# Agent Traffic Light Monitor

Language: English | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Español](README.es.md)

Agent Traffic Light Monitor is a local status light and alerting layer for Claude Code and AI coding agents.

It shows whether Claude Code is:

- Green: idle or ready for review after Claude Code stops
- Yellow: Claude Code is active, running a tool, or thinking after a tool call
- Red: blocked, failed, waiting for permission, or needs your attention

## Current MVP

This MVP supports:

- Claude Code hooks integration
- Claude Code status line command
- Live terminal status view
- Local event history
- Desktop notifications
- Local browser config UI
- Setup diagnostics

## Install

Install globally:

```bash
npm install -g agent-traffic-light-monitor
```

Or run without a global install:

```bash
npx agent-traffic-light-monitor --help
```

## Initialize a project

Run this in the project you want to monitor:

```bash
agent-traffic-light-monitor init
```

During init, Agent Traffic Light Monitor asks for notification preferences and writes:

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
agent-traffic-light-monitor watch
```

Then use Claude Code in the same project. The watch terminal will update as Claude uses tools, finishes, or needs attention.

## Configure Agent Traffic Light Monitor

### Local browser UI

```bash
agent-traffic-light-monitor config-ui
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
agent-traffic-light-monitor config show
```

Show one value:

```bash
agent-traffic-light-monitor config show notifyOnComplete
```

Set values:

```bash
agent-traffic-light-monitor config set notifyOnComplete false
agent-traffic-light-monitor config set notifyOnError true
agent-traffic-light-monitor config set notifyOnStuck true
agent-traffic-light-monitor config set stuckAfterMinutes 5
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
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | agent-traffic-light-monitor hook pre-tool-use
agent-traffic-light-monitor status
```

Red state:

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"stderr":"tests failed"}}' | agent-traffic-light-monitor hook post-tool-use
agent-traffic-light-monitor status
```

Green state:

```bash
agent-traffic-light-monitor hook stop
agent-traffic-light-monitor status
```

## VS Code Claude Code usage

1. Open this project in VS Code.
2. Run:

```bash
npm install
npm run build
agent-traffic-light-monitor init
```

3. Start the live status terminal:

```bash
agent-traffic-light-monitor watch
```

4. Restart the Claude Code session in VS Code so it reloads `.claude/settings.json`.
5. Use Claude Code normally.

The status changes appear in the `watch` terminal and Claude Code status line. This MVP does not change the native VS Code bottom status bar.

## Troubleshooting

Run:

```bash
agent-traffic-light-monitor doctor
```

Doctor checks:

- `.agent-pulse` files exist
- `dist/cli.js` exists
- `.claude/settings.json` exists
- Claude Code statusLine is configured
- Claude Code hooks are configured

If status does not change:

1. Make sure you are in the project directory you want to monitor.
2. Run `npm run build`.
3. Run `agent-traffic-light-monitor init` from that same project directory.
4. Restart the Claude Code session in VS Code.
5. Run `agent-traffic-light-monitor watch` in another terminal from that same project directory.
6. Ask Claude Code to read or edit a file to trigger hooks.

If you have multiple `.agent-pulse/status.json` files, make sure `watch` is reading the one inside the project you are currently using with Claude Code.

Permission prompts and notifications are treated as attention states. `PreToolUse` and successful `PostToolUse` stay yellow until Claude Code stops, while permission requests and failed tool calls show red.

If desktop notifications are noisy, run:

```bash
agent-traffic-light-monitor config-ui
```

Then disable completion notifications or adjust stuck detection.

## Data and privacy

Agent Traffic Light Monitor stores data locally in `.agent-pulse/`.

The MVP does not upload code, prompts, terminal output, or project data to any server.
