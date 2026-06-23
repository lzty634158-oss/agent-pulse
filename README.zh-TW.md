# Agent Pulse

語言： [English](README.md) | [简体中文](README.zh-CN.md) | 繁體中文 | [日本語](README.ja.md) | [한국어](README.ko.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Español](README.es.md)

Agent Pulse 是一個面向 Claude Code 和 AI 編程助手的本地狀態燈與提醒工具。

它可以顯示 Claude Code 目前狀態：

- 綠燈：閒置、完成、等待 review
- 黃燈：正在工作、正在呼叫工具
- 紅燈：阻塞、失敗、需要使用者介入

## 目前 MVP 功能

- Claude Code hooks 整合
- Claude Code status line 命令
- 終端即時狀態燈
- 本地事件歷史
- 桌面通知
- 本地瀏覽器設定頁
- 安裝診斷命令

## 從原始碼安裝

```bash
npm install
npm run build
```

## 初始化專案

在需要監控的專案根目錄執行：

```bash
node dist/cli.js init
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
node dist/cli.js watch
```

然後正常使用 Claude Code。Claude 呼叫工具、完成任務或需要介入時，`watch` 終端會自動更新狀態。

## 設定 Agent Pulse

### 本地瀏覽器 UI

```bash
node dist/cli.js config-ui
```

會開啟：

```text
http://127.0.0.1:4321
```

可設定：桌面通知、完成通知、錯誤通知、卡住通知、卡住判定時間、Slack webhook 預留欄位。

使用完後，在執行 `config-ui` 的終端按 `Ctrl+C` 關閉本地服務。

### 命令列設定

```bash
node dist/cli.js config show
node dist/cli.js config show notifyOnComplete
node dist/cli.js config set notifyOnComplete false
node dist/cli.js config set notifyOnError true
node dist/cli.js config set notifyOnStuck true
node dist/cli.js config set stuckAfterMinutes 5
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

## VS Code Claude Code 使用方式

1. 在 VS Code 中開啟目前專案。
2. 執行：

```bash
npm install
npm run build
node dist/cli.js init
```

3. 啟動即時狀態終端：

```bash
node dist/cli.js watch
```

4. 重新啟動 VS Code 中的 Claude Code 會話，讓它重新載入 `.claude/settings.json`。
5. 正常使用 Claude Code。

狀態變化會顯示在 `watch` 終端和 Claude Code status line 中。目前 MVP 不會修改 VS Code 底部原生狀態列。

## 排錯

```bash
node dist/cli.js doctor
```

`doctor` 會檢查 `.agent-pulse`、`dist/cli.js`、`.claude/settings.json`、statusLine 和 hooks 設定。

如果狀態沒有變化：執行 `npm run build`、`node dist/cli.js init`，重啟 VS Code 中的 Claude Code 會話，然後在另一個終端執行 `node dist/cli.js watch`。

## 資料與隱私

Agent Pulse 的資料預設保存在本地 `.agent-pulse/` 目錄。目前 MVP 不會上傳程式碼、prompt、終端輸出或專案資料到任何伺服器。
