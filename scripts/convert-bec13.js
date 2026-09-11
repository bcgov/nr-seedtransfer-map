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

  const jsonPath = path.join(__dirname, '../BEC13_v2_FeaturesToJSON.json');
  const outputDir = path.join(__dirname, '../docs/Version_7_0');
  const fgbPath = path.join(outputDir, 'BEC_Variants.fgb');
  const boundsPath = path.join(outputDir, 'bec_bounds.json');

  const TOLERANCE = 50.0; // 50 meters tolerance for Douglas-Peucker simplification

  console.log(`Starting conversion of BEC13 dataset...`);
  console.log(`Simplification tolerance: ${TOLERANCE} meters.`);

  // 1. Constants for NAD83 / GRS80 (EPSG:3005) inverse projection
  const a = 6378137.0;
  const f = 1 / 298.257222101;
  const e2 = 2 * f - f * f;
  const e = Math.sqrt(e2);
  const lat1 = 50.0 * Math.PI / 180;
  const lat2 = 58.5 * Math.PI / 180;
  const lat0 = 45.0 * Math.PI / 180;
  const lon0 = -126.0 * Math.PI / 180;
  const x0 = 1000000.0;
  const y0 = 0.0;

  function computeQ(lat) {
    const sinLat = Math.sin(lat);
    const term1 = sinLat / (1 - e2 * sinLat * sinLat);
    const term2 = (1 / (2 * e)) * Math.log((1 - e * sinLat) / (1 + e * sinLat));
    return (1 - e2) * (term1 - term2);
  }

  function computeM(lat) {
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    return cosLat / Math.sqrt(1 - e2 * sinLat * sinLat);
  }

  const m1 = computeM(lat1);
  const m2 = computeM(lat2);
  const q1 = computeQ(lat1);
  const q2 = computeQ(lat2);
  const q0 = computeQ(lat0);

  const n = (m1 * m1 - m2 * m2) / (q2 - q1);
  const C = m1 * m1 + n * q1;
  const rho0 = (a * Math.sqrt(C - n * q0)) / n;
  const qp = computeQ(Math.PI / 2);

  const c1 = e2 / 3 + (31 * e2 * e2) / 180 + (517 * e2 * e2 * e2) / 5040;
  const c2 = (23 * e2 * e2) / 360 + (251 * e2 * e2 * e2) / 3780;
  const c3 = (761 * e2 * e2 * e2) / 45360;

  function reproject3005To4326(x, y) {
    const dx = x - x0;
    const dy = rho0 - (y - y0);
    const rho = Math.sqrt(dx * dx + dy * dy);
    let theta = 0;
    if (rho !== 0) {
      theta = Math.atan2(n * dx, n * dy);
    }
    const lon = lon0 + theta / n;
    const q = (C - (rho * rho * n * n) / (a * a)) / n;
    const sinBeta = Math.min(1, Math.max(-1, q / qp));
    const beta = Math.asin(sinBeta);
    const lat = beta + c1 * Math.sin(2 * beta) + c2 * Math.sin(4 * beta) + c3 * Math.sin(6 * beta);
    return [lon * 180 / Math.PI, lat * 180 / Math.PI];
  }

  // 2. Douglas-Peucker Simplification
  function getSqSegDist(p, p1, p2) {
    let x = p1[0];
    let y = p1[1];
    let dx = p2[0] - x;
    let dy = p2[1] - y;
    if (dx !== 0 || dy !== 0) {
      let t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = p2[0];
        y = p2[1];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    dx = p[0] - x;
    dy = p[1] - y;
    return dx * dx + dy * dy;
  }

  function simplifyDPStep(points, first, last, sqTolerance, simplified) {
    let maxSqDist = sqTolerance;
    let index;
    for (let i = first + 1; i < last; i++) {
      const sqDist = getSqSegDist(points[i], points[first], points[last]);
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }
    if (maxSqDist > sqTolerance) {
      if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
      simplified.push(points[index]);
      if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
  }

  function simplifyDouglasPeucker(points, tolerance) {
    if (points.length <= 2) return points;
    const sqTolerance = tolerance * tolerance;
    const simplified = [points[0]];
    simplifyDPStep(points, 0, points.length - 1, sqTolerance, simplified);
    simplified.push(points[points.length - 1]);
    return simplified;
  }

  function simplifyRing(ring, tolerance) {
    return simplifyDouglasPeucker(ring, tolerance);
  }

  function simplifyAndReprojectGeometry(geom, tolerance) {
    const processRing = (ring) => {
      const simplified = tolerance > 0 ? simplifyRing(ring, tolerance) : ring;
      return simplified.map(pt => reproject3005To4326(pt[0], pt[1]));
    };

    if (geom.type === 'Polygon') {
      return {
        type: 'Polygon',
        coordinates: geom.coordinates.map(processRing)
      };
    } else if (geom.type === 'MultiPolygon') {
      return {
        type: 'MultiPolygon',
        coordinates: geom.coordinates.map(poly => poly.map(processRing))
      };
    }
    return geom;
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

  // 3. Custom FGB serialization helper functions
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

  function serializeWithIndex(geojson) {
    const featuresCount = geojson.features.length;
    if (featuresCount === 0) {
      throw new Error('Cannot serialize an empty FeatureCollection to FlatGeobuf (featuresCount=0).');
    }
    const indexNodeSize = 16;

    const firstProps = geojson.features[0] ? geojson.features[0].properties : null;
    let columns = null;
    if (firstProps) {
      columns = Object.keys(firstProps).map(key => mapColumn(firstProps, key));
    }

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

    const headerBytes = customBuildHeader(headerMeta, 0);

    const serializedFeatures = geojson.features.map(f => {
      const geometry = 'GeometryCollection' === f.geometry.type ? parseGC(f.geometry) : parseGeometry(f.geometry);
      return buildFeature(geometry, f.properties, headerMeta);
    });

    const featureOffsets = new Array(featuresCount);
    let currentOffset = 0;
    for (let j = 0; j < featuresCount; j++) {
      featureOffsets[j] = currentOffset;
      currentOffset += serializedFeatures[j].length;
    }

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

    for (let j = 0; j < featuresCount; j++) {
      const nodeIdx = levelOffsets[0] + j;
      const byteOffset = nodeIdx * 40;
      const f = geojson.features[j];
      const bbox = getGeometryBbox(f.geometry);

      indexView.setFloat64(byteOffset + 0, bbox.minX, true);
      indexView.setFloat64(byteOffset + 8, bbox.minY, true);
      indexView.setFloat64(byteOffset + 16, bbox.maxX, true);
      indexView.setFloat64(byteOffset + 24, bbox.maxY, true);
      indexView.setBigUint64(byteOffset + 32, BigInt(featureOffsets[j]), true);
    }

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

  // 4. Stream and process the large GeoJSON
  const stream = fs.createReadStream(jsonPath, { encoding: 'utf8', highWaterMark: 1024 * 1024 });
  let buffer = '';
  const processedFeatures = [];
  const bounds = {};
  let featureCount = 0;

  console.log(`Reading and processing features from ${jsonPath}...`);

  let inFeaturesArray = false;
  let scanIdx = 0;
  let braceCount = 0;
  let inString = false;
  let escape = false;
  let featureStartIdx = -1;

  for await (const chunk of stream) {
    buffer += chunk;

    if (!inFeaturesArray) {
      const featuresKeyIdx = buffer.indexOf('"features"');
      if (featuresKeyIdx !== -1) {
        const arrayStartIdx = buffer.indexOf('[', featuresKeyIdx);
        if (arrayStartIdx !== -1) {
          inFeaturesArray = true;
          buffer = buffer.slice(arrayStartIdx + 1);
          scanIdx = 0;
        } else {
          buffer = buffer.slice(featuresKeyIdx);
          scanIdx = 0;
        }
      } else {
        if (buffer.length > 20) {
          buffer = buffer.slice(buffer.length - 20);
        }
        scanIdx = 0;
      }
      continue;
    }

    while (scanIdx < buffer.length) {
      const char = buffer[scanIdx];

      if (escape) {
        escape = false;
        scanIdx++;
        continue;
      }
      if (char === '\\') {
        escape = true;
        scanIdx++;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        scanIdx++;
        continue;
      }
      if (inString) {
        scanIdx++;
        continue;
      }

      if (char === '{') {
        if (braceCount === 0) {
          featureStartIdx = scanIdx;
        }
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && featureStartIdx !== -1) {
          const featureStr = buffer.slice(featureStartIdx, scanIdx + 1);
          
          try {
            const f = JSON.parse(featureStr);
            featureCount++;

            // Get and normalize the map label, safely navigating potential null properties
            const mapLabel = f.properties?.MAP_LABEL ?? f.properties?.map_label;

            if (mapLabel) {
              // Simplify (in 3005 meters) and Reproject (to 4326 lat/long)
              const processedGeom = simplifyAndReprojectGeometry(f.geometry, TOLERANCE);

              // Calculate bounding box in WGS84 for this variant
              const bbox = getGeometryBbox(processedGeom);
              if (!bounds[mapLabel]) {
                bounds[mapLabel] = { ...bbox };
              } else {
                const b = bounds[mapLabel];
                if (bbox.minX < b.minX) b.minX = bbox.minX;
                if (bbox.minY < b.minY) b.minY = bbox.minY;
                if (bbox.maxX > b.maxX) b.maxX = bbox.maxX;
                if (bbox.maxY > b.maxY) b.maxY = bbox.maxY;
              }

              // Build output feature with only MAP_LABEL property
              processedFeatures.push({
                type: 'Feature',
                geometry: processedGeom,
                properties: {
                  map_label: mapLabel
                }
              });
            }

            if (featureCount % 2000 === 0) {
              console.log(`Processed ${featureCount} features...`);
            }
          } catch (err) {
            console.error(`Error parsing feature ${featureCount + 1}:`, err.message);
          }

          // Slice the processed feature off the buffer
          buffer = buffer.slice(scanIdx + 1);
          scanIdx = 0;
          featureStartIdx = -1;
          continue; // Skip scanIdx++ to start scanning index 0 of the new buffer
        }
      }
      scanIdx++;
    }
  }

  console.log(`Processed all features. Total features parsed: ${featureCount}`);
  console.log(`Retained ${processedFeatures.length} features with valid labels.`);
  console.log(`Unique variant bounds computed: ${Object.keys(bounds).length}`);

  // 5. Serialize features to FlatGeobuf
  console.log(`Serializing to FlatGeobuf format with spatial index...`);
  const fc = {
    type: 'FeatureCollection',
    features: processedFeatures
  };
  const serialized = serializeWithIndex(fc);

  console.log(`Writing output to ${fgbPath}...`);
  fs.writeFileSync(fgbPath, Buffer.from(serialized));
  console.log(`FlatGeobuf written successfully. Size: ${(serialized.length / (1024 * 1024)).toFixed(2)} MB.`);

  console.log(`Writing bounds to ${boundsPath}...`);
  fs.writeFileSync(boundsPath, JSON.stringify(bounds, null, 2));
  console.log(`Bounds written successfully.`);

  console.log(`🎉 BEC 13 update script finished successfully!`);
})().catch(err => {
  console.error('Fatal error in conversion script:', err);
  process.exit(1);
});
