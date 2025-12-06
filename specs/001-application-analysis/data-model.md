# Data Model Specification

## Overview

The CBST Seedlot Selection Tool uses JSON-based data files stored locally and ArcGIS Feature Server layers for spatial data. This document defines all data structures, schemas, and relationships.

## Data Sources

### Local JSON Files
Located in: `docs/Version_7_0/`

### ArcGIS Feature Server Layers
REST API endpoints providing spatial data

## Core Data Structures

### Species Store

**Location**: Hardcoded in `main.js`

**Type**: JavaScript Array

**Schema**:
```javascript
{
  name: string,      // Species code (e.g., "AT", "BA", "FDC")
  minsuit: number    // Minimum suitability threshold (96.0 - 98.5)
}
```

**Example**:
```javascript
{ name: "FDC", minsuit: 97.5 }
```

**Complete List** (25 species):
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

### BEC Variant Store

**Location**: Hardcoded in `main.js`

**Type**: JavaScript Array

**Schema**:
```javascript
{
  name: string,  // BEC variant code (e.g., "BAFAun", "CWHdm")
  id: number     // Unique identifier (1-218)
}
```

**Count**: 218 BEC variants

**Categories** (examples):
- BAFA: Boreal Altai Fescue Alpine
- BG: Bunchgrass
- BWBS: Boreal White and Black Spruce
- CDF: Coastal Douglas-fir
- CWH: Coastal Western Hemlock
- ESSF: Engelmann Spruce - Subalpine Fir
- ICH: Interior Cedar - Hemlock
- IDF: Interior Douglas-fir
- IMA: Interior Mountain-heather Alpine
- MH: Mountain Hemlock
- MS: Montane Spruce
- PP: Ponderosa Pine
- SBPS: Sub-Boreal Pine - Spruce
- SBS: Sub-Boreal Spruce
- SWB: Spruce - Willow - Birch

### Migrated Height List Data

**File Pattern**: `{Species}_migrated_height_list_5.json`

**Example**: `Fdc_migrated_height_list_5.json`

**Type**: JSON Array of Objects

**Schema**:
```javascript
{
  "BECvar_site": string,      // Plantation BEC variant (destination)
  "BECvar_seed": string,       // Seed source BEC variant (origin)
  "HTp_pred": string,          // Predicted height (as string, e.g., "0.9850")
  "Sp_suit_site": string,      // Site suitability (0 or 1)
  "Sp_suit_seed": string,      // Seed suitability (0 or 1)
  "Limit": string              // Limit field (often empty string)
}
```

**Field Descriptions**:
- `BECvar_site`: The BEC variant where the seed would be planted (plantation site)
- `BECvar_seed`: The BEC variant where the seed originates (seed source)
- `HTp_pred`: Height prediction value (0.0000 to 1.0000+), represents suitability score
- `Sp_suit_site`: Binary indicator (0/1) for species suitability at plantation site
- `Sp_suit_seed`: Binary indicator (0/1) for species suitability at seed source location
- `Limit`: Additional limitation field (typically empty, purpose unclear)

**Data Characteristics**:
- Very large files (some > 80,000 records)
- Represents all possible BEC variant combinations for each species
- Used for cutblock workflow (filtering by `BECvar_site`)
- Used for seedlot workflow (filtering by `BECvar_seed`)

**Example Record**:
```json
{
  "BECvar_site": "BAFAun",
  "BECvar_seed": "BGxh1",
  "HTp_pred": "0.9850",
  "Sp_suit_site": "1",
  "Sp_suit_seed": "1",
  "Limit": ""
}
```

### Seedlot List Data

**File Pattern**: `{Species}_Seedlots.json`

**Example**: `Fdc_Seedlots.json`

**Type**: JSON Array of Objects

**Schema**:
```javascript
{
  "": string,                  // Record index (empty key)
  "BECvar_seed": string,       // Seed source BEC variant
  "BECvar_site": string,       // Plantation BEC variant
  "GW": string,                // Genetic Worth (often empty)
  "GeneticClass": string,      // Class designation (A, B, or empty)
  "MigrationDistance": string, // Migration distance value (e.g., "0.9850")
  "Orchard": string,           // Orchard number (or empty)
  "Seedlot": string,           // Seedlot number (or empty)
  "Species1": string           // Species code
}
```

