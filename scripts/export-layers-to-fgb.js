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
    const { serialize } = await import('flatgeobuf/lib/mjs/geojson.js');
    const outputDir = path.join(__dirname, '../docs/Version_7_0');

    // 1. Layer 0 (Management Units)
    console.log('Downloading Layer 0 (Management Units)...');
    const l0 = await fetchAllFeatures(0, '*');
    console.log(`Layer 0 fetched: ${l0.features.length} features. Serializing to FlatGeobuf...`);
    const fgb0 = serialize(l0);
    fs.writeFileSync(path.join(outputDir, 'Management_Units.fgb'), Buffer.from(fgb0));
    console.log('Layer 0 saved to Management_Units.fgb');

    // We will calculate bounds for variants
    const bounds = {};
    function addBbox(mapLabel, geometry) {
      if (!mapLabel || !geometry || !geometry.coordinates) return;
      
      let coords = [];
      const type = geometry.type;
      
      if (type === 'Polygon') {
        coords = geometry.coordinates.flat(1);
      } else if (type === 'MultiPolygon') {
        coords = geometry.coordinates.flat(2);
      } else {
        return;
      }
      
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const pt of coords) {
        if (Array.isArray(pt) && pt.length >= 2) {
          const x = pt[0];
          const y = pt[1];
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
      
      if (minX === Infinity) return;
      
      if (!bounds[mapLabel]) {
        bounds[mapLabel] = { minX, minY, maxX, maxY };
      } else {
        const b = bounds[mapLabel];
        if (minX < b.minX) b.minX = minX;
        if (minY < b.minY) b.minY = minY;
        if (maxX > b.maxX) b.maxX = maxX;
        if (maxY > b.maxY) b.maxY = maxY;
      }
    }

    // 2. Layer 5 (Suitable BEC)
    console.log('Downloading Layer 5 (Suitable BEC)...');
    const l5 = await fetchAllFeatures(5, 'map_label,objectid_1');
    console.log(`Layer 5 fetched: ${l5.features.length} features. Processing bounds...`);
    for (const f of l5.features) {
      addBbox(f.properties.map_label, f.geometry);
    }
    console.log('Serializing Layer 5 to FlatGeobuf...');
    const fgb5 = serialize(l5);
    fs.writeFileSync(path.join(outputDir, 'Suitable_BEC.fgb'), Buffer.from(fgb5));
    console.log('Layer 5 saved to Suitable_BEC.fgb');

    // 3. Layer 6 (Nonsuitable BEC)
    console.log('Downloading Layer 6 (Non-suitable BEC)...');
    const l6 = await fetchAllFeatures(6, 'map_label,objectid_1');
    console.log(`Layer 6 fetched: ${l6.features.length} features. Processing bounds...`);
    for (const f of l6.features) {
      addBbox(f.properties.map_label, f.geometry);
    }
    console.log('Serializing Layer 6 to FlatGeobuf...');
    const fgb6 = serialize(l6);
    fs.writeFileSync(path.join(outputDir, 'Nonsuitable_BEC.fgb'), Buffer.from(fgb6));
    console.log('Layer 6 saved to Nonsuitable_BEC.fgb');

    // Save bounds
    fs.writeFileSync(path.join(outputDir, 'bec_bounds.json'), JSON.stringify(bounds, null, 2));
    console.log(`Calculated bounds for ${Object.keys(bounds).length} variants.`);

    console.log('🎉 All layers exported and serialized successfully!');
  } catch (err) {
    console.error('Error exporting layers:', err);
    process.exit(1);
  }
})();
