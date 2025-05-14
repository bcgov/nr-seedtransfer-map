/* 
 seedlot selector functionality and data
 */


define(function () {
    var jsontxt,jsonseedlot,jsontxt2019;
    // var defineMap = require('defineMap.js');
    
    var speciesStore = [
        {name: "AT", minsuit: 97.5},
        {name: "BA", minsuit: 97.5},
        {name: "BG", minsuit: 97.5},
        {name: "BL", minsuit: 97.0},
        {name: "CW", minsuit: 99.0},
        {name: "DR", minsuit: 97.5},
        {name: "EP", minsuit: 97.5},
        {name: "FDC", minsuit: 97.5},
        {name: "FDI", minsuit: 97.5},
        {name: "HM", minsuit: 97.5},
        {name: "HW", minsuit: 97.5},
        {name: "LT", minsuit: 97.5},
        {name: "LW", minsuit: 97.5},
        {name: "PA", minsuit: 97.5},
        {name: "PJ", minsuit: 97.5},
        {name: "PLC", minsuit: 97.5},
        {name: "PLI", minsuit: 97.5},
        {name: "PW", minsuit: 96.0},
        {name: "PY", minsuit: 96.0},
        {name: "SB", minsuit: 97.5},
        {name: "SS", minsuit: 97.0},
        {name: "SX", minsuit: 97.5},
        {name: "SXS", minsuit: 97.5},
        {name: "YC", minsuit: 96.0}
    ];

    var gensuitdata = [
        {gensuit: "1", classA: "1 to 0.98", classB: "1 to 0.985"},
        {gensuit: "2", classA: "0.98 to 0.965", classB: "0.985 to 0.975"},
        {gensuit: "3", classA: "0.965 to 0.955", classB: "0.975 to 0.965"}
    ];

    var becStore = [
        {name: 'BAFAun', id: 1},
        {name: 'BAFAunp', id: 2},
        {name: 'BGxh1', id: 3},
        {name: 'BGxh2', id: 4},
        {name: 'BGxh3', id: 5},
        {name: 'BGxw1', id: 6},
        {name: 'BGxw2', id: 7},
        {name: 'BWBSdk', id: 8},
        {name: 'BWBSmk', id: 9},
        {name: 'BWBSmw', id: 10},
        {name: 'BWBSvk', id: 11},
        {name: 'BWBSwk1', id: 12},
        {name: 'BWBSwk2', id: 13},
        {name: 'BWBSwk3', id: 14},
        {name: 'CDFmm', id: 15},
        {name: 'CMAun', id: 16},
        {name: 'CMAunp', id: 17},
        {name: 'CMAwh', id: 18},
        {name: 'CWHdm', id: 19},
        {name: 'CWHds1', id: 20},
        {name: 'CWHds2', id: 21},
        {name: 'CWHmm1', id: 22},
        {name: 'CWHmm2', id: 23},
        {name: 'CWHms1', id: 24},
        {name: 'CWHms2', id: 25},
        {name: 'CWHun', id: 26},
        {name: 'CWHvh1', id: 27},
        {name: 'CWHvh2', id: 28},
        {name: 'CWHvh3', id: 29},
        {name: 'CWHvm1', id: 30},
        {name: 'CWHvm2', id: 31},
        {name: 'CWHwh1', id: 32},
        {name: 'CWHwh2', id: 33},
        {name: 'CWHwm', id: 34},
        {name: 'CWHws1', id: 35},
        {name: 'CWHws2', id: 36},
        {name: 'CWHxm1', id: 37},
        {name: 'CWHxm2', id: 38},
        {name: 'ESSFdc1', id: 39},
        {name: 'ESSFdc2', id: 40},
        {name: 'ESSFdc3', id: 41},
        {name: 'ESSFdcp', id: 42},
        {name: 'ESSFdcw', id: 43},
        {name: 'ESSFdk1', id: 44},
        {name: 'ESSFdk2', id: 45},
        {name: 'ESSFdkp', id: 46},
        {name: 'ESSFdkw', id: 47},
        {name: 'ESSFdv1', id: 48},
        {name: 'ESSFdv2', id: 49},
        {name: 'ESSFdvp', id: 50},
        {name: 'ESSFdvw', id: 51},
        {name: 'ESSFmc', id: 52},
        {name: 'ESSFmcp', id: 53},
        {name: 'ESSFmh', id: 54},
        {name: 'ESSFmk', id: 55},
        {name: 'ESSFmkp', id: 56},
        {name: 'ESSFmm1', id: 57},
        {name: 'ESSFmm2', id: 58},
        {name: 'ESSFmm3', id: 59},
        {name: 'ESSFmmp', id: 60},
        {name: 'ESSFmmw', id: 61},
        {name: 'ESSFmv1', id: 62},
        {name: 'ESSFmv2', id: 63},
        {name: 'ESSFmv3', id: 64},
        {name: 'ESSFmv4', id: 65},
        {name: 'ESSFmvp', id: 66},
        {name: 'ESSFmw', id: 67},
        {name: 'ESSFmw1', id: 68},
        {name: 'ESSFmw2', id: 69},
        {name: 'ESSFmwp', id: 70},
        {name: 'ESSFmww', id: 71},
        {name: 'ESSFun', id: 72},
        {name: 'ESSFunp', id: 73},
        {name: 'ESSFvc', id: 74},
        {name: 'ESSFvcp', id: 75},
        {name: 'ESSFvcw', id: 76},
        {name: 'ESSFwc2', id: 77},
        {name: 'ESSFwc2w', id: 78},
        {name: 'ESSFwc3', id: 79},
        {name: 'ESSFwc4', id: 80},
        {name: 'ESSFwcp', id: 81},
        {name: 'ESSFwcw', id: 82},
        {name: 'ESSFwh1', id: 83},
        {name: 'ESSFwh2', id: 84},
        {name: 'ESSFwh3', id: 85},
        {name: 'ESSFwk1', id: 86},
        {name: 'ESSFwk2', id: 87},
        {name: 'ESSFwm', id: 88},
        {name: 'ESSFwm1', id: 89},
        {name: 'ESSFwm2', id: 90},
        {name: 'ESSFwm3', id: 91},
        {name: 'ESSFwm4', id: 92},
        {name: 'ESSFwmp', id: 93},
        {name: 'ESSFwmw', id: 94},
        {name: 'ESSFwv', id: 95},
        {name: 'ESSFwvp', id: 96},
        {name: 'ESSFxc1', id: 97},
        {name: 'ESSFxc2', id: 98},
        {name: 'ESSFxc3', id: 99},
        {name: 'ESSFxcp', id: 100},
        {name: 'ESSFxcw', id: 101},
        {name: 'ESSFxv1', id: 102},
        {name: 'ESSFxv2', id: 103},
        {name: 'ESSFxvp', id: 104},
        {name: 'ESSFxvw', id: 105},
        {name: 'ICHdk', id: 106},
        {name: 'ICHdm', id: 107},
        {name: 'ICHdw1', id: 108},
        {name: 'ICHdw3', id: 109},
        {name: 'ICHdw4', id: 110},
        {name: 'ICHmc1', id: 111},
        {name: 'ICHmc1a', id: 112},
        {name: 'ICHmc2', id: 113},
        {name: 'ICHmk1', id: 114},
        {name: 'ICHmk2', id: 115},
        {name: 'ICHmk3', id: 116},
        {name: 'ICHmk4', id: 117},
        {name: 'ICHmk5', id: 118},
        {name: 'ICHmm', id: 119},
        {name: 'ICHmw1', id: 120},
        {name: 'ICHmw2', id: 121},
        {name: 'ICHmw3', id: 122},
        {name: 'ICHmw4', id: 123},
        {name: 'ICHmw5', id: 124},
        {name: 'ICHvc', id: 125},
        {name: 'ICHvk1', id: 126},
        {name: 'ICHvk2', id: 127},
        {name: 'ICHwc', id: 128},
        {name: 'ICHwk1', id: 129},
        {name: 'ICHwk2', id: 130},
        {name: 'ICHwk3', id: 131},
        {name: 'ICHwk4', id: 132},
        {name: 'ICHxw', id: 133},
        {name: 'ICHxwa', id: 134},
        {name: 'IDFdc', id: 135},
        {name: 'IDFdk1', id: 136},
        {name: 'IDFdk2', id: 137},
        {name: 'IDFdk3', id: 138},
        {name: 'IDFdk4', id: 139},
        {name: 'IDFdk5', id: 140},
        {name: 'IDFdm1', id: 141},
        {name: 'IDFdm2', id: 142},
        {name: 'IDFdw', id: 143},
        {name: 'IDFmw1', id: 144},
        {name: 'IDFmw2', id: 145},
        {name: 'IDFww', id: 146},
        {name: 'IDFww1', id: 147},
        {name: 'IDFxc', id: 148},
        {name: 'IDFxh1', id: 149},
        {name: 'IDFxh2', id: 150},
        {name: 'IDFxh4', id: 151},
        {name: 'IDFxk', id: 152},
        {name: 'IDFxm', id: 153},
        {name: 'IDFxw', id: 154},
        {name: 'IDFxx2', id: 155},
        {name: 'IMAun', id: 156},
        {name: 'IMAunp', id: 157},
        {name: 'MHmm1', id: 158},
        {name: 'MHmm2', id: 159},
        {name: 'MHmmp', id: 160},
        {name: 'MHun', id: 161},
        {name: 'MHunp', id: 162},
        {name: 'MHwh', id: 163},
        {name: 'MHwh1', id: 164},
        {name: 'MHwhp', id: 165},
        {name: 'MSdc1', id: 166},
        {name: 'MSdc2', id: 167},
        {name: 'MSdc3', id: 168},
        {name: 'MSdk', id: 169},
        {name: 'MSdk1', id: 170},
        {name: 'MSdk2', id: 171},
        {name: 'MSdm1', id: 172},
        {name: 'MSdm2', id: 173},
        {name: 'MSdm3', id: 174},
        {name: 'MSdm3w', id: 175},
        {name: 'MSdv', id: 176},
        {name: 'MSdw', id: 177},
        {name: 'MSmw1', id: 178},
        {name: 'MSmw2', id: 179},
        {name: 'MSun', id: 180},
        {name: 'MSxk1', id: 181},
        {name: 'MSxk2', id: 182},
        {name: 'MSxk3', id: 183},
        {name: 'MSxv', id: 184},
        {name: 'PPdh2', id: 185},
        {name: 'PPxh1', id: 186},
        {name: 'PPxh2', id: 187},
        {name: 'PPxh3', id: 188},
        {name: 'SBPSdc', id: 189},
        {name: 'SBPSmc', id: 190},
        {name: 'SBPSmk', id: 191},
        {name: 'SBPSxc', id: 192},
        {name: 'SBSdh1', id: 193},
        {name: 'SBSdh2', id: 194},
        {name: 'SBSdk', id: 195},
        {name: 'SBSdw1', id: 196},
        {name: 'SBSdw2', id: 197},
        {name: 'SBSdw3', id: 198},
        {name: 'SBSmc1', id: 199},
        {name: 'SBSmc2', id: 200},
        {name: 'SBSmc3', id: 201},
        {name: 'SBSmh', id: 202},
        {name: 'SBSmk1', id: 203},
        {name: 'SBSmk2', id: 204},
        {name: 'SBSmm', id: 205},
        {name: 'SBSmw', id: 206},
        {name: 'SBSun', id: 207},
        {name: 'SBSvk', id: 208},
        {name: 'SBSwk1', id: 209},
        {name: 'SBSwk2', id: 210},
        {name: 'SBSwk3', id: 211},
        {name: 'SBSwk3a', id: 212},
        {name: 'SWBmk', id: 213},
        {name: 'SWBmks', id: 214},
        {name: 'SWBun', id: 215},
        {name: 'SWBuns', id: 216},
        {name: 'SWBvk', id: 217},
        {name: 'SWBvks', id: 218}
    ];

    return{
        fillSelects: fillSelects,
        addSuitabilityLayerCutblock: addSuitabilityLayerCutblock,
        addSuitabilityLayerSeedlot: addSuitabilityLayerSeedlot,
        populateSeedlot: populateSeedlot,
        populateSpeciesBEC: populateSpeciesBEC
    };

    // adds all the options to the Species and BEC Variant dropdowns
    function fillSelects() {
        for (const i in becStore) {
            const temp = document.createElement("Option");
            temp.label = becStore[i].name;
            temp.value = becStore[i].id;
            const temp3 = document.createElement("Option");
            temp3.label = becStore[i].name;
            temp3.value = becStore[i].id;
            document.getElementById("becInputCutblock").options.add(temp);
            document.getElementById("becInputSeedlot").options.add(temp3);
        }
        for (const j in speciesStore) {
            const temp2 = document.createElement("Option");
            temp2.value = speciesStore[j].name;
            temp2.label = speciesStore[j].name;
            const temp4 = document.createElement("Option");
            temp4.value = speciesStore[j].name;
            temp4.label = speciesStore[j].name;
            document.getElementById("speciesInputCutblock").options.add(temp2);
            document.getElementById("speciesInputSeedlot").options.add(temp4);
        }
    }

    // create the paths and locations for the selected cutblock and species
    function addSuitabilityLayerCutblock(sp, bec) {
        console.log("Cutblock Go button. Species: " + sp + " BEC: " + bec);
        jsontxt = "Version_8_0/" + sp.charAt(0).toUpperCase() + sp.slice(1) + "_migrated_height_list_out.json";
        jsonseedlot = "Version_8_0/" + sp.charAt(0).toUpperCase() + sp.slice(1) + "_Seedlots.json";
        let suit = speciesStore.find(x => x.name === sp).minsuit;
        return new Promise((resolve, reject) => {
            loadgrid(bec, suit, 0, jsontxt).then((response) => {
                resolve(response);
            }).then(() => {
                console.log(jsonseedlot + "  " + suit);
                console.log("this should print first")
            });
        });
        console.log("this shouldn't print before jsonseedlot")
        return loadgrd;
        // loadseedlotgrid(sp, suit, 0, jsonseedlot);
    }

    function addSuitabilityLayerSeedlot(sp, bec) {
        console.log("Seedlot Go button. Species: " + sp + " BEC: " + bec);
        jsontxt = "Version_8_0/" + sp.charAt(0).toUpperCase() + sp.slice(1) + "_migrated_height_list_out.json";
//        let jsonseedlot = "Version_8_0/" + sp.charAt(0).toUpperCase() + sp.slice(1) + "_Seedlots.json";
        jsontxt2019 = "Version_8_0/" + sp.charAt(0).toUpperCase() + sp.slice(1) + "_migrated_height_list_out.json";
        let suit = speciesStore.find(x => x.name === sp).minsuit;        
//        loadgridSeed(sp, suit, 0, jsontxt, jsontxt2019);
        console.log(jsontxt2019 + "  " + suit);
    }

    function loadgrid(bec, min, spmin, json) {
        min = min / 100
        spmin = spmin / 100
        window.dat = becStore;
        // console.log(bec);
        // console.log(becStore.id = bec);
        // console.log(min);
        // console.log(spmin);
        // console.log(json);
        // query the data
        // console.log(this);
        outlist = [];
        outlist_2019 = [];   
        const lst = [];
        let cutblock = new Promise((resolve, reject) => {
            $.getJSON(json, function(data) {
                // good way of testing a new variable live in devtools when the page is loaded 
                // window.json_obj = data;
                // const jsn = JSON.fetch(data);
                // var res = data.filter(function(x) {return x["BECvar_site"] == bec && x["HTp_pred"] >= min && x["Sp_suit_site"] >= spmin});
                // find the name in becStore associated to the bec id chosen 
                var bec_name = becStore.find(x=> x.id == bec).name;
                var results = data.filter(function(x) {return x["BECvar_site"] == bec_name && x["HTp_pred"] >= min && x["Sp_suit_site"] >= spmin});
                // console.log(results);
    
                // some difference between 1 and 0 in v5, ask why
                output_suit = data.filter(function(x) {return x["BECvar_site"] == bec_name && x["HTp_pred"] >= min && x["Sp_suit_site"] == spmin});
                window.suit = output_suit;
                output_suit_2019 = data.filter(function(x) {return x["BECvar_site"] == bec_name && x["HTp_pred_2019"] >= min && x["Sp_suit_site_2019"] == spmin});
                
                if (results.length == 0) { alert("No results available for those parameters"); }
    
                var $table = $('#cutblock_table');
                $table.bootstrapTable('destroy');
                $(function() {
                    $table.bootstrapTable({data: results});
                });
                // $table.bootstrapTable('hideLoading');
       
                console.log(output_suit);
                // when does this get triggered? give an example perhaps
                // might be cause the querying in v5 has the 1 and 0 difference and idk what that does. might be "enable" and "disable"
                if (output_suit.length > 0) {
                    for (var i = 0; i < output_suit.length; i++) {
                        // outlist.push(output_suit[i].BECvar_seed);
                        outlist += "'" + output_suit[i].BECvar_seed + "'" + ", ";
                    };
                }
                outlist = outlist.slice(1,-2)
                console.log(outlist);               
    
                if (output_suit_2019.length > 0) {
                    for (var i = 0; i < output_suit_2019.length; i++) {
                        outlist_2019.push(output_suit_2019[i].BECvar_seed);
                        // outlist += "'" + output_suit[i].BECvar_seed + "'" + ", ";
                    };
                    // console.log(outlist_2019);               
                }
                
                // outlist_not_suit = '';
                // console.log(outlist);
                // if (output_not_suit.length > 0) {
                //     for (var i = 0; i < output_not_suit.length; i++) {
                //         outlist_not_suit = outlist_not_suit + "'" + output_not_suit[i] + "'" + ", ";
                //     }
                //     outlist_not_suit = outlist_not_suit.substring(0, outlist_not_suit.length - 2);
                //     nonsuitLayer.setInfoTemplate(currentinfoTemplate);
                //     nonsuitLayer.setDefinitionExpression("MAP_LABEL in (" + outlist_not_suit + ")");
                //     map.addLayers([nonsuitLayer]);
                // }
                
            });
            resolve([outlist, outlist_2019]);
        });
        return cutblock;
    };

    function loadseedlotgrid(bec, min, spmin, json) {

    };

    function populateSeedlot(orch) {
        console.log("Seedlot top button. Value entered " + orch);
    }

    function populateSpeciesBEC(lot) {
        console.log("Seedlot middle button. Value entered " + lot);
    }



});
