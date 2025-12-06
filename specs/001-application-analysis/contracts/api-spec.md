# API Contract Specification

## Overview

This document defines all function signatures, contracts, and interfaces for the CBST Seedlot Selection Tool application modules.

## Module: main.js

### Module Declaration
```javascript
define(function () {
    // Module implementation
    return {
        fillSelects: fillSelects,
        addSuitabilityLayerCutblock: addSuitabilityLayerCutblock,
        addSuitabilityLayerSeedlot: addSuitabilityLayerSeedlot,
        populateSeedlot: populateSeedlot,
        populateSpeciesBEC: populateSpeciesBEC,
        getIntersection: getIntersection,
        updateData: updateData,
    };
});
```

### fillSelects()

**Purpose**: Populate dropdown menus with species and BEC variant options

**Signature**:
```javascript
function fillSelects()
```

**Parameters**: None

**Returns**: `undefined`

**Side Effects**:
- Populates `speciesInputCutblock` dropdown
- Populates `speciesInputSeedlot` dropdown
- Populates `becInputCutblock` dropdown (multi-select)
- Populates `becInputSeedlot` dropdown (single-select)
- Initializes Bootstrap Select on all dropdowns

**Dependencies**:
- DOM elements: `speciesInputCutblock`, `speciesInputSeedlot`, `becInputCutblock`, `becInputSeedlot`
- Global: `speciesStore`, `becStore` arrays
- jQuery and Bootstrap Select

**Notes**: Must be called after DOM is ready

---

### addSuitabilityLayerCutblock(sp, bec)

**Purpose**: Process cutblock workflow - find suitable seed sources for given planting site

**Signature**:
```javascript
function addSuitabilityLayerCutblock(sp: string, bec: number | number[]): Promise<Array<Array<string>>>
```

**Parameters**:
- `sp` (string): Species code (e.g., "FDC", "LW")
- `bec` (number | number[]): BEC variant ID or array of IDs (1-3 variants)

**Returns**: `Promise<Array<Array<string>>>`
- Resolves to: `[[outlist_suit], [outlist_non_suit], [outlist_2019], [outlist_non_2019]]`
- Each inner array contains comma-separated BEC variant names in SQL IN clause format
- Example: `[["'BAFAun', 'CWHdm'"], [""], [""], [""]]`

**Side Effects**:
- Loads JSON file: `Version_7_0/{Species}_migrated_height_list_5.json`
- Loads JSON file: `Version_7_0/{Species}_Seedlots.json`
- Populates `cutblock_table` with Bootstrap Table
- Populates `seedlot_table` with Bootstrap Table
- Sets global variables: `window.dat` (becStore)

**Dependencies**:
- jQuery `$.getJSON()`
- Global: `speciesStore`, `becStore`
- DOM elements: `cutblock_table`, `seedlot_table`
- Bootstrap Table library
- Functions: `getIntersection()`, `updateData()`, `populateCutblockTable()`, `getSeedLot()`

**Errors**: No explicit error handling for failed JSON loads

**Algorithm**:
1. Construct file paths based on species
2. Calculate suitability threshold from species store
3. Load migrated height data
4. Filter by selected BEC variant(s) and thresholds
5. If multiple BEC variants, calculate intersection
6. Separate suitable vs non-suitable results
7. Build SQL IN clause strings for map layers
8. Load and filter seedlot data
9. Populate tables

---

### addSuitabilityLayerSeedlot(sp, bec)

**Purpose**: Process seedlot workflow - find suitable planting sites for given seed source

**Signature**:
```javascript
function addSuitabilityLayerSeedlot(sp: string, bec: number): Promise<Array<Array<string>>>
```

**Parameters**:
- `sp` (string): Species code
- `bec` (number): BEC variant ID (single selection only)

**Returns**: `Promise<Array<Array<string>>>`
- Format: `[[outlist_suit], [outlist_non_suit], [outlist_2019], [outlist_non_2019]]`
- Contains plantation BEC variants (BECvar_site) where seedlot can be used

**Side Effects**:
- Loads JSON file: `Version_7_0/{Species}_migrated_height_list_5.json`
- Populates `seed` table with Bootstrap Table
- Sets global variable: `window.json_obj` (loaded data)

