# Research and Dependency Analysis

## Overview

This document analyzes the current technology stack, dependencies, and modernization opportunities for the CBST Seedlot Selection Tool.

## Current Dependency Analysis

### Core Dependencies

#### ArcGIS JS API 4.19
- **Purpose**: GIS mapping, feature layers, widgets
- **Type**: External CDN dependency
- **Version**: 4.19 (released 2020)
- **Status**: Stable but outdated
- **Latest Version**: 4.31+ (as of 2025)
- **Considerations**:
  - Major version updates may introduce breaking changes
  - Newer versions include performance improvements
  - Security patches available in newer versions
  - Consider migration path carefully

**Recommendation**: Research compatibility with newer ArcGIS JS API versions. Test 4.31+ for breaking changes before upgrading.

#### jQuery 3.6.0
- **Purpose**: DOM manipulation, AJAX requests
- **Type**: External CDN dependency
- **Version**: 3.6.0
- **Status**: Current and stable
- **Latest Version**: 3.7.1 (minor updates available)
- **Modern Alternative**: Native JavaScript (ES6+) for new code
- **Considerations**:
  - jQuery is no longer essential for modern JavaScript
  - Can be replaced with native DOM APIs
  - AJAX can use Fetch API

**Recommendation**: Keep for compatibility during refactoring. Consider gradual migration to native JavaScript.

#### Bootstrap 4.5.2
- **Purpose**: CSS framework, responsive layout, components
- **Type**: External CDN dependency
- **Version**: 4.5.2
- **Status**: Stable but outdated
- **Latest Version**: Bootstrap 5.3+ (major version difference)
- **Breaking Changes**:
  - jQuery dependency removed in Bootstrap 5
  - Class name changes
  - JavaScript API changes

**Recommendation**: Research Bootstrap 5 migration path. Consider if upgrade is necessary or if staying on 4.x is sufficient.

#### Bootstrap Select 1.13.1
- **Purpose**: Enhanced select dropdowns with search
- **Type**: External CDN dependency
- **Version**: 1.13.1
- **Status**: Stable
- **Latest Version**: 1.14.0-beta3 (development)
- **Considerations**:
  - Bootstrap 5 compatible version available
  - Alternative: native HTML5 datalist or custom component

**Recommendation**: Verify Bootstrap 5 compatibility if upgrading Bootstrap.

#### Bootstrap Table 1.18.3
- **Purpose**: Sortable, searchable tables
- **Type**: External CDN dependency
- **Version**: 1.18.3
- **Status**: Current
- **Latest Version**: 1.21.3+ (minor updates available)
- **Considerations**:
  - Actively maintained
  - Bootstrap 5 compatible versions available

**Recommendation**: Update to latest 1.x version if staying on Bootstrap 4, or research Bootstrap 5 compatible version.

#### Font Awesome 5.14.0
- **Purpose**: Icons
- **Type**: External CDN dependency
- **Version**: 5.14.0
- **Status**: Stable but outdated
- **Latest Version**: Font Awesome 6.x (paid/free tiers)
- **Considerations**:
  - FA 6 has breaking changes in class names
  - Free tier available
  - Alternative: Bootstrap Icons (no dependency)

**Recommendation**: Consider migrating to Bootstrap Icons (included with Bootstrap) to reduce dependencies.

### Development Dependencies

**None Currently** - No build tools, linters, or test frameworks configured.

## Modernization Opportunities

### JavaScript Modernization

#### Current State
- ES5 JavaScript syntax
- AMD/RequireJS module pattern (via ArcGIS JS API)
- Global variables used (`window.dat`, `window.json_obj`)
- Callback-based async patterns
- Inline event handlers

#### Modern Alternatives

**ES6+ Modules**
- Native ES6 modules with `import/export`
- Better tree-shaking and bundling
- Requires build tooling
- May require ArcGIS JS API configuration changes

**Promise/Async-Await**
- Replace jQuery AJAX with Fetch API
- Use async/await for cleaner async code
- Better error handling patterns

**Template Literals**
- Replace string concatenation
- Better readability for SQL IN clauses

**Destructuring and Spread**
- Cleaner array/object manipulation
- Replace manual array filtering with functional patterns

**Example Modernization**:
```javascript
// Current
$.getJSON(path, function(data) {
    var results = data.filter(function(x) {
        return x.BECvar_site == bec_name;
    });
});

// Modern
const response = await fetch(path);
const data = await response.json();
const results = data.filter(x => x.BECvar_site === bec_name);
```

### Build Tooling

#### Options

**Webpack**
- Industry standard
- Good ArcGIS JS API integration
- Complex configuration
- Large bundle size

**Vite**
- Fast development server
- Modern ESM support
- Simpler configuration
- Good for modern JavaScript

**Parcel**
- Zero configuration
- Good for simple projects
- May need customization for ArcGIS

**Rollup**
- Good for library builds
- Less suitable for applications

**Recommendation**: Evaluate Vite for development experience, or Webpack for ecosystem compatibility.

### Module System Migration

#### Current: AMD/RequireJS
```javascript
define(['dependency'], function(dep) {
    // module code
});
```

#### Target: ES6 Modules
```javascript
import dependency from './dependency.js';
```

**Challenges**:
- ArcGIS JS API uses AMD
- May need configuration to support both
- Consider using ArcGIS JS API's ES modules build if available

### Testing Framework

