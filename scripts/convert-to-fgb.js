const fs = require('fs');
const path = require('path');

(async () => {
  // Dynamically import ES modules from flatgeobuf package
  const flatbuffers = await import('flatbuffers');
  const { magicbytes } = await import('flatgeobuf/lib/mjs/constants.js');
  const { buildFeature } = await import('flatgeobuf/lib/mjs/generic/feature.js');
  const { mapColumn } = await import('flatgeobuf/lib/mjs/generic/featurecollection.js');
  const { inferGeometryType } = await import('flatgeobuf/lib/mjs/generic/header.js');
  const { parseGC, parseGeometry } = await import('flatgeobuf/lib/mjs/geojson/geometry.js');
  const { Header } = await import('flatgeobuf/lib/mjs/flat-geobuf/header.js');
  const { Column } = await import('flatgeobuf/lib/mjs/flat-geobuf/column.js');
  const { Crs } = await import('flatgeobuf/lib/mjs/flat-geobuf/crs.js');

  // Read becStore directly from docs/scripts/becStore.js
  const becStore = require('../docs/scripts/becStore.js');

  const versionDir = path.join(__dirname, '../docs/Version_7_0');
  const files = fs.readdirSync(versionDir);
  const speciesOnly = process.env.SPECIES_ONLY
    ? new Set(process.env.SPECIES_ONLY.split(',').map(s => s.trim().toLowerCase()))
    : null;
  const includeSpecies = species =>
    !speciesOnly || speciesOnly.has(species.toLowerCase());

  console.log(
    speciesOnly
      ? `Processing JSON databases in ${versionDir} (species: ${[...speciesOnly].join(', ')})...`
      : `Processing JSON databases in ${versionDir}...`
  );

  // Custom buildHeader implementation that respects the indexNodeSize option instead of hardcoding to 0
  function customBuildHeader(t, r = 0) {
    const builder = new flatbuffers.Builder();
    let columnsOffset = 0;
    if (t.columns) {
      const columnOffsets = t.columns.map(col => {
        const nameOffset = builder.createString(col.name);
        Column.startColumn(builder);
        Column.addName(builder, nameOffset);
        Column.addType(builder, col.type);
        return Column.endColumn(builder);
      });
      columnsOffset = Header.createColumnsVector(builder, columnOffsets);
    }
    
    let crsOffset = 0;
    if (r) {
      Crs.startCrs(builder);
      Crs.addCode(builder, r);
      crsOffset = Crs.endCrs(builder);
    }
    
    const nameStrOffset = builder.createString("L1");
    
    Header.startHeader(builder);
    if (crsOffset) {
      Header.addCrs(builder, crsOffset);
    }
    Header.addFeaturesCount(builder, BigInt(t.featuresCount));
    Header.addGeometryType(builder, t.geometryType);
    Header.addIndexNodeSize(builder, t.indexNodeSize); // respect the indexNodeSize
    if (columnsOffset) {
      Header.addColumns(builder, columnsOffset);
    }
    Header.addName(builder, nameStrOffset);
    
    const rootOffset = Header.endHeader(builder);
    builder.finishSizePrefixed(rootOffset);
    return builder.asUint8Array();
  }

  // Custom serialization function that includes the Packed Hilbert R-tree spatial index
  function serializeWithIndex(geojson, becStore) {
    const featuresCount = geojson.features.length;
    const indexNodeSize = 16;

    // 1. Gather columns (properties)
    const firstProps = geojson.features[0].properties;
    let columns = null;
    if (firstProps) {
      columns = Object.keys(firstProps).map(key => mapColumn(firstProps, key));
    }

    // 2. Prepare header metadata with spatial index node size set to 16
    const headerMeta = {
      geometryType: inferGeometryType(geojson.features),
      columns: columns,
      envelope: null,
      featuresCount: featuresCount,
      indexNodeSize: indexNodeSize,
      crs: null,
      title: null,
      description: null,
      metadata: null
    };

    // 3. Build size-prefixed header bytes
    const headerBytes = customBuildHeader(headerMeta, 0); // crsCode = 0

    // 4. Serialize all features to individual Uint8Arrays
    const serializedFeatures = geojson.features.map(f => {
      const geometry = "GeometryCollection" === f.geometry.type ? parseGC(f.geometry) : parseGeometry(f.geometry);
      return buildFeature(geometry, f.properties, headerMeta);
    });

    // 5. Calculate feature relative offsets from the start of the features section
    const featureOffsets = new Array(featuresCount);
    let currentOffset = 0;
    for (let j = 0; j < featuresCount; j++) {
      featureOffsets[j] = currentOffset;
      currentOffset += serializedFeatures[j].length;
    }

    // 6. Construct the Packed Hilbert R-tree index
    // Compute level bounds and node counts
    let l = featuresCount;
    const levelNodeCounts = [featuresCount];
    let numNodes = featuresCount;
    do {
      l = Math.ceil(l / indexNodeSize);
      levelNodeCounts.push(l);
      numNodes += l;
    } while (l !== 1);

    const levelOffsets = new Array(levelNodeCounts.length);
    let currentLevelOffset = numNodes;
    for (let i = 0; i < levelNodeCounts.length; i++) {
      currentLevelOffset -= levelNodeCounts[i];
      levelOffsets[i] = currentLevelOffset;
    }

    // Allocate index array buffer (40 bytes per node)
    const indexBuffer = new ArrayBuffer(numNodes * 40);
    const indexView = new DataView(indexBuffer);

    // Populate Level 0 (leaves)
    for (let j = 0; j < featuresCount; j++) {
      const nodeIdx = levelOffsets[0] + j;
      const byteOffset = nodeIdx * 40;

      const f = geojson.features[j];
      const x = f.geometry.coordinates[0];

      indexView.setFloat64(byteOffset + 0, x, true);      // minX
      indexView.setFloat64(byteOffset + 8, 0, true);      // minY
      indexView.setFloat64(byteOffset + 16, x, true);     // maxX
      indexView.setFloat64(byteOffset + 24, 0, true);     // maxY
      indexView.setBigUint64(byteOffset + 32, BigInt(featureOffsets[j]), true); // relative feature offset
    }

    // Build upper levels bottom-up
    for (let i = 1; i < levelNodeCounts.length; i++) {
      const numLevelNodes = levelNodeCounts[i];
      const numChildNodes = levelNodeCounts[i - 1];

      for (let k = 0; k < numLevelNodes; k++) {
        const parentIdx = levelOffsets[i] + k;
        const parentByteOffset = parentIdx * 40;

        const childStartIdx = levelOffsets[i - 1] + k * indexNodeSize;
        const childEndIdx = Math.min(childStartIdx + indexNodeSize, levelOffsets[i - 1] + numChildNodes);

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let c = childStartIdx; c < childEndIdx; c++) {
          const childByteOffset = c * 40;
          const cMinX = indexView.getFloat64(childByteOffset + 0, true);
          const cMinY = indexView.getFloat64(childByteOffset + 8, true);
          const cMaxX = indexView.getFloat64(childByteOffset + 16, true);
          const cMaxY = indexView.getFloat64(childByteOffset + 24, true);

          if (cMinX < minX) minX = cMinX;
          if (cMinY < minY) minY = cMinY;
          if (cMaxX > maxX) maxX = cMaxX;
          if (cMaxY > maxY) maxY = cMaxY;
        }

        indexView.setFloat64(parentByteOffset + 0, minX, true);
        indexView.setFloat64(parentByteOffset + 8, minY, true);
        indexView.setFloat64(parentByteOffset + 16, maxX, true);
        indexView.setFloat64(parentByteOffset + 24, maxY, true);
        indexView.setBigUint64(parentByteOffset + 32, BigInt(childStartIdx), true);
      }
    }

    // 7. Write everything to a final Uint8Array
    const indexBytes = new Uint8Array(indexBuffer);
    const totalLength = magicbytes.length + headerBytes.length + indexBytes.length + currentOffset;
    const result = new Uint8Array(totalLength);

    // Set magic bytes
    result.set(magicbytes, 0);
    // Set size-prefixed header
    result.set(headerBytes, magicbytes.length);
    // Set index
    result.set(indexBytes, magicbytes.length + headerBytes.length);

    // Set features sequentially
    let currentWriteOffset = magicbytes.length + headerBytes.length + indexBytes.length;
    for (let j = 0; j < featuresCount; j++) {
      result.set(serializedFeatures[j], currentWriteOffset);
      currentWriteOffset += serializedFeatures[j].length;
    }

    return result;
  }

  // Iterate over files in docs/Version_7_0 and convert them
  files.forEach(file => {
    if (file.endsWith('_Seedlots.json')) {
      const species = file.replace('_Seedlots.json', '');
      if (!includeSpecies(species)) return;
      const jsonPath = path.join(versionDir, file);
      const fgbPath = path.join(versionDir, `${species}_Seedlots.fgb`);

      console.log(`Converting ${file} to FlatGeobuf...`);
      const records = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

      const features = records.map(record => {
        const becName = record.BECvar_site || record.BECvarfut_plantation;
        const idx = becStore.findIndex(b => b.name === becName);
        if (idx === -1) {
          console.warn(`Warning: BEC Variant ${becName} not found in becStore for record in ${file}`);
        }
        const properties = {};
        for (const k in record) {
          if (k !== '' && !k.startsWith('Unnamed:')) {
            properties[k] = record[k];
          }
        }
        if (!properties.BECvar_site && properties.BECvarfut_plantation) {
          properties.BECvar_site = properties.BECvarfut_plantation;
        }
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [idx * 10, 0]
          },
          properties
        };
      });

      const fc = { type: 'FeatureCollection', features };
      const serialized = serializeWithIndex(fc, becStore);
      fs.writeFileSync(fgbPath, Buffer.from(serialized));
    } else if (file.includes('_migrated_height_list_') && file.endsWith('.json')) {
      const species = file.split('_migrated_height_list_')[0];
      if (!includeSpecies(species)) return;
      const baseName = file.replace('.json', '');
      const jsonPath = path.join(versionDir, file);

      const fgbPathSite = path.join(versionDir, `${baseName}_site.fgb`);
      const fgbPathSeed = path.join(versionDir, `${baseName}_seed.fgb`);

      console.log(`Converting ${file} to FlatGeobuf (site and seed versions)...`);
      const records = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

      // Site version (indexed by BECvar_site)
      const featuresSite = records.map(record => {
        const becName = record.BECvar_site || record.BECvarfut_plantation;
        const idx = becStore.findIndex(b => b.name === becName);
        if (idx === -1) {
          console.warn(`Warning: BEC Variant ${becName} not found in ${file}`);
        }
        const properties = {};
        for (const k in record) {
          if (k !== '' && !k.startsWith('Unnamed:')) {
            properties[k] = record[k];
          }
        }
        if (!properties.BECvar_site && properties.BECvarfut_plantation) {
          properties.BECvar_site = properties.BECvarfut_plantation;
        }
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [idx * 10, 0]
          },
          properties
        };
      });
      const fcSite = { type: 'FeatureCollection', features: featuresSite };
      const serializedSite = serializeWithIndex(fcSite, becStore);
      fs.writeFileSync(fgbPathSite, Buffer.from(serializedSite));

      // Seed version (indexed by BECvar_seed)
      const featuresSeed = records.map(record => {
        const becName = record.BECvar_seed;
        const idx = becStore.findIndex(b => b.name === becName);
        if (idx === -1) {
          console.warn(`Warning: BEC Variant ${becName} not found in ${file}`);
        }
        const properties = {};
        for (const k in record) {
          if (k !== '' && !k.startsWith('Unnamed:')) {
            properties[k] = record[k];
          }
        }
        if (!properties.BECvar_site && properties.BECvarfut_plantation) {
          properties.BECvar_site = properties.BECvarfut_plantation;
        }
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [idx * 10, 0]
          },
          properties
        };
      });
      const fcSeed = { type: 'FeatureCollection', features: featuresSeed };
      const serializedSeed = serializeWithIndex(fcSeed, becStore);
      fs.writeFileSync(fgbPathSeed, Buffer.from(serializedSeed));
    }
  });

  console.log('🎉 FlatGeobuf database conversion complete with custom spatial indexes!');
})().catch(err => {
  console.error('Error in conversion script:', err);
  process.exit(1);
});
