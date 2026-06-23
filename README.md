# Agent Pulse

Language: English | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Español](README.es.md)

Agent Pulse is a local status light and alerting layer for Claude Code and AI coding agents.

It shows whether Claude Code is:

- Green: idle, finished, or ready for review
- Yellow: working or running a tool
- Red: blocked, failed, or needs your attention

## Current MVP

This MVP supports:

- Claude Code hooks integration
- Claude Code status line command
- Live terminal status view
- Local event history
- Desktop notifications
- Local browser config UI
- Setup diagnostics

## Install from source

```bash
npm install
npm run build
```

## Initialize a project

Run this in the project you want to monitor:

```bash
node dist/cli.js init
```

During init, Agent Pulse asks for notification preferences and writes:

```text
.agent-pulse/config.json
.agent-pulse/status.json
.agent-pulse/events.jsonl
.claude/settings.json
```

The Claude Code settings file configures hooks and statusLine commands for this project.

## Watch Claude Code status

Open a second terminal in the project and run:

```bash
node dist/cli.js watch
```

Then use Claude Code in the same project. The watch terminal will update as Claude uses tools, finishes, or needs attention.

## Configure Agent Pulse

### Local browser UI

```bash
node dist/cli.js config-ui
```

This opens:

```text
http://127.0.0.1:4321
```

You can configure:

- Desktop notifications
- Notify on complete
- Notify on error
- Notify on stuck
- Stuck timeout minutes
- Slack webhook placeholder

Press `Ctrl+C` in the terminal running `config-ui` to stop the local server.

### CLI config commands

Show all config:

```bash
node dist/cli.js config show
```

Show one value:

```bash
node dist/cli.js config show notifyOnComplete
```

Set values:

```bash
node dist/cli.js config set notifyOnComplete false
node dist/cli.js config set notifyOnError true
node dist/cli.js config set notifyOnStuck true
node dist/cli.js config set stuckAfterMinutes 5
```

Available keys:

```text
stuckAfterMinutes
desktopNotifications
notifyOnComplete
notifyOnError
notifyOnStuck
slackWebhookUrl
agent
```

## Commands

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

## Development commands

```bash
npm run dev -- --help
npm run dev -- init
npm run dev -- watch
npm run dev -- config show
npm run dev -- config set notifyOnComplete false
npm run dev -- config-ui
npm run typecheck
npm run build
```

## Simulate hook events

Yellow state:

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | node dist/cli.js hook pre-tool-use
node dist/cli.js status
```

Red state:

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"stderr":"tests failed"}}' | node dist/cli.js hook post-tool-use
node dist/cli.js status
```

Green state:

```bash
node dist/cli.js hook stop
node dist/cli.js status
```

## VS Code Claude Code usage

1. Open this project in VS Code.
2. Run:

```bash
npm install
npm run build
node dist/cli.js init
```

3. Start the live status terminal:

```bash
node dist/cli.js watch
```

4. Restart the Claude Code session in VS Code so it reloads `.claude/settings.json`.
5. Use Claude Code normally.

The status changes appear in the `watch` terminal and Claude Code status line. This MVP does not change the native VS Code bottom status bar.

## Troubleshooting

Run:

```bash
node dist/cli.js doctor
```

Doctor checks:

- `.agent-pulse` files exist
- `dist/cli.js` exists
- `.claude/settings.json` exists
- Claude Code statusLine is configured
- Claude Code hooks are configured

If status does not change:

1. Run `npm run build`.
2. Run `node dist/cli.js init`.
3. Restart the Claude Code session in VS Code.
4. Run `node dist/cli.js watch` in another terminal.
5. Ask Claude Code to read or edit a file to trigger hooks.

If desktop notifications are noisy, run:

```bash
node dist/cli.js config-ui
```

Then disable completion notifications or adjust stuck detection.

## Data and privacy

Agent Pulse stores data locally in `.agent-pulse/`.

The MVP does not upload code, prompts, terminal output, or project data to any server.
