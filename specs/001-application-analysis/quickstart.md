# Quick Start Guide

## For New Developers

This guide will help you get up and running with the CBST Seedlot Selection Tool codebase quickly.

## Prerequisites

### Required
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Text editor or IDE (VS Code recommended)
- Git for version control
- Basic understanding of:
  - HTML, CSS, JavaScript
  - GIS concepts (helpful but not required)
  - Forestry/BEC terminology (helpful but not required)

### Optional but Helpful
- Node.js (for future build tools)
- Local web server (for development)
- ArcGIS developer account (for understanding ArcGIS services)

## Project Structure

```
nr-seedtransfer-map/
├── docs/                    # Main application directory
│   ├── index.html          # Entry point
│   ├── css/
│   │   └── styles.css      # Application styles
│   ├── scripts/
│   │   ├── requireMain.js  # Application entry point
│   │   ├── main.js         # Business logic
│   │   └── defineMap.js    # Map functionality
│   └── Version_7_0/        # Data files (JSON)
├── memory/                  # Spec Kit constitution
└── specs/                   # Specification documents
```

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nr-seedtransfer-map
```

### 2. Set Up Local Server (Recommended)

The application requires a web server due to browser security restrictions (CORS) for loading JSON files.

#### Option A: Python (Simple)

```bash
cd docs
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

#### Option B: Node.js (http-server)

```bash
npm install -g http-server
cd docs
http-server -p 8000
```

#### Option C: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click on `docs/index.html`
3. Select "Open with Live Server"

### 3. Open in Browser

Navigate to:
- `http://localhost:8000/index.html` (if using Python/Node server)
- Or the URL provided by Live Server

You should see the CBST Seedlot Selection Tool interface.

## Understanding the Codebase

### Entry Point: `docs/index.html`

This is the main HTML file that:
- Loads all CSS and JavaScript dependencies
- Defines the page structure
- Sets up the three-tab interface

### Application Flow

1. **Page Load**
   - `index.html` loads ArcGIS JS API
   - ArcGIS JS API loads `requireMain.js` via RequireJS
   - `requireMain.js` initializes modules

2. **Initialization**
   ```javascript
   main.fillSelects();      // Populate dropdowns
   defineMap.mapInit();     // Initialize map
   ```

3. **User Interaction**
   - User selects species and BEC variant
   - Event handlers in `requireMain.js` call business logic
   - `main.js` processes data
   - `defineMap.js` updates map layers

### Key Modules

#### `scripts/requireMain.js`
- **Purpose**: Application coordinator
- **Key Functions**: Event handlers, module initialization
- **Read First**: Yes - shows application flow

#### `scripts/main.js`
- **Purpose**: Business logic and data processing
- **Key Functions**: 
  - `fillSelects()` - Populate dropdowns
  - `addSuitabilityLayerCutblock()` - Cutblock workflow
  - `addSuitabilityLayerSeedlot()` - Seedlot workflow
- **Read Second**: Core application logic

#### `scripts/defineMap.js`
- **Purpose**: ArcGIS map management
- **Key Functions**:
  - `mapInit()` - Initialize map
  - `updateLayer()` - Update map layers
  - Widget initialization functions
- **Read Third**: Map-specific functionality

## Key Concepts

### BEC Variants
Biogeoclimatic Ecosystem Classification variants represent ecological zones in British Columbia. The application uses 218 different variants to determine seedlot compatibility.

### Species
25 tree species are supported, each with a minimum suitability threshold (96.0% - 98.5%). Species codes follow forestry naming conventions (e.g., "FDC" = Douglas-fir, "LW" = Western larch).

### Suitability Calculation
The application filters data based on:
- **HTp_pred**: Predicted height (suitability score)
- **Sp_suit_site**: Species suitability at planting site
- **Sp_suit_seed**: Species suitability at seed source
- **MigrationDistance**: Climatic transfer limits

### Workflows

#### Workflow 1: "I Have A Cutblock"
User has a planting site and needs to find suitable seed sources.
- Input: Species + up to 3 BEC variants (planting site)
- Output: Suitable seed sources and map visualization

#### Workflow 2: "I Have A Seedlot"
User has a seedlot and wants to know where it can be used.
- Input: Species + BEC variant (seed source) OR seedlot/orchard number
- Output: Suitable planting locations and map visualization

## Data Files

### Location
All data files are in `docs/Version_7_0/`

### File Types

1. **Migrated Height Lists**: `{Species}_migrated_height_list_5.json`
   - Contains BEC variant compatibility data
   - Large files (some >80,000 records)
   - Used for suitability calculations

