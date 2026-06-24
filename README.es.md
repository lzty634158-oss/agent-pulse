# Agent Traffic Light Monitor

Idioma: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | Español

Agent Traffic Light Monitor es una herramienta local de luces de estado y alertas para Claude Code y agentes de programación con IA.

Muestra el estado de Claude Code:

- Verde: inactivo o listo para revisión después de que Claude Code se detiene
- Amarillo: Claude Code está activo, ejecutando una herramienta o pensando después de una llamada de herramienta
- Rojo: bloqueado, falló, espera permiso o necesita tu atención

## Funciones actuales del MVP

- Integración con Claude Code hooks
- Comando de Claude Code status line
- Vista de estado en tiempo real en la terminal
- Historial local de eventos
- Notificaciones de escritorio
- UI local de configuración en el navegador
- Diagnóstico de instalación

## Instalación

Instala globalmente:

```bash
npm install -g agent-traffic-light-monitor
```

O ejecútalo sin instalación global:

```bash
npx agent-traffic-light-monitor --help
```

## Inicializar un proyecto

Ejecuta esto en el proyecto que quieres monitorear:

```bash
agent-traffic-light-monitor init
```

Agent Traffic Light Monitor pregunta las preferencias de notificación y escribe:

```text
.agent-pulse/config.json
.agent-pulse/status.json
.agent-pulse/events.jsonl
.claude/settings.json
```

`.claude/settings.json` configura hooks y statusLine de Claude Code para este proyecto.

## Ver el estado de Claude Code

Abre una segunda terminal en el proyecto y ejecuta:

```bash
agent-traffic-light-monitor watch
```

Luego usa Claude Code normalmente en el mismo proyecto.

## Configurar Agent Traffic Light Monitor

### UI local en el navegador

```bash
agent-traffic-light-monitor config-ui
```

Abre:

```text
http://127.0.0.1:4321
```

Puedes configurar notificaciones de escritorio, notificaciones al terminar, por error y por bloqueo, el tiempo para considerar un bloqueo y el campo reservado para Slack webhook.

Pulsa `Ctrl+C` en la terminal que ejecuta `config-ui` para detener el servidor local.

### Configuración por CLI

```bash
agent-traffic-light-monitor config show
agent-traffic-light-monitor config show notifyOnComplete
agent-traffic-light-monitor config set notifyOnComplete false
agent-traffic-light-monitor config set notifyOnError true
agent-traffic-light-monitor config set notifyOnStuck true
agent-traffic-light-monitor config set stuckAfterMinutes 5
```

Claves disponibles:

```text
stuckAfterMinutes
desktopNotifications
notifyOnComplete
notifyOnError
notifyOnStuck
slackWebhookUrl
agent
```

## Comandos

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

## Comandos de desarrollo

```bash
npm run dev -- --help
npm run dev -- init
npm run dev -- watch
npm run dev -- config show
npm run dev -- config-ui
npm run typecheck
npm run build
```

## Simular eventos hook

Estado amarillo:

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | agent-traffic-light-monitor hook pre-tool-use
agent-traffic-light-monitor status
```

Estado rojo:

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"stderr":"tests failed"}}' | agent-traffic-light-monitor hook post-tool-use
agent-traffic-light-monitor status
```

Estado verde:

```bash
agent-traffic-light-monitor hook stop
agent-traffic-light-monitor status
```

## Uso con VS Code Claude Code

1. Abre este proyecto en VS Code.
2. Ejecuta:

```bash
npm install
npm run build
agent-traffic-light-monitor init
```

3. Inicia la terminal de estado:

```bash
agent-traffic-light-monitor watch
```

4. Reinicia la sesión de Claude Code en VS Code para recargar `.claude/settings.json`.
5. Usa Claude Code normalmente.

Los cambios de estado aparecen en la terminal `watch` y en la status line de Claude Code. Este MVP no cambia la barra de estado nativa inferior de VS Code.

## Solución de problemas

```bash
agent-traffic-light-monitor doctor
```

`doctor` revisa `.agent-pulse`, `dist/cli.js`, `.claude/settings.json`, statusLine y hooks.

Si el estado no cambia: ejecuta `npm run build`, `agent-traffic-light-monitor init`, reinicia la sesión de Claude Code en VS Code y ejecuta `agent-traffic-light-monitor watch` en otra terminal.

## Datos y privacidad

Agent Traffic Light Monitor guarda los datos localmente en `.agent-pulse/`. El MVP actual no sube código, prompts, salida de terminal ni datos del proyecto a ningún servidor.