**Dependencies**:
- jQuery `$.getJSON()`
- Global: `speciesStore`, `becStore`
- DOM element: `seed` table
- Bootstrap Table library
- Functions: `updateData()`, `populateSeedlotTable()`

**Errors**: Shows alert if no results found

**Algorithm**:
1. Construct file path based on species
2. Calculate suitability threshold
3. Load migrated height data
4. Filter by seed BEC variant (BECvar_seed == selected)
5. Separate suitable vs non-suitable by Sp_suit_site
6. Extract plantation BEC variants (BECvar_site)
7. Build SQL IN clause strings
8. Populate table

---

### getIntersection(array)

**Purpose**: Calculate intersection of multiple filtered arrays based on BECvar_seed field

**Signature**:
```javascript
function getIntersection(array: Array<Array<Object>>): Promise<Array<Object>>
```

**Parameters**:
- `array` (Array<Array<Object>>): Array of filtered data arrays (1-3 arrays)

**Returns**: `Promise<Array<Object>>`
- Array of objects that appear in all input arrays
- Objects matched by `BECvar_seed` field value

**Side Effects**: None

**Dependencies**: None

**Algorithm**:
- For 1 array: return as-is
- For 2 arrays: filter array[0] where BECvar_seed exists in array[1]
- For 3 arrays: filter array[0] where BECvar_seed exists in both array[1] and array[2]

**Performance**: O(n*m) for 2 arrays, O(n*m*k) for 3 arrays where n, m, k are array sizes

---

### updateData(data)

**Purpose**: Transform suitability codes to human-readable text

**Signature**:
```javascript
function updateData(data: Array<Object>): Promise<Array<Object>>
```

**Parameters**:
- `data` (Array<Object>): Array of data objects with Sp_suit_seed field

**Returns**: `Promise<Array<Object>>`
- Same array with transformed Sp_suit_seed values

**Side Effects**: Mutates input array

**Transformations**:
- `Sp_suit_seed == "1"` → `"Suitable"`
- `Sp_suit_seed == "0"` → `"Not Suitable"`

---

### getSeedLot(bec, spmin, min, jsonseedlot)

**Purpose**: Filter and display seedlots matching criteria

**Signature**:
```javascript
function getSeedLot(
    bec: number | number[], 
    spmin: number, 
    min: number, 
    jsonseedlot: string
): undefined
```

**Parameters**:
- `bec` (number | number[]): BEC variant ID(s)
- `spmin` (number): Minimum suitability threshold (0.0 - 1.0)
- `min` (number): Additional minimum value (currently always 0)
- `jsonseedlot` (string): Path to seedlot JSON file

**Returns**: `undefined`

**Side Effects**:
- Loads JSON file specified by `jsonseedlot` path
- Populates `seedlot_table` with Bootstrap Table
- Converts empty Seedlot/GW values to 0

**Dependencies**:
- jQuery `$.getJSON()`
- Global: `becStore`
- DOM element: `seedlot_table`
- Bootstrap Table library
- Function: `getIntersection()` (for multiple BEC variants)

**Filtering Logic**:
- Filter where `BECvar_site == selected_BEC` AND `MigrationDistance >= spmin`
- For multiple BEC variants: calculate intersection

---

### populateSeedlot(orch)

**Purpose**: Lookup seedlot information by orchard number and auto-populate form

**Signature**:
```javascript
function populateSeedlot(orch: number | string): undefined
```

**Parameters**:
- `orch` (number | string): Orchard number

**Returns**: `undefined`

**Side Effects**:
- Loads `Orchard_list.json`
- Loads `Seedlot_list.json`
- Sets `seedlotNumber` input value
- Sets `becInputSeedlot` dropdown value
- Sets `speciesInputSeedlot` dropdown value
- Refreshes Bootstrap Select dropdowns
- Sets global variable: `window.res` (results)

**Dependencies**:
- jQuery `$.getJSON()`
- Global: `becStore`
- DOM elements: `seedlotNumber`, `becInputSeedlot`, `speciesInputSeedlot`
- Bootstrap Select library

