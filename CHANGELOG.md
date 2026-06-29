# Changelog

All notable changes to `agent-traffic-light-monitor` are documented here. The project follows [Semantic Versioning](https://semver.org/). While the project is pre-1.0, minor bumps (0.y.0) may include breaking changes — read release notes before upgrading.

## [0.2.1] — 2026-06-29

### Fixed

- Added `UserPromptSubmit` hook support so the status turns yellow immediately after the user submits a prompt. Previously, conversations that involved pure thinking and no tool calls could stay green until `Stop`, so the hardware lamp looked idle during the thinking phase.
- Reduced the USB-serial device payload to the minimal `{ "status": "..." }` frame. The lamp does not need `message` or `detail`, and long Stop details could exceed firmware buffers.

### Hardware

- Updated the ESP32-C3 Mini 1 firmware so `yellow` blinks while Claude Code is working/thinking; `green` and `red` remain solid.

### Documentation

- Added the hardware prototype section to all localized READMEs (`zh-CN`, `zh-TW`, `ja`, `ko`, `de`, `fr`, `es`). The localized docs now mention the **ESP32-C3 Mini 1** hardware target and point users to [`firmware/README.md`](firmware/README.md) for wiring, flashing, and protocol details.
- Fixed package-lock metadata so the root package version matches the published version.

## [0.2.0] — 2026-06-29

### Added

- **Hardware status lamp (v0 prototype)**: `device push`, `device list`, `device watch` commands drive an ESP32-C3 RGB LED over USB serial. Uses the on-board LED on an ESP32-C3 Mini 1 (R:GPIO3, G:GPIO4, B:GPIO5), no wiring required. Firmware lives in [`firmware/`](firmware/) and is documented in [`firmware/README.md`](firmware/README.md).
- **`watch --device` flag**: a single `watch` process now drives both the terminal view and the hardware lamp. Falls back gracefully (warns and continues) if no ESP32 board is detected.
- **Multi-vendor USB-serial detection**: VID auto-discovery now covers Espressif native USB (0x303A), WCH CH340 / CH341 / CH9102 (0x1A86), Silicon Labs CP210x (0x10C4), and FTDI (0x0403). Out of the box, the CLI detects almost every dev board with a USB-serial bridge, including clone boards that don't expose native Espressif USB.
- **Common-anode firmware default**: the shipped firmware assumes common-anode polarity (LOW = on). `firmware/README.md` documents how to flip it for common-cathode boards, including a one-shot test sketch to identify which you have.

### Fixed

- **Notification flood**: desktop notifications previously deduped by `status.updatedAt`, which is always millisecond-unique on each write — a flaky source could trigger 20 "Claude Code stopped" popups in a row. Notifications now dedupe by `${status}:${event}`, so the same logical state fires at most one notification until the state actually changes.

### Internal

- **Event bus refactor**: introduced `src/core/status-events.ts` (in-process `EventEmitter`) and `src/core/status-watcher.ts` (`watchStatus(handler)` helper that dedupes chokidar + readStatus + updatedAt boilerplate). `updateStatus()` now emits `status-change` after every write. Both `watch` and `device watch` use the new helper — chokidar lives in one place.
- **`tryFindDevice()` graceful degradation**: `findDevice()` still throws on ambiguity, but a new non-throwing variant lets `watch --device` warn-and-continue when the board is unplugged.

## [0.1.1] — 2026-06-25

Initial public release on npm. Includes Claude Code hook integration, live terminal watch, status-line command, local event history, desktop notifications, browser-based config UI, and a `doctor` command for setup diagnostics.

## [0.1.0] — 2026-06-23

First public iteration. Core data model (`status.json`, `events.jsonl`, `config.json` under `.agent-pulse/`), commander CLI scaffolding, and the first end-to-end hook flow against Claude Code.
