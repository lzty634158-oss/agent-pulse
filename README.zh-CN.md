# Agent Pulse

Agent Pulse 是一个面向 Claude Code 和 AI 编程助手的本地状态灯与提醒工具。

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

## 从源码安装

```bash
npm install
npm run build
```

## 初始化项目

在需要监控的项目根目录运行：

```bash
node dist/cli.js init
```

初始化时，Agent Pulse 会询问通知偏好，并写入：

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
node dist/cli.js watch
```

然后正常使用 Claude Code。Claude 调用工具、完成任务、需要介入时，`watch` 终端会自动更新红黄绿状态。

## 配置 Agent Pulse

### 本地浏览器配置页

```bash
node dist/cli.js config-ui
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
node dist/cli.js config show
```

查看单个配置：

```bash
node dist/cli.js config show notifyOnComplete
```

修改配置：

```bash
node dist/cli.js config set notifyOnComplete false
node dist/cli.js config set notifyOnError true
node dist/cli.js config set notifyOnStuck true
node dist/cli.js config set stuckAfterMinutes 5
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
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | node dist/cli.js hook pre-tool-use
node dist/cli.js status
```

红灯状态：

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"stderr":"tests failed"}}' | node dist/cli.js hook post-tool-use
node dist/cli.js status
```

绿灯状态：

```bash
node dist/cli.js hook stop
node dist/cli.js status
```

## VS Code Claude Code 使用方式

1. 在 VS Code 中打开当前项目。
2. 运行：

```bash
npm install
npm run build
node dist/cli.js init
```

3. 启动实时状态终端：

```bash
node dist/cli.js watch
```

4. 重启 VS Code 中的 Claude Code 会话，让它重新加载 `.claude/settings.json`。
5. 正常使用 Claude Code。

状态变化会显示在 `watch` 终端和 Claude Code status line 中。当前 MVP 不会修改 VS Code 底部原生状态栏。

## 排错

运行：

```bash
node dist/cli.js doctor
```

`doctor` 会检查：

- `.agent-pulse` 文件是否存在
- `dist/cli.js` 是否存在
- `.claude/settings.json` 是否存在
- Claude Code statusLine 是否配置
- Claude Code hooks 是否配置

如果状态没有变化：

1. 运行 `npm run build`。
2. 运行 `node dist/cli.js init`。
3. 重启 VS Code 中的 Claude Code 会话。
4. 在另一个终端运行 `node dist/cli.js watch`。
5. 让 Claude Code 读取或编辑一个文件，以触发 hooks。

如果桌面通知太频繁，运行：

```bash
node dist/cli.js config-ui
```

然后关闭完成通知，或调整卡住检测时间。

## 数据与隐私

Agent Pulse 的数据默认保存在本地 `.agent-pulse/` 目录。

当前 MVP 不会上传代码、prompt、终端输出或项目数据到任何服务器。