**Errors**: Shows alert if orchard not found

**Algorithm**:
1. Lookup orchard in Orchard_list.json
2. Extract representative seedlot number
3. Set seedlot input field
4. Lookup seedlot in Seedlot_list.json
5. Extract species and BEC variant
6. Set form fields and refresh dropdowns

---

### populateSpeciesBEC(lot)

**Purpose**: Lookup species and BEC variant by seedlot number and auto-populate form

**Signature**:
```javascript
function populateSpeciesBEC(lot: number | string): undefined
```

**Parameters**:
- `lot` (number | string): Seedlot number

**Returns**: `undefined`

**Side Effects**:
- Loads `Seedlot_list.json`
- Sets `orchardNumber` input value
- Sets `becInputSeedlot` dropdown value
- Sets `speciesInputSeedlot` dropdown value
- Refreshes Bootstrap Select dropdowns

**Dependencies**:
- jQuery `$.getJSON()`
- Global: `becStore`
- DOM elements: `orchardNumber`, `becInputSeedlot`, `speciesInputSeedlot`
- Bootstrap Select library

**Algorithm**:
1. Lookup seedlot in Seedlot_list.json
2. Extract orchard, species, and BEC variant
3. Set form fields and refresh dropdowns

---

## Module: defineMap.js

### Module Declaration
```javascript
define([
    "esri/Map",
    "esri/views/MapView",
    // ... other ArcGIS modules
], function (Map, MapView, /* ... */) {
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
});
```

### mapInit()

**Purpose**: Initialize ArcGIS map view and all map widgets

**Signature**:
```javascript
function mapInit(): undefined
```

**Parameters**: None

**Returns**: `undefined`

**Side Effects**:
- Creates ArcGIS Map instance
- Creates MapView instance
- Initializes base feature layers
- Sets up all map widgets
- Adds UI elements to map view

**Dependencies**:
- ArcGIS JS API modules
- DOM element: `mapDiv`
- Functions: `layerInit()`, `addExpand()`, `addTracking()`, `addCoords()`, `zoomToLocation()`, `addLayerList()`, `addBasemapGallery()`, `addPrintButton()`, `addLegend()`, `addScalebar()`

**Map Configuration**:
- Basemap: "topo"
- Center: [-125.877, 54]
- Zoom: 6
- Popup: docked bottom-center

---

### updateLayer(outlist)

**Purpose**: Update map layers with filtered BEC variant data

**Signature**:
```javascript
function updateLayer(outlist: Array<Array<string>>): undefined
```

**Parameters**:
- `outlist` (Array<Array<string>>): Array of 4 arrays containing SQL IN clause strings
  - `outlist[0]`: Suitable BEC variants (e.g., `"'BAFAun', 'CWHdm'"`)
  - `outlist[1]`: Non-suitable BEC variants
  - `outlist[2]`: 2019 suitable (currently unused)
  - `outlist[3]`: 2019 non-suitable (currently unused)

**Returns**: `undefined`

**Side Effects**:
- Sets definition expressions on `nonsuitLayer` and `currentLayer`
- Adds/updates layers on map
- Sets popup templates
- Adds SPU and MGU layers

**Dependencies**:
- Global: `nonsuitLayer`, `currentLayer`, `mguLayer`, `spuLayer`, `map`
- ArcGIS Feature Layer API

**Definition Expression Format**:
```javascript
"MAP_LABEL IN (" + outlist[0] + ")"
// Example: "MAP_LABEL IN ('BAFAun', 'CWHdm')"
```

---

### addLayers(layers)

**Purpose**: Add multiple layers to map

**Signature**:
```javascript
function addLayers(layers: Array<FeatureLayer>): undefined
```

**Parameters**:
- `layers` (Array<FeatureLayer>): Array of ArcGIS FeatureLayer instances

**Returns**: `undefined`

**Side Effects**: Adds layers to map

**Dependencies**: ArcGIS Map API

---

### clearLyrs()

**Purpose**: Remove all layers from map

**Signature**:
```javascript
function clearLyrs(): undefined
```

**Parameters**: None