2. **Seedlot Lists**: `{Species}_Seedlots.json`
   - Contains seedlot-to-BEC variant mappings
   - Used for seedlot filtering

3. **Master Lists**:
   - `Orchard_list.json` - Orchard-to-seedlot mappings
   - `Seedlot_list.json` - Complete seedlot registry

### Data Structure
See `specs/001-application-analysis/data-model.md` for complete schemas.

## Common Tasks

### Adding a New Species

1. Add species to `speciesStore` in `main.js`:
   ```javascript
   { name: "NEW", minsuit: 97.5 }
   ```

2. Ensure JSON data files exist:
   - `Version_7_0/New_migrated_height_list_5.json`
   - `Version_7_0/New_Seedlots.json`

3. Test both workflows with new species

### Debugging

#### Enable Console Logging
The code already has `console.log()` statements. Open browser DevTools (F12) to see:
- Loaded data
- Filtering results
- Map layer updates

#### Common Issues

**Map not displaying**:
- Check ArcGIS JS API loaded (Network tab)
- Check for console errors
- Verify Feature Server URLs are accessible

**No results in tables**:
- Check JSON files loaded (Network tab)
- Verify species/BEC variant selections
- Check console for filtering results

**Dropdowns not populating**:
- Check `fillSelects()` called on load
- Verify Bootstrap Select initialized
- Check for JavaScript errors

### Testing Changes

1. **Manual Testing**
   - Test both workflows with different species
   - Try multiple BEC variant selections
   - Test seedlot/orchard lookups
   - Verify map updates correctly
   - Test error cases (invalid inputs)

2. **Browser Testing**
   - Test in multiple browsers
   - Check responsive layout
   - Verify map interactions

3. **Performance Testing**
   - Test with large datasets
   - Monitor memory usage
   - Check load times

## Development Workflow

### Making Changes

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Edit files in `docs/scripts/`
   - Test locally
   - Check browser console for errors

3. **Test Thoroughly**
   - Test both workflows
   - Test edge cases
   - Verify no regressions

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   ```

5. **Create Pull Request**
   - Push branch to remote
   - Create PR with description
   - Request review

### Code Style

- Follow existing code patterns
- Use meaningful variable names
- Comment complex logic
- Keep functions focused on single responsibility

## External Resources

### ArcGIS Services
The application uses several ArcGIS Feature Server endpoints:
- Base URL: `https://maps.forsite.ca/server/rest/services/`
- Services may require network access
- Check service status if map layers fail

### Documentation
- [ArcGIS JS API Documentation](https://developers.arcgis.com/javascript/latest/)
- [Bootstrap 4 Documentation](https://getbootstrap.com/docs/4.5/)
- [jQuery API](https://api.jquery.com/)

## Getting Help

### Documentation
- `specs/001-application-analysis/spec.md` - Complete application specification
- `specs/001-application-analysis/data-model.md` - Data schemas
- `specs/001-application-analysis/contracts/api-spec.md` - Function contracts

### Code Exploration Tips
1. Start with `requireMain.js` to understand flow
2. Trace a user action through the code
3. Use browser DevTools to inspect data
4. Add console.log() statements for debugging
5. Read inline comments in code

## Next Steps

1. **Explore the Application**
   - Try both workflows
   - Explore different species/BEC combinations
   - Understand the data flow

2. **Read Documentation**
   - Review `spec.md` for complete understanding
   - Read `api-spec.md` for function details
   - Study `data-model.md` for data structures

3. **Start Coding**
   - Pick a small improvement task
   - Make changes locally
   - Test thoroughly
   - Submit PR

4. **Join the Team**
   - Review existing PRs
   - Understand code review process
   - Contribute to discussions

## Troubleshooting

### Application Won't Load
- Check web server is running
- Verify all files are in correct locations
- Check browser console for errors
- Ensure CDN resources are accessible

### Map Not Displaying
- Check internet connection (for ArcGIS services)
- Verify ArcGIS JS API loaded
- Check Feature Server URLs are accessible
- Look for CORS errors in console

### Data Not Loading
- Verify JSON files exist in `Version_7_0/`
- Check file names match expected pattern
- Verify web server allows file access
- Check browser Network tab for failed requests

### Performance Issues
- Large JSON files may take time to load
- Consider using smaller test datasets during development
- Monitor browser memory usage
- Check for memory leaks

## Additional Resources

- **Repository**: Check GitHub for issues, PRs, and discussions
- **Spec Kit**: Review `memory/constitution.md` for project principles
- **Refactoring Plan**: See `specs/001-application-analysis/plan.md` for future improvements

Good luck, and welcome to the project! 🎉

