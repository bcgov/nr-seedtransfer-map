# CBST Seedlot Selection Tool (SST)

[![CI](https://github.com/bcgov/nr-seedtransfer-map/actions/workflows/lint.yml/badge.svg)](https://github.com/bcgov/nr-seedtransfer-map/actions/workflows/lint.yml)

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
project's development dependencies:

```bash
npm install
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

Verify both JavaScript logic/correctness and Prettier formatting consistency across all source
files:

```bash
npm run validate
```

- **How it works:** This command runs two distinct checks sequentially:
  1. Executes **ESLint 10+** flat config across the `docs/scripts/` directory to detect logic
     errors, accidental global leakage, and scope issues.
  2. Runs **Prettier** validation across HTML, CSS, and JS source files (excluding external
     datasets), as well as this `README.md` to check formatting consistency.
- **CI Integration:** Every pull request modifying files in the `docs/` directory automatically
  executes `npm run validate` in our automated GitHub Actions workflow to enforce clean code styles
  before the sandbox preview is deployed.

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
│   ├── scripts/            # Core JavaScript files (Leaflet/ArcGIS logic)
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
