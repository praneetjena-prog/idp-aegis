# AEGIS — Open Industrial Facility Intelligence Platform

Democratizing predictive maintenance and building health through open, explainable telemetry intelligence.

AEGIS is an open-access facility operations platform engineered for public infrastructure, universities, community hubs, and resource-constrained facilities. Built for on-the-ground facility managers, technicians, and maintenance staff.

---

## ✨ Features

- **Multi-Parameter Monitoring:** Real-time stream ingestion for vibration, current draw, surface temperature, and acoustic metrics.
- **Explainable Anomaly Detection:** Correlate physical subsystems and detect early baseline drift before failures occur.
- **Triage & Predictive Maintenance:** Automated probable-cause diagnostics and field maintenance dispatch plans.
- **Scenario Simulator:** Simulate mechanical degradation, cooling loop faults, and power quality anomalies.
- **Hardware Integration:** Compatible with open-source ESP32 telemetry nodes and edge sensors.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ or v22+)
- npm

### Installation & Local Run

```sh
# 1. Clone the repository
git clone https://github.com/praneetjena-prog/idp-aegis.git
cd idp-aegis

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The application will be accessible at `http://localhost:8080/`.

---

## 📦 Build & Deployment

To generate an optimized static build for GitHub Pages:

```sh
npm run build
```

The compiled output will be generated in `dist/`.
