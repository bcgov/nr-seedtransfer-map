require([
    "scripts/defineMap.js",
    "scripts/main.js",
    "esri/tasks/support/Query",
    "esri/layers/GeoJSONLayer"

], function (defineMap, main) {
    main.fillSelects();
    defineMap.mapInit();
    var selected = [];


    $('#becInputCutblock').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        console.log(e.target.selectedOptions);
        selected = [];
        window.table = e;
        var options = e.target.selectedOptions;
        for (var i = 0; i < options.length; i++) {
            selected.push(options[i].value);
        }
    });



    // clicking Go button on "I have a cutblock tab"
    document.getElementById("addButtonCutblock") 
            .addEventListener("click", function () {
                defineMap.clearLyrs();
                console.log(selected);
                main.addSuitabilityLayerCutblock(document.getElementById("speciesInputCutblock").value, selected).then((layers) => {
                    console.log(layers);
                    defineMap.updateLayer(layers);
                });
             });
    
    // Go button "I have a Seedlot" tab
    document.getElementById("addButtonSeedlot")
            .addEventListener("click", function () {
                defineMap.clearLyrs();
                main.addSuitabilityLayerSeedlot(document.getElementById("speciesInputSeedlot").value, document.getElementById("becInputSeedlot").value).then((layers)=> {
                    defineMap.updateLayer(layers);
                    // defineMap.displaySPU(document.getElementById("seedlotNumber").value);
                });
            });
            
    document.getElementById("addSeedlotfromOrchard")
            .addEventListener("click", function () {
                main.populateSeedlot(document.getElementById("orchardNumber").value);
            });
    document.getElementById("addSpeciesBecSeedlot")
            .addEventListener("click", function () {
                main.populateSpeciesBEC(document.getElementById("seedlotNumber").value);
            });
            
    document.getElementById("mapDiv")
        .addEventListener("click", function() {
            defineMap.updatePopup = "This is a test";
        });
    
    document.getElementById("clearButtonCutblock")
        .addEventListener("click", function () {
            defineMap.clearCutBlock();
        });

});


// document.getElementById("addButtonCutblock") 
// .addEventListener("click", function () {
//     defineMap.clearLyrs();
//     var selected = [];
//     let selectedPromise = new Promise(function (resolve, reject) {
//         $('#becInputCutblock').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
//             console.log(e.target.selectedOptions);
//             window.table = e;
//             // e.target.selectionOptions[clickedIndex].selected = true;
//             var options = e.target.selectedOptions;
//             for (var i = 0; i < options.length; i++) {
//                 selected.push(options[i].value);
//             }
//             console.log(selected);
            
//         });    
//     }).then(function () {
//         console.log(document.getElementById("becInputCutblock").value);
//         main.addSuitabilityLayerCutblock(document.getElementById("speciesInputCutblock").value, selected).then((layers) => {
//             // console.log(layers);
//             defineMap.updateLayer(layers);
//         });
//     });
    
//     return selectedPromise;

    
//  });