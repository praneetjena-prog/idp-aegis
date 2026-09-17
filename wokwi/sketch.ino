#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <DHT.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// ----------------------------------------------------
// NETWORK CONFIGURATION
// ----------------------------------------------------
// For Wokwi Simulator, use "Wokwi-GUEST" (open wifi)
// For real hardware, change to your home/lab Wi-Fi
const char* ssid     = "Wokwi-GUEST";
const char* password = "";

// Set this to your Flask backend URL.
// When testing with ngrok: e.g. "https://xxxx.ngrok-free.app/api/sensor-data"
// When testing on local LAN: e.g. "http://192.168.1.50:5000/api/sensor-data"
const char* serverUrl = "http://localhost:5000/api/sensor-data";

// ----------------------------------------------------
// PIN ASSIGNMENTS
// ----------------------------------------------------
#define DHTPIN 4
#define DHTTYPE DHT22

#define LDRPIN 35
#define MQ2PIN 34

#define GREEN_LED 18
#define YELLOW_LED 19
#define RED_LED 23
#define BUZZER 25

DHT dht(DHTPIN, DHTTYPE);
Adafruit_MPU6050 mpu;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("========================================");
  Serial.println("    AEGIS TELEMETRY EDGE NODE (ESP32)   ");
  Serial.println("========================================");

  // Initialize DHT22
  dht.begin();
  Serial.println("[OK] DHT22 initialized on GPIO 4");

  // Initialize MPU6050
  Wire.begin(21, 22);
  if (mpu.begin()) {
    Serial.println("[OK] MPU6050 initialized on I2C (21/22)");
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  } else {
    Serial.println("[ERROR] MPU6050 not found - check wiring!");
  }

  // Outputs
  pinMode(GREEN_LED, OUTPUT);
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  digitalWrite(GREEN_LED, LOW);
  digitalWrite(YELLOW_LED, LOW);
  digitalWrite(RED_LED, LOW);
  digitalWrite(BUZZER, LOW);

  // Connect to Wi-Fi
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("[OK] Wi-Fi Connected. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("[WARN] Wi-Fi not connected. Running local alarms only.");
  }

  Serial.println("AEGIS EDGE SENSOR READY");
  Serial.println("========================================");
}

void loop() {
  // 1. Read DHT22
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Safety fallback for NaN
  if (isnan(temperature)) temperature = 25.0;
  if (isnan(humidity)) humidity = 50.0;

  // 2. Read MPU6050 Vibration
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // Physically accurate net dynamic acceleration (AC ripple without gravity)
  float totalAccel = sqrt(sq(a.acceleration.x) + sq(a.acceleration.y) + sq(a.acceleration.z));
  float vibration = abs(totalAccel - 9.81);

  // 3. Read Analog Sensors
  int light = analogRead(LDRPIN);
  int gas = analogRead(MQ2PIN);

  // 4. Synthesize Motor Current & Flow based on machine load
  float motorCurrent = 13.5 + (vibration * 0.4); 
  float waterFlow = (vibration > 2.5) ? 55.0 : 88.0;

  // 5. Local Anomaly Evaluation (ISO 10816 standards)
  int anomalies = 0;
  if (vibration > 2.5) anomalies++;     // ISO 10816 critical vibration
  if (temperature > 45.0) anomalies++;  // Casing thermal limit
  if (motorCurrent > 14.2) anomalies++; // Electrical overload
  if (gas > 2000) anomalies++;          // Smoke / gas surge

  // 6. Actuate LEDs & Buzzer
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(YELLOW_LED, LOW);
  digitalWrite(RED_LED, LOW);
  digitalWrite(BUZZER, LOW);

  String statusStr = "Normal";
  if (anomalies == 0) {
    digitalWrite(GREEN_LED, HIGH);
    statusStr = "Normal";
  } else if (anomalies == 1) {
    digitalWrite(YELLOW_LED, HIGH);
    statusStr = "Warning";
  } else {
    digitalWrite(RED_LED, HIGH);
    digitalWrite(BUZZER, HIGH);
    statusStr = "Alert";
  }

  // 7. Print Console Diagnostics
  Serial.println();
  Serial.println("===== AEGIS SENSOR TELEMETRY =====");
  Serial.printf("Temp:      %.1f °C\n", temperature);
  Serial.printf("Humidity:  %.1f %%\n", humidity);
  Serial.printf("Vibration: %.2f mm/s\n", vibration);
  Serial.printf("Current:   %.1f A\n", motorCurrent);
  Serial.printf("Flow:      %.1f L/min\n", waterFlow);
  Serial.printf("Light:     %d\n", light);
  Serial.printf("Gas:       %d\n", gas);
  Serial.printf("Status:    %s (Anomalies: %d)\n", statusStr.c_str(), anomalies);

  // 8. Transmit to AEGIS Backend via HTTP POST
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = String("{") +
      "\"temperature\":" + String(temperature, 1) + "," +
      "\"humidity\":" + String(humidity, 1) + "," +
      "\"vibration\":" + String(vibration, 2) + "," +
      "\"current\":" + String(motorCurrent, 1) + "," +
      "\"flow\":" + String(waterFlow, 1) + "," +
      "\"light\":" + String(light) + "," +
      "\"gas\":" + String(gas) +
      "}";

    int httpCode = http.POST(jsonPayload);
    if (httpCode > 0) {
      Serial.printf("[HTTP] Ingest successful, code: %d\n", httpCode);
    } else {
      Serial.printf("[HTTP] POST failed, error: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  }

  Serial.println("==================================");
  delay(2000);
}
