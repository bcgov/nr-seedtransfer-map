# CBST Seedlot Selection Tool - Application Specification

## Overview

### Application Name
CBST Seedlot Selection Tool Version 6.0

### Purpose
The Seedlot Selection Tool (SST) is a GIS mapping program designed to help forest managers in British Columbia match seedlots with planting sites based on climatic information and BEC (Biogeoclimatic Ecosystem Classification) variant compatibility. The tool implements the CBST Areas of Use standards as per the April 2022 Amendments to the Chief Forester's Standards for Seed Use, using BEC 10 classification.

### Version Information
- **Application Version**: 6.0
- **Data Version**: 7.0 (Version_7_0 directory)
- **Seedlot Data Date**: August 18th, 2025
- **Standards**: BEC 10 classification

### Target Users
- Forest managers
- Forestry professionals
- Reforestation coordinators
- Seed source administrators

### Domain Context
The application supports forest management decision-making in British Columbia by providing:
- Seedlot-to-planting-site matching based on climatic compatibility
- Planting-site-to-seedlot matching for seed source selection
- Visual representation of suitable areas using GIS mapping
- Tabular data showing compatibility relationships

## Architecture

### Application Type
Client-side web application using AMD (Asynchronous Module Definition) pattern with RequireJS.

### Entry Point
`docs/index.html` - Main HTML document that loads all dependencies and initializes the application.

### Module Structure

#### 1. `docs/scripts/requireMain.js`
**Purpose**: Application entry point and event handling coordinator

**Responsibilities**:
- Initialize application modules
- Set up UI event listeners
- Coordinate between map and business logic modules
- Handle user interactions for both workflows

**Dependencies**:
- `scripts/defineMap.js`
- `scripts/main.js`
- `esri/tasks/support/Query`
- `esri/layers/GeoJSONLayer`

#### 2. `docs/scripts/main.js`
**Purpose**: Business logic and data processing module

**Responsibilities**:
- Species and BEC variant data management
- Suitability calculations
- Seedlot data filtering and matching
- Table population
- Data intersection operations
- Seedlot/orchard lookup

**Key Functions**:
- `fillSelects()` - Populate dropdown menus
- `addSuitabilityLayerCutblock()` - Process cutblock workflow
- `addSuitabilityLayerSeedlot()` - Process seedlot workflow
- `getIntersection()` - Calculate BEC variant intersections
- `populateSeedlot()` - Lookup seedlot by orchard
- `populateSpeciesBEC()` - Lookup species/BEC by seedlot
- `getSeedLot()` - Filter seedlots by criteria
- `updateData()` - Transform suitability codes to text

#### 3. `docs/scripts/defineMap.js`
**Purpose**: ArcGIS map initialization and management

**Responsibilities**:
- Map view creation and configuration
- Layer management (base layers, feature layers, dynamic layers)
- Widget initialization (basemap, print, layers, legend, tracking)
- Shapefile upload and processing
- Coordinate input handling
- Map interaction handlers

**Key Functions**:
- `mapInit()` - Initialize map and view
- `layerInit()` - Set up base feature layers
- `updateLayer()` - Apply dynamic layer filtering
- `addLayers()` - Add layers to map
- `clearLyrs()` - Remove all layers
- Widget initialization functions

### Data Flow

```
User Input (HTML Forms)
    ↓
requireMain.js (Event Handlers)
    ↓
main.js (Business Logic)
    ↓
JSON Data Files / ArcGIS Services
    ↓
main.js (Data Processing)
    ↓
defineMap.js (Map Layer Updates)
    ↓
ArcGIS Map View (Visual Output)
```

### External Services

#### ArcGIS Feature Servers
1. **CBST BEC10/BEC11 Service**
   - Base URL: `https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/`
   - Layer 0: Management Units
   - Layer 2: CBST 2019 (deprecated/inactive)
   - Layer 3: 2019 Species May Not Be Suitable (deprecated/inactive)
   - Layer 5: CBST (suitable areas)
   - Layer 6: CBST Species May Not Be Suitable (non-suitable areas)