**Field Descriptions**:
- `BECvar_seed`: BEC variant where seed was collected
- `BECvar_site`: BEC variant where seed can be planted
- `GW`: Genetic Worth value (often empty string)
- `GeneticClass`: Seedlot class (A, B, or empty)
- `MigrationDistance`: Migration distance suitability score
- `Orchard`: Associated orchard number (may be empty)
- `Seedlot`: Seedlot identifier (may be empty)
- `Species1`: Tree species code

**Data Characteristics**:
- Contains seedlot-to-BEC variant mappings
- Some records have empty seedlot/orchard fields
- Used for filtering available seedlots in cutblock workflow
- Migration distance used as filter threshold

**Example Record**:
```json
{
  "": "0",
  "BECvar_seed": "BAFAun",
  "BECvar_site": "BAFAun",
  "GW": "",
  "GeneticClass": "",
  "MigrationDistance": "0.0",
  "Orchard": "",
  "Seedlot": "",
  "Species1": "FDC"
}
```

### Master Seedlot List

**File**: `Seedlot_list.json`

**Type**: JSON Array of Objects

**Schema**:
```javascript
{
  "": string,          // Record index
  "Orchard": string,   // Orchard number (may be empty)
  "BECvar": string,    // BEC variant code
  "Seedlot": string,   // Seedlot number (as string)
  "Species": string,   // Species code
  "Class": string,     // Seedlot class (A or B)
  "GW": string         // Genetic Worth (often empty)
}
```

**Purpose**:
- Lookup table for seedlot number → species/BEC variant
- Used in "Set Species & BEC" functionality
- Complete registry of all seedlots

**Example Record**:
```json
{
  "": "12029",
  "Orchard": "101",
  "Seedlot": "3226",
  "Species": "FDC",
  "Class": "A",
  "GW": ""
}
```

### Master Orchard List

**File**: `Orchard_list.json`

**Type**: JSON Array of Objects

**Schema**:
```javascript
{
  "": string,        // Record index
  "Orchard": string, // Orchard number (may be empty)
  "Seedlot": string, // Representative seedlot number
  "Class": string    // Seedlot class (A or B)
}
```

**Purpose**:
- Lookup table for orchard number → representative seedlot
- Used in "Set Representative Seedlot" functionality
- Maps orchards to seedlots for auto-population

**Example Record**:
```json
{
  "": "12029",
  "Orchard": "101",
  "Seedlot": "3226",
  "Class": "A"
}
```

## ArcGIS Feature Server Data

### Layer 0: Management Units

**URL**: `https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/0`

**Type**: Feature Layer

**Fields**:
- `Management_Units`: Management unit identifier

**Purpose**: Base layer showing forest management unit boundaries

### Layer 5: CBST (Suitable Areas)

**URL**: `https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/5`

**Type**: Feature Layer

**Fields**:
- `MAP_Label`: BEC variant code
- `SHAPE_Area`: Polygon area

**Purpose**: Displays suitable BEC variant areas based on query

**Filtering**: Dynamic definition expression using `MAP_LABEL IN (...)` syntax

### Layer 6: CBST Species May Not Be Suitable

**URL**: `https://maps.forsite.ca/server/rest/services/Hosted/CBST_BEC10_BEC11/FeatureServer/6`

**Type**: Feature Layer

**Fields**:
- `MAP_Label`: BEC variant code
- `SHAPE_Area`: Polygon area

**Purpose**: Displays non-suitable BEC variant areas based on query

**Filtering**: Dynamic definition expression using `MAP_LABEL IN (...)` syntax

### Layer 1: Area of Use (SPU Layer)

**URL**: `https://maps.forsite.ca/server/rest/services/204_2/CBST_BEC_v11/MapServer/1`

**Type**: Feature Layer

**Fields**:
- `Seedlot`: Seedlot identifier
- `SPU`: Seed Planning Unit identifier

**Purpose**: Shows area of use for specific seedlots

**Usage**: Can be filtered by seedlot number (currently commented out in code)

### Deprecated Layers (2019 Model)

