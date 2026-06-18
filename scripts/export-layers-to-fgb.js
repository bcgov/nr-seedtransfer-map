const fs = require('fs');
const path = require('path');

async function fetchAllFeatures(layerId, outFields = '*') {
  let features = [];
  let offset = 0;
  const limit = 2000;
  const baseUrl = `https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/${layerId}/query`;
  
  while (true) {
    console.log(`Fetching layer ${layerId} offset ${offset}...`);
    const params = new URLSearchParams({
      where: '1=1',
      outFields: outFields,
      f: 'geojson',
      outSR: '4326',
      returnGeometry: 'true',
      resultOffset: offset,
      resultRecordCount: limit,
      orderByFields: layerId === 0 ? 'objectid' : 'objectid_1'
    });
    
    const url = `${baseUrl}?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} fetching layer ${layerId}`);
    }
    const data = await response.json();
    if (!data.features || data.features.length === 0) {
      break;
    }
    features.push(...data.features);
    if (data.features.length < limit) {
      break;
    }
    offset += limit;
  }
  
  return {
    type: 'FeatureCollection',
    features: features
  };
}

(async () => {
  try {
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

    const outputDir = path.join(__dirname, '../docs/Version_7_0');

    // Helper to build header
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
      
      const nameStrOffset = builder.createString('L1');
      
      Header.startHeader(builder);
      if (crsOffset) {
        Header.addCrs(builder, crsOffset);
      }
      Header.addFeaturesCount(builder, BigInt(t.featuresCount));
      Header.addGeometryType(builder, t.geometryType);
      Header.addIndexNodeSize(builder, t.indexNodeSize);
      if (columnsOffset) {
        Header.addColumns(builder, columnsOffset);
      }
      Header.addName(builder, nameStrOffset);
      
      const rootOffset = Header.endHeader(builder);
      builder.finishSizePrefixed(rootOffset);
      return builder.asUint8Array();
    }

    // Helper to compute geometry bounding box
    function getGeometryBbox(geometry) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      function processCoords(coords) {
        if (typeof coords[0] === 'number') {
          const x = coords[0];
          const y = coords[1];
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        } else {
          for (const c of coords) {
            processCoords(c);
          }
        }
      }
      
      if (geometry && geometry.coordinates) {
        processCoords(geometry.coordinates);
      }
      
      if (minX === Infinity) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
      }
      return { minX, minY, maxX, maxY };
    }

    // Custom serialization function with spatial index support
    function serializeWithIndex(geojson) {
      const featuresCount = geojson.features.length;
      const indexNodeSize = 16;

      // 1. Gather columns (properties)
      const firstProps = geojson.features[0] ? geojson.features[0].properties : null;
      let columns = null;
      if (firstProps) {
        columns = Object.keys(firstProps).map(key => mapColumn(firstProps, key));
      }

      // 2. Prepare header metadata
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
      const headerBytes = customBuildHeader(headerMeta, 0);

      // 4. Serialize all features to individual Uint8Arrays
      const serializedFeatures = geojson.features.map(f => {
        const geometry = 'GeometryCollection' === f.geometry.type ? parseGC(f.geometry) : parseGeometry(f.geometry);
        return buildFeature(geometry, f.properties, headerMeta);
      });

      // 5. Calculate feature relative offsets
      const featureOffsets = new Array(featuresCount);
      let currentOffset = 0;
      for (let j = 0; j < featuresCount; j++) {
        featureOffsets[j] = currentOffset;
        currentOffset += serializedFeatures[j].length;
      }

      // 6. Construct the Packed Hilbert R-tree index
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

      const indexBuffer = new ArrayBuffer(numNodes * 40);
      const indexView = new DataView(indexBuffer);

      // Populate Level 0 (leaves)
      for (let j = 0; j < featuresCount; j++) {
        const nodeIdx = levelOffsets[0] + j;
        const byteOffset = nodeIdx * 40;

        const f = geojson.features[j];
        const bbox = getGeometryBbox(f.geometry);

        indexView.setFloat64(byteOffset + 0, bbox.minX, true);      // minX
        indexView.setFloat64(byteOffset + 8, bbox.minY, true);      // minY
        indexView.setFloat64(byteOffset + 16, bbox.maxX, true);     // maxX
        indexView.setFloat64(byteOffset + 24, bbox.maxY, true);     // maxY
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

      const indexBytes = new Uint8Array(indexBuffer);
      const totalLength = magicbytes.length + headerBytes.length + indexBytes.length + currentOffset;
      const result = new Uint8Array(totalLength);

      result.set(magicbytes, 0);
      result.set(headerBytes, magicbytes.length);
      result.set(indexBytes, magicbytes.length + headerBytes.length);

      let currentWriteOffset = magicbytes.length + headerBytes.length + indexBytes.length;
      for (let j = 0; j < featuresCount; j++) {
        result.set(serializedFeatures[j], currentWriteOffset);
        currentWriteOffset += serializedFeatures[j].length;
      }

      return result;
    }

    // 1. Layer 0 (Management Units)
    console.log('Downloading Layer 0 (Management Units)...');
    const l0 = await fetchAllFeatures(0, '*');
    console.log(`Layer 0 fetched: ${l0.features.length} features. Serializing to FlatGeobuf...`);
    const fgb0 = serializeWithIndex(l0);
    fs.writeFileSync(path.join(outputDir, 'Management_Units.fgb'), Buffer.from(fgb0));
    console.log('Layer 0 saved to Management_Units.fgb');

    // We will calculate bounds for variants
    const bounds = {};
    function addBbox(mapLabel, geometry) {
      if (!mapLabel || !geometry || !geometry.coordinates) return;
      const bbox = getGeometryBbox(geometry);
      
      if (!bounds[mapLabel]) {
        bounds[mapLabel] = bbox;
      } else {
        const b = bounds[mapLabel];
        if (bbox.minX < b.minX) b.minX = bbox.minX;
        if (bbox.minY < b.minY) b.minY = bbox.minY;
        if (bbox.maxX > b.maxX) b.maxX = bbox.maxX;
        if (bbox.maxY > b.maxY) b.maxY = bbox.maxY;
      }
    }

    // 2. BEC variant polygons (FeatureServer layer 5: BEC_10_Suit_v4).
    //
    // Layer 6 (BEC_10_NotSuit_v4) is byte-identical to layer 5 on Forsite — same
    // 15,266 features and total area. Suitable vs non-suitable is determined at
    // runtime by MAP_LABEL filtering, not by layer, so we export once as
    // BEC_Variants.fgb (see defineMap.js).
    console.log('Downloading Layer 5 (BEC variants)...');
    const becVariants = await fetchAllFeatures(5, 'map_label,objectid_1');
    console.log(
      `Layer 5 fetched: ${becVariants.features.length} features. Processing bounds...`,
    );
    for (const f of becVariants.features) {
      addBbox(f.properties.map_label, f.geometry);
    }
    console.log('Serializing BEC variants to FlatGeobuf...');
    const fgbBec = serializeWithIndex(becVariants);
    fs.writeFileSync(path.join(outputDir, 'BEC_Variants.fgb'), Buffer.from(fgbBec));
    console.log('Layer 5 saved to BEC_Variants.fgb');

    // Save bounds
    fs.writeFileSync(path.join(outputDir, 'bec_bounds.json'), JSON.stringify(bounds, null, 2));
    console.log(`Calculated bounds for ${Object.keys(bounds).length} variants.`);

    console.log('🎉 All layers exported and serialized successfully with spatial indexes!');
  } catch (err) {
    console.error('Error exporting layers:', err);
    process.exit(1);
  }
})();
