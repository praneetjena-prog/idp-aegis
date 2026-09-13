# Aegis — Facility Operations Engine

**Democratizing predictive maintenance and building health through open, explainable telemetry intelligence.**

Non-profit, open-access facility intelligence platform for public facilities, universities, community hubs, and resource-constrained infrastructure. Built for on-the-ground facility managers, technicians, and maintenance staff.

> **Integrity Label:** `Aegis Open Engine — Telemetry Source: Simulated Demonstration Bus`

## Mission

Existing BMS are proprietary, costly, and alert-heavy. Aegis is a non-profit, open intelligence layer that unifies multi-parameter monitoring, explainable anomaly detection, and predictive maintenance.

**Technician-First Flow:** `Observe Multi-Parameter Data` → `Understand True Baselines` → `Flag Early Drift` → `Correlate Physical Systems` → `Explain Probable Failure` → `Generate Field Maintenance Plan`

## Live Operations Console

- **Composite Health Score:** 87/100 circular gauge with delta
- **Equipment Status:** 34 Nominal | 3 Advisory | 1 Critical
- **Resource Optimization:** Energy baseline deviation +6.4% flagged
- **Subsystem Modules:** HVAC 91% Nominal, Electrical 82% Attention, Water 95% Nominal, Mechanical 74% Action Required, Energy 88% Nominal — clickable deep-dive
- **Triage Queue:** Urgent AHU-03 bearing degradation 91% confidence (6.8 mm/s +24% current +ΔT), advisory pump strainer, optimization VAV hunting
- **24H Telemetry Chart:** Baseline Expected Envelope vs Actual with anomaly zone
- **Live Telemetry Bus:** 1,428 points @ 1-15min, MQTT, real-time ticker with 1.8s refresh
- **Failure Forecast:** RUL 168h ±24h, degradation slope, confidence interval

## Architecture

**Hardware Pipeline:** `Open Sensors (DHT22, ACS712, MPU6050)` → `Edge MCU (ESP32)` → `MQTT Broker` → `Aegis Processing Engine` → `Telemetry Store + ML Inference` → `Operational UI`

**Workflow Chain:** `Raw Sensor Feed` → `Validation & Cleaning` → `Baseline Comparison` → `Multivariate Correlation` → `Failure Probability` → `Actionable Field Work Order`

**Sensor Kit (<$180/asset):** DHT22/DS18B20, ACS712/SCT-013, ZMPT101B, MPU6050, YF-S201, MQ/NDIR CO2, Optical Smoke/Gas

## Features

- **Industrial Dark UI:** #0B0E14 base, #121721 surface, #1E2638 borders, teal/cyan accents, high contrast for control rooms & field tablets
- **Explainable AI:** No black box — Isolation Forest + FFT spectral, Seasonal ARIMA baseline, correlation chain Vib↑ + Current↑ + ΔT↓ → Mechanical Drag
- **Interactive Simulator:** Normal Baseline (2.1 mm/s, 14.2A, 54.2°C) vs Mechanical Degradation (6.8 mm/s, 17.6A +24%, 71.8°C) with printable maintenance ticket
- **Field Operations:** One-click work order dispatch (#8821), acknowledge, print field sheet (PDF), exportable checklist (9 tasks), work order ledger, maintenance kit stock check
- **Data Export:** JSON/CSV open data export, checklist JSON, ledger export
- **Live Simulation:** Toggle Normal Run vs Induced Fault, range select 1H/24H/7D, telemetry filtering, search

## Tech Stack

- React 18 + Vite
- Tailwind CSS (industrial dark, high density, monospace metrics)
- lucide-react icons
- Clean modularity: `components/ui/`, `components/dashboard/`, `components/workflow/`

## Run

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
npm run build
```

## Public Good Guardrail

Democratizes predictive maintenance using standard low-cost sensors and transparent algorithms, eliminating vendor lock-in and alert fatigue. MIT Licensed, non-profit.

Built for field technicians, not boardrooms.
