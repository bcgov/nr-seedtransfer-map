/*
 * Define the JavaScript functions used to create the structure and widgets
 */

define([], function () {
  var map
  var currentLayer = {
    definitionExpression: '1=0',
  }
  var nonsuitLayer = {
    definitionExpression: '1=0',
  }

  var addedLayerIds = []
  var addedSourceIds = []

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
      button.innerHTML = '📁'
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
    // Expose internal layers for E2E testing
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
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
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

      new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML('<div style="padding: 5px;"><strong>Selected ' + mapLabel + '</strong></div>')
        .addTo(map)
    })
  }

  function addLayers(_layers) {
    // No-op placeholder to preserve API compatibility
  }

  function updateLayer(outlist) {
    clearSuitabilityLayers()

    // Color scheme for years: 2043=Yellow, 2053=Green, 2063=Blue
    const yearColors = {
      2043: { color: '#ffc800', opacity: 0.6 },
      2053: { color: '#00aa00', opacity: 0.6 },
      2063: { color: '#0070ff', opacity: 0.6 },
    }

    const isYearBased =
      outlist && typeof outlist === 'object' && !Array.isArray(outlist) && outlist.yearLayers

    if (isYearBased && Array.isArray(outlist.yearLayers) && outlist.yearLayers.length > 0) {
      // Update definition expressions for E2E tests monitoring the expression
      const allSuit = []
      const allNonSuit = []

      outlist.yearLayers.forEach((yearData) => {
        const year = String(yearData.year)
        const suitBecList = Array.isArray(yearData.suit) ? yearData.suit : []
        const nonSuitBecList = Array.isArray(yearData.nonSuit) ? yearData.nonSuit : []
        const config = yearColors[year] || { color: '#646464', opacity: 0.6 }

        if (suitBecList.length > 0) {
          allSuit.push.apply(allSuit, suitBecList)
          addArcGISQueryLayer(
            'https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/5',
            'MAP_LABEL in (' + suitBecList.join(', ') + ')',
            `suit-layer-${year}`,
            config.color,
            config.opacity,
          )
        }

        if (nonSuitBecList.length > 0) {
          allNonSuit.push.apply(allNonSuit, nonSuitBecList)
          addArcGISQueryLayer(
            'https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/6',
            'MAP_LABEL in (' + nonSuitBecList.join(', ') + ')',
            `nonsuit-layer-${year}`,
            config.color,
            config.opacity * 0.5, // Lighter shade for non-suitable
          )
        }
      })

      currentLayer.definitionExpression =
        allSuit.length > 0 ? 'MAP_LABEL in (' + allSuit.join(', ') + ')' : '1=0'
      nonsuitLayer.definitionExpression =
        allNonSuit.length > 0 ? 'MAP_LABEL in (' + allNonSuit.join(', ') + ')' : '1=0'
    } else {
      // Simple format (single year or fallback)
      const suitList = Array.isArray(outlist) ? outlist[0] : ''
      const nonSuitList = Array.isArray(outlist) ? outlist[1] : ''

      currentLayer.definitionExpression =
        suitList && suitList.length > 0 ? 'MAP_LABEL in (' + suitList + ')' : '1=0'
      nonsuitLayer.definitionExpression =
        nonSuitList && nonSuitList.length > 0 ? 'MAP_LABEL in (' + nonSuitList + ')' : '1=0'

      if (suitList && suitList.length > 0) {
        addArcGISQueryLayer(
          'https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/5',
          'MAP_LABEL in (' + suitList + ')',
          'suitable-layer',
          '#d95f02', // Orange
          0.7,
        )
      }

      if (nonSuitList && nonSuitList.length > 0) {
        addArcGISQueryLayer(
          'https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/6',
          'MAP_LABEL in (' + nonSuitList + ')',
          'nonsuitable-layer',
          '#aa66cd', // Purple
          0.7,
        )
      }
    }
  }

  function addArcGISQueryLayer(baseUrl, whereClause, layerId, fillColor, opacity) {
    const queryUrl =
      baseUrl +
      '/query?where=' +
      encodeURIComponent(whereClause) +
      '&outFields=map_label&f=geojson&outSR=4326&returnGeometry=true'
    const sourceId = layerId + '-source'

    addedSourceIds.push(sourceId)
    addedLayerIds.push(layerId)

    map.addSource(sourceId, {
      type: 'geojson',
      data: queryUrl,
    })

    map.addLayer({
      id: layerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': fillColor,
        'fill-opacity': opacity,
        'fill-outline-color': '#000000',
      },
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
    })

    fetch(url + '?' + queryParams.toString(), {
      method: 'POST',
      body: formData,
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Network response was not ok')
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
            geometry = {
              type: 'Polygon',
              coordinates: feat.geometry.rings,
            }
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

  // Add the basemap gallery placeholder
  function addBasemapGallery() {
    var basemapBtn = document.getElementById('basemapButton')
    if (basemapBtn) {
      basemapBtn.onclick = function () {
        alert('Basemap switcher is not supported in the MapLibre engine migration preview.')
      }
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
