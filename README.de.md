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
```

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
