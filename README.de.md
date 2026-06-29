# Agent Traffic Light Monitor

Sprache: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Français](README.fr.md) | Deutsch | [Español](README.es.md)

Agent Traffic Light Monitor ist ein lokales Statuslicht- und Benachrichtigungstool für Claude Code und KI-Coding-Agents.

Es zeigt den Status von Claude Code an:

- Grün: im Leerlauf oder bereit zur Review, nachdem Claude Code gestoppt hat
- Gelb: Claude Code ist aktiv, führt ein Tool aus oder denkt nach einem Tool-Aufruf weiter
- Rot: blockiert, fehlgeschlagen, wartet auf Berechtigung oder benötigt Aufmerksamkeit

## Aktuelle MVP-Funktionen

- Claude Code hooks Integration
- Claude Code status line Befehl
- Live-Statusansicht im Terminal
- Lokaler Ereignisverlauf
- Desktop-Benachrichtigungen
- Lokale Browser-Konfigurationsoberfläche
- Setup-Diagnose
- Hardware-Prototyp: USB-Seriell-Statuslampe (ESP32-C3 Mini 1, experimentell)

## Versions-Highlights

- **0.2.2**: Die Hardware-Lampe blinkt gelb, während Claude arbeitet oder nachdenkt, und leuchtet nach Abschluss dauerhaft grün. Sie sendet außerdem kleinere serielle Daten für stabilere LED-Updates.
- **0.2.0**: Unterstützung für eine ESP32-C3 Mini 1 Hardware-Lampe per USB-Seriell hinzugefügt, inklusive `device`-Befehlen und `watch --device`.
- **0.1.1**: Installierbare CLI mit Claude Code hooks, Terminal-Statusansicht, Desktop-Benachrichtigungen, Konfigurations-UI und Diagnosebefehl.

## Installation

Global installieren:

```bash
npm install -g agent-traffic-light-monitor
```

Oder ohne globale Installation ausführen:

```bash
npx agent-traffic-light-monitor --help
```

## Projekt initialisieren

Im zu überwachenden Projekt ausführen:

```bash
agent-traffic-light-monitor init
```

Agent Traffic Light Monitor fragt nach Benachrichtigungseinstellungen und schreibt:

```text
.agent-pulse/config.json
.agent-pulse/status.json
.agent-pulse/events.jsonl
.claude/settings.json
```

`.claude/settings.json` konfiguriert Claude Code hooks und statusLine für dieses Projekt.

## Claude Code Status überwachen

Öffnen Sie ein zweites Terminal im Projekt und führen Sie aus:

```bash
agent-traffic-light-monitor watch
```

Verwenden Sie danach Claude Code normal im selben Projekt.

## Agent Traffic Light Monitor konfigurieren

### Lokale Browser-UI

```bash
agent-traffic-light-monitor config-ui
```

Öffnet:

```text
http://127.0.0.1:4321
```

Konfigurierbar sind Desktop-Benachrichtigungen, Benachrichtigungen bei Abschluss, Fehler und Hängenbleiben, die Stuck-Zeit sowie ein reserviertes Slack-webhook-Feld.

Beenden Sie den lokalen Server mit `Ctrl+C` im Terminal, in dem `config-ui` läuft.

### CLI-Konfiguration

```bash
agent-traffic-light-monitor config show
agent-traffic-light-monitor config show notifyOnComplete
agent-traffic-light-monitor config set notifyOnComplete false
agent-traffic-light-monitor config set notifyOnError true
agent-traffic-light-monitor config set notifyOnStuck true
agent-traffic-light-monitor config set stuckAfterMinutes 5
```

Verfügbare Schlüssel:

```text
stuckAfterMinutes
desktopNotifications
notifyOnComplete
notifyOnError
notifyOnStuck
slackWebhookUrl
agent
```

## Befehle