2. **CBST BEC v11 Map Server**
   - Base URL: `https://maps.forsite.ca/server/rest/services/204_2/CBST_BEC_v11/MapServer/`
   - Layer 1: Area of Use (SPU layer)

#### ArcGIS Portal Services
- Generate Feature Collection: `https://www.arcgis.com/sharing/rest/content/features/generate`
- Print Service: `https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task`

### Technology Stack

#### Core Technologies
- **HTML5**: Structure and semantic markup
- **JavaScript (ES5)**: Application logic
- **CSS3**: Styling and layout

#### JavaScript Libraries
- **ArcGIS JS API 4.19**: Mapping and GIS functionality
- **jQuery 3.6.0**: DOM manipulation and AJAX
- **RequireJS**: Module loading (via ArcGIS JS API)

#### UI Frameworks
- **Bootstrap 4.5.2**: Responsive layout and components
- **Bootstrap Select 1.13.1**: Enhanced select dropdowns
- **Bootstrap Table 1.18.3**: Sortable, searchable tables
- **Font Awesome 5.14.0**: Icons

#### Build Tools
- None - Direct file serving (suitable for GitHub Pages deployment)

## User Workflows

### Workflow 1: "I Have A Cutblock"

**Use Case**: User has a planting site (cutblock) and needs to find suitable seed sources.

**Steps**:
1. Navigate to "I Have A Cutblock" tab
2. Select tree species from dropdown (25 species available)
3. Select BEC variant(s) for cutblock location (up to 3 variants)
4. Click "GO" button
5. System processes:
   - Loads species-specific migrated height data
   - Filters by selected BEC variant(s) and suitability thresholds
   - Calculates intersections if multiple BEC variants selected
   - Displays results in map and tables
6. Review results:
   - Map shows suitable (orange) and non-suitable (purple) areas
   - Cutblock table shows BEC variant compatibility
   - Seedlot table shows available seedlots for selected BEC variants

**Output**:
- Map layers highlighting suitable/non-suitable BEC variants
- Table: "Plantation BEC" ↔ "Seed BEC" compatibility matrix
- Table: Available seedlots matching criteria

**Business Rules**:
- Minimum suitability threshold varies by species (96.0% - 98.5%)
- Must meet predicted height (HTp_pred) threshold
- Site suitability (Sp_suit_site) must be considered
- Multiple BEC variants use intersection logic (AND operation)

### Workflow 2: "I Have A Seedlot"

**Use Case**: User has a seedlot and wants to know where it can be used, OR user is collecting from a BEC variant and wants deployment options.

**Input Methods** (three options):

#### Option A: Orchard Number
1. Enter orchard number
2. Click "Set Representative Seedlot"
3. System auto-populates species and BEC variant from Orchard_list.json

#### Option B: Seedlot Number
1. Enter seedlot number
2. Click "Set Species & BEC"
3. System auto-populates species and BEC variant from Seedlot_list.json

#### Option C: Manual Selection
1. Select species from dropdown
2. Select BEC variant from dropdown
3. Click "GO"

**Processing**:
- Loads species-specific migrated height data
- Filters by seed BEC variant and suitability thresholds
- Identifies plantation BEC variants where seedlot can be used

**Output**:
- Map layers showing suitable/non-suitable plantation areas
- Table: "Plantation BEC" ↔ "Seed BEC" compatibility
- Displays all BEC variants where the seedlot can be deployed

**Business Rules**:
- Based on seed BEC variant (source location)
- Migration distance must meet minimum threshold
- Site suitability determines color coding on map

## Business Logic

### Suitability Calculation

#### Species Thresholds
Each species has a minimum suitability percentage:
- AT: 97.5%
- BA: 97.5%
- BG: 98.5%
- BL: 97.0%
- CW: 98.0%
- DR: 97.5%
- EP: 97.5%
- FDC: 97.5%
- FDI: 97.5%
- HM: 97.5%
- HW: 97.5%
- LT: 97.5%
- LW: 97.5%
- PA: 96.5%
- PJ: 97.5%
- PLC: 97.5%
- PLI: 97.5%
- PW: 96.0%
- PY: 96.0%
- SB: 97.5%
- SS: 97.0%
- SX: 97.5%
- SXS: 97.5%
- YC: 96.0%

