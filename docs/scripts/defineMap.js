/*
 * Define the JavaScript functions used to create the structure and widgets
 */

define([
  'esri/Map',
  'esri/views/MapView',
  'esri/layers/FeatureLayer',
  'esri/layers/GraphicsLayer',
  'esri/widgets/Print',
  'esri/widgets/BasemapGallery',
  'esri/widgets/DistanceMeasurement2D',
  'esri/widgets/AreaMeasurement2D',
  'esri/request',
  'esri/layers/support/Field',
  'esri/Graphic',
  'esri/layers/KMLLayer',
], function (
  Map,
  MapView,
  FeatureLayer,
  GraphicsLayer,
  Print,
  BasemapGallery,
  DistanceMeasurement2D,
  AreaMeasurement2D,
  request,
  Field,
  Graphic,
  KMLLayer,
) {
  var map, view, xy
  var layerButton
  var _scaleBar, layerList
  var activeWidget
  var expand, trackWidget
  var currentLayer, nonsuitLayer, _current2019Layer, _nonsuit2019Layer, spuLayer, mguLayer
  var _suitRenderer, _nonSuitRenderer
  var portalUrl = 'https://www.arcgis.com'
  var template
  var uploadFormEl, uploadStatusEl

  template = {
    title: 'Selected {MAP_Label}',
  }

  _suitRenderer = {
    type: 'simple-fill',
    color: [217, 95, 2, 0.4],
    outline: {
      color: [115, 76, 0, 1],
    },
  }
  _nonSuitRenderer = {
    type: 'simple-fill',
    color: [170, 102, 205, 0.4],
    outline: {
      color: [76, 0, 115, 1],
    },
  }

  return {
    mapInit: mapInit,
    fullExtent: fullExtent,
    clearLyrs: clearLyrs,
    addLayers: addLayers,
    updateLayer: updateLayer,
    displaySPU: displaySPU,
    updatePopup: updatePopup,
    clearCutBlock: clearCutBlock,
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
    updatePopup()

    addExpand()
    addTracking()
    zoomToLocation()

    // When the view UI is loaded, add the buttons
    view.when(function () {
      view.ui.add('topbar', 'top-left')
      view.ui.add(expand, 'top-left')
      view.ui.add(trackWidget, 'top-left')

      const _attributeEditing = document.getElementById('featureUpdateDiv')

      addBasemapGallery()
      addPrintButton()
      addScalebar()
    })
  }

  function addLayers(layers) {
    map.addMany(layers)
  }

  function layerInit() {
    currentLayer = featureInit(
      'https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/5',
      ['map_label', 'SHAPE_Area'],
      'CBST',
    )
    nonsuitLayer = featureInit(
      'https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/6',
      ['map_label', 'SHAPE_Area'],
      'CBST Species May Not Be Suitable',
    )
    _current2019Layer = featureInit(
      'https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/2',
      ['map_label', 'SHAPE_Area'],
      'CBST 2019',
    )
    _nonsuit2019Layer = featureInit(
      'https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/3',
      ['map_label', 'SHAPE_Area'],
      '2019 Species May Not Be Suitable',
    )
    spuLayer = featureInit(
      'https://maps.forsite.ca/server/rest/services/204_2/CBST_BEC_v11/MapServer/1',
      ['Seedlot', 'SPU'],
      'Area of Use',
    )
    mguLayer = featureInit(
      'https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/0',
      ['Management_Units'],
      'Management Unit',
    )
    spuLayer
      .load()
      .then(function () {
        map.add(spuLayer)
      })
      .catch(function () {
        console.info(
          'Area of Use layer failed to load (expected in public deployment). Skipping map addition.',
        )
      })
    mguLayer
      .load()
      .then(function () {
        map.add(mguLayer)
      })
      .catch(function (error) {
        console.error(
          'Failed to load Management Unit layer. Skipping map addition to prevent WebGL crash.',
          error,
        )
      })
  }

  function updateLayer(outlist) {
    // outlist: all 4 possible queries that reflect the users chosen species and bec variant
    // outlist = [outlist_suit, outlist_non_suit, outlist_2019, outlist_non_2019]
    window.outlist = outlist

    if (outlist[1].length != 0) {
      nonsuitLayer.definitionExpression = 'MAP_LABEL in (' + outlist[1] + ')'
      nonsuitLayer.popupTemplate = template
      map.add(nonsuitLayer)
    } else {
      nonsuitLayer.definitionExpression = 'MAP_LABEL in ()'
      nonsuitLayer.popupTemplate = ''
      map.add(nonsuitLayer)
    }

    if (outlist[0].length != 0) {
      currentLayer.definitionExpression = 'MAP_LABEL in (' + outlist[0] + ')'
      currentLayer.popupTemplate = template
      map.add(currentLayer)
    } else {
      currentLayer.definitionExpression = 'MAP_LABEL in ()'
      currentLayer.popupTemplate = ''
      map.add(currentLayer)
    }

    if (mguLayer.loadStatus === 'loaded') {
      map.add(mguLayer)
    }
    if (spuLayer.loadStatus === 'loaded') {
      map.add(spuLayer)
    }
  }

  function displaySPU(SPLayer) {
    if (spuLayer.loadStatus === 'loaded') {
      spuLayer.definitionExpression = 'Seedlot = ' + SPLayer
      map.add(spuLayer)
    }
  }

  function updatePopup() {
    nonsuitLayer.on('selection-complete', (event) => {
      // Round coordinates to 3 decimals
      const lat = Math.round(event.mapPoint.latitude * 1000) / 1000
      const lon = Math.round(event.mapPoint.longitude * 1000) / 1000

      view.popup.open({
        // Set the popup's title to the coordinates of the clicked location
        title: 'Reverse geocode: [' + lon + ', ' + lat + ']',
        location: event.mapPoint, // Set the location of the popup to the clicked location
      })
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
  // Initialize a feature layer
  function featureInit(src, fields, name) {
    var layer = new FeatureLayer({
      url: src,
      title: name,
      outfields: fields,
      opacity: 0.5,
      visibilityMode: 'independent',
    })
    layer.load().catch(function (error) {
      if (name === 'Area of Use') {
        console.info('Area of Use layer requires authentication and is skipped in public mode.')
      } else {
        console.warn('Failed to load feature layer: ' + name, error)
      }
    })
    return layer
  }

  function _kmlInit(src) {
    return new KMLLayer({
      url: src,
      title: 'KML Sample',
    })
  }

  // Initialize a feature layer with definition query and custom renderer
  function _featureInit_complex(src, expression, name, renderer) {
    return new FeatureLayer({
      url: src,
      definitionExpression: expression,
      title: name,
      renderer: renderer,
      opacity: 0.5,
      visibilityMode: 'independent',
    })
  }

  /*
   * Utility Functions
   */
  function _popupTable(lyr) {
    lyr.load().then(function () {
      lyr.popupTemplate = lyr.createPopupTemplate()
    })
  }

  function _updateKey(list) {
    var listLength = list.length
    var newlist = new Array()
    for (let i = 0; i < listLength; i++) {
      newlist.push(list[i][1].replace(/ /g, '_'))
    }
    return newlist
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

  // Add the line and area measurement tools
  function _addMeasurement() {
    document.getElementById('distanceButton').addEventListener('click', function () {
      setActiveWidget(null)
      if (!this.classList.contains('active')) {
        setActiveWidget('distance')
        view.focus()
      } else {
        setActiveButton(null)
      }
    })
    document.getElementById('areaButton').addEventListener('click', function () {
      setActiveWidget(null)
      if (!this.classList.contains('active')) {
        setActiveWidget('area')
        view.focus()
      } else {
        setActiveButton(null)
      }
    })
  }

  /*Create and add the extent button widget*/
  function _addExtentButton() {
    document.getElementById('homeButton').addEventListener('click', function () {
      fullExtent()
    })
  }

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

  function _addMouseCoord() {
    var coordsWidget = document.createElement('mouseDiv')
    coordsWidget.id = 'coordsWidget'
    coordsWidget.className = 'esri-widget esri-component'
    view.ui.add(coordsWidget, 'bottom-right')
    function showCoordinates(pt) {
      var coords =
        'Lat/Long ' +
        pt.latitude.toFixed(3) +
        ' ' +
        pt.longitude.toFixed(3) +
        ' | Scale 1:' +
        Math.round(view.scale * 1) / 1
      coordsWidget.innerHTML = coords
    }

    view.watch('stationary', function (_isStationary) {
      showCoordinates(view.center)
    })
    view.on('pointer-move', function (evt) {
      showCoordinates(view.toMap({ x: evt.x, y: evt.y }))
    })
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

  // Add the instructions button
  function _addLogo() {
    document.getElementById('instructionButton').addEventListener('click', function () {
      setActiveWidget(null)
      if (!this.classList.contains('active')) {
        setActiveWidget('instruction')
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
        activeWidget = fullExtent()
        view.ui.add(activeWidget)
        setActiveButton(document.getElementById('homeButton'))
        break
      case 'basemap':
        activeWidget = new BasemapGallery({
          view: view,
        })
        view.ui.add(activeWidget, 'top-right')
        setActiveButton(document.getElementById('basemapButton'))
        break
      case 'printer':
        activeWidget = new Print({
          view: view,
          id: 'printer',
          printServiceUrl:
            'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
        })
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
          activeWidget.destroy()
          activeWidget = null
        }
        break
    }
  }
})
