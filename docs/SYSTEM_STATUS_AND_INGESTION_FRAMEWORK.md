# AEGIS — System Status Report & Multi-Source Telemetry Ingestion Framework

**Document Version:** 1.0.0  
**Generated Date:** October 11, 2026  
**Platform:** AEGIS Open Industrial Facility Intelligence Platform  
**Repository Location:** `C:\Users\DEVANSH\idp-aegis`  
**License:** MIT Open Access  

---

## 1. Executive Summary & Application Status

AEGIS is an open-access facility intelligence and predictive maintenance operations platform engineered for commercial buildings, educational facilities, and public infrastructure. It democratizes machine health diagnostics using low-cost commercial off-the-shelf (COTS) edge hardware (~$180/asset) combined with explainable physical degradation modeling.

### Current System Health Status: **Operational & Verified (100%)**

| Component | Technology | Runtime Status | Health Verification |
| :--- | :--- | :---: | :--- |
| **Frontend Console** | React 19, Vite, Tailwind CSS v4, Recharts | **ONLINE** | `vite build` completed in **713ms** with **0 errors**. |
| **Telemetry Gateway** | Python (Flask 3.1), SQLite, CORS | **ONLINE** | Port `5000` active. Baseline seeding & auto-simulation functional. |
| **Authentication & RBAC** | Supabase Auth + Google Identity (GIS) | **CONFIGURED** | Google OAuth redirect, PostgreSQL `profiles` table, SQLite sync. |
| **Physics Model** | Deterministic Degradation Engine | **ONLINE** | Calculates wear index $w$, ISO 10816 limits, and RUL forecasts. |
| **Edge Hardware / Sim** | ESP32 C++ Sketch, Wokwi, Python Node | **READY** | Automated pulse generator streaming every 2s. |

---

