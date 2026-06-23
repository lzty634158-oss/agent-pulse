# Agent Pulse

언어: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | 한국어 | [Français](README.fr.md) | [Deutsch](README.de.md) | [Español](README.es.md)

Agent Pulse는 Claude Code 및 AI 코딩 에이전트를 위한 로컬 상태 표시등 및 알림 도구입니다.

상태는 세 가지 색으로 표시됩니다.

- 초록: 유휴, 완료, 리뷰 대기
- 노랑: 작업 중 또는 도구 실행 중
- 빨강: 차단됨, 실패, 사용자 개입 필요

## 현재 MVP 기능

- Claude Code hooks 연동
- Claude Code status line 명령
- 터미널 실시간 상태 표시
- 로컬 이벤트 기록
- 데스크톱 알림
- 로컬 브라우저 설정 UI
- 설정 진단 명령

## 소스에서 설치

```bash
npm install
npm run build
```

## 프로젝트 초기화

모니터링할 프로젝트에서 실행합니다.

```bash
node dist/cli.js init
```

생성되는 파일:

```text
.agent-pulse/config.json
.agent-pulse/status.json
.agent-pulse/events.jsonl
.claude/settings.json
```

`.claude/settings.json`에는 Claude Code hooks와 statusLine이 설정됩니다.

## Claude Code 상태 보기

다른 터미널에서 실행합니다.

```bash
node dist/cli.js watch
```

그 다음 같은 프로젝트에서 Claude Code를 평소처럼 사용합니다.

## 설정

### 로컬 브라우저 UI

```bash
node dist/cli.js config-ui
```

열리는 주소:

```text
http://127.0.0.1:4321
```

설정 항목:

- 데스크톱 알림
- 완료 시 알림
- 오류 시 알림
- 멈춤 감지 시 알림
- 멈춤으로 판단할 시간
- Slack webhook 예약 필드

종료하려면 `config-ui`를 실행 중인 터미널에서 `Ctrl+C`를 누릅니다.

### CLI 설정

```bash
node dist/cli.js config show
node dist/cli.js config show notifyOnComplete
node dist/cli.js config set notifyOnComplete false
node dist/cli.js config set notifyOnError true
node dist/cli.js config set notifyOnStuck true
node dist/cli.js config set stuckAfterMinutes 5
```

사용 가능한 키:

```text
stuckAfterMinutes
desktopNotifications
notifyOnComplete
notifyOnError
notifyOnStuck
slackWebhookUrl
agent
```

## 명령어

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

## 개발 명령어

```bash
npm run dev -- --help
npm run dev -- init
npm run dev -- watch
npm run dev -- config show
npm run dev -- config-ui
npm run typecheck
npm run build
```

## hook 이벤트 시뮬레이션

노란 상태:

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | node dist/cli.js hook pre-tool-use
node dist/cli.js status
```

빨간 상태:

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"stderr":"tests failed"}}' | node dist/cli.js hook post-tool-use
node dist/cli.js status
```

초록 상태:

```bash
node dist/cli.js hook stop
node dist/cli.js status
```

## VS Code Claude Code 사용법

1. VS Code에서 프로젝트를 엽니다.
2. 실행합니다.

```bash
npm install
npm run build
node dist/cli.js init
```

3. 상태 감시 터미널을 시작합니다.

```bash
node dist/cli.js watch
```

4. VS Code의 Claude Code 세션을 재시작하여 `.claude/settings.json`을 다시 로드합니다.
5. Claude Code를 평소처럼 사용합니다.

상태 변화는 `watch` 터미널과 Claude Code status line에 표시됩니다. 현재 MVP는 VS Code 기본 하단 상태 표시줄을 변경하지 않습니다.

## 문제 해결

```bash
node dist/cli.js doctor
```

`doctor`는 `.agent-pulse`, `dist/cli.js`, `.claude/settings.json`, statusLine, hooks 설정을 확인합니다.

상태가 바뀌지 않으면:

1. `npm run build`를 실행합니다.
2. `node dist/cli.js init`을 실행합니다.
3. VS Code의 Claude Code 세션을 재시작합니다.
4. 다른 터미널에서 `node dist/cli.js watch`를 실행합니다.
5. Claude Code에 파일 읽기나 편집을 요청해 hooks를 트리거합니다.

## 데이터와 개인정보

Agent Pulse는 데이터를 로컬 `.agent-pulse/`에 저장합니다. 현재 MVP는 코드, 프롬프트, 터미널 출력, 프로젝트 데이터를 서버로 업로드하지 않습니다.