**Returns**: `undefined`

**Side Effects**: Removes all layers from map

**Dependencies**: ArcGIS Map API

---

### displaySPU(SPLayer)

**Purpose**: Filter SPU layer by seedlot number

**Signature**:
```javascript
function displaySPU(SPLayer: number | string): undefined
```

**Parameters**:
- `SPLayer` (number | string): Seedlot number

**Returns**: `undefined`

**Side Effects**:
- Sets definition expression on `spuLayer`
- Adds layer to map

**Definition Expression**:
```javascript
"Seedlot = " + SPLayer
```

**Status**: Currently commented out in requireMain.js

---

### updatePopup()

**Purpose**: Configure popup behavior for non-suitable layer

**Signature**:
```javascript
function updatePopup(): undefined
```

**Parameters**: None

**Returns**: `undefined`

**Side Effects**:
- Registers event handler on `nonsuitLayer`
- Opens popup with coordinates on layer click

**Dependencies**: Global: `nonsuitLayer`, `view`

---

### clearCutBlock()

**Purpose**: Clear BEC variant selections in cutblock form

**Signature**:
```javascript
function clearCutBlock(): undefined
```

**Parameters**: None

**Returns**: `undefined`

**Side Effects**:
- Clears Bootstrap Select dropdown values
- Refreshes dropdown displays

**Dependencies**:
- jQuery
- Bootstrap Select library
- DOM: `.selectpicker` elements

---

### featureInit(src, fields, name)

**Purpose**: Create ArcGIS FeatureLayer instance

**Signature**:
```javascript
function featureInit(
    src: string, 
    fields: Array<string>, 
    name: string
): FeatureLayer
```

**Parameters**:
- `src` (string): Feature Server URL
- `fields` (Array<string>): Array of field names to request
- `name` (string): Layer title

**Returns**: `FeatureLayer` instance

**Configuration**:
- Opacity: 0.5
- Visibility mode: "independent"

**Dependencies**: ArcGIS FeatureLayer API

---

## Module: requireMain.js

### Application Initialization

**Entry Point**: Script tag in index.html

**Initialization Sequence**:
1. Load modules: `defineMap`, `main`
2. Call `main.fillSelects()` - populate dropdowns
3. Call `defineMap.mapInit()` - initialize map
4. Register event handlers

### Event Handlers

#### Cutblock Workflow
```javascript
document.getElementById("addButtonCutblock")
    .addEventListener("click", function () {
        defineMap.clearLyrs();
        main.addSuitabilityLayerCutblock(
            document.getElementById("speciesInputCutblock").value, 
            selected
        ).then((layers) => {
            defineMap.updateLayer(layers);
        });
    });
```

#### Seedlot Workflow
```javascript
document.getElementById("addButtonSeedlot")
    .addEventListener("click", function () {
        defineMap.clearLyrs();
        main.addSuitabilityLayerSeedlot(
            document.getElementById("speciesInputSeedlot").value, 
            document.getElementById("becInputSeedlot").value
        ).then((layers) => {
            defineMap.updateLayer(layers);
        });
    });
```

#### BEC Variant Selection Tracking
```javascript
$('#becInputCutblock').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    selected = [];
    var options = e.target.selectedOptions;
    for (var i = 0; i < options.length; i++) {
        selected.push(options[i].value);
    }
});
```

## Error Handling Contracts

### Current State
- Minimal error handling
- No try-catch blocks
- No error callbacks in promises
- Alert dialogs for some user errors

### Recommended Error Handling

```javascript
// Recommended pattern for JSON loading
$.getJSON(path)
    .done(function(data) {
        // Process data
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Failed to load JSON:", path, errorThrown);
        // Show user-friendly error message
    });
```

## Performance Considerations

### Async Operations
- All JSON loading is asynchronous
- Map layer updates are synchronous
- No loading indicators for async operations

### Memory Management
- No cleanup of loaded data
- Previous query results remain in memory
- Global variables accumulate

### Optimization Opportunities
- Implement request cancellation for rapid user interactions
- Add debouncing for dropdown changes
- Cache loaded JSON files
- Implement progressive loading for large datasets

