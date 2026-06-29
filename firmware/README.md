# Agent Pulse Lamp — ESP32-C3 Firmware

Status indicator firmware for `agent-traffic-light-monitor`. Reads JSON status lines from USB serial and lights the on-board RGB LED.

## Hardware

| Item | Value |
|---|---|
| Board | ESP32-C3 Mini 1 (Espressif) |
| R | GPIO3 |
| G | GPIO4 |
| B | GPIO5 |
| Logic level | 3.3 V |
| Protocol | USB CDC serial, 115200 baud, one JSON line per update |

## Wiring

This firmware is designed for the ESP32-C3 Mini 1 dev board's **on-board RGB LED**. No external wiring is required.

If your board uses a different pin layout, edit the three `#define PIN_R / PIN_G / PIN_B` lines at the top of `agent-pulse-lamp.ino`.

### Polarity (common cathode vs common anode)

The default firmware assumes a **common anode** LED (LOW = on, HIGH = off). This is what the on-board LED on the user's ESP32-C3 Mini 1 uses, confirmed on 2026-06-26.

If your LED has a common GND pin (common cathode) instead, edit `setColor()` in `agent-pulse-lamp.ino` and flip the polarity:

```cpp
// Change this (common anode):
digitalWrite(PIN_R, r ? LOW : HIGH);

// To this (common cathode):
digitalWrite(PIN_R, r ? HIGH : LOW);
```

Apply the same flip to the G and B lines.

Not sure which yours is? Flash [`agent-pulse-lamp-test.ino`](agent-pulse-lamp-test.ino) — it cycles through R, G, B individually and prints what it is doing over Serial.

## Build & flash

### Option A — Arduino IDE

1. Install [Arduino IDE](https://www.arduino.cc/en/software) (2.x).
2. Add the ESP32 board package URL in **File → Preferences → Additional board URLs**:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. **Tools → Board → Board Manager**, search "esp32", install the Espressif package.
4. **Tools → Board → ESP32C3 Dev Module** (or "ESP32-C3 DevKitM1" depending on your board).
5. **Tools → USB CDC On Boot → Enabled** (important — without this the serial port will not appear).
6. Open `agent-pulse-lamp.ino` and click **Upload**.

### Option B — arduino-cli

```bash
arduino-cli core install esp32:esp32
arduino-cli board list
arduino-cli compile --fqbn esp32:esp32:esp32c3 firmware/agent-pulse-lamp.ino
arduino-cli upload -p COM3 --fqbn esp32:esp32:esp32c3 firmware/agent-pulse-lamp.ino
```

(Replace `COM3` with the port shown by `arduino-cli board list`.)

## Protocol

The firmware reads one small JSON object per line, terminated by `\n`. The only field it looks at is `status`. The CLI intentionally sends a minimal frame (`{"status":"green"}`) instead of the full status object, because the lamp only needs the color and long message/detail fields can exceed tiny firmware buffers:

```json
{"status":"green"}
{"status":"yellow"}
{"status":"red"}
{"status":"blue"}
```

Color mapping:

| `status` | LED |
|---|---|
| `green` | solid green |
| `yellow` | blinking yellow (R+G) |
| `red` | solid red |
| anything else | solid blue (safety: visible "I don't know") |

## Test from the host

After flashing, open a serial monitor at 115200 baud. You should see the LED briefly light blue on boot, then stay off.

From another terminal:

```bash
# one-shot test
agent-traffic-light-monitor device push

# live test
agent-traffic-light-monitor device watch
# in yet another terminal:
agent-traffic-light-monitor hook pre-tool-use
```

You should see the LED change color as each hook fires.
