/*
  Aegis Facility Operations Engine — ESP32 sensor node
  ----------------------------------------------------
  Hardware: ESP32 DevKit, DHT22, MPU6050, ACS712, YF-S201 water flow,
            LDR, MQ-2, buzzer, status LEDs.

  Fill in WIFI_SSID / WIFI_PASS / DEVICE_ID / INGEST_KEY / ENDPOINT.
  The device ID, ingest key and endpoint are shown in the dashboard under
  Settings -> Sensor Node.

  Libraries: WiFi, HTTPClient (ESP32 core), DHT sensor library, Adafruit MPU6050,
             Adafruit Unified Sensor, ArduinoJson.

  Wiring (typical):
    DHT22 data      -> GPIO 4    (10k pull-up to 3V3)
    MPU6050 SDA/SCL -> GPIO 21 / GPIO 22
    ACS712 out      -> GPIO 34   (analog in, divider to keep <3.3V)
    Flow sensor     -> GPIO 27   (interrupt, pulse counting)
    LDR divider     -> GPIO 35
    MQ-2 analog     -> GPIO 32
    Buzzer          -> GPIO 25
    Status LED      -> GPIO 26
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <DHT.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

#define WIFI_SSID   "YOUR_WIFI"
#define WIFI_PASS   "YOUR_PASSWORD"
#define ENDPOINT    "https://YOUR-APP.lovable.app/api/public/ingest"
#define DEVICE_ID   "aegis-node-01"
#define INGEST_KEY  "PASTE_INGEST_KEY_HERE"
#define ASSET_TAG   "AHU-03"

#define DHT_PIN      4
#define DHT_TYPE     DHT22
#define ACS_PIN      34
#define LDR_PIN      35
#define MQ2_PIN      32
#define FLOW_PIN     27
#define BUZZER_PIN   25
#define LED_PIN      26

// Post every 10 seconds.
const unsigned long POST_INTERVAL_MS = 10000UL;

// ACS712-20A: 100 mV per amp, 2.5 V zero point.
const float ACS_SENSITIVITY = 0.100f;
const float ACS_ZERO_V      = 2.5f;

// YF-S201: ~450 pulses per litre.
const float FLOW_PULSES_PER_LITRE = 450.0f;

DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_MPU6050 mpu;

volatile unsigned long flowPulses = 0;
unsigned long lastPost = 0;

void IRAM_ATTR onFlowPulse() { flowPulses++; }

void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
  }
  digitalWrite(LED_PIN, HIGH);
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(FLOW_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), onFlowPulse, RISING);

  dht.begin();
  Wire.begin();
  if (!mpu.begin()) Serial.println("MPU6050 not found");
  mpu.setAccelerometerRange(MPU6050_RANGE_4_G);

  connectWifi();
}

// RMS vibration velocity estimate (mm/s) from a short accelerometer burst.
float readVibrationMmS() {
  const int samples = 200;
  double sumSq = 0;
  for (int i = 0; i < samples; i++) {
    sensors_event_t a, g, t;
    mpu.getEvent(&a, &g, &t);
    float mag = sqrt(a.acceleration.x * a.acceleration.x +
                     a.acceleration.y * a.acceleration.y +
                     a.acceleration.z * a.acceleration.z) - 9.81f;
    sumSq += (double)mag * mag;
    delayMicroseconds(500);
  }
  float rmsAccel = sqrt(sumSq / samples);          // m/s^2 RMS
  const float assumedHz = 50.0f;                   // dominant rotational frequency
  return (rmsAccel / (2.0f * PI * assumedHz)) * 1000.0f;  // mm/s
}

float readCurrentA() {
  const int samples = 500;
  double sumSq = 0;
  for (int i = 0; i < samples; i++) {
    float v = analogRead(ACS_PIN) * (3.3f / 4095.0f);
    float d = v - ACS_ZERO_V;
    sumSq += (double)d * d;
    delayMicroseconds(200);
  }
  float rmsV = sqrt(sumSq / samples);
  return rmsV / ACS_SENSITIVITY;
}

float readFlowLpm() {
  noInterrupts();
  unsigned long pulses = flowPulses;
  flowPulses = 0;
  interrupts();
  float litres = pulses / FLOW_PULSES_PER_LITRE;
  return litres * (60000.0f / (float)POST_INTERVAL_MS);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWifi();
  if (millis() - lastPost < POST_INTERVAL_MS) return;
  lastPost = millis();

  float temperature = dht.readTemperature();
  float humidity    = dht.readHumidity();
  float vibration   = readVibrationMmS();
  float current     = readCurrentA();
  float flow        = readFlowLpm();
  float light       = analogRead(LDR_PIN) * (1000.0f / 4095.0f);   // rough lux scale
  float gas         = analogRead(MQ2_PIN) * (1000.0f / 4095.0f);   // rough ppm scale

  if (isnan(temperature)) temperature = 0;
  if (isnan(humidity)) humidity = 0;

  // Local alert so the node is useful even without the network.
  bool alarm = vibration > 2.5f || temperature > 52.0f || gas > 300.0f;
  digitalWrite(BUZZER_PIN, alarm ? HIGH : LOW);

  String body = String("{\"device_id\":\"") + DEVICE_ID +
    "\",\"key\":\"" + INGEST_KEY +
    "\",\"asset\":\"" + ASSET_TAG + "\",\"readings\":[" +
    "{\"metric\":\"vibration\",\"value\":"   + String(vibration, 3)   + ",\"unit\":\"mm/s\"}," +
    "{\"metric\":\"current\",\"value\":"     + String(current, 3)     + ",\"unit\":\"A\"}," +
    "{\"metric\":\"temperature\",\"value\":" + String(temperature, 2) + ",\"unit\":\"C\"}," +
    "{\"metric\":\"humidity\",\"value\":"    + String(humidity, 2)    + ",\"unit\":\"%\"}," +
    "{\"metric\":\"flow\",\"value\":"        + String(flow, 2)        + ",\"unit\":\"L/min\"}," +
    "{\"metric\":\"light\",\"value\":"       + String(light, 1)       + ",\"unit\":\"lux\"}," +
    "{\"metric\":\"gas\",\"value\":"         + String(gas, 1)         + ",\"unit\":\"ppm\"}" +
    "]}";

  HTTPClient http;
  http.begin(ENDPOINT);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(body);
  Serial.printf("POST -> %d\n", code);
  http.end();
}
