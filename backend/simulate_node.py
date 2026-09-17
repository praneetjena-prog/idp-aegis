"""
AEGIS Node Simulator
Run this script to send simulated ESP32 sensor telemetry into the Flask backend.
Useful for testing the backend and frontend connection without opening Wokwi.
"""

import time
import random
import urllib.request
import json

SERVER_URL = "http://127.0.0.1:5000/api/sensor-data"

def send_telemetry(fault_mode=False):
    if fault_mode:
        # Simulate bearing degradation on AHU-03
        vib = round(random.uniform(2.6, 3.4), 2)
        temp = round(random.uniform(49.0, 53.5), 1)
        cur = round(random.uniform(14.5, 15.8), 1)
        flow = round(random.uniform(50.0, 60.0), 1)
        gas = random.randint(150, 320)
    else:
        # Normal healthy machine operation
        vib = round(random.uniform(1.2, 1.7), 2)
        temp = round(random.uniform(36.0, 41.0), 1)
        cur = round(random.uniform(13.2, 13.9), 1)
        flow = round(random.uniform(82.0, 92.0), 1)
        gas = random.randint(80, 180)

    payload = {
        "temperature": temp,
        "humidity": round(random.uniform(55.0, 65.0), 1),
        "vibration": vib,
        "current": cur,
        "flow": flow,
        "light": random.randint(350, 500),
        "gas": gas
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        SERVER_URL,
        data=data,
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            print(f"[AEGIS NODE] Sent: Vib={vib}mm/s Temp={temp}°C Cur={cur}A -> Status: {body.get('status')}")
    except Exception as e:
        print(f"[AEGIS NODE] Failed to send: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("   Starting AEGIS Simulated Edge Node (press Ctrl+C to stop)")
    print("   Target: " + SERVER_URL)
    print("=" * 60)
    
    cycle = 0
    while True:
        cycle += 1
        # Toggle fault every 15 cycles for dynamic testing
        fault = (cycle % 10 == 0 or cycle % 10 == 1 or cycle % 10 == 2)
        send_telemetry(fault_mode=fault)
        time.sleep(2.0)
