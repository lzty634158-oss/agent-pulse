# Agent Pulse

Langue : [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | Français | [Deutsch](README.de.md) | [Español](README.es.md)

Agent Pulse est un outil local de voyant d’état et d’alertes pour Claude Code et les agents de codage IA.

Il indique l’état de Claude Code :

- Vert : inactif, terminé ou prêt pour la revue
- Jaune : en cours de travail ou d’exécution d’un outil
- Rouge : bloqué, en échec ou nécessite votre attention

## Fonctionnalités MVP actuelles

- Intégration avec les hooks Claude Code
- Commande Claude Code status line
- Vue d’état en temps réel dans le terminal
- Historique local des événements
- Notifications de bureau
- Interface de configuration locale dans le navigateur
- Diagnostic d’installation

## Installation depuis le code source

```bash
npm install
npm run build
```

## Initialiser un projet

Exécutez cette commande dans le projet à surveiller :

```bash
node dist/cli.js init
```

Agent Pulse demande les préférences de notification et écrit :

```text
.agent-pulse/config.json
.agent-pulse/status.json
.agent-pulse/events.jsonl
.claude/settings.json
```

Le fichier `.claude/settings.json` configure les hooks et la statusLine Claude Code pour ce projet.

## Surveiller l’état de Claude Code

Ouvrez un second terminal dans le projet et exécutez :

```bash
node dist/cli.js watch
```

Utilisez ensuite Claude Code normalement dans le même projet. Le terminal `watch` se mettra à jour quand Claude utilise des outils, termine ou demande votre attention.

## Configurer Agent Pulse

### Interface locale dans le navigateur

```bash
node dist/cli.js config-ui
```

Cela ouvre :

```text
http://127.0.0.1:4321
```

Vous pouvez configurer les notifications de bureau, les notifications de fin, d’erreur et de blocage, le délai de blocage et le champ Slack webhook réservé.

Appuyez sur `Ctrl+C` dans le terminal exécutant `config-ui` pour arrêter le serveur local.

### Configuration CLI

```bash
node dist/cli.js config show
node dist/cli.js config show notifyOnComplete
node dist/cli.js config set notifyOnComplete false
node dist/cli.js config set notifyOnError true
node dist/cli.js config set notifyOnStuck true
node dist/cli.js config set stuckAfterMinutes 5
```

Clés disponibles :

```text
stuckAfterMinutes
desktopNotifications
notifyOnComplete
notifyOnError
notifyOnStuck
slackWebhookUrl
agent
```

## Commandes

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

## Commandes de développement

```bash
npm run dev -- --help
npm run dev -- init
npm run dev -- watch
npm run dev -- config show
npm run dev -- config-ui
npm run typecheck
npm run build
```

## Simuler des événements hook

État jaune :

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | node dist/cli.js hook pre-tool-use
node dist/cli.js status
```

État rouge :

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"stderr":"tests failed"}}' | node dist/cli.js hook post-tool-use
node dist/cli.js status
```

État vert :

```bash
node dist/cli.js hook stop
node dist/cli.js status
```

## Utilisation avec VS Code Claude Code

1. Ouvrez ce projet dans VS Code.
2. Exécutez :

```bash
npm install
npm run build
node dist/cli.js init
```

3. Lancez le terminal de surveillance :

```bash
node dist/cli.js watch
```

4. Redémarrez la session Claude Code dans VS Code pour recharger `.claude/settings.json`.
5. Utilisez Claude Code normalement.

Les changements d’état apparaissent dans le terminal `watch` et dans la status line Claude Code. Ce MVP ne modifie pas la barre d’état native de VS Code.

## Dépannage

```bash
node dist/cli.js doctor
```

`doctor` vérifie `.agent-pulse`, `dist/cli.js`, `.claude/settings.json`, statusLine et hooks.

Si l’état ne change pas : exécutez `npm run build`, `node dist/cli.js init`, redémarrez la session Claude Code dans VS Code, puis lancez `node dist/cli.js watch` dans un autre terminal.

## Données et confidentialité

Agent Pulse stocke les données localement dans `.agent-pulse/`. Le MVP actuel n’envoie pas le code, les prompts, la sortie du terminal ni les données du projet vers un serveur.