## 2. Core Architecture & Active Modules

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DATA PRODUCERS (INGESTION LAYER)                      │
│   ESP32 Edge Node  │  Wokwi Cloud Sim  │  Modbus / PLC  │  Batch CSV Dumps  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP POST / JSON
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AEGIS TELEMETRY SERVER (PORT 5000)                       │
│  - Endpoint: POST /api/sensor-data                                          │
│  - ISO 10816 Vibration Severity Classifier                                 │
│  - Storage: SQLite Database (aegis.db) -> sensor_data, users                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP GET / Realtime Stream
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                  AEGIS OPERATIONS CONSOLE (PORT 8080)                       │
│  - Home Portal (#home): Landing Showcase & Google Authentication Gate       │
│  - Overview (#overview): High-Level Facility Health Index (91% vs 74%)      │
│  - Console (#console): Live Telemetry Bus, 14-Day Failure Risk, Work Orders │
│  - Analysis (#analysis): Multi-Parameter Root Cause & ISO Auditor View      │
│  - Simulator (#simulator): Interactive Mechanical Wear & Energy Simulator   │
│  - Platform (#platform): Technician 101 Onboarding & Hardware Table ($180)  │
│  - Asset Passport (#asset/:id): QR-Code Field Inspection Check-Sheets       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Universal Multi-Source Ingestion Framework

To connect any external sensor, legacy building automation system (BMS), PLC, or database into AEGIS, use the ingestion framework detailed below.

### 3.1 The Canonical Telemetry Schema

AEGIS accepts JSON payloads via **HTTP POST** to `/api/sensor-data` (or `/api/public/ingest`). It accepts both flat key-value pairs and structured metric lists.

#### Standard Schema (Recommended)
```json
{
  "asset_id": "AHU-03",
  "temperature": 42.5,
  "humidity": 58.2,
  "vibration": 1.65,
  "current": 13.8,
  "flow": 86.4,
  "light": 420,
  "gas": 115,
  "timestamp": "2026-10-11T17:30:00Z"
}
```

#### Metric Specifications & Standard Engineering Units

| Field | Parameter | Unit | ISO / Nominal Baseline | Alarm Thresholds |
| :--- | :--- | :--- | :--- | :--- |
| `vibration` | Peak / RMS Velocity | $\text{mm/s}$ | $1.20 - 1.80\text{ mm/s}$ | $> 1.8$ (Warning), $> 2.5$ (Critical) |
| `current` | Motor Phase Current | $\text{A}$ | $13.5 - 14.0\text{ A}$ | $> 14.2\text{ A}$ (Overload) |
| `temperature` | Outer Race / Surface Temp | $^\circ\text{C}$ | $35.0 - 41.0^\circ\text{C}$ | $> 42.0^\circ\text{C}$ (Advisory), $> 48.0^\circ\text{C}$ (Overheat) |
| `flow` | Chilled Water Loop Flow | $\text{L/min}$ | $80.0 - 100.0\text{ L/min}$ | $< 60.0\text{ L/min}$ (Strainer restriction) |
| `humidity` | Ambient Relative Humidity | $\%$ | $45 - 65\%$ | $> 70\%$ (Condensation risk) |
| `gas` | Combustible / Smoke PPM | $\text{ppm}$ | $< 200\text{ ppm}$ | $> 2000\text{ ppm}$ (Hazard / Smoke) |
| `light` | Facility Ambient Illuminance| $\text{lux}$ | $> 300\text{ lux}$ | $< 120\text{ lux}$ (Service bay dark) |

---

## 4. Integration Blueprints by Source Type

### Blueprint A: Physical Microcontrollers (ESP32, ESP8266, Raspberry Pi Pico)
Microcontrollers send telemetry directly over Wi-Fi/Ethernet via HTTP POST every 1–5 seconds.

#### Example: Arduino C++ Implementation
```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://192.168.1.50:5000/api/sensor-data";

void sendTelemetry(float temp, float vib, float current) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"temperature\":" + String(temp, 1) + 
                  ",\"vibration\":" + String(vib, 2) + 
                  ",\"current\":" + String(current, 1) + "}";

    int code = http.POST(json);
    http.end();
  }
}
```

---

### Blueprint B: Industrial PLCs & Building Buses (Modbus RTU / TCP, BACnet)
For heavy industrial equipment communicating over RS-485 Modbus or Ethernet BACnet, run an edge gateway script (e.g. on a Raspberry Pi or local industrial PC) that reads PLC registers and forwards them to AEGIS.

#### Example: Python Modbus-to-AEGIS Bridge (`modbus_bridge.py`)
```python
import time
import requests
from pymodbus.client import ModbusTcpClient

PLC_IP = "192.168.1.100"
PLC_PORT = 502
AEGIS_INGEST_URL = "http://localhost:5000/api/sensor-data"

client = ModbusTcpClient(PLC_IP, port=PLC_PORT)

def poll_and_forward():
    if not client.connect():
        print("[BRIDGE] Failed to connect to PLC")
        return

    # Read 4 holding registers starting at address 40001
    result = client.read_holding_registers(address=0, count=4)
    if not result.isError():
        # Scale raw integer registers to engineering values
        raw_vib, raw_temp, raw_cur, raw_flow = result.registers
        payload = {
            "vibration": round(raw_vib / 100.0, 2),     # e.g., 185 -> 1.85 mm/s
            "temperature": round(raw_temp / 10.0, 1),   # e.g., 425 -> 42.5 C
            "current": round(raw_cur / 10.0, 1),       # e.g., 138 -> 13.8 A
            "flow": round(raw_flow / 1.0, 1)           # e.g., 85 -> 85.0 L/min
        }
        try:
            requests.post(AEGIS_INGEST_URL, json=payload, timeout=2.0)
            print(f"[BRIDGE] Forwarded PLC Telemetry: {payload}")
        except Exception as e:
            print(f"[BRIDGE] Failed to forward to AEGIS: {e}")

if __name__ == "__main__":
    while True:
        poll_and_forward()
        time.sleep(2.0)
```

---

### Blueprint C: MQTT Broker Integration (Mosquitto, EMQX, AWS IoT)
For distributed sensor networks publishing to MQTT topics (`facility/+/telemetry`), an MQTT subscriber daemon converts messages to AEGIS ingest events.

#### Example: Python MQTT-to-AEGIS Daemon
```python
import json
import requests
import paho.mqtt.client as mqtt

AEGIS_URL = "http://127.0.0.1:5000/api/sensor-data"

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode("utf-8"))
        requests.post(AEGIS_URL, json=data, timeout=1.5)
        print(f"[MQTT INGEST] Topic {msg.topic}: Ingested successfully")
    except Exception as e:
        print(f"[MQTT ERROR] {e}")

client = mqtt.Client()
client.on_message = on_message
client.connect("mqtt.local", 1883, 60)
client.subscribe("facility/+/telemetry")
client.loop_forever()
```

---

### Blueprint D: Historical CSV / Timeseries Ingestion
If you have historical datasets or SCADA export logs, stream them into AEGIS using a playback script to test predictive forecasts against historical failures.

#### Example: CSV Replay Script
```python
import csv
import time
import requests

URL = "http://127.0.0.1:5000/api/sensor-data"

with open("historical_telemetry.csv", "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        payload = {
            "vibration": float(row["vibration"]),
            "temperature": float(row["temperature"]),
            "current": float(row["current"]),
            "flow": float(row.get("flow", 80.0)),
            "gas": int(row.get("gas", 100))
        }
        requests.post(URL, json=payload)
        time.sleep(1.0) # 1-second simulation tick
```

---

## 5. Quick-Start Operating Instructions

### Starting the Whole Stack Locally

#### 1. Start the React Frontend Console
```powershell
cd C:\Users\DEVANSH\idp-aegis
npm run dev
```
Accessible at: **`http://localhost:8080/`**

#### 2. Start the Telemetry Server with Simulated Edge Data (Single Command)
```powershell
cd C:\Users\DEVANSH\idp-aegis\backend
py app.py --simulate
```
* Runs the Flask API on **`http://127.0.0.1:5000`**
* Automatically seeds the SQLite database (`aegis.db`)
* Auto-streams real-time telemetry every 2 seconds into your dashboard

#### 3. Connect Real External Sensors
Point your ESP32, PLC bridge, or MQTT daemon to:
```text
POST http://<YOUR_IP>:5000/api/sensor-data
Content-Type: application/json
```
The dashboard will instantly switch from simulated mode to **LIVE HARDWARE TELEMETRY**.