#### Recommendations

**Jest**
- Popular JavaScript testing framework
- Good mocking capabilities
- Requires Node.js setup

**Vitest**
- Vite-native testing
- Fast execution
- Modern syntax support

**QUnit** (ArcGIS Compatible)
- Used by ArcGIS JS API
- Familiar if already using ArcGIS
- Less modern than Jest/Vitest

**Recommendation**: Start with Vitest if using Vite, or Jest for broader ecosystem compatibility.

### Type Safety

#### TypeScript
- Benefits:
  - Type safety for large codebase
  - Better IDE support
  - Self-documenting code
- Challenges:
  - ArcGIS JS API types availability
  - Migration effort
  - Build complexity

**Recommendation**: Consider TypeScript for new code, gradual migration for existing code.

### CSS Modernization

#### Current: CSS3 with Bootstrap
- Functional but verbose
- Many unused Bootstrap classes
- Inline styles in some places

#### Modern Options

**CSS Modules**
- Scoped styling
- Better component isolation

**Tailwind CSS**
- Utility-first approach
- Smaller bundle sizes
- Rapid development

**Sass/SCSS**
- Variables and mixins
- Better organization
- Bootstrap has Sass version

**Recommendation**: Evaluate Tailwind CSS for modern utility-first approach, or continue with Bootstrap if team familiarity is priority.

### Data Management

#### Current Issues
- Large JSON files loaded entirely into memory
- No pagination or streaming
- No caching strategy
- Synchronous filtering of large datasets

#### Solutions

**IndexedDB**
- Browser-based database
- Store and query large datasets
- Better than loading all data

**Web Workers**
- Offload data processing
- Prevent UI blocking
- Parallel processing

**Server-Side Filtering**
- Move filtering to backend
- Reduce client-side data transfer
- Better performance for large datasets

**Virtual Scrolling**
- Only render visible table rows
- Better performance for large tables

**Recommendation**: Start with IndexedDB for client-side caching, consider server-side filtering if backend is available.

### Performance Optimization

#### Bundle Optimization
- Code splitting for large modules
- Lazy loading for map components
- Tree shaking to remove unused code

#### Asset Optimization
- Compress JSON files (gzip/brotli)
- Image optimization if added
- CDN caching strategies

#### Runtime Optimization
- Debounce user input handlers
- Cancel in-flight requests
- Memoize expensive calculations
- Use requestAnimationFrame for animations

### Security Considerations

#### Current State
- No authentication required
- External CDN dependencies
- No Content Security Policy

#### Improvements
- Implement CSP headers
- Subresource Integrity (SRI) for CDN resources
- Regular dependency security audits
- HTTPS enforcement

### Accessibility

#### Current State
- Basic semantic HTML
- Some ARIA attributes via Bootstrap
- Keyboard navigation limitations

#### Improvements
- Full keyboard navigation support
- Screen reader optimization
- WCAG 2.1 AA compliance
- Focus management

## Browser Compatibility

### Current Requirements
- ES5 JavaScript support
- ArcGIS JS API 4.19 compatibility

### Support Matrix Research Needed
- Test on current browser versions
- Define minimum browser support policy
- Consider dropping IE11 if supported

## Migration Strategy Considerations

### Incremental Approach
1. **Phase 1**: Add build tooling without changing code
2. **Phase 2**: Modernize individual modules incrementally
3. **Phase 3**: Replace dependencies one at a time
4. **Phase 4**: Refactor architecture

### Big Bang Approach
- Complete rewrite with modern stack
- Higher risk
- Faster to modern stack
- May lose working features

**Recommendation**: Incremental approach to minimize risk and maintain functionality.

## Research Tasks

### Immediate
1. [ ] Test ArcGIS JS API 4.31+ compatibility
2. [ ] Evaluate build tool options (Vite vs Webpack)
3. [ ] Research ArcGIS JS API ES modules support
4. [ ] Test Bootstrap 5 migration complexity

### Short Term
1. [ ] Set up development environment with build tools
2. [ ] Create proof-of-concept with modern JavaScript
3. [ ] Benchmark performance improvements
4. [ ] Research IndexedDB for data caching

### Long Term
1. [ ] Plan TypeScript migration
2. [ ] Evaluate server-side data filtering
3. [ ] Design new architecture
4. [ ] Create migration timeline

## Resource Links

### ArcGIS JS API
- [Current Documentation](https://developers.arcgis.com/javascript/latest/)
- [Migrating from 4.x](https://developers.arcgis.com/javascript/latest/migrating-from-4x/)
- [ES Modules](https://developers.arcgis.com/javascript/latest/es-modules/)

### Modern JavaScript
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Can I Use](https://caniuse.com/) - Browser compatibility

### Build Tools
- [Vite Documentation](https://vitejs.dev/)
- [Webpack Documentation](https://webpack.js.org/)

### Testing
- [Vitest Documentation](https://vitest.dev/)
- [Jest Documentation](https://jestjs.io/)

## Recommendations Summary

### High Priority
1. Add build tooling (Vite recommended)
2. Implement error handling
3. Add loading indicators
4. Optimize large JSON file loading

### Medium Priority
1. Modernize JavaScript syntax incrementally
2. Add automated testing
3. Implement data caching
4. Update outdated dependencies

### Low Priority
1. TypeScript migration
2. CSS framework upgrade
3. Complete architecture rewrite
4. Server-side implementation

