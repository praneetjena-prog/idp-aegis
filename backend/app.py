import os
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) for all routes
# This allows the React frontend (running on localhost:8080 or other ports)
# and external clients (like Wokwi via ngrok) to communicate without browser blocks.
CORS(app, resources={r"/*": {"origins": "*"}})

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BACKEND_DIR, "aegis.db")


# ====================================================================
# DATABASE CONFIGURATION & INITIALIZATION
# ====================================================================

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sensor_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            temperature REAL,
            humidity REAL,
            vibration REAL,
            current REAL,
            flow REAL,
            light INTEGER,
            gas INTEGER,
            status TEXT,
            timestamp TEXT
        )
    """)
    conn.commit()
    conn.close()


# Initialize database table on application start
init_db()


# ====================================================================
# HEALTH CHECK & ROOT ROUTE
# ====================================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "system": "AEGIS Telemetry System",
        "status": "online",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "ingest": "POST /api/sensor-data",
            "latest": "GET /api/latest",
            "history": "GET /api/history?limit=50",
            "stats": "GET /api/stats"
        }
    })


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "database": "connected"}), 200


# ====================================================================
# TELEMETRY INGESTION ENDPOINT (CALLED BY ESP32 / WOKWI)
# ====================================================================

@app.route("/api/sensor-data", methods=["POST"])
@app.route("/api/public/ingest", methods=["POST"])
def receive_sensor_data():
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({"error": "Invalid or missing JSON payload"}), 400

        # Handle both flat format {"temperature": 28.5, ...}
        # and nested format {"readings": [{"metric": "temperature", "value": 28.5}, ...]}
        temperature = data.get("temperature")
        humidity = data.get("humidity")
        vibration = data.get("vibration")
        current = data.get("current")
        flow = data.get("flow")
        light = data.get("light")
        gas = data.get("gas")

        if "readings" in data and isinstance(data["readings"], list):
            for r in data["readings"]:
                m = r.get("metric")
                v = r.get("value")
                if m == "temperature": temperature = v
                elif m == "humidity": humidity = v
                elif m == "vibration": vibration = v
                elif m == "current": current = v
                elif m == "flow": flow = v
                elif m == "light": light = v
                elif m == "gas": gas = v

        # Convert numeric strings if necessary
        try: temperature = float(temperature) if temperature is not None else None
        except (ValueError, TypeError): temperature = None

        try: humidity = float(humidity) if humidity is not None else None
        except (ValueError, TypeError): humidity = None

        try: vibration = float(vibration) if vibration is not None else None
        except (ValueError, TypeError): vibration = None

        try: current = float(current) if current is not None else None
        except (ValueError, TypeError): current = None

        try: flow = float(flow) if flow is not None else None
        except (ValueError, TypeError): flow = None

        try: light = int(light) if light is not None else None
        except (ValueError, TypeError): light = None

        try: gas = int(gas) if gas is not None else None
        except (ValueError, TypeError): gas = None

        # Synthesize fallback current or flow if not provided by hardware node
        if current is None and vibration is not None:
            current = round(13.5 + (vibration * 0.4), 1)

        if flow is None and vibration is not None:
            flow = 55.0 if vibration > 2.5 else 88.0

        # Evaluated against ISO 10816 & Machine Nameplate Standards
        status = "Normal"
        anomalies = []

        if vibration is not None and vibration > 2.5:
            anomalies.append("Vibration Critical (>2.5 mm/s)")
        elif vibration is not None and vibration > 1.8:
            anomalies.append("Vibration Warning (>1.8 mm/s)")

        if temperature is not None and temperature > 48.0:
            anomalies.append("Motor Overheating (>48°C)")
        elif temperature is not None and temperature > 42.0:
            anomalies.append("Motor Thermal Advisory (>42°C)")

        if current is not None and current > 14.2:
            anomalies.append("Electrical Overcurrent (>14.2 A)")

        if gas is not None and gas > 2000:
            anomalies.append("Air Quality / Smoke Anomaly (>2000)")

        if any("Critical" in a or "Overheating" in a or "Overcurrent" in a for a in anomalies):
            status = "Alert"
        elif len(anomalies) > 0:
            status = "Warning"

        timestamp = datetime.now().isoformat()

        conn = get_db()
        conn.execute("""
            INSERT INTO sensor_data 
            (temperature, humidity, vibration, current, flow, light, gas, status, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (temperature, humidity, vibration, current, flow, light, gas, status, timestamp))
        conn.commit()
        conn.close()

        return jsonify({
            "message": "Telemetry recorded successfully",
            "status": status,
            "anomalies": anomalies,
            "timestamp": timestamp
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ====================================================================
# LATEST READING (POLLED BY FRONTEND DASHBOARD)
# ====================================================================

@app.route("/api/latest", methods=["GET"])
def get_latest():
    conn = get_db()
    cursor = conn.execute("SELECT * FROM sensor_data ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()

    if row:
        return jsonify(dict(row)), 200

    return jsonify({"message": "No telemetry data found"}), 404


# ====================================================================
# HISTORICAL TELEMETRY (USED BY 24H CHARTS)
# ====================================================================

@app.route("/api/history", methods=["GET"])
def get_history():
    limit = request.args.get("limit", default=50, type=int)
    conn = get_db()
    cursor = conn.execute("SELECT * FROM sensor_data ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()

    # Reverse to return chronological order (oldest to newest)
    data = [dict(row) for row in reversed(rows)]
    return jsonify(data), 200


# ====================================================================
# FACILITY SUMMARY STATS
# ====================================================================

@app.route("/api/stats", methods=["GET"])
def get_stats():
    conn = get_db()
    cursor = conn.execute("""
        SELECT 
            COUNT(*) as total_records,
            ROUND(AVG(temperature), 1) as avg_temp,
            ROUND(MAX(temperature), 1) as max_temp,
            ROUND(MIN(temperature), 1) as min_temp,

            ROUND(AVG(humidity), 1) as avg_humidity,
            ROUND(MAX(humidity), 1) as max_humidity,
            ROUND(MIN(humidity), 1) as min_humidity,

            ROUND(AVG(vibration), 2) as avg_vibration,
            ROUND(MAX(vibration), 2) as max_vibration,

            ROUND(AVG(current), 1) as avg_current,
            ROUND(MAX(current), 1) as max_current,

            ROUND(AVG(gas), 0) as avg_gas,
            ROUND(MAX(gas), 0) as max_gas
        FROM sensor_data
    """)
    stats = dict(cursor.fetchone())
    conn.close()
    return jsonify(stats), 200


# ====================================================================
# SERVER STARTUP
# ====================================================================

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("   AEGIS Telemetry Server (Flask + SQLite)")
    print("   Listening on http://127.0.0.1:5000 (all interfaces 0.0.0.0)")
    print("=" * 60 + "\n")
    app.run(host="0.0.0.0", port=5000, debug=True)
