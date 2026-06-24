# Agent Traffic Light Monitor

言語: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | 日本語 | [한국어](README.ko.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Español](README.es.md)

Agent Traffic Light Monitor は、Claude Code と AI コーディングエージェント向けのローカル状態ライトおよび通知ツールです。

状態は次の 3 色で表示されます。

- 緑: Claude Code 停止後のアイドル、レビュー待ち
- 黄: Claude Code がアクティブ、ツール実行中、またはツール呼び出し後に思考中
- 赤: ブロック、失敗、権限待ち、ユーザーの対応が必要

## 現在の MVP 機能

- Claude Code hooks 連携
- Claude Code status line コマンド
- ターミナルでのリアルタイム状態表示
- ローカルイベント履歴
- デスクトップ通知
- ローカルブラウザ設定 UI
- セットアップ診断

## インストール

グローバルにインストールします。

```bash
npm install -g agent-traffic-light-monitor
```

またはグローバルインストールなしで実行します。

```bash
npx agent-traffic-light-monitor --help
```

## プロジェクトを初期化

監視したいプロジェクトで実行します。

```bash
agent-traffic-light-monitor init
```

生成されるファイル:

```text
.agent-pulse/config.json
.agent-pulse/status.json
.agent-pulse/events.jsonl
.claude/settings.json
```

`.claude/settings.json` に Claude Code hooks と statusLine が設定されます。

## Claude Code の状態を監視

別のターミナルで実行します。

```bash
agent-traffic-light-monitor watch
```

その後、同じプロジェクトで Claude Code を通常どおり使用します。

## 設定

### ブラウザ UI

```bash
agent-traffic-light-monitor config-ui
```

開かれる URL:

```text
http://127.0.0.1:4321
```

設定できる項目:

- デスクトップ通知
- 完了時の通知
- エラー時の通知
- スタック時の通知
- スタック判定までの分数
- Slack webhook 予約フィールド

終了するには、`config-ui` を実行しているターミナルで `Ctrl+C` を押します。

### CLI 設定

```bash
agent-traffic-light-monitor config show
agent-traffic-light-monitor config show notifyOnComplete
agent-traffic-light-monitor config set notifyOnComplete false
agent-traffic-light-monitor config set notifyOnError true
agent-traffic-light-monitor config set notifyOnStuck true
agent-traffic-light-monitor config set stuckAfterMinutes 5
```

利用可能なキー:

```text
stuckAfterMinutes
desktopNotifications
notifyOnComplete
notifyOnError
notifyOnStuck
slackWebhookUrl
agent
```

## コマンド

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

## 開発コマンド

```bash
npm run dev -- --help
npm run dev -- init
npm run dev -- watch
npm run dev -- config show
npm run dev -- config-ui
npm run typecheck
npm run build
```

## hook イベントをシミュレート

黄状態:

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | agent-traffic-light-monitor hook pre-tool-use
agent-traffic-light-monitor status
```

赤状態:

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"stderr":"tests failed"}}' | agent-traffic-light-monitor hook post-tool-use
agent-traffic-light-monitor status
```

緑状態:

```bash
agent-traffic-light-monitor hook stop
agent-traffic-light-monitor status
```

## VS Code Claude Code での使い方

1. VS Code でプロジェクトを開きます。
2. 実行します。

```bash
npm install
npm run build
agent-traffic-light-monitor init
```

3. 監視用ターミナルを起動します。

```bash
agent-traffic-light-monitor watch
```

4. VS Code の Claude Code セッションを再起動して、`.claude/settings.json` を再読み込みします。
5. Claude Code を通常どおり使用します。

状態は `watch` ターミナルと Claude Code status line に表示されます。この MVP は VS Code ネイティブの下部ステータスバーは変更しません。

## トラブルシューティング

```bash
agent-traffic-light-monitor doctor
```

`doctor` は `.agent-pulse`、`dist/cli.js`、`.claude/settings.json`、statusLine、hooks を確認します。

状態が変わらない場合:

1. `npm run build` を実行します。
2. `agent-traffic-light-monitor init` を実行します。
3. VS Code の Claude Code セッションを再起動します。
4. 別のターミナルで `agent-traffic-light-monitor watch` を実行します。
5. Claude Code にファイルの読み取りや編集を依頼して hooks を発火させます。

## データとプライバシー

Agent Traffic Light Monitor はデータをローカルの `.agent-pulse/` に保存します。現在の MVP はコード、プロンプト、ターミナル出力、プロジェクトデータをサーバーへアップロードしません。