**Layer 2**: CBST 2019 - Currently inactive
**Layer 3**: 2019 Species May Not Be Suitable - Currently inactive

## Data Relationships

### Entity Relationship Diagram (Conceptual)

```
Species
  ├── has many → Migrated Height Records
  ├── has many → Seedlot Records
  └── has one → Minimum Suitability Threshold

BEC Variant
  ├── appears in → Migrated Height Records (as site)
  ├── appears in → Migrated Height Records (as seed)
  └── appears in → Seedlot Records

Seedlot
  ├── belongs to → Species
  ├── belongs to → BEC Variant (seed source)
  ├── can be used in → BEC Variant (planting site)
  ├── may belong to → Orchard
  └── has → Genetic Class (A or B)

Orchard
  └── has one → Representative Seedlot
```

### Data Flow Relationships

```
User selects Species + BEC Variant(s)
    ↓
Load Migrated Height List (filtered by species)
    ↓
Filter by BEC variant(s) and suitability threshold
    ↓
Extract unique BECvar_seed values
    ↓
Create MAP_LABEL filter string
    ↓
Apply to ArcGIS Feature Layer definition expression
    ↓
Map displays filtered polygons
```

## Data Constraints

### Validation Rules

1. **Species Codes**: Must match one of 25 defined species
2. **BEC Variants**: Must match one of 218 defined variants
3. **Suitability Thresholds**: Must be >= species minimum (96.0% - 98.5%)
4. **BEC Variant Selection**: 
   - Cutblock workflow: Maximum 3 variants
   - Seedlot workflow: Single variant only
5. **HTp_pred Values**: Range from 0.0000 to 1.0000+ (as strings)

### Data Quality Notes

- Some records have empty string values for optional fields
- Empty seedlot/orchard values converted to 0 in processing
- Migration distance may be "0.0" for some records
- Genetic Worth (GW) often empty
- Some seedlots may not have BEC 10 assignments yet (Class B seedlots)

### Data Currency

- **Seedlot Data Date**: August 18th, 2025
- **Version**: 7.0
- **Update Frequency**: Manual updates required
- **Known Gaps**: 
  - Seedlots registered after August 18th, 2025 not included
  - Some Class B seedlots pending BEC 10 assignment

## Data Access Patterns

### Read Operations

1. **On Application Load**:
   - Species store (in-memory)
   - BEC variant store (in-memory)

2. **On Workflow Execution**:
   - Load species-specific migrated height JSON (async)
   - Load species-specific seedlot JSON (async)
   - Query ArcGIS Feature Server layers (on-demand)

3. **On Seedlot/Orchard Lookup**:
   - Load `Seedlot_list.json` (async)
   - Load `Orchard_list.json` (async)

### Write Operations

- None - All data is read-only
- Shapefile upload creates temporary feature layers (in-memory only)

### Caching

- No explicit caching mechanism
- Data loaded fresh on each workflow execution
- Browser may cache JSON files via HTTP cache headers

## Data Size Estimates

### File Sizes (approximate)
- Migrated Height Lists: 5-20 MB per species (varies)
- Seedlot Lists: 1-5 MB per species
- Master Lists: < 1 MB each

### Memory Usage
- All loaded data resides in browser memory
- No pagination or streaming
- Potential memory pressure with large species datasets

## Data Schema Evolution

### Version History
- **Version 7.0**: Current version (BEC 10 classification)
- **Version 6.0**: Previous version (some 2019 model data still in codebase but inactive)

### Migration Notes
- 2019 model layers (Layer 2, 3) deprecated but still defined
- HTp_pred_2019 fields commented out in code
- Sp_suit_site_2019 and Sp_suit_seed_2019 fields commented out

## Recommendations

### Data Optimization
1. Consider data pagination for large files
2. Implement client-side caching
3. Use compressed JSON if file sizes become problematic
4. Consider server-side filtering instead of client-side

### Data Management
1. Establish regular data update process
2. Version control for JSON data files
3. Document data source and update procedures
4. Implement data validation on load

### Schema Improvements
1. Standardize empty value representation
2. Use consistent numeric types (avoid string numbers where possible)
3. Add metadata fields (last updated, version, source)
4. Consider schema validation (JSON Schema)

