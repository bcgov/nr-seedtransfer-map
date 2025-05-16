/* 
 * Define the JavaScript functions used to create the structure and widgets
 */

define([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/layers/GraphicsLayer",
    "esri/widgets/LayerList",
    "esri/form/elements/inputs/TextBoxInput",
    "esri/widgets/Print",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Search",
    "esri/widgets/Legend",
    "esri/widgets/DistanceMeasurement2D",
    "esri/widgets/AreaMeasurement2D",
    "esri/widgets/ScaleBar",
    "esri/core/urlUtils",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/Color",
    "esri/PopupTemplate",
    "esri/widgets/Expand",
    "esri/request",
    "esri/layers/support/Field",
    "esri/Graphic",
    "esri/widgets/Track",
    "esri/widgets/FeatureForm/InputField",
    "esri/widgets/FeatureForm",
    "esri/widgets/FeatureTemplates",
    "esri/geometry/support/webMercatorUtils",
    "esri/layers/KMLLayer"

], function (Map, MapView, FeatureLayer, GraphicsLayer, LayerList, TextBoxInput, Print, BasemapGallery, Search, Legend, DistanceMeasurement2D, AreaMeasurement2D, ScaleBar, urlUtils, SimpleMarkerSymbol, Color, PopupTemplate, Expand, request, Field, Graphic, Track, InputField, FeatureForm, FeatureTemplates, webMercatorUtils, KMLLayer) {

    var map, view, xy;
    var layerButton;
    var scaleBar, layerList;
    var activeWidget;
    var currentLayer, nonsuitLayer, current2019Layer, nonsuit2019Layer, spuLayer, muLayer;
    var suitRenderer, nonSuitRenderer;
    var portalUrl = "https://www.arcgis.com";
    
    template = {
        title : "Selected {MAP_Label}",
    };


    return {
        mapInit: mapInit,
        fullExtent: fullExtent,
        clearLyrs: clearLyrs,
        addLayers: addLayers,
        updateLayer: updateLayer,
        displaySPU: displaySPU,
        updatePopup: updatePopup,
        clearCutBlock: clearCutBlock,
    };

    suitRenderer = {
        type: "simple-fill",
            color: [217, 95, 2, 0.4],
            outline:{ 
                color: [115, 76, 0, 1]
            }
    };
    nonSuitRenderer = {
        type: "simple-fill",
            color: [170, 102, 205, 0.4],
            outline:{ 
                color: [76, 0, 115, 1]
            }
    };
    



    /* 
     * Initialize the map and all layers and functionality
     */
    function mapInit() {
        //*Create a new map

        map = new Map({
            basemap: "topo",
            layers: []
        });
        
        //Create a new map view and add the map to it
        xy = [-125.877, 54];
        // xy = [-119.877, 51.674]; // older model
        view = new MapView({
            center: xy,
            zoom: 6,
            container: "mapDiv",
            map: map,
            popup: {
                dockEnabled: false,
                dockOptions: {
                    position: "bottom-center",
                    breakpoint: false
                }
            }
        });

  
  


        // Make the layers
        layerInit();
        updatePopup();
        //Enable Pop Up Tables
        // popupTable();

        addExpand();
        addTracking();
        addCoords();
        zoomToLocation();
        

        //When the view UI is loaded, add the buttons
        view.when(function () {
            view.ui.add("topbar", "top-left");
            view.ui.add(expand, "top-left");
            view.ui.add(trackWidget, "top-left");
            view.ui.add(editExpand, "top-right");
            const attributeEditing = document.getElementById("featureUpdateDiv");

//            view.ui.add("titleDiv", "top-right");
//            view.ui.add("btn_logo", "bottom-left");
            // addLayerListButton();
            addLayerList();
//            addMeasurement();
//            addLogo();
//            addExtentButton();
            addBasemapGallery();
            addPrintButton();
            addLegend();
            addScalebar();
//            addMouseCoord();
            
        });

    }

    function addLayers(layers) {
        map.addMany(layers);
    }

    function layerInit() {
        currentLayer = featureInit("https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/5", ["map_label", "SHAPE_Area"], "CBST");
        nonsuitLayer = featureInit("https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/6", ["map_label", "SHAPE_Area"], "CBST Species May Not Be Suitable");
        current2019Layer = featureInit("https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/2", ["map_label", "SHAPE_Area"], "CBST 2019");
        nonsuit2019Layer = featureInit("https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/3", ["map_label", "SHAPE_Area"], "2019 Species May Not Be Suitable");
        spuLayer = featureInit("https://maps.forsite.ca/server/rest/services/204_2/CBST_BEC_v11/MapServer/1", ["Seedlot", "SPU"], "Area of Use");
        mguLayer = featureInit("https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/0", ["Management_Units"], "Management Unit");
        map.add(spuLayer);
        map.add(mguLayer);
        // kmlsample = kmlInit("//geostore.corp.forsite.ca/www/204/SeedTransferRevamp/examples.kml");
        // kmlsample = kmlInit("http://quickmap.dot.ca.gov/data/lcs.kml");
        // map.add(kmlsample);
    }

    function updateLayer(outlist) {
        // outlist: all 4 possible queries that reflect the users chosen species and bec variant
        // outlist = [outlist_suit, outlist_non_suit, outlist_2019, outlist_non_2019]
        // nonsuit 
        window.outlist = outlist;
        // console.log(outlist);

        // currentLayer.definitionExpression = 'MAP_LABEL in ("BAFAun", "ESSFmcp", "ESSFun", "ESSFunp", "ESSFwvp")';
        // currentLayer.definitionExpression = "MAP_LABEL in ('BAFAunp', 'ESSFmk','ESSFmkp', 'ESSFmw','IMAunp', 'MHmm2')";

        if (outlist[1].length != 0) {
            nonsuitLayer.definitionExpression = "MAP_LABEL in (" + outlist[1] + ")";
            nonsuitLayer.popupTemplate = template;
            map.add(nonsuitLayer);
        } else {
            nonsuitLayer.definitionExpression = "MAP_LABEL in ()";
            nonsuitLayer.popupTemplate = "";
            map.add(nonsuitLayer);
        }

        if (outlist[0].length != 0) {
            currentLayer.definitionExpression = "MAP_LABEL in (" + outlist[0] + ")";
            currentLayer.popupTemplate = template;
            map.add(currentLayer);
        } else {
            currentLayer.definitionExpression = "MAP_LABEL in ()";
            currentLayer.popupTemplate = "";
            map.add(currentLayer);
        }

        // if (outlist[2].length != 0) {
        //     current2019Layer.definitionExpression = "MAP_LABEL in (" + outlist[2] + ")";
        //     map.add(current2019Layer);
        // } else {
        //     current2019Layer.definitionExpression = "MAP_LABEL in ()";
        //     map.add(current2019Layer);
        // }

        // if (outlist[3].length != 0) {
        //     nonsuit2019Layer.definitionExpression = "MAP_LABEL in (" + outlist[3] + ")";
        //     map.add(nonsuit2019Layer);
        // } else {
        //     nonsuit2019Layer.definitionExpression = "MAP_LABEL in ()";
        //     map.add(nonsuit2019Layer);
        // }
        map.add(mguLayer)
        map.add(spuLayer)
    }

    function displaySPU(SPLayer) {
        spuLayer.definitionExpression = "Seedlot = " + SPLayer;
        map.add(spuLayer);
    }

    function updatePopup() {
        // currentLayer.popup.autoOpenEnabled = false;
        nonsuitLayer.on("selection-complete", (event)=> {
            // Get the coordinates of the click on the view
            // around the decimals to 3 decimals
            console.log("non suit layer triggered")
            const lat = Math.round(event.mapPoint.latitude * 1000) / 1000;
            const lon = Math.round(event.mapPoint.longitude * 1000) / 1000;
    
            view.popup.open({
                // Set the popup's title to the coordinates of the clicked location
                title: "Reverse geocode: [" + lon + ", " + lat + "]",
                location: event.mapPoint // Set the location of the popup to the clicked location
            });
        });
    }

    /*
     * Section with functions for different layer types and situations
     */

    function clearCutBlock() {
        // var $table = $('#becInputCutblock');
        // $('#becInputCutblock option').attr("selected",false);
        $('.selectpicker').selectpicker('val', '');
        $('.selectpicker').selectpicker('refresh');
        // $('select').selectpicker();
    }


    function clearLyrs() {
        map.layers.removeAll();
    }
    // Initialize a feature layer
    function featureInit(src, fields, name) {
        return new FeatureLayer({
            url: src,
            title: name,
            outfields: fields,
            opacity: 0.5,
            visibilityMode: "independent",

        });
    }

    function kmlInit(src) {
        return new KMLLayer({
            url: src,
            title: "KML Sample",
        });
    }

    // Initialize a feature layer with definition query and custom renderer
    function featureInit_complex(src, expression, name, renderer) {
        return new FeatureLayer({
            url: src,
            definitionExpression: expression,
            title: name,
            renderer: renderer,
            opacity: 0.5,
            visibilityMode: "independent"
        });
    }

    /*
     * Utility Functions
     */
    function popupTable(lyr) {
        lyr.load().then(function () {
            lyr.popupTemplate = lyr.createPopupTemplate();
        });
    }

    function updateKey(list) {
        var listLength = list.length;
        var newlist = new Array();
        for (var i = 0; i < listLength; i++) {
            newlist.push(list[i][1].replace(/ /g, "_"));
        }
        return newlist;
    }

    function fullExtent() {
        view.goTo({
            center: xy,
            zoom: 8.5
        });
    }

    /*
     * Widgets and behaviour
     */

    // Add the line and area measurement tools
    function addMeasurement() {
        document
                .getElementById("distanceButton")
                .addEventListener("click", function () {
                    setActiveWidget(null);
                    if (!this.classList.contains("active")) {
                        setActiveWidget("distance");
                        view.focus();
                    } else {
                        setActiveButton(null);
                    }
                });
        document
                .getElementById("areaButton")
                .addEventListener("click", function () {
                    setActiveWidget(null);
                    if (!this.classList.contains("active")) {
                        setActiveWidget("area");
                        view.focus();
                    } else {
                        setActiveButton(null);
                    }
                });
    }


    /*Create and add the extent button widget*/
    function addExtentButton() {
        document
                .getElementById("homeButton")
                .addEventListener("click", function () {
                    fullExtent();
                });
    }

    function addLayerListButton() {
        layerButton = document.createElement("layerDiv");
        layerButton.id = "layerButton";
        layerButton.className = "esri-icon-layers esri-widget--button esri-component";
        view.ui.add(layerButton, "top-right");
    }

    function addLayerList() {
        document
                .getElementById("layerButton")
                .addEventListener("click", function () {
                    setActiveWidget(null);
                    if (!this.classList.contains("active")) {
                        layerList = new LayerList({
                            view: view,
                            listItemCreatedFunction: function (event) {
                                var item = event.item;
                                item.actionsSections = [[
                                    {
                                            title: "Increase opacity",
                                            className: "esri-icon-up",
                                            id: "increase-opacity"
                                        },
                                        {
                                            title: "Decrease opacity",
                                            className: "esri-icon-down",
                                            id: "decrease-opacity"
                                        }
                                    ]];
                                item.panel = {
                                    content: "legend",
                                    open: true
                                };
                            }
                        });
                        layerList.on("trigger-action", function (event) {
                            var item = event.item;
                            var id = event.action.id;
                            if (id === "increase-opacity") {
                                if (item.layer.opacity < 1) {
                                    item.layer.opacity += 0.25;
                                }
                            } else if (id === "decrease-opacity") {
                                if (item.layer.opacity > 0) {
                                    item.layer.opacity -= 0.25;
                                }
                            }

                        });
                        view.ui.add(layerList, "top-right");
                        setActiveWidget("layer");
                    } else {
                        setActiveButton(null);
                        layerList.destroy();
                    }
                });

    }

    function addLegend() {
        document
                .getElementById("legendButton")
                .addEventListener("click", function () {
                    setActiveWidget(null);
                    if (!this.classList.contains("active")) {
                        setActiveWidget("legend");
                    } else {
                        setActiveButton(null);
                    }
                });
    }


    function addTracking() {
        trackWidget = new Track({
            view: view
        });
    }

    function addCoords() {
        editExpand = new Expand({
            expandIconClass: "esri-icon-edit",
            expandTooltip: "Expand Edit",
            expanded: true,
            view: view,
            content: document.getElementById("editArea")
          });
    }

    function zoomToLocation() { 
        document.getElementById("btnUpdate").onclick = () => {        
            var coords = document.getElementById("coordsforlocation").value.split(",");
            // coords[0] = lat
            // coords[1] = long

            if (!Number(coords[0]) || !Number(coords[1])) {
                console.log("its working");
                alert("The coordinates you entered are invalid")
            } else {
                if (coords[0] < -90 || coords[0] > 90 || coords[1] < -180 || coords[1] > 180) {
                    alert("One of those numbers is out of valid range");
                    return;
                } else { 
                    console.log(coords[0], coords[1]);         
                    view.center=[coords[1], coords[0]]
                    view.zoom = 12

                } 
            }
            

        };
    }


     // Uploading and downloading shapefiles section 
    
     function addExpand() {
        var fileForm = document.getElementById("mainWindow");

        expand = new Expand({
          expandIconClass: "esri-icon-upload uploadformatting",
          view: view,
          content: fileForm
        });

        document.getElementById("uploadForm").addEventListener("change", function (event) {
            var fileName = event.target.value.toLowerCase();

            if (fileName.indexOf(".zip") !== -1) {//is file a zip - if not notify user
              generateFeatureCollection(fileName);
            }
            else {
              document.getElementById('upload-status').innerHTML = '<p style="color:red">Add shapefile as .zip file</p>';
            }
          });

    }

    function generateFeatureCollection (fileName) {
        var name = fileName.split(".");
        // Chrome and IE add c:\fakepath to the value - we need to remove it
        // see this link for more info: http://davidwalsh.name/fakepath
        name = name[0].replace("c:\\fakepath\\", "");

        const uploadStatus = document.getElementById('upload-status');
        uploadStatus.textContent = 'Loading ' + name;

        // define the input params for generate see the rest doc for details
        // https://developers.arcgis.com/rest/users-groups-and-items/generate.htm
        var params = {
          'name': name,
          'targetSR': view.spatialReference,
          'maxRecordCount': 10000,
          'enforceInputFileSizeLimit': true,
          'enforceOutputJsonSizeLimit': true
        };

        // generalize features to 10 meters for better performance
        params.generalize = true;
        params.maxAllowableOffset = 10;
        params.reducePrecision = true;
        params.numberOfDigitsAfterDecimal = 0;

        var myContent = {
          'filetype': 'shapefile',
          'publishParameters': JSON.stringify(params),
          'f': 'json',
        };

        // use the REST generate operation to generate a feature collection from the zipped shapefile
        request(portalUrl + '/sharing/rest/content/features/generate', {
          query: myContent,
          body: document.getElementById('uploadForm'),
          responseType: 'json'
        })
        .then(function (response) {
            var layerName = response.data.featureCollection.layers[0].layerDefinition.name;
            document.getElementById('upload-status').innerHTML = '<b>Loaded: </b>' + layerName;
            addShapefileToMap(response.data.featureCollection);
          })
          .catch(errorHandler);
      }

      function errorHandler (error) {
        document.getElementById('upload-status').innerHTML =
        "<p style='color:red;max-width: 500px;'>" + error.message + "</p>";
      }

      function addShapefileToMap (featureCollection) {
        // add the shapefile to the map and zoom to the feature collection extent
        // if you want to persist the feature collection when you reload browser, you could store the
        // collection in local storage by serializing the layer using featureLayer.toJson()
        // see the 'Feature Collection in Local Storage' sample for an example of how to work with local storage
        var sourceGraphics = [];

        var layers = featureCollection.layers.map(function (layer) {

          var graphics = layer.featureSet.features.map(function(feature){
            return Graphic.fromJSON(feature);
          })
          sourceGraphics = sourceGraphics.concat(graphics);
          var featureLayer = new FeatureLayer({
            objectIdField: "FID",
            source: graphics,
            fields: layer.layerDefinition.fields.map(function(field) {
            return Field.fromJSON(field);
            })
          });
          return featureLayer;
          // associate the feature with the popup on click to enable highlight and zoom to
        });
        map.addMany(layers);
        view.goTo(sourceGraphics)
        .catch(function(error){
          if (error.name != "AbortError"){
            console.error(error);
          }
        });

        document.getElementById('upload-status').innerHTML = "";
      }

    function addMouseCoord() {
        var coordsWidget = document.createElement("mouseDiv");
        coordsWidget.id = "coordsWidget";
        coordsWidget.className = "esri-widget esri-component";
        view.ui.add(coordsWidget, "bottom-right");
        function showCoordinates(pt) {
            var coords = "Lat/Long " + pt.latitude.toFixed(3) + " " + pt.longitude.toFixed(3) +
                    " | Scale 1:" + Math.round(view.scale * 1) / 1;
            coordsWidget.innerHTML = coords;
        }

        view.watch("stationary", function (isStationary) {
            showCoordinates(view.center);
        });
        view.on("pointer-move", function (evt) {
            showCoordinates(view.toMap({x: evt.x, y: evt.y}));
        });
    }

    // Add the basemap gallery
    function addBasemapGallery() {
        document
                .getElementById("basemapButton")
                .addEventListener("click", function () {
                    setActiveWidget(null);
                    if (!this.classList.contains("active")) {
                        setActiveWidget("basemap");
                    } else {
                        setActiveButton(null);
                    }
                });
    }

    // Add the instructions button
    function addLogo() {
        document
                .getElementById("instructionButton")
                .addEventListener("click", function () {
                    setActiveWidget(null);
                    if (!this.classList.contains("active")) {
                        setActiveWidget("instruction");
                    } else {
                        setActiveButton(null);
                    }
                });
    }

    //Create and add the print button
    function addPrintButton() {
        document
                .getElementById("printerButton")
                .addEventListener("click", function () {
                    setActiveWidget(null);
                    if (!this.classList.contains("active")) {
                        setActiveWidget("printer");
                    } else {
                        setActiveButton(null);
                    }
                });
    }

    // Create and add a scalebar
    function addScalebar() {
        scaleBar = new ScaleBar({
            view: view,
            unit: "metric",
            style: "ruler",
            container: 'scaleDiv'
        });
    }

    function setActiveButton(selectedButton) {
        var elements = document.getElementsByClassName("action-button");
        for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
        }
        if (selectedButton) {
            selectedButton.classList.add("active");
        }
    }

    function setActiveWidget(type) {
        switch (type) {
            case "legend":
                activeWidget = new Legend({
                    view: view
                });
                view.ui.add(activeWidget, "top-left");
                setActiveButton(document.getElementById("legendButton"));
                break;
            case "layer":
                setActiveButton(document.getElementById("layerButton"));
                break;
            case "home":
                activeWidget = fullExtent();
                view.ui.add(activeWidget);
                setActiveButton(document.getElementById("homeButton"));
                break;
            case "basemap":
                activeWidget = new BasemapGallery({
                    view: view
                });
                view.ui.add(activeWidget, "top-right");
                setActiveButton(document.getElementById("basemapButton"));
                break;
            case "printer":
                activeWidget = new Print({
                    view: view,
                    id: "printer",
                    printServiceUrl:
                            "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
                });
                view.ui.add(activeWidget, "top-right");
                setActiveButton(document.getElementById("printerButton"));
                break;
            case "distance":
                activeWidget = new DistanceMeasurement2D({
                    view: view,
                    unit: "meters"
                });
                // skip the initial 'new measurement' button
                activeWidget.viewModel.newMeasurement();
                view.ui.add(activeWidget, "manual");
                setActiveButton(document.getElementById("distanceButton"));
                break;
            case "area":
                activeWidget = new AreaMeasurement2D({
                    view: view,
                    unit: "hectares"
                });
                activeWidget.viewModel.newMeasurement();
                view.ui.add(activeWidget, "manual");
                setActiveButton(document.getElementById("areaButton"));
                break;

            case null:
                if (activeWidget) {
                    view.ui.remove(activeWidget);
                    activeWidget.destroy();
                    activeWidget = null;
                }
                break;
        }
    }

});



