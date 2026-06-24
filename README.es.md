# Agent Pulse

Idioma: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | Español

Agent Pulse es una herramienta local de luces de estado y alertas para Claude Code y agentes de programación con IA.

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

## Instalar desde el código fuente

```bash
npm install
npm run build
```

## Inicializar un proyecto

Ejecuta esto en el proyecto que quieres monitorear:

```bash
node dist/cli.js init
```

Agent Pulse pregunta las preferencias de notificación y escribe:

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
node dist/cli.js watch
```

Luego usa Claude Code normalmente en el mismo proyecto.

## Configurar Agent Pulse

### UI local en el navegador

```bash
node dist/cli.js config-ui
```

Abre:

```text
http://127.0.0.1:4321
```

Puedes configurar notificaciones de escritorio, notificaciones al terminar, por error y por bloqueo, el tiempo para considerar un bloqueo y el campo reservado para Slack webhook.

Pulsa `Ctrl+C` en la terminal que ejecuta `config-ui` para detener el servidor local.

### Configuración por CLI

```bash
node dist/cli.js config show
node dist/cli.js config show notifyOnComplete
node dist/cli.js config set notifyOnComplete false
node dist/cli.js config set notifyOnError true
node dist/cli.js config set notifyOnStuck true
node dist/cli.js config set stuckAfterMinutes 5
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
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | node dist/cli.js hook pre-tool-use
node dist/cli.js status
```

Estado rojo:

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"stderr":"tests failed"}}' | node dist/cli.js hook post-tool-use
node dist/cli.js status
```

Estado verde:

```bash
node dist/cli.js hook stop
node dist/cli.js status
```

## Uso con VS Code Claude Code

1. Abre este proyecto en VS Code.
2. Ejecuta:

```bash
npm install
npm run build
node dist/cli.js init
```

3. Inicia la terminal de estado:

```bash
node dist/cli.js watch
```

4. Reinicia la sesión de Claude Code en VS Code para recargar `.claude/settings.json`.
5. Usa Claude Code normalmente.

Los cambios de estado aparecen en la terminal `watch` y en la status line de Claude Code. Este MVP no cambia la barra de estado nativa inferior de VS Code.

## Solución de problemas

```bash
node dist/cli.js doctor
```

`doctor` revisa `.agent-pulse`, `dist/cli.js`, `.claude/settings.json`, statusLine y hooks.

Si el estado no cambia: ejecuta `npm run build`, `node dist/cli.js init`, reinicia la sesión de Claude Code en VS Code y ejecuta `node dist/cli.js watch` en otra terminal.

## Datos y privacidad

Agent Pulse guarda los datos localmente en `.agent-pulse/`. El MVP actual no sube código, prompts, salida de terminal ni datos del proyecto a ningún servidor.
