# CBST Seedlot Selection Tool (SST)

[![Merge Deployment](https://github.com/bcgov/nr-seedtransfer-map/actions/workflows/merge.yml/badge.svg)](https://github.com/bcgov/nr-seedtransfer-map/actions/workflows/merge.yml)

The **Seedlot Selection Tool (SST)** is an interactive GIS web application designed to assist forest
managers and silviculture professionals in British Columbia. It enables users to match seedlots with
optimal planting sites based on ecological characteristics and Biogeoclimatic Ecosystem
Classification (BEC) variant compatibility, fully adhering to the Climate-Based Seed Transfer (CBST)
standard standards.

**Live Deployment:**
[CBST Seedlot Selection Tool](https://bcgov.github.io/nr-seedtransfer-map/index.html)

---

## Local Development & Testing

Due to browser security restrictions (CORS), you cannot open the `index.html` file directly in a web
browser. Instead, you must serve the application from a local web server.

To make local development and quality control as seamless as possible, we leverage standard NPM
scripts.

### 1. One-Time Setup

Before running tests, formatting code, or serving the application locally, make sure you install the
project's development dependencies and compile the local binary FlatGeobuf database files:

```bash
npm install
npm run db:convert
```

### 2. Start the Local Server

Spin up a local development server serving the `/docs` folder:

```bash
npm run dev
```

- **How it works:** This command starts a lightweight, pre-configured Node-based server serving the
  `/docs` folder using `http-server`.
- **Accessing the App:** Once started, open your browser and navigate to:
  **`http://localhost:8000`**

### 3. Linting & Code Verification

Verify JavaScript correctness, Prettier formatting consistency, and run lightweight unit tests:

```bash
npm run validate
```

- **How it works:** This command runs three distinct checks sequentially:
  1. Executes **ESLint 10+** flat config across the `docs/scripts/` directory to detect logic errors
     and syntax issues.
  2. Runs **Prettier** validation across HTML, CSS, and JS source files.
  3. Runs **Node-native Unit Tests** on helper utility functions.
- **CI Integration:** Every pull request automatically executes `npm run validate` to ensure fast
  feedback.

### 4. Running Unit Tests

Run the lightweight utility test suite in Node.js (uses the native `node:test` runner, no bundlers
or transpilation needed):

```bash
npm run test:unit
```

- **Speed:** Executes in under **5 milliseconds**!
- **Tested Logic:** Business logic helpers in `docs/scripts/main.js` (e.g., `getIntersection`,
  `updateData`).

### 5. Running E2E Integration Tests (Playwright)

Run the full end-to-end integration suite in a headless Chromium browser:

```bash
# 1. Install browser binary (one-time setup if needed)
npx playwright install chromium

# 2. Run tests in headless mode
npm run test:e2e

# 3. Open interactive Playwright UI for debugging/stepping through tests
npx playwright test --ui
```

- **Covered Workflows:**
  1. **Cutblock Flow:** Simulates opening the Cutblock tab, selecting a species & BEC variant, and
     verifying the suitability and seedlot tables populate with live data.
  2. **Orchard Representative Seedlot:** Simulates entering an Orchard number, resolving the
     representative seedlot via AJAX, and displaying suitability results.
  3. **Direct Seedlot Input:** Simulates entering a Seedlot number, auto-detecting the associated
     Species and BEC variant, and running matching calculations.

### 6. Run the Entire Test Suite

Run both unit and E2E tests in a single command:

```bash
npm run test
```

---

## Automated CI/CD Workflows

Every Pull Request automatically triggers a parallel validation and integration testing pipeline in
GitHub Actions (`.github/workflows/pr-open.yml`):

1. **Lint & Unit Tests (`validate` job):** Runs linting, formatting, and unit tests. Takes <15
   seconds.
2. **E2E Integration (`e2e` job):** Boots up the local server inside the runner and executes
   Playwright tests. Takes ~20 seconds.
3. **Deploy Preview Sandbox (`deploy` job):** Runs sequentially _only_ after both validation and E2E
   testing jobs complete successfully, ensuring no regressions enter staging environments.

### 4. Auto-Formatting Code

Automatically format all HTML, CSS, JS source files, and this `README.md` using our standardized
Prettier configuration:

```bash
npm run format
```

- **Formatting Style:** This repository strictly matches the styling standard of our larger frontend
  applications (such as `quickstart-openshift`), which enforces:
  - Single quotes instead of double quotes (`singleQuote: true`)
  - No trailing semicolons at the end of JS statements (`semi: false`)
  - 2-space indents and standard Unix line endings (`lf`)
  - Trailing commas for all multi-line structures (`trailingComma: 'all'`)

---

## Repository Structure

```
nr-seedtransfer-map/
├── .github/workflows/      # Automated CI/CD pipelines
│   ├── merge.yml           # Production branch deployment
│   ├── pr-close.yml        # PR preview environment cleanup
│   ├── pr-open.yml         # PR preview sandbox deployment
│   └── pr-validate.yml     # Automated PR metadata validation
├── docs/                   # Main application payload (GitHub Pages)
│   ├── css/                # Application stylesheets
│   ├── scripts/            # Core JavaScript files (MapLibre GL JS logic)
│   │   ├── main.js         # Business & suitability logic
│   │   ├── defineMap.js    # Map rendering & widgets
│   │   └── requireMain.js  # RequireJS entry point
│   ├── Version_7_0/        # Local JSON seedlot & migration datasets
│   └── index.html          # Main HTML application entry point
├── eslint.config.mjs       # ESLint 10+ flat config rules
└── README.md               # You are here!
```

---

## License & Contributions

This application is built for the **Province of British Columbia** and is open to contributions.
Code is distributed under the Apache License 2.0.
