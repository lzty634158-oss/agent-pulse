# Agent Traffic Light Monitor

언어: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | 한국어 | [Français](README.fr.md) | [Deutsch](README.de.md) | [Español](README.es.md)

Agent Traffic Light Monitor는 Claude Code 및 AI 코딩 에이전트를 위한 로컬 상태 표시등 및 알림 도구입니다.

상태는 세 가지 색으로 표시됩니다.

- 초록: Claude Code가 멈춘 뒤 유휴 상태이거나 리뷰 대기
- 노랑: Claude Code가 활성 상태, 도구 실행 중, 또는 도구 호출 후 생각 중
- 빨강: 차단됨, 실패, 권한 대기, 사용자 개입 필요

## 현재 MVP 기능

- Claude Code hooks 연동
- Claude Code status line 명령
- 터미널 실시간 상태 표시
- 로컬 이벤트 기록
- 데스크톱 알림
- 로컬 브라우저 설정 UI
- 설정 진단 명령
- 하드웨어 프로토타입: USB 시리얼 상태 램프 (ESP32-C3 Mini 1, 실험적)

## 설치

전역으로 설치합니다.

```bash
npm install -g agent-traffic-light-monitor
```

또는 전역 설치 없이 실행합니다.

```bash
npx agent-traffic-light-monitor --help
```

## 프로젝트 초기화

모니터링할 프로젝트에서 실행합니다.

```bash
agent-traffic-light-monitor init
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
agent-traffic-light-monitor watch
```

그 다음 같은 프로젝트에서 Claude Code를 평소처럼 사용합니다.

## 설정

### 로컬 브라우저 UI

```bash
agent-traffic-light-monitor config-ui
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
agent-traffic-light-monitor config show
agent-traffic-light-monitor config show notifyOnComplete
agent-traffic-light-monitor config set notifyOnComplete false
agent-traffic-light-monitor config set notifyOnError true
agent-traffic-light-monitor config set notifyOnStuck true
agent-traffic-light-monitor config set stuckAfterMinutes 5
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

## 하드웨어 프로토타입(실험적)

초기 프로토타입은 **ESP32-C3 Mini 1** 개발 보드에서 동작하며, 보드의 내장 RGB LED를 USB 시리얼을 통해 점등합니다.

펌웨어는 [`firmware/`](firmware/)에 있습니다. 핀 배치, 업로드 방법, JSON 프로토콜은 [firmware/README.md](firmware/README.md)를 참조하세요.

펌웨어 업로드 후 빠른 시작:

```bash
# 감지된 시리얼 포트 목록(드라이버 문제 해결용)
agent-traffic-light-monitor device list

# 현재 상태를 한 번 푸시
agent-traffic-light-monitor device push

# 상태 변화를 실시간으로 스트리밍(터미널은 조용히, 하드웨어만)
agent-traffic-light-monitor device watch

# 또는 터미널 표시와 램프를 단일 watch 프로세스로 동시에 구동
agent-traffic-light-monitor watch --device
```

ESP32 보드가 여러 개 연결된 경우 `--port`로 지정합니다:

```bash
agent-traffic-light-monitor device watch --port COM5
```

지원되는 USB 시리얼 브리지 칩: **Espressif 네이티브 USB (0x303A)**, **WCH CH340 / CH341 (0x1A86)**, **Silicon Labs CP210x (0x10C4)**, **FTDI (0x0403)**.

상태 → LED 색상 매핑: `green` → 초록, `yellow` → 노랑, `red` → 빨강, 그 외 → 파랑(안전 폴백).

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
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | agent-traffic-light-monitor hook pre-tool-use
agent-traffic-light-monitor status
```

빨간 상태:

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"stderr":"tests failed"}}' | agent-traffic-light-monitor hook post-tool-use
agent-traffic-light-monitor status
```

초록 상태:

```bash
agent-traffic-light-monitor hook stop
agent-traffic-light-monitor status
```

## VS Code Claude Code 사용법

1. VS Code에서 프로젝트를 엽니다.
2. 실행합니다.

```bash
npm install
npm run build
agent-traffic-light-monitor init
```

3. 상태 감시 터미널을 시작합니다.

```bash
agent-traffic-light-monitor watch
```

4. VS Code의 Claude Code 세션을 재시작하여 `.claude/settings.json`을 다시 로드합니다.
5. Claude Code를 평소처럼 사용합니다.

상태 변화는 `watch` 터미널과 Claude Code status line에 표시됩니다. 현재 MVP는 VS Code 기본 하단 상태 표시줄을 변경하지 않습니다.

## 문제 해결

```bash
agent-traffic-light-monitor doctor
```

`doctor`는 `.agent-pulse`, `dist/cli.js`, `.claude/settings.json`, statusLine, hooks 설정을 확인합니다.

상태가 바뀌지 않으면:

1. `npm run build`를 실행합니다.
2. `agent-traffic-light-monitor init`을 실행합니다.
3. VS Code의 Claude Code 세션을 재시작합니다.
4. 다른 터미널에서 `agent-traffic-light-monitor watch`를 실행합니다.
5. Claude Code에 파일 읽기나 편집을 요청해 hooks를 트리거합니다.

## 데이터와 개인정보

Agent Traffic Light Monitor는 데이터를 로컬 `.agent-pulse/`에 저장합니다. 현재 MVP는 코드, 프롬프트, 터미널 출력, 프로젝트 데이터를 서버로 업로드하지 않습니다.
