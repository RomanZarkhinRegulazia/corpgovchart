# Corporate Governance Chart (CorpGovChart)

A secure, client-side web application for visualizing organizational governance structures. Built with **Vite**, **TypeScript**, and **GoJS**.

## 🚀 Features
*   **Instant Visualization**: Upload your CSV file to generate an interactive chart instantly.
*   **Secure**: All data processing happens in your browser. No data is uploaded to any server.
*   **Interactive**:
    *   **Right-Click** nodes to change colors or view details.
    *   **Double-Click** text (Name/Role) to edit directly.
    *   **Drag & Drop** to rearrange the view.

## 📖 User Guide
1.  Open the application (e.g., `https://your-app-url.web.app`).
2.  Click **Choose File**.
3.  Select your `governance.csv`.
4.  The Interactive Chart will render automatically.

## 💻 Developer Guide

### Prerequisites
*   Node.js (v18+)

### Setup
```bash
git clone https://github.com/RomanZarkhinRegulazia/corpgovchart.git
cd corpgovchart
npm install
```

### Run Locally
```bash
npm run dev
```
Open `http://localhost:5173`.

### Build for Production
```bash
npm run build
# Output is in dist/ folder
```
