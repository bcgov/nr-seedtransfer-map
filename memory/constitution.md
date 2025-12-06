# Project Constitution

## Purpose
This document establishes the foundational principles and standards for the CBST Seedlot Selection Tool project. It serves as the single source of truth for development decisions, code quality expectations, and project governance.

## Project Overview
The CBST Seedlot Selection Tool is a GIS web mapping application designed to help forest managers in British Columbia match seedlots with planting sites based on climatic information and BEC (Biogeoclimatic Ecosystem Classification) variant compatibility.

## Core Principles

### 1. Documentation First
- All functionality must be documented before refactoring
- New features require specifications
- API contracts must be explicit
- Data models must be formally defined

### 2. Maintainability
- Code should be readable by developers unfamiliar with the codebase
- Complex business logic must be documented
- Dependencies must be explicitly declared and versioned
- Avoid technical debt accumulation

### 3. User-Centric Development
- Primary users are forest managers and forestry professionals
- User workflows must be clearly defined and preserved
- UI/UX changes must maintain backward compatibility with existing workflows
- Performance optimizations should not degrade user experience

### 4. Technical Standards
- Follow conventional commits format: `feat:`, `fix:`, `docs:`, `chore:`
- Prefer incremental, verified changes over large refactoring
- Always ensure application functionality before proceeding
- Test changes in development environment before deployment

### 5. Code Quality
- Functions should have clear responsibilities
- Avoid global state where possible
- Use consistent naming conventions
- Comment complex algorithms and business logic

### 6. Dependency Management
- External dependencies must be versioned
- Prefer stable, well-maintained libraries
- Document reasons for dependency choices
- Regular security and compatibility audits

## Technical Constraints

### Current Stack
- Frontend: HTML5, JavaScript (ES5/AMD), CSS3
- Mapping: ArcGIS JS API 4.19
- UI Framework: Bootstrap 4.5.2, jQuery 3.6.0
- Data Format: JSON (local files)
- Build: None (direct file serving)

### Browser Support
- Modern browsers with ES5 support
- Desktop-first design (mobile responsive where applicable)
- ArcGIS JS API compatibility requirements

### Data Sources
- Local JSON files in `docs/Version_7_0/`
- ArcGIS Feature Server REST services
- Shapefile upload support for user data

## Development Guidelines

### Git Workflow
- Use feature branches for all changes
- Provide complete command sequences for git operations
- Prefer frequent and small pull requests
- Never commit sensitive data or credentials

### Testing
- Manual testing required for all user workflows
- Verify map interactions and data filtering
- Test with various species and BEC variant combinations
- Validate shapefile upload functionality

### Deployment
- Deployment via GitHub Pages (`docs/` directory)
- No build process required currently
- CDN resources must be accessible
- Verify all external service endpoints

## Refactoring Priorities

1. **Documentation** - Complete specification of existing functionality
2. **Modularization** - Better separation of concerns
3. **Error Handling** - Improved user feedback and error recovery
4. **Performance** - Optimize large JSON file loading
5. **Modernization** - Consider modern JavaScript patterns where appropriate
6. **Testing** - Introduce automated testing infrastructure

## Domain Knowledge

### BEC Variants
- Biogeoclimatic Ecosystem Classification variants represent ecological zones
- 218 distinct BEC variants in the system
- Each variant has unique suitability characteristics

### Species
- 25 tree species supported
- Each species has a minimum suitability threshold (96.0% - 98.5%)
- Species codes follow standard forestry naming conventions

### Seedlots
- Seedlots represent seed sources for reforestation
- Class A and Class B seedlots have different restrictions
- Seedlots are associated with orchards, BEC variants, and species
- Migration distance indicates climatic transfer limits

### Suitability Calculation
- Based on predicted height (HTp_pred) and site suitability (Sp_suit_site)
- Must meet species-specific minimum thresholds
- Separate calculations for suitable vs. non-suitable classifications

## Change Management
- Breaking changes require advance notice and migration guides
- Version numbers should follow semantic versioning
- Maintain backward compatibility where possible
- Document deprecation timelines

## Resources
- Official documentation in `specs/` directory
- Data model schemas in `specs/001-application-analysis/data-model.md`
- API contracts in `specs/001-application-analysis/contracts/api-spec.md`
- Quick start guide in `specs/001-application-analysis/quickstart.md`

