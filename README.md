# CBST Seedlot Selection Tool (SST)

[![CI](https://github.com/bcgov/nr-seedtransfer-map/actions/workflows/lint.yml/badge.svg)](https://github.com/bcgov/nr-seedtransfer-map/actions/workflows/lint.yml)

The **Seedlot Selection Tool (SST)** is an interactive GIS web application designed to assist forest
managers and silviculture professionals in British Columbia. It enables users to match seedlots with
optimal planting sites based on ecological characteristics and Biogeoclimatic Ecosystem
Classification (BEC) variant compatibility, fully adhering to the Climate-Based Seed Transfer (CBST)
standard standards.

🔗 **Live Deployment:**
[CBST Seedlot Selection Tool](https://bcgov.github.io/nr-seedtransfer-map/index.html)

---

## 🚀 Local Development & Testing

Due to browser security restrictions (CORS), you cannot open the `index.html` file directly in a web
browser. Instead, you must serve the application from a local web server.

To make local development and quality control as seamless as possible, we provide a unified `./run`
control script.

### 1. Start the Local Server

Spin up a local development server serving the `/docs` folder:

```bash
./run dev
```

- **How it works:** This command automatically detects your system environment. It will prioritize
  running a lightweight Node-based server using `npx http-server`, and falls back to a built-in
  Python web server if Node is not available.
- **Accessing the App:** Once started, open your browser and navigate to:
  **`http://localhost:8000`**

### 2. Linting & Code Verification

Verify both JavaScript syntax correctness and Prettier formatting consistency across all source
files:

```bash
./run lint
```

- **How it works:** This command runs two distinct checks:
  1. Crawls the `docs/scripts/` directory and compiles each JS script using `node -c` to validate
     syntax.
  2. Runs Prettier validation across HTML, CSS, and JS source files (excluding external datasets),
     as well as the `README.md` to check formatting consistency.
- **CI Integration:** Every push and pull request to the `main` branch automatically executes
  `./run lint` in our automated GitHub Actions workflow to enforce clean code styles.

### 3. Auto-Formatting Code

Automatically format all HTML, CSS, JS source files, and this `README.md` using our standardized
Prettier configuration:

```bash
./run format
```

- **Formatting Style:** This repository strictly matches the styling standard of our larger frontend
  applications (such as `quickstart-openshift`), which enforces:
  - Single quotes instead of double quotes (`singleQuote: true`)
  - No trailing semicolons at the end of JS statements (`semi: false`)
  - 2-space indents and standard Unix line endings (`lf`)
  - Trailing commas for all multi-line structures (`trailingComma: 'all'`)

---

## 📁 Repository Structure

```
nr-seedtransfer-map/
├── .github/workflows/      # Automated CI/CD pipelines
│   └── lint.yml            # Automated syntax checking
├── docs/                   # Main application payload (GitHub Pages)
│   ├── css/                # Application stylesheets
│   ├── scripts/            # Core JavaScript files (Leaflet/ArcGIS logic)
│   │   ├── main.js         # Business & suitability logic
│   │   ├── defineMap.js    # Map rendering & widgets
│   │   └── requireMain.js  # RequireJS entry point
│   ├── Version_7_0/        # Local JSON seedlot & migration datasets
│   └── index.html          # Main HTML application entry point
├── run                     # Unified control script (executable bash)
└── README.md               # You are here!
```

---

## ⚖️ License & Contributions

This application is built for the **Province of British Columbia** and is open to contributions.
Code is distributed under the Apache License 2.0.