#### Filtering Criteria
For cutblock workflow:
- `BECvar_site == selected_BEC` (plantation location matches)
- `HTp_pred >= species_minimum_threshold` (meets height prediction threshold)
- `Sp_suit_site >= 0` (site suitability considered)

For seedlot workflow:
- `BECvar_seed == selected_BEC` (seed source location matches)
- `HTp_pred >= species_minimum_threshold`
- `Sp_suit_site >= 0`

#### Classification
- **Suitable**: `Sp_suit_seed == 1` (species suitable at seed location)
- **Not Suitable**: `Sp_suit_seed == 0` (species may not be suitable)

### Intersection Logic

When multiple BEC variants are selected (cutblock workflow):
1. Filter data for each selected BEC variant independently
2. Find intersection of results based on `BECvar_seed` field
3. Only BEC variants that appear in ALL selected site BEC variants are included
4. Supports 1, 2, or 3 BEC variant selections

**Algorithm**:
- For 2 variants: Find records where `BECvar_seed` exists in both filtered arrays
- For 3 variants: Find records where `BECvar_seed` exists in all three filtered arrays

### Data Transformation

#### Suitability Code to Text
- `Sp_suit_seed == "1"` → "Suitable"
- `Sp_suit_seed == "0"` → "Not Suitable"

#### Empty Value Handling
- Empty seedlot numbers → converted to 0
- Empty GW (genetic worth) values → converted to 0

## UI Components

### Navigation Tabs
Three-tab interface using Bootstrap tabs:
1. **Instructions**: User guide and help documentation
2. **I Have A Cutblock**: Cutblock-to-seedlot workflow
3. **I Have A Seedlot**: Seedlot-to-planting-site workflow

### Form Controls

#### Species Selection
- Dropdown with 25 tree species
- Single selection
- Bootstrap Select enhanced dropdown

#### BEC Variant Selection
- Dropdown with 218 BEC variants
- Search-enabled (Bootstrap Select live search)
- **Cutblock tab**: Multi-select (max 3)
- **Seedlot tab**: Single select

#### Action Buttons
- **GO**: Execute workflow
- **Clear**: Reset form selections (cutblock tab only)
- **Set Representative Seedlot**: Lookup by orchard
- **Set Species & BEC**: Lookup by seedlot

### Data Tables

#### Bootstrap Table Integration
- Sortable columns
- Searchable
- Styled with Bootstrap classes

#### Cutblock Workflow Tables
1. **Compatibility Table** (`cutblock_table`)
   - Columns: Plantation BEC, Seed BEC, Suitability, Limit
   - Shows BEC variant compatibility matrix

2. **Seedlot Table** (`seedlot_table`)
   - Columns: Seedlot, Orchard, GW, Class, Seed BEC
   - Shows available seedlots for selected criteria

#### Seedlot Workflow Table
1. **Compatibility Table** (`seed`)
   - Columns: Plantation BEC, Seed BEC, Suitability, Limit
   - Shows where seedlot can be deployed

### Map Widgets

#### Toolbar Buttons
- **Basemaps**: Switch map basemap (BasemapGallery widget)
- **Print**: Export map to PDF (Print widget)
- **Layers**: Manage layer visibility and opacity (LayerList widget)

#### Additional Widgets
- **Tracking**: GPS location tracking (Track widget)
- **Coordinate Input**: Zoom to lat/long coordinates
- **Shapefile Upload**: Add user shapefiles to map

#### Map Features
- Click on polygons to view popup information
- Popup shows selected BEC unit details
- Layer opacity controls in layer list

## Data Sources

### Local JSON Files

#### Location
`docs/Version_7_0/` directory

#### File Types

1. **Migrated Height Lists** (`*_migrated_height_list_5.json`)
   - One file per species (25 files)
   - Format: `{Species}_migrated_height_list_5.json`
   - Contains: BEC variant compatibility, height predictions, suitability data

2. **Seedlot Lists** (`*_Seedlots.json`)
   - One file per species (25 files)
   - Format: `{Species}_Seedlots.json`
   - Contains: Seedlot details, BEC variants, migration distances

