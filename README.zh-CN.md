# Agent Traffic Light Monitor

Agent Traffic Light Monitor 是一个面向 Claude Code 和 AI 编程助手的本地状态灯与提醒工具。

语言： [English](README.md) | 简体中文 | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Español](README.es.md)

它可以显示 Claude Code 当前状态：

- 绿灯：Claude Code 停止后空闲、等待 review
- 黄灯：Claude Code 正在工作、正在调用工具，或工具结束后仍在思考
- 红灯：阻塞、失败、等待权限、需要用户介入

## 当前 MVP 功能

当前版本支持：

- Claude Code hooks 集成
- Claude Code status line 命令
- 终端实时状态灯
- 本地事件历史
- 桌面通知
- 本地浏览器配置页
- 安装诊断命令
- 硬件原型：USB 串口状态灯（ESP32-C3 Mini 1，实验性）

## 版本亮点

- **0.2.2**：硬件灯在 Claude 工作或思考时会黄灯闪烁，结束后变为绿灯；串口只发送最小状态数据，LED 更新更稳定。
- **0.2.0**：新增 ESP32-C3 Mini 1 硬件状态灯支持，包含 `device` 命令和 `watch --device`。
- **0.1.1**：发布可安装 CLI，支持 Claude Code hooks、终端实时状态、桌面通知、配置页和诊断命令。

## 安装

全局安装：

```bash
npm install -g agent-traffic-light-monitor
```

或者不全局安装，直接运行：

```bash
npx agent-traffic-light-monitor --help
```

## 初始化项目

在需要监控的项目根目录运行：

```bash
agent-traffic-light-monitor init
```

初始化时，Agent Traffic Light Monitor 会询问通知偏好，并写入：

```text
.agent-pulse/config.json
.agent-pulse/status.json
.agent-pulse/events.jsonl
.claude/settings.json
```

其中 `.claude/settings.json` 会为当前项目配置 Claude Code hooks 和 statusLine。

## 查看 Claude Code 实时状态

在项目目录中再打开一个终端，运行：

```bash
agent-traffic-light-monitor watch
```

然后正常使用 Claude Code。Claude 调用工具、完成任务、需要介入时，`watch` 终端会自动更新红黄绿状态。

## 配置 Agent Traffic Light Monitor

### 本地浏览器配置页

```bash
agent-traffic-light-monitor config-ui
```

会打开：

```text
http://127.0.0.1:4321
```

可配置：

- 是否开启桌面通知
- 完成时是否通知
- 出错时是否通知
- 卡住时是否通知
- 几分钟算卡住
- Slack webhook 预留字段

使用完后，在运行 `config-ui` 的终端按 `Ctrl+C` 关闭本地服务。

### 命令行配置

查看全部配置：

```bash
agent-traffic-light-monitor config show
```

查看单个配置：

```bash
agent-traffic-light-monitor config show notifyOnComplete
```

修改配置：

```bash
agent-traffic-light-monitor config set notifyOnComplete false
agent-traffic-light-monitor config set notifyOnError true
agent-traffic-light-monitor config set notifyOnStuck true
agent-traffic-light-monitor config set stuckAfterMinutes 5
```

可用配置项：

```text
stuckAfterMinutes
desktopNotifications
notifyOnComplete
notifyOnError
notifyOnStuck
slackWebhookUrl
agent
```

## 常用命令

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

## 硬件原型（实验性）

一个早期原型运行在 **ESP32-C3 Mini 1** 开发板上，使用其板载 RGB LED，通过 USB 串口接收状态变化。

固件位于 [`firmware/`](firmware/) — 烧录方法、接线说明和 JSON 协议见 [firmware/README.md](firmware/README.md)。

刷好固件后快速上手：

```bash
# 列出检测到的串口（排查驱动问题时用）
agent-traffic-light-monitor device list

# 推送一次当前状态
agent-traffic-light-monitor device push

# 持续推送状态变化（终端静默，只推灯）
agent-traffic-light-monitor device watch

# 或一个 watch 进程同时驱动终端和灯
agent-traffic-light-monitor watch --device
```

如果接了多块 ESP32 板子，用 `--port` 指定：

```bash
agent-traffic-light-monitor device watch --port COM5
```

支持的 USB 串口桥接芯片：**Espressif 原生 USB (0x303A)**、**WCH CH340 / CH341 (0x1A86)**、**Silicon Labs CP210x (0x10C4)**、**FTDI (0x0403)**。

状态到 LED 颜色映射：`green` → 绿，`yellow` → 黄，`red` → 红，其他 → 蓝（安全兜底）。

## 开发命令

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

## 模拟 hook 事件

黄灯状态：

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | agent-traffic-light-monitor hook pre-tool-use
agent-traffic-light-monitor status
```

红灯状态：

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"stderr":"tests failed"}}' | agent-traffic-light-monitor hook post-tool-use
agent-traffic-light-monitor status
```

绿灯状态：

```bash
agent-traffic-light-monitor hook stop
agent-traffic-light-monitor status
```

## VS Code Claude Code 使用方式

1. 在 VS Code 中打开当前项目。
2. 运行：

```bash
npm install
npm run build
agent-traffic-light-monitor init
```

3. 启动实时状态终端：

```bash
agent-traffic-light-monitor watch
```

4. 重启 VS Code 中的 Claude Code 会话，让它重新加载 `.claude/settings.json`。
5. 正常使用 Claude Code。

状态变化会显示在 `watch` 终端和 Claude Code status line 中。当前 MVP 不会修改 VS Code 底部原生状态栏。

## 排错

运行：

```bash
agent-traffic-light-monitor doctor
```

`doctor` 会检查：

- `.agent-pulse` 文件是否存在
- `dist/cli.js` 是否存在
- `.claude/settings.json` 是否存在
- Claude Code statusLine 是否配置
- Claude Code hooks 是否配置

如果状态没有变化：

1. 运行 `npm run build`。
2. 运行 `agent-traffic-light-monitor init`。
3. 重启 VS Code 中的 Claude Code 会话。
4. 在另一个终端运行 `agent-traffic-light-monitor watch`。
5. 让 Claude Code 读取或编辑一个文件，以触发 hooks。

如果桌面通知太频繁，运行：

```bash
agent-traffic-light-monitor config-ui
```

然后关闭完成通知，或调整卡住检测时间。

## 数据与隐私

Agent Traffic Light Monitor 的数据默认保存在本地 `.agent-pulse/` 目录。

当前 MVP 不会上传代码、prompt、终端输出或项目数据到任何服务器。