```bash
agent-traffic-light-monitor init
agent-traffic-light-monitor watch
agent-traffic-light-monitor status
agent-traffic-light-monitor statusline
agent-traffic-light-monitor history
agent-traffic-light-monitor config show
agent-traffic-light-monitor config set notifyOnComplete false
agent-traffic-light-monitor config-ui
agent-traffic-light-monitor doctor
agent-traffic-light-monitor device list
agent-traffic-light-monitor device push
agent-traffic-light-monitor device watch
agent-traffic-light-monitor watch --device
```

## Hardware-Prototyp (experimentell)

Ein früher Prototyp läuft auf einem **ESP32-C3 Mini 1** Entwicklerboard und nutzt dessen Onboard-RGB-LED, die per USB-Seriell-Verbindung Statusänderungen empfängt.

Die Firmware liegt in [`firmware/`](firmware/) — Pinbelegung, Flash-Anleitung und JSON-Protokoll siehe [firmware/README.md](firmware/README.md).

Schnellstart nach dem Flashen der Firmware:

```bash
# Erkannte serielle Ports auflisten (hilfreich bei Treiberproblemen)
agent-traffic-light-monitor device list

# Aktuellen Status einmal an die Lampe senden
agent-traffic-light-monitor device push

# Statusänderungen fortlaufend übertragen (Terminal bleibt still, nur Lampe)
agent-traffic-light-monitor device watch

# Oder ein einzelner `watch`-Prozess für Terminal und Lampe gleichzeitig
agent-traffic-light-monitor watch --device
```

Bei mehreren angeschlossenen ESP32-Boards mit `--port` auswählen:

```bash
agent-traffic-light-monitor device watch --port COM5
```

Unterstützte USB-Seriell-Brücken: **Espressif native USB (0x303A)**, **WCH CH340 / CH341 (0x1A86)**, **Silicon Labs CP210x (0x10C4)**, **FTDI (0x0403)**.

Status-zu-LED-Farbe Zuordnung: `green` → Grün, `yellow` → Gelb, `red` → Rot, alles andere → Blau (Sicherheits-Fallback).

## Entwicklungsbefehle

```bash
npm run dev -- --help
npm run dev -- init
npm run dev -- watch
npm run dev -- config show
npm run dev -- config-ui
npm run typecheck
npm run build
```

## Hook-Ereignisse simulieren

Gelber Status:

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | agent-traffic-light-monitor hook pre-tool-use
agent-traffic-light-monitor status
```

Roter Status:

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"stderr":"tests failed"}}' | agent-traffic-light-monitor hook post-tool-use
agent-traffic-light-monitor status
```

Grüner Status:

```bash
agent-traffic-light-monitor hook stop
agent-traffic-light-monitor status
```

## Verwendung mit VS Code Claude Code

1. Öffnen Sie dieses Projekt in VS Code.
2. Führen Sie aus:

```bash
npm install
npm run build
agent-traffic-light-monitor init
```

3. Starten Sie das Status-Terminal:

```bash
agent-traffic-light-monitor watch
```

4. Starten Sie die Claude Code Sitzung in VS Code neu, damit `.claude/settings.json` erneut geladen wird.
5. Verwenden Sie Claude Code normal.

Statusänderungen erscheinen im `watch`-Terminal und in der Claude Code status line. Dieses MVP ändert nicht die native untere VS-Code-Statusleiste.

## Fehlerbehebung

```bash
agent-traffic-light-monitor doctor
```

`doctor` prüft `.agent-pulse`, `dist/cli.js`, `.claude/settings.json`, statusLine und hooks.

Wenn sich der Status nicht ändert: führen Sie `npm run build` und `agent-traffic-light-monitor init` aus, starten Sie die Claude Code Sitzung in VS Code neu und starten Sie `agent-traffic-light-monitor watch` in einem zweiten Terminal.

## Daten und Datenschutz

Agent Traffic Light Monitor speichert Daten lokal in `.agent-pulse/`. Das aktuelle MVP lädt keinen Code, keine Prompts, keine Terminalausgaben und keine Projektdaten auf einen Server hoch.
