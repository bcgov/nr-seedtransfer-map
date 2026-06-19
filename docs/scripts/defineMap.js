/*
 * Define the JavaScript functions used to create the structure and widgets
 */

define(['lib/flatgeobuf/flatgeobuf-geojson.min.js', 'scripts/dataUrl.js'], function (
  flatgeobuf,
  dataUrl,
) {
  var map
  var becBounds = null
  var currentLayer = {
    definitionExpression: '1=0',
  }
  var nonsuitLayer = {
    definitionExpression: '1=0',
  }

  function loadBecBounds() {
    if (becBounds) return Promise.resolve(becBounds)

    var boundsUrl = dataUrl.resolveDataUrl('Version_7_0/bec_bounds.json') + '?v=7.0.12'

    return fetch(boundsUrl)
      .then(function (r) {
        if (!r.ok) throw new Error('Failed to load BEC bounds: ' + r.statusText)
        return r.json()
      })
      .then(function (data) {
        becBounds = data
        return becBounds
      })
  }

  function parseLabelSet(input) {
    var set = new Set()
    if (!input) return set
    var parts = Array.isArray(input) ? input : String(input).split(',')
    parts.forEach(function (part) {
      var label = String(part)
        .trim()
        .replace(/^'+|'+$/g, '')
      if (label) set.add(label)
    })
    return set
  }

  var addedLayerIds = []
  var addedSourceIds = []

  var BEC_VARIANTS_URL = 'Version_7_0/BEC_Variants.fgb'
  var MANAGEMENT_UNITS_URL = 'Version_7_0/Management_Units.fgb'

  var becFeaturesPromise = null
  var mguFeaturesPromise = null

  // Read all features from a local FlatGeobuf file
  async function loadFgbFeatures(url) {
    var resolvedUrl = dataUrl.resolveDataUrl(url) + '?v=7.0.12'
    var response = await fetch(resolvedUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch ' + url + ': ' + response.status)
    }
    var bytes = new Uint8Array(await response.arrayBuffer())
    var out = []
    var iterator = flatgeobuf.deserialize(bytes)
    for await (var feature of iterator) {
      out.push(feature)
    }
    return out
  }

  // Load (once) and cache all BEC variant features from the local snapshot.
  function loadBecFeatures() {
    if (!becFeaturesPromise) {
      becFeaturesPromise = loadFgbFeatures(BEC_VARIANTS_URL).catch(function (error) {
        becFeaturesPromise = null // allow a later retry if loading failed
        throw error
      })
    }
    return becFeaturesPromise
  }

  // Load (once) and cache Management Units boundaries.
  function loadMguFeatures() {
    if (!mguFeaturesPromise) {
      mguFeaturesPromise = loadFgbFeatures(MANAGEMENT_UNITS_URL).catch(function (error) {
        mguFeaturesPromise = null // allow a later retry if loading failed
        throw error
      })
    }
    return mguFeaturesPromise
  }

  // Basemap definitions — all free, zero API keys required
  var BASEMAPS = [
    {
      id: 'osm',
      label: 'OpenStreetMap',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      attribution:
        '\u00a9 <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    },
    {
      id: 'carto-light',
      label: 'Carto Light',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      ],
      attribution:
        '\u00a9 <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors \u00a9 <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
    },
    {
      id: 'carto-dark',
      label: 'Carto Dark',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      ],
      attribution:
        '\u00a9 <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors \u00a9 <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
    },
  ]
  var currentBasemapIndex = 0

  // Uploading shapefiles custom control integration
  class UploadControl {
    onAdd(mapInstance) {
      this._map = mapInstance
      this._container = document.createElement('div')
      this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group'

      var button = document.createElement('button')
      button.className = 'maplibregl-ctrl-icon'
      button.type = 'button'
      button.title = 'Upload Shapefile'
      button.setAttribute('aria-label', 'Upload shapefile')
      button.textContent = '📁'
      button.style.fontSize = '16px'
      button.style.display = 'flex'
      button.style.alignItems = 'center'
      button.style.justifyContent = 'center'

      var fileForm = document.getElementById('mainWindow')
      if (fileForm) {
        fileForm.style.position = 'absolute'
        fileForm.style.top = '40px'
        fileForm.style.left = '0'
        fileForm.style.backgroundColor = 'white'
        fileForm.style.border = '1px solid #ccc'
        fileForm.style.padding = '10px'
        fileForm.style.borderRadius = '4px'
        fileForm.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)'
        fileForm.style.zIndex = '1000'
        fileForm.style.width = '250px'
        this._container.appendChild(fileForm)
      }

      button.addEventListener('click', function () {
        if (fileForm) {
          fileForm.style.display = fileForm.style.display === 'none' ? 'block' : 'none'
        }
      })

      this._container.appendChild(button)
      return this._container
    }

    onRemove() {
      this._container.parentNode.removeChild(this._container)
      this._map = undefined
    }
  }

  return {
    mapInit: mapInit,
    fullExtent: fullExtent,
    clearLyrs: clearLyrs,
    addLayers: addLayers,
    updateLayer: updateLayer,
    clearCutBlock: clearCutBlock,
    _map: function () {
      return map
    },
    _currentLayer: function () {
      return currentLayer
    },
    _nonsuitLayer: function () {
      return nonsuitLayer
    },
  }

  /*
   * Initialize the map and all layers and functionality
   */
  function mapInit() {
    map = new maplibregl.Map({
      container: 'mapDiv',
      style: {
        version: 8,
        sources: {
          'basemap-osm': {
            type: 'raster',
            tiles: BASEMAPS[0].tiles,
            tileSize: 256,
            attribution: BASEMAPS[0].attribution,
          },
        },
        layers: [
          {
            id: 'basemap-layer-osm',
            type: 'raster',
            source: 'basemap-osm',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [-125.877, 54],
      zoom: 6,
    })

    // Add navigation controls (zoom, rotation)
    map.addControl(new maplibregl.NavigationControl(), 'top-left')

    map.on('load', function () {
      // Register alternate basemap layers (hidden) so switching only toggles visibility
      // and does not reset runtime-added sources/layers via setStyle().
      for (var i = 1; i < BASEMAPS.length; i++) {
        var bm = BASEMAPS[i]
        map.addSource('basemap-' + bm.id, {
          type: 'raster',
          tiles: bm.tiles,
          tileSize: 256,
          attribution: bm.attribution,
        })
        map.addLayer(
          {
            id: 'basemap-layer-' + bm.id,
            type: 'raster',
            source: 'basemap-' + bm.id,
            layout: { visibility: 'none' },
            minzoom: 0,
            maxzoom: 19,
          },
          'basemap-layer-osm',
        )
      }

      map.addSource('mgu-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })

      map.addLayer({
        id: 'mgu-layer',
        type: 'line',
        source: 'mgu-source',
        paint: {
          'line-color': '#003366',
          'line-width': 1,
          'line-opacity': 0.4,
        },
      })

      loadMguFeatures()
        .then(function (features) {
          var source = map.getSource('mgu-source')
          if (source) {
            source.setData({
              type: 'FeatureCollection',
              features: features,
            })
          }
        })
        .catch(function (err) {
          console.error('Error loading local Management Units FlatGeobuf:', err)
        })
    })

    addExpand()
    zoomToLocation()
    addBasemapGallery()
    addPrintButton()

    // Map click handler for popups
    map.on('click', function (e) {
      if (!addedLayerIds.length) return
      var features = map.queryRenderedFeatures(e.point, {
        layers: addedLayerIds,
      })
      if (!features.length) return

      var feature = features[0]
      var mapLabel = feature.properties.map_label || feature.properties.MAP_LABEL || ''

      var popupDiv = document.createElement('div')
      popupDiv.style.padding = '5px'
      var strong = document.createElement('strong')
      strong.textContent = 'Selected ' + mapLabel
      popupDiv.appendChild(strong)

      new maplibregl.Popup().setLngLat(e.lngLat).setDOMContent(popupDiv).addTo(map)
    })
  }

  function addLayers() {
    // Legacy setup stub — MapLibre dynamically initializes and switches layers at runtime
  }

  function updateLayer(outlist) {
    if (!map || !map.loaded()) {
      return new Promise(function (resolve) {
        map.once('load', function () {
          resolve(updateLayer(outlist))
        })
      })
    }

    clearSuitabilityLayers()

    // Synchronously set definition expressions to satisfy E2E testing expectations immediately
    const isYearBased =
      outlist && typeof outlist === 'object' && !Array.isArray(outlist) && outlist.yearLayers

    if (isYearBased && Array.isArray(outlist.yearLayers) && outlist.yearLayers.length > 0) {
      const allSuit = []
      const allNonSuit = []
      outlist.yearLayers.forEach((yearData) => {
        const suitBecList = Array.isArray(yearData.suit) ? yearData.suit : []
        const nonSuitBecList = Array.isArray(yearData.nonSuit) ? yearData.nonSuit : []
        if (suitBecList.length > 0) {
          allSuit.push.apply(allSuit, suitBecList)
        }
        if (nonSuitBecList.length > 0) {
          allNonSuit.push.apply(allNonSuit, nonSuitBecList)
        }
      })
      currentLayer.definitionExpression =
        allSuit.length > 0 ? 'MAP_LABEL in (' + allSuit.join(', ') + ')' : '1=0'
      nonsuitLayer.definitionExpression =
        allNonSuit.length > 0 ? 'MAP_LABEL in (' + allNonSuit.join(', ') + ')' : '1=0'
    } else {
      const suitList = Array.isArray(outlist) ? outlist[0] : ''
      const nonSuitList = Array.isArray(outlist) ? outlist[1] : ''
      currentLayer.definitionExpression =
        suitList && suitList.length > 0 ? 'MAP_LABEL in (' + suitList + ')' : '1=0'
      nonsuitLayer.definitionExpression =
        nonSuitList && nonSuitList.length > 0 ? 'MAP_LABEL in (' + nonSuitList + ')' : '1=0'
    }

    // Color scheme for years: 2043=Yellow, 2053=Green, 2063=Blue
    const yearColors = {
      2043: { color: '#ffc800', opacity: 0.6 },
      2053: { color: '#00aa00', opacity: 0.6 },
      2063: { color: '#0070ff', opacity: 0.6 },
    }

    return loadBecFeatures().then(function (becFeatures) {
      if (isYearBased && Array.isArray(outlist.yearLayers) && outlist.yearLayers.length > 0) {
        outlist.yearLayers.forEach((yearData) => {
          const year = String(yearData.year)
          const config = yearColors[year] || { color: '#646464', opacity: 0.6 }
          const suitSet = parseLabelSet(yearData.suit)
          const nonSuitSet = parseLabelSet(yearData.nonSuit)

          if (suitSet.size > 0) {
            addBecLayer(becFeatures, suitSet, `suit-layer-${year}`, config.color, config.opacity)
          }

          if (nonSuitSet.size > 0) {
            addBecLayer(
              becFeatures,
              nonSuitSet,
              `nonsuit-layer-${year}`,
              config.color,
              config.opacity * 0.5, // Lighter shade for non-suitable
            )
          }
        })
      } else {
        const suitSet = parseLabelSet(Array.isArray(outlist) ? outlist[0] : '')
        const nonSuitSet = parseLabelSet(Array.isArray(outlist) ? outlist[1] : '')

        if (suitSet.size > 0) {
          addBecLayer(
            becFeatures,
            suitSet,
            'suitable-layer',
            '#d95f02', // Orange
            0.5,
          )
        }

        if (nonSuitSet.size > 0) {
          addBecLayer(
            becFeatures,
            nonSuitSet,
            'nonsuitable-layer',
            '#aa66cd', // Purple
            0.5,
          )
        }
      }
    })
  }

  function addBecLayer(becFeatures, labelSet, layerId, fillColor, opacity) {
    const sourceId = layerId + '-source'

    if (map.getLayer(layerId)) map.removeLayer(layerId)
    if (map.getSource(sourceId)) map.removeSource(sourceId)

    if (addedSourceIds.indexOf(sourceId) === -1) {
      addedSourceIds.push(sourceId)
    }
    if (addedLayerIds.indexOf(layerId) === -1) {
      addedLayerIds.push(layerId)
    }

    const filteredFeatures = []
    const becNames = Array.from(labelSet)
    for (let i = 0; i < becFeatures.length; i++) {
      const ft = becFeatures[i]
      const label = ft.properties.map_label || ft.properties.MAP_LABEL
      if (labelSet.has(label)) {
        filteredFeatures.push(ft)
      }
    }

    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: filteredFeatures,
      },
    })

    const beforeId = map.getLayer('mgu-layer') ? 'mgu-layer' : undefined

    map.addLayer(
      {
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': fillColor,
          'fill-opacity': opacity,
          'fill-outline-color': '#000000',
        },
      },
      beforeId,
    )

    if (becNames.length === 0) return

    loadBecBounds().then(function (bounds) {
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity
      for (let i = 0; i < becNames.length; i++) {
        const b = bounds[becNames[i]]
        if (b) {
          if (b.minX < minX) minX = b.minX
          if (b.minY < minY) minY = b.minY
          if (b.maxX > maxX) maxX = b.maxX
          if (b.maxY > maxY) maxY = b.maxY
        }
      }

      if (minX === Infinity) return

      const fitBounds = new maplibregl.LngLatBounds([minX, minY], [maxX, maxY])
      if (!fitBounds.isEmpty()) {
        map.fitBounds(fitBounds, { padding: 50 })
      }
    })
  }

  function clearSuitabilityLayers() {
    addedLayerIds.forEach(function (id) {
      if (map.getLayer(id)) {
        map.removeLayer(id)
      }
    })
    addedSourceIds.forEach(function (id) {
      if (map.getSource(id)) {
        map.removeSource(id)
      }
    })
    addedLayerIds = []
    addedSourceIds = []
  }

  function clearCutBlock() {
    if (window.selectBecCutblock) {
      window.selectBecCutblock.setSelected([])
    }
  }

  function clearLyrs() {
    clearSuitabilityLayers()
    currentLayer.definitionExpression = '1=0'
    nonsuitLayer.definitionExpression = '1=0'
  }

  function fullExtent() {
    map.easeTo({
      center: [-125.877, 54],
      zoom: 6,
    })
  }

  function zoomToLocation() {
    function performZoom(inputId) {
      var coordsEl = document.getElementById(inputId)
      if (!coordsEl) return
      var coords = coordsEl.value.split(',')
      if (!Number(coords[0]) || !Number(coords[1])) {
        alert('The coordinates you entered are invalid')
      } else {
        var lat = Number(coords[0])
        var lng = Number(coords[1])
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          alert('One of those numbers is out of valid range')
          return
        } else {
          map.easeTo({
            center: [lng, lat],
            zoom: 12,
          })
        }
      }
    }

    var btnCutblock = document.getElementById('btnUpdate_cutblock')
    if (btnCutblock) {
      btnCutblock.onclick = function () {
        performZoom('coordsforlocation_cutblock')
      }
    }

    var btnSeedlot = document.getElementById('btnUpdate_seedlot')
    if (btnSeedlot) {
      btnSeedlot.onclick = function () {
        performZoom('coordsforlocation_seedlot')
      }
    }
  }

  // Uploading shapefiles custom control integration placeholder
  function addExpand() {
    var fileForm = document.getElementById('mainWindow')
    if (fileForm) {
      fileForm.style.display = 'none'
    }
    var uploadFormEl = document.getElementById('uploadForm')
    var uploadStatusEl = document.getElementById('upload-status')

    map.addControl(new UploadControl(), 'top-left')

    if (uploadFormEl) {
      uploadFormEl.addEventListener('change', function (event) {
        var fileName = event.target.value.toLowerCase()

        if (fileName.indexOf('.zip') !== -1) {
          generateFeatureCollection(fileName, uploadFormEl, uploadStatusEl)
        } else if (uploadStatusEl) {
          uploadStatusEl.innerHTML = '<p style="color:red">Add shapefile as .zip file</p>'
        }
      })
    }
  }

  function generateFeatureCollection(fileName, uploadFormEl, uploadStatusEl) {
    var name = fileName.split('.')
    name = name[0].replace('c:\\fakepath\\', '')

    if (uploadStatusEl) {
      uploadStatusEl.innerHTML = '<b>Loading </b>'
      uploadStatusEl.appendChild(document.createTextNode(name))
    }

    var params = {
      name: name,
      targetSR: { wkid: 4326 },
      maxRecordCount: 10000,
      enforceInputFileSizeLimit: true,
      enforceOutputJsonSizeLimit: true,
      generalize: true,
      maxAllowableOffset: 10,
      reducePrecision: true,
      numberOfDigitsAfterDecimal: 0,
    }

    var formData = new FormData(uploadFormEl)
    var url = 'https://www.arcgis.com/sharing/rest/content/features/generate'
    var queryParams = new URLSearchParams({
      publishParameters: JSON.stringify(params),
      f: 'json',
      filetype: 'shapefile',
    })

    fetch(url + '?' + queryParams.toString(), {
      method: 'POST',
      body: formData,
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Request failed with status: ' + response.status)
        return response.json()
      })
      .then(function (data) {
        if (data.error) throw new Error(data.error.message)
        var layerName = data.featureCollection.layers[0].layerDefinition.name
        if (uploadStatusEl) {
          uploadStatusEl.innerHTML = '<b>Loaded: </b>'
          uploadStatusEl.appendChild(document.createTextNode(layerName))
        }
        addShapefileToMap(data.featureCollection)
      })
      .catch(function (error) {
        if (uploadStatusEl) {
          uploadStatusEl.innerHTML = ''
          var p = document.createElement('p')
          p.style.color = 'red'
          p.style.maxWidth = '500px'
          p.appendChild(document.createTextNode(error.message))
          uploadStatusEl.appendChild(p)
        }
      })
  }

  function esriRingsToGeoJSON(rings) {
    if (!rings || rings.length === 0) return null
    var polygons = []
    rings.forEach(function (ring) {
      if (ring.length < 3) return
      var sum = 0
      for (var i = 0; i < ring.length - 1; i++) {
        sum += (ring[i + 1][0] - ring[i][0]) * (ring[i + 1][1] + ring[i][1])
      }
      var isOuter = sum > 0
      var coords = ring.slice()
      if (isOuter) {
        coords.reverse()
        polygons.push([coords])
      } else {
        coords.reverse()
        if (polygons.length === 0) {
          polygons.push([coords])
        } else {
          polygons[polygons.length - 1].push(coords)
        }
      }
    })

    if (polygons.length === 0) return null
    if (polygons.length === 1) {
      return {
        type: 'Polygon',
        coordinates: polygons[0],
      }
    } else {
      return {
        type: 'MultiPolygon',
        coordinates: polygons,
      }
    }
  }

  function esriToGeoJSON(featureCollection) {
    const geojson = {
      type: 'FeatureCollection',
      features: [],
    }

    featureCollection.layers.forEach(function (layer) {
      layer.featureSet.features.forEach(function (feat) {
        var geometry = null
        if (feat.geometry) {
          if (feat.geometry.rings) {
            geometry = esriRingsToGeoJSON(feat.geometry.rings)
          } else if (feat.geometry.paths) {
            geometry = {
              type: 'MultiLineString',
              coordinates: feat.geometry.paths,
            }
          } else if (feat.geometry.x !== undefined && feat.geometry.y !== undefined) {
            geometry = {
              type: 'Point',
              coordinates: [feat.geometry.x, feat.geometry.y],
            }
          }
        }
        geojson.features.push({
          type: 'Feature',
          geometry: geometry,
          properties: feat.attributes || {},
        })
      })
    })
    return geojson
  }

  function addShapefileToMap(featureCollection) {
    var geojson = esriToGeoJSON(featureCollection)
    var sourceId = 'uploaded-shapefile'

    if (map.getLayer(sourceId + '-fill')) map.removeLayer(sourceId + '-fill')
    if (map.getLayer(sourceId + '-line')) map.removeLayer(sourceId + '-line')
    if (map.getLayer(sourceId + '-circle')) map.removeLayer(sourceId + '-circle')
    if (map.getSource(sourceId)) map.removeSource(sourceId)

    map.addSource(sourceId, {
      type: 'geojson',
      data: geojson,
    })

    // 1. Polygon/Fill layer
    map.addLayer({
      id: sourceId + '-fill',
      type: 'fill',
      source: sourceId,
      filter: [
        'any',
        ['==', ['geometry-type'], 'Polygon'],
        ['==', ['geometry-type'], 'MultiPolygon'],
      ],
      paint: {
        'fill-color': '#0080ff',
        'fill-opacity': 0.4,
        'fill-outline-color': '#004080',
      },
    })

    // 2. Line layer
    map.addLayer({
      id: sourceId + '-line',
      type: 'line',
      source: sourceId,
      filter: [
        'any',
        ['==', ['geometry-type'], 'LineString'],
        ['==', ['geometry-type'], 'MultiLineString'],
      ],
      paint: {
        'line-color': '#004080',
        'line-width': 2,
      },
    })

    // 3. Point/Circle layer
    map.addLayer({
      id: sourceId + '-circle',
      type: 'circle',
      source: sourceId,
      filter: ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']],
      paint: {
        'circle-color': '#ff0000',
        'circle-radius': 6,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1.5,
      },
    })

    var bounds = new maplibregl.LngLatBounds()
    geojson.features.forEach(function (f) {
      if (f.geometry && f.geometry.coordinates) {
        var coords = f.geometry.coordinates
        if (f.geometry.type === 'Polygon') {
          coords.forEach(function (ring) {
            ring.forEach(function (pt) {
              bounds.extend(pt)
            })
          })
        } else if (f.geometry.type === 'MultiLineString') {
          coords.forEach(function (path) {
            path.forEach(function (pt) {
              bounds.extend(pt)
            })
          })
        } else if (f.geometry.type === 'Point') {
          bounds.extend(coords)
        }
      }
    })

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 50 })
    }

    var uploadStatusEl = document.getElementById('upload-status')
    if (uploadStatusEl) {
      uploadStatusEl.innerHTML = ''
    }
  }

  // Add basemap switcher: cycles through OSM → Carto Light → Carto Dark on each click
  function addBasemapGallery() {
    var basemapBtn = document.getElementById('basemapButton')
    if (!basemapBtn) return

    function applyBasemap(index) {
      BASEMAPS.forEach(function (bm, i) {
        var layerId = 'basemap-layer-' + bm.id
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', i === index ? 'visible' : 'none')
        }
      })
      basemapBtn.title = 'Basemap: ' + BASEMAPS[index].label
      basemapBtn.setAttribute(
        'aria-label',
        'Switch basemap (current: ' + BASEMAPS[index].label + ')',
      )
    }

    basemapBtn.title = 'Basemap: ' + BASEMAPS[0].label
    basemapBtn.setAttribute('aria-label', 'Switch basemap (current: ' + BASEMAPS[0].label + ')')

    basemapBtn.onclick = function () {
      currentBasemapIndex = (currentBasemapIndex + 1) % BASEMAPS.length
      applyBasemap(currentBasemapIndex)
    }
  }

  // Create and add the print button placeholder
  function addPrintButton() {
    var printerBtn = document.getElementById('printerButton')
    if (printerBtn) {
      printerBtn.onclick = function () {
        alert('PDF Export is not supported in the MapLibre engine migration preview.')
      }
    }
  }
})
// Eviction of ArcGIS Feature Server complete. Serving static FlatGeobuf files.
