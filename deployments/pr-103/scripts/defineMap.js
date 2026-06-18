/*
 * Define the JavaScript functions used to create the structure and widgets
 */

define([
  'esri/Map',
  'esri/views/MapView',
  'esri/layers/FeatureLayer',
  'esri/layers/GraphicsLayer',
  'esri/widgets/DistanceMeasurement2D',
  'esri/widgets/AreaMeasurement2D',
  'esri/request',
  'esri/layers/support/Field',
  'esri/Graphic',
  'esri/renderers/SimpleRenderer',
  'esri/symbols/SimpleFillSymbol',
  'lib/flatgeobuf/flatgeobuf-geojson.min.js',
], function (
  Map,
  MapView,
  FeatureLayer,
  GraphicsLayer,
  DistanceMeasurement2D,
  AreaMeasurement2D,
  request,
  Field,
  Graphic,
  SimpleRenderer,
  SimpleFillSymbol,
  flatgeobuf,
) {
  var map, view, xy
  var _scaleBar
  var activeWidget
  var expand, trackWidget
  var currentLayer, nonsuitLayer, mguLayer
  var _suitRenderer, _nonSuitRenderer
  var portalUrl = 'https://www.arcgis.com'
  var template
  var uploadFormEl, uploadStatusEl

  // Local FlatGeobuf polygon snapshots exported from the (retiring) Forsite
  // FeatureServer. See scripts/export-layers-to-fgb.js and issue #100.
  var BEC_VARIANTS_URL = 'Version_7_0/BEC_Variants.fgb'
  var MANAGEMENT_UNITS_URL = 'Version_7_0/Management_Units.fgb'

  // Original Forsite simple-renderer colors, preserved for visual parity.
  var SUIT_COLOR = { r: 217, g: 95, b: 2, outline: [115, 76, 0] } // orange
  var NONSUIT_COLOR = { r: 170, g: 102, b: 205, outline: [76, 0, 115] } // purple

  // Cache of all BEC variant features ({ rings, label }) parsed once from the
  // local FGB; display layers are built by filtering this to selected variants.
  var becFeaturesPromise = null

  template = {
    title: 'Selected {MAP_LABEL}',
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
    _view: function () {
      return view
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
    map = new Map({
      basemap: 'topo',
      layers: [],
    })

    // Create a new map view and add the map to it
    xy = [-125.877, 54]
    view = new MapView({
      center: xy,
      zoom: 6,
      container: 'mapDiv',
      map: map,
      popup: {
        dockEnabled: false,
        dockOptions: {
          position: 'bottom-center',
          breakpoint: false,
        },
      },
    })

    // Make the layers
    layerInit()

    addExpand()
    addTracking()
    zoomToLocation()

    // When the view UI is loaded, add the buttons
    view.when(function () {
      view.ui.add('topbar', 'top-left')
      view.ui.add(expand, 'top-left')
      view.ui.add(trackWidget, 'top-left')

      addBasemapGallery()
      addPrintButton()
      addScalebar()
    })
  }

  function addLayers(layers) {
    map.addMany(layers)
  }

  function layerInit() {
    // Management Units render as a static outline overlay from startup.
    // Loaded from the local FlatGeobuf snapshot (formerly Forsite layer 0).
    loadFgbFeatures(MANAGEMENT_UNITS_URL)
      .then(function (features) {
        mguLayer = buildPolygonLayer(features, null, {
          fill: [130, 130, 130, 0],
          outline: [0, 0, 0],
          outlineWidth: 1,
          opacity: 1,
          title: 'Management Unit',
          popup: false,
        })
        map.add(mguLayer)
      })
      .catch(function (error) {
        console.error('Failed to load Management Unit layer from local FlatGeobuf.', error)
      })
  }

  function updateLayer(outlist) {
    // outlist: the user's chosen suitable / non-suitable BEC variants. Either:
    //   [suitList, nonSuitList]                       - simple format (quoted, comma-joined)
    //   { yearLayers: [{year, suit, nonSuit}, ...] }  - year-based format (arrays)
    //
    // Polygons are drawn from the local BEC_Variants FlatGeobuf snapshot: we
    // load all variant features once (cached), then build a client-side ArcGIS
    // FeatureLayer containing only the selected variants for each display layer.
    // Returns a promise so callers can keep the loader visible until the (large)
    // BEC snapshot has finished loading on first use.
    return loadBecFeatures().then(function (becFeatures) {
      // Color scheme for years: 2043=Yellow, 2053=Green, 2063=Blue
      const yearColors = {
        2043: { r: 255, g: 200, b: 0 },
        2053: { r: 0, g: 170, b: 0 },
        2063: { r: 0, g: 112, b: 255 },
      }

      const isYearBased =
        outlist && typeof outlist === 'object' && !Array.isArray(outlist) && outlist.yearLayers

      if (isYearBased && Array.isArray(outlist.yearLayers) && outlist.yearLayers.length > 0) {
        outlist.yearLayers.forEach((yearData) => {
          const year = String(yearData.year)
          const color = yearColors[year] || { r: 100, g: 100, b: 100 }
          const suitSet = parseLabelSet(yearData.suit)
          const nonSuitSet = parseLabelSet(yearData.nonSuit)

          if (suitSet.size > 0) {
            map.add(
              buildPolygonLayer(becFeatures, suitSet, {
                fill: [color.r, color.g, color.b],
                outline: [color.r, color.g, color.b],
                outlineWidth: 1.5,
                opacity: 0.6,
                title: `Year ${year} - Suitable`,
              }),
            )
          }

          if (nonSuitSet.size > 0) {
            map.add(
              buildPolygonLayer(becFeatures, nonSuitSet, {
                fill: [color.r, color.g, color.b],
                outline: [color.r, color.g, color.b],
                outlineWidth: 1.5,
                opacity: 0.3, // Lighter shade for non-suitable
                title: `Year ${year} - Not Suitable`,
              }),
            )
          }
        })
      } else {
        const suitSet = parseLabelSet(Array.isArray(outlist) ? outlist[0] : '')
        const nonSuitSet = parseLabelSet(Array.isArray(outlist) ? outlist[1] : '')

        nonsuitLayer = buildPolygonLayer(becFeatures, nonSuitSet, {
          fill: [NONSUIT_COLOR.r, NONSUIT_COLOR.g, NONSUIT_COLOR.b],
          outline: NONSUIT_COLOR.outline,
          outlineWidth: 1,
          opacity: 0.5,
          title: 'CBST Species May Not Be Suitable',
        })
        map.add(nonsuitLayer)

        currentLayer = buildPolygonLayer(becFeatures, suitSet, {
          fill: [SUIT_COLOR.r, SUIT_COLOR.g, SUIT_COLOR.b],
          outline: SUIT_COLOR.outline,
          outlineWidth: 1,
          opacity: 0.5,
          title: 'CBST',
        })
        map.add(currentLayer)
      }

      // Keep the Management Units outline on top, if it has finished loading.
      if (mguLayer) {
        map.add(mguLayer)
      }
    })
  }

  /*
   * Section with functions for different layer types and situations
   */

  function clearCutBlock() {
    if (window.selectBecCutblock) {
      window.selectBecCutblock.setSelected([])
    }
  }

  function clearLyrs() {
    map.layers.removeAll()
  }
  // Convert a GeoJSON Polygon/MultiPolygon into ArcGIS polygon rings.
  function geomToRings(geometry) {
    if (!geometry) return null
    if (geometry.type === 'Polygon') return geometry.coordinates
    if (geometry.type === 'MultiPolygon') {
      var rings = []
      geometry.coordinates.forEach(function (poly) {
        poly.forEach(function (ring) {
          rings.push(ring)
        })
      })
      return rings
    }
    return null
  }

  // Parse the (single-quoted, comma-joined or array) variant lists into a Set
  // of plain MAP_LABEL strings, e.g. "'IDFdk1', 'SBSmc2'" -> {IDFdk1, SBSmc2}.
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

  // Read all features from a local FlatGeobuf file into lightweight
  // { rings, label } records (geometry kept as raw rings for cheap reuse).
  // The whole file is fetched and decoded from bytes: the URL-based
  // flatgeobuf.deserialize path requires a bounding rect for HTTP range
  // queries, but here we need every feature so we can filter by MAP_LABEL.
  function loadFgbFeatures(url) {
    return (async function () {
      var response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch ' + url + ': ' + response.status)
      }
      var bytes = new Uint8Array(await response.arrayBuffer())
      var out = []
      var iterator = flatgeobuf.deserialize(bytes)
      for await (var feature of iterator) {
        var rings = geomToRings(feature.geometry)
        if (!rings) continue
        var props = feature.properties || {}
        out.push({ rings: rings, label: props.map_label })
      }
      return out
    })()
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

  // Build a client-side ArcGIS FeatureLayer from cached polygon features,
  // optionally filtered to a Set of MAP_LABELs.
  function buildPolygonLayer(features, labelSet, opts) {
    var graphics = []
    var oid = 1
    for (var i = 0; i < features.length; i++) {
      var ft = features[i]
      if (labelSet && !labelSet.has(ft.label)) continue
      graphics.push(
        new Graphic({
          geometry: {
            type: 'polygon',
            rings: ft.rings,
            spatialReference: { wkid: 4326 },
          },
          attributes: { OBJECTID: oid++, MAP_LABEL: ft.label == null ? '' : ft.label },
        }),
      )
    }

    var symbol = new SimpleFillSymbol({
      color: opts.fill,
      outline: { color: opts.outline, width: opts.outlineWidth || 1 },
    })

    return new FeatureLayer({
      source: graphics,
      objectIdField: 'OBJECTID',
      geometryType: 'polygon',
      spatialReference: { wkid: 4326 },
      fields: [
        { name: 'OBJECTID', type: 'oid' },
        { name: 'MAP_LABEL', type: 'string' },
      ],
      title: opts.title,
      opacity: opts.opacity == null ? 0.5 : opts.opacity,
      popupTemplate: opts.popup === false || graphics.length === 0 ? null : template,
      renderer: new SimpleRenderer({ symbol: symbol }),
    })
  }

  function fullExtent() {
    view.goTo({
      center: xy,
      zoom: 8.5,
    })
  }

  /*
   * Widgets and behaviour
   */

  function addTracking() {
    trackWidget = document.createElement('arcgis-track')
    trackWidget.view = view
  }

  function zoomToLocation() {
    function performZoom(inputId) {
      var coords = document.getElementById(inputId).value.split(',')
      if (!Number(coords[0]) || !Number(coords[1])) {
        alert('The coordinates you entered are invalid')
      } else {
        if (coords[0] < -90 || coords[0] > 90 || coords[1] < -180 || coords[1] > 180) {
          alert('One of those numbers is out of valid range')
          return
        } else {
          view.center = [coords[1], coords[0]]
          view.zoom = 12
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

  // Uploading and downloading shapefiles section

  function addExpand() {
    var fileForm = document.getElementById('mainWindow')
    if (fileForm) {
      fileForm.style.display = 'block'
    }
    uploadFormEl = document.getElementById('uploadForm')
    uploadStatusEl = document.getElementById('upload-status')

    expand = document.createElement('arcgis-expand')
    expand.view = view
    expand.expanded = false
    expand.setAttribute('expand-icon', 'upload')
    expand.appendChild(fileForm)

    // Collapse the expand widget whenever the user clicks outside on the map view
    view.on('click', function () {
      if (expand) {
        expand.expanded = false
      }
    })

    if (uploadFormEl) {
      uploadFormEl.addEventListener('change', function (event) {
        var fileName = event.target.value.toLowerCase()

        if (fileName.indexOf('.zip') !== -1) {
          //is file a zip - if not notify user
          generateFeatureCollection(fileName)
        } else if (uploadStatusEl) {
          uploadStatusEl.innerHTML = '<p style="color:red">Add shapefile as .zip file</p>'
        }
      })
    }
  }

  function generateFeatureCollection(fileName) {
    var name = fileName.split('.')
    // Chrome and IE add c:\fakepath to the value - we need to remove it
    // see this link for more info: http://davidwalsh.name/fakepath
    name = name[0].replace('c:\\fakepath\\', '')

    if (uploadStatusEl) {
      uploadStatusEl.innerHTML = '<b>Loading </b>'
      uploadStatusEl.appendChild(document.createTextNode(name))
    }

    // define the input params for generate see the rest doc for details
    // https://developers.arcgis.com/rest/users-groups-and-items/generate.htm
    var params = {
      name: name,
      targetSR: view.spatialReference,
      maxRecordCount: 10000,
      enforceInputFileSizeLimit: true,
      enforceOutputJsonSizeLimit: true,
    }

    // generalize features to 10 meters for better performance
    params.generalize = true
    params.maxAllowableOffset = 10
    params.reducePrecision = true
    params.numberOfDigitsAfterDecimal = 0

    var myContent = {
      filetype: 'shapefile',
      publishParameters: JSON.stringify(params),
      f: 'json',
    }

    // use the REST generate operation to generate a feature collection from the zipped shapefile
    request(portalUrl + '/sharing/rest/content/features/generate', {
      query: myContent,
      body: uploadFormEl,
      responseType: 'json',
    })
      .then(function (response) {
        var layerName = response.data.featureCollection.layers[0].layerDefinition.name
        if (uploadStatusEl) {
          uploadStatusEl.innerHTML = '<b>Loaded: </b>'
          uploadStatusEl.appendChild(document.createTextNode(layerName))
        }
        addShapefileToMap(response.data.featureCollection)
      })
      .catch(errorHandler)
  }

  function errorHandler(error) {
    if (uploadStatusEl) {
      uploadStatusEl.innerHTML = ''
      var p = document.createElement('p')
      p.style.color = 'red'
      p.style.maxWidth = '500px'
      p.appendChild(document.createTextNode(error.message))
      uploadStatusEl.appendChild(p)
    }
  }

  function addShapefileToMap(featureCollection) {
    // add the shapefile to the map and zoom to the feature collection extent
    // if you want to persist the feature collection when you reload browser, you could store the
    // collection in local storage by serializing the layer using featureLayer.toJson()
    // see the 'Feature Collection in Local Storage' sample for an example of how to work with local storage
    var sourceGraphics = []

    var layers = featureCollection.layers.map(function (layer) {
      var graphics = layer.featureSet.features.map(function (feature) {
        return Graphic.fromJSON(feature)
      })
      sourceGraphics = sourceGraphics.concat(graphics)
      var featureLayer = new FeatureLayer({
        objectIdField: 'FID',
        source: graphics,
        fields: layer.layerDefinition.fields.map(function (field) {
          return Field.fromJSON(field)
        }),
      })
      return featureLayer
      // associate the feature with the popup on click to enable highlight and zoom to
    })
    map.addMany(layers)
    view.goTo(sourceGraphics).catch(function (error) {
      if (error.name != 'AbortError') {
        console.error(error)
      }
    })

    if (uploadStatusEl) {
      uploadStatusEl.innerHTML = ''
    }
  }

  // Add the basemap gallery
  function addBasemapGallery() {
    document.getElementById('basemapButton').addEventListener('click', function () {
      setActiveWidget(null)
      if (!this.classList.contains('active')) {
        setActiveWidget('basemap')
      } else {
        setActiveButton(null)
      }
    })
  }

  //Create and add the print button
  function addPrintButton() {
    document.getElementById('printerButton').addEventListener('click', function () {
      setActiveWidget(null)
      if (!this.classList.contains('active')) {
        setActiveWidget('printer')
      } else {
        setActiveButton(null)
      }
    })
  }

  // Create and add a scalebar
  function addScalebar() {
    _scaleBar = document.createElement('arcgis-scale-bar')
    _scaleBar.view = view
    _scaleBar.setAttribute('unit', 'metric')
    _scaleBar.setAttribute('bar-style', 'ruler')
    view.ui.add(_scaleBar, 'bottom-left')
  }

  function setActiveButton(selectedButton) {
    var elements = document.getElementsByClassName('action-button')
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove('active')
    }
    if (selectedButton) {
      selectedButton.classList.add('active')
    }
  }

  function setActiveWidget(type) {
    switch (type) {
      case 'home':
        fullExtent()
        setActiveButton(document.getElementById('homeButton'))
        break
      case 'basemap':
        activeWidget = document.createElement('arcgis-basemap-gallery')
        activeWidget.view = view
        view.ui.add(activeWidget, 'top-right')
        setActiveButton(document.getElementById('basemapButton'))
        break
      case 'printer':
        activeWidget = document.createElement('arcgis-print')
        activeWidget.view = view
        activeWidget.setAttribute(
          'print-service-url',
          'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
        )
        view.ui.add(activeWidget, 'top-right')
        setActiveButton(document.getElementById('printerButton'))
        break
      case 'distance':
        activeWidget = new DistanceMeasurement2D({
          view: view,
          unit: 'meters',
        })
        // skip the initial 'new measurement' button
        activeWidget.viewModel.newMeasurement()
        view.ui.add(activeWidget, 'manual')
        setActiveButton(document.getElementById('distanceButton'))
        break
      case 'area':
        activeWidget = new AreaMeasurement2D({
          view: view,
          unit: 'hectares',
        })
        activeWidget.viewModel.newMeasurement()
        view.ui.add(activeWidget, 'manual')
        setActiveButton(document.getElementById('areaButton'))
        break

      case null:
        if (activeWidget) {
          view.ui.remove(activeWidget)
          if (typeof activeWidget.destroy === 'function') {
            activeWidget.destroy()
          }
          activeWidget = null
        }
        break
    }
  }
})
