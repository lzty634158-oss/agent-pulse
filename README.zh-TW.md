# Agent Traffic Light Monitor

語言： [English](README.md) | [简体中文](README.zh-CN.md) | 繁體中文 | [日本語](README.ja.md) | [한국어](README.ko.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Español](README.es.md)

Agent Traffic Light Monitor 是一個面向 Claude Code 和 AI 編程助手的本地狀態燈與提醒工具。

它可以顯示 Claude Code 目前狀態：

- 綠燈：Claude Code 停止後閒置、等待 review
- 黃燈：Claude Code 正在工作、正在呼叫工具，或工具結束後仍在思考
- 紅燈：阻塞、失敗、等待權限、需要使用者介入

## 目前 MVP 功能

- Claude Code hooks 整合
- Claude Code status line 命令
- 終端即時狀態燈
- 本地事件歷史
- 桌面通知
- 本地瀏覽器設定頁
- 安裝診斷命令
- 硬體原型：USB 串口狀態燈（ESP32-C3 Mini 1，實驗性）

## 安裝

全域安裝：

```bash
npm install -g agent-traffic-light-monitor
```

或是不全域安裝，直接執行：

```bash
npx agent-traffic-light-monitor --help
```

## 初始化專案

在需要監控的專案根目錄執行：

```bash
agent-traffic-light-monitor init
```

初始化時會詢問通知偏好，並寫入：

```text
.agent-pulse/config.json
.agent-pulse/status.json
.agent-pulse/events.jsonl
.claude/settings.json
```

`.claude/settings.json` 會為目前專案配置 Claude Code hooks 和 statusLine。

## 查看 Claude Code 即時狀態

在專案目錄中再開一個終端，執行：

```bash
agent-traffic-light-monitor watch
```

然後正常使用 Claude Code。Claude 呼叫工具、完成任務或需要介入時，`watch` 終端會自動更新狀態。

## 設定 Agent Traffic Light Monitor

### 本地瀏覽器 UI

```bash
agent-traffic-light-monitor config-ui
```

會開啟：

```text
http://127.0.0.1:4321
```

可設定：桌面通知、完成通知、錯誤通知、卡住通知、卡住判定時間、Slack webhook 預留欄位。

使用完後，在執行 `config-ui` 的終端按 `Ctrl+C` 關閉本地服務。

### 命令列設定

```bash
agent-traffic-light-monitor config show
agent-traffic-light-monitor config show notifyOnComplete
agent-traffic-light-monitor config set notifyOnComplete false
agent-traffic-light-monitor config set notifyOnError true
agent-traffic-light-monitor config set notifyOnStuck true
agent-traffic-light-monitor config set stuckAfterMinutes 5
```

可用設定項：

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

## 硬體原型（實驗性）

一個早期原型運行在 **ESP32-C3 Mini 1** 開發板上，使用其板載 RGB LED，透過 USB 串口接收狀態變化。

韌體位於 [`firmware/`](firmware/) — 燒錄方法、接線說明和 JSON 協定見 [firmware/README.md](firmware/README.md)。

燒好韌體後快速上手：

```bash
# 列出偵測到的串口（排查驅動問題時用）
agent-traffic-light-monitor device list

# 推送一次目前狀態
agent-traffic-light-monitor device push

# 持續推送狀態變化（終端靜默，只推燈）
agent-traffic-light-monitor device watch

# 或單一 watch 進程同時驅動終端和燈
agent-traffic-light-monitor watch --device
```

如果接了多塊 ESP32 板子，用 `--port` 指定：

```bash
agent-traffic-light-monitor device watch --port COM5
```

支援的 USB 串口橋接晶片：**Espressif 原生 USB (0x303A)**、**WCH CH340 / CH341 (0x1A86)**、**Silicon Labs CP210x (0x10C4)**、**FTDI (0x0403)**。

狀態到 LED 顏色對應：`green` → 綠，`yellow` → 黃，`red` → 紅，其他 → 藍（安全兜底）。

## VS Code Claude Code 使用方式

1. 在 VS Code 中開啟目前專案。
2. 執行：

```bash
npm install
npm run build
agent-traffic-light-monitor init
```

3. 啟動即時狀態終端：

```bash
agent-traffic-light-monitor watch
```

4. 重新啟動 VS Code 中的 Claude Code 會話，讓它重新載入 `.claude/settings.json`。
5. 正常使用 Claude Code。

狀態變化會顯示在 `watch` 終端和 Claude Code status line 中。目前 MVP 不會修改 VS Code 底部原生狀態列。

## 排錯

```bash
agent-traffic-light-monitor doctor
```

`doctor` 會檢查 `.agent-pulse`、`dist/cli.js`、`.claude/settings.json`、statusLine 和 hooks 設定。

如果狀態沒有變化：執行 `npm run build`、`agent-traffic-light-monitor init`，重啟 VS Code 中的 Claude Code 會話，然後在另一個終端執行 `agent-traffic-light-monitor watch`。

## 資料與隱私

Agent Traffic Light Monitor 的資料預設保存在本地 `.agent-pulse/` 目錄。目前 MVP 不會上傳程式碼、prompt、終端輸出或專案資料到任何伺服器。
