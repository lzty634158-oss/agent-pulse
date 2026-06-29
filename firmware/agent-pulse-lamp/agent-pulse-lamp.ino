// agent-pulse-lamp.ino
// Agent Pulse status indicator for ESP32-C3 Mini 1
// LED wiring: R=GPIO3, G=GPIO4, B=GPIO5
// LED type: common anode (LOW = on, HIGH = off). Confirmed 2026-06-26.
//
// If your board is common cathode instead, flip the digitalWrite polarity
// in setColor() — search for "POLARITY" below.

#define PIN_R 3
#define PIN_G 4
#define PIN_B 5

#define BAUD 115200
#define MAX_LINE 1024

String buf;

void setup() {
  pinMode(PIN_R, OUTPUT);
  pinMode(PIN_G, OUTPUT);
  pinMode(PIN_B, OUTPUT);
  setColor(0, 0, 0);
  Serial.begin(BAUD);
}

void setColor(int r, int g, int b) {
  // POLARITY: for common anode, LOW = on, HIGH = off.
  // For common cathode, swap to: r ? HIGH : LOW
  digitalWrite(PIN_R, r ? LOW : HIGH);
  digitalWrite(PIN_G, g ? LOW : HIGH);
  digitalWrite(PIN_B, b ? LOW : HIGH);
}

void setStatusColor(const String& status) {
  if (status == "green")       setColor(0, 1, 0);
  else if (status == "yellow") setColor(1, 1, 0);
  else if (status == "red")    setColor(1, 0, 0);
  else                          setColor(0, 0, 1);
}

void loop() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      int idx = buf.indexOf("\"status\":\"");
      if (idx >= 0) {
        int start = idx + 10;
        int end = buf.indexOf('"', start);
        if (end > start) {
          setStatusColor(buf.substring(start, end));
        }
      }
      buf = "";
    } else if (c != '\r') {
      buf += c;
      if (buf.length() > MAX_LINE) {
        buf = "";
      }
    }
  }
}