3. **Master Lists**
   - `Orchard_list.json`: Orchard-to-seedlot mappings
   - `Seedlot_list.json`: Complete seedlot registry with species and BEC data

#### Data Characteristics
- Large files (some > 40,000 records)
- Loaded dynamically via jQuery `$.getJSON()`
- No caching mechanism
- Files are read-only from application perspective

## Performance Considerations

### Large JSON Files
- Some migrated height files exceed 80,000 records
- All data loaded into memory on workflow execution
- Filtering performed in-memory using JavaScript `Array.filter()`
- No pagination or lazy loading

### Map Rendering
- Multiple feature layers can be active simultaneously
- Definition expressions applied for dynamic filtering
- Layer opacity set to 0.5 for transparency
- No performance optimizations for large datasets

### Browser Memory
- All JSON data loaded into browser memory
- No cleanup mechanism for previous queries
- Potential memory issues with very large datasets

## Error Handling

### User Input Validation
- Coordinate input validates numeric ranges
- File upload checks for .zip extension
- Empty selections may result in "No results" alerts

### Data Loading Errors
- No explicit error handling for failed JSON loads
- ArcGIS service failures not explicitly handled
- Network errors may cause silent failures

### User Feedback
- Alert dialogs for invalid inputs
- Console logging for debugging
- No loading indicators for async operations

## Browser Compatibility

### Requirements
- Modern browser with ES5 JavaScript support
- ArcGIS JS API 4.19 compatibility
- Local file serving or web server required (CORS considerations)

### Tested Environments
- Desktop browsers (implicit from CDN resources)
- Not explicitly mobile-optimized

## Security Considerations

### External Resources
- All dependencies loaded from CDNs
- No authentication required for application
- ArcGIS services may have usage restrictions

### Data Privacy
- No user data collection
- Shapefile uploads processed client-side
- No server-side data storage

## Deployment

### Current Deployment
- GitHub Pages (serving `docs/` directory)
- Static file hosting
- No build process required

### Requirements
- Web server or static hosting
- Access to external CDNs
- ArcGIS Feature Server access
- Local JSON files in `docs/Version_7_0/`

## Future Considerations

### Known Limitations
- Seedlot data current as of August 18th, 2025
- Some B Class seedlots not yet included (pending BEC 10 assignment)
- No support for seedlots registered after data snapshot date
- 2019 model data commented out/inactive

### Technical Debt
- Mixed ES5/ES6+ patterns
- No module bundling
- Large inline JSON data structures
- Limited error handling
- No automated testing
- Global variables used (e.g., `window.dat`, `window.json_obj`)

### Potential Improvements
- Modern JavaScript (ES6+ modules)
- Build tooling (Webpack, Vite)
- TypeScript for type safety
- Unit and integration tests
- Error handling improvements
- Loading indicators
- Data caching strategies
- Progressive data loading

## Known Issues & Improvement Opportunities

For detailed improvement plans, priorities, and effort estimates, see [plan.md](./plan.md#improvement-opportunities).

### Summary of Key Areas

**Critical Priority**:
- **Performance**: Large data files (>80,000 records) loaded entirely into memory with no caching
- **Error Handling**: Minimal error handling for async operations, silent failures possible
- **User Feedback**: No loading indicators during async operations

**Important Priority**:
- **Code Quality**: Global variables (`window.dat`, `window.json_obj`) and outdated patterns
- **Testing**: No automated test infrastructure, manual testing only
- **Dependencies**: Outdated versions (ArcGIS 4.19, Bootstrap 4.5.2) may have security patches

**Enhancement Priority**:
- **Modern JavaScript**: ES5 only, callback-based patterns, no modern features
- **Build Tooling**: No build process, direct file serving only
- **Accessibility**: Limited ARIA attributes, keyboard navigation gaps

**Quick Wins Available**:
- Loading spinners (1-2 hours)
- Basic error handling (4-6 hours)
- Global variable refactoring (2-4 hours)
- ESLint configuration (1 hour)

See [plan.md](./plan.md) for detailed improvement opportunities with specific solutions, effort estimates, and implementation strategies.

