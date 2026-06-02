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

    mguLayer = featureInit(
      'https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/0',
      ['Management_Units'],
      'Management Unit',
    )
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
    // outlist: definition query strings that reflect the user's chosen species and BEC variant
    // outlist = [outlist_suit, outlist_non_suit]

    if (outlist[1].length != 0) {
      nonsuitLayer.definitionExpression = 'MAP_LABEL in (' + outlist[1] + ')'
      nonsuitLayer.popupTemplate = template
      map.add(nonsuitLayer)
    } else {
      nonsuitLayer.definitionExpression = '1=0'
      nonsuitLayer.popupTemplate = ''
      map.add(nonsuitLayer)
    }

    if (outlist[0].length != 0) {
      currentLayer.definitionExpression = 'MAP_LABEL in (' + outlist[0] + ')'
      currentLayer.popupTemplate = template
      map.add(currentLayer)
    } else {
      currentLayer.definitionExpression = '1=0'
      currentLayer.popupTemplate = ''
      map.add(currentLayer)
    }

    if (mguLayer.loadStatus === 'loaded') {
      map.add(mguLayer)
    }
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
      outFields: fields,
      opacity: 0.5,
      visibilityMode: 'independent',
    })
    layer.load().catch(function (error) {
      console.warn('Failed to load feature layer: ' + name, error)
    })
    return layer
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
