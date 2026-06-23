# Agent Pulse

Sprache: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Français](README.fr.md) | Deutsch | [Español](README.es.md)

Agent Pulse ist ein lokales Statuslicht- und Benachrichtigungstool für Claude Code und KI-Coding-Agents.

Es zeigt den Status von Claude Code an:

- Grün: Leerlauf, abgeschlossen oder bereit zur Review
- Gelb: arbeitet oder führt ein Tool aus
- Rot: blockiert, fehlgeschlagen oder benötigt Aufmerksamkeit

## Aktuelle MVP-Funktionen

- Claude Code hooks Integration
- Claude Code status line Befehl
- Live-Statusansicht im Terminal
- Lokaler Ereignisverlauf
- Desktop-Benachrichtigungen
- Lokale Browser-Konfigurationsoberfläche
- Setup-Diagnose

## Installation aus dem Quellcode

```bash
npm install
npm run build
```

## Projekt initialisieren

Im zu überwachenden Projekt ausführen:

```bash
node dist/cli.js init
```

Agent Pulse fragt nach Benachrichtigungseinstellungen und schreibt:

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
node dist/cli.js watch
```

Verwenden Sie danach Claude Code normal im selben Projekt.

## Agent Pulse konfigurieren

### Lokale Browser-UI

```bash
node dist/cli.js config-ui
```

Öffnet:

```text
http://127.0.0.1:4321
```

Konfigurierbar sind Desktop-Benachrichtigungen, Benachrichtigungen bei Abschluss, Fehler und Hängenbleiben, die Stuck-Zeit sowie ein reserviertes Slack-webhook-Feld.

Beenden Sie den lokalen Server mit `Ctrl+C` im Terminal, in dem `config-ui` läuft.

### CLI-Konfiguration

```bash
node dist/cli.js config show
node dist/cli.js config show notifyOnComplete
node dist/cli.js config set notifyOnComplete false
node dist/cli.js config set notifyOnError true
node dist/cli.js config set notifyOnStuck true
node dist/cli.js config set stuckAfterMinutes 5
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
node dist/cli.js init
node dist/cli.js watch
node dist/cli.js status
node dist/cli.js statusline
node dist/cli.js history
node dist/cli.js config show
node dist/cli.js config set notifyOnComplete false
node dist/cli.js config-ui
node dist/cli.js doctor
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
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | node dist/cli.js hook pre-tool-use
node dist/cli.js status
```

Roter Status:

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"stderr":"tests failed"}}' | node dist/cli.js hook post-tool-use
node dist/cli.js status
```

Grüner Status:

```bash
node dist/cli.js hook stop
node dist/cli.js status
```

## Verwendung mit VS Code Claude Code

1. Öffnen Sie dieses Projekt in VS Code.
2. Führen Sie aus:

```bash
npm install
npm run build
node dist/cli.js init
```

3. Starten Sie das Status-Terminal:

```bash
node dist/cli.js watch
```

4. Starten Sie die Claude Code Sitzung in VS Code neu, damit `.claude/settings.json` erneut geladen wird.
5. Verwenden Sie Claude Code normal.

Statusänderungen erscheinen im `watch`-Terminal und in der Claude Code status line. Dieses MVP ändert nicht die native untere VS-Code-Statusleiste.

## Fehlerbehebung

```bash
node dist/cli.js doctor
```

`doctor` prüft `.agent-pulse`, `dist/cli.js`, `.claude/settings.json`, statusLine und hooks.

Wenn sich der Status nicht ändert: führen Sie `npm run build` und `node dist/cli.js init` aus, starten Sie die Claude Code Sitzung in VS Code neu und starten Sie `node dist/cli.js watch` in einem zweiten Terminal.

## Daten und Datenschutz

Agent Pulse speichert Daten lokal in `.agent-pulse/`. Das aktuelle MVP lädt keinen Code, keine Prompts, keine Terminalausgaben und keine Projektdaten auf einen Server hoch.
