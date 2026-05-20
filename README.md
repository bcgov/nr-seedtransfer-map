# CBST Seedlot Selection Tool (SST)

[![CI](https://github.com/bcgov/nr-seedtransfer-map/actions/workflows/lint.yml/badge.svg)](https://github.com/bcgov/nr-seedtransfer-map/actions/workflows/lint.yml)

The **Seedlot Selection Tool (SST)** is an interactive GIS web application designed to assist forest managers and silviculture professionals in British Columbia. It enables users to match seedlots with optimal planting sites based on ecological characteristics and Biogeoclimatic Ecosystem Classification (BEC) variant compatibility, fully adhering to the Climate-Based Seed Transfer (CBST) standard standards.

🔗 **Live Deployment:** [CBST Seedlot Selection Tool](https://bcgov.github.io/nr-seedtransfer-map/index.html)

---

## 🚀 Local Development & Testing

Due to browser security restrictions (CORS), you cannot open the `index.html` file directly in a web browser. Instead, you must serve the application from a local web server.

To make local development and quality control as seamless as possible, we provide a unified `./run` control script.

### 1. Start the Local Server
Spin up a local development server serving the `/docs` folder:
```bash
./run dev
```
* **How it works:** This command automatically detects your system environment. It will prioritize running a lightweight Node-based server using `npx http-server`, and falls back to a built-in Python web server if Node is not available.
* **Accessing the App:** Once started, open your browser and navigate to: **`http://localhost:8000`**

### 2. Verify JavaScript Syntax (Linting)
Ensure all JavaScript files compile perfectly and are free of structural or syntax errors:
```bash
./run lint
```
* **How it works:** This command crawls the entire `docs/scripts/` directory and compiles each script using `node -c` (which validates code structure without executing it). 
* **CI Integration:** Every pull request to the `main` branch automatically triggers this command in a GitHub Actions pipeline. Any code with syntax errors will be automatically blocked from merging.

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

This application is built for the **Province of British Columbia** and is open to contributions. Code is distributed under the Apache License 2.0.
