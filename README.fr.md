# Agent Traffic Light Monitor

Langue : [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | Français | [Deutsch](README.de.md) | [Español](README.es.md)

Agent Traffic Light Monitor est un outil local de voyant d’état et d’alertes pour Claude Code et les agents de codage IA.

Il indique l’état de Claude Code :

- Vert : inactif ou prêt pour la revue après l’arrêt de Claude Code
- Jaune : Claude Code est actif, exécute un outil ou réfléchit après un appel d’outil
- Rouge : bloqué, en échec, en attente d’autorisation ou nécessite votre attention

## Fonctionnalités MVP actuelles

- Intégration avec les hooks Claude Code
- Commande Claude Code status line
- Vue d’état en temps réel dans le terminal
- Historique local des événements
- Notifications de bureau
- Interface de configuration locale dans le navigateur
- Diagnostic d’installation
- Prototype matériel : voyant d’état USB-série (ESP32-C3 Mini 1, expérimental)

## Installation

Installez globalement :

```bash
npm install -g agent-traffic-light-monitor
```

Ou exécutez sans installation globale :

```bash
npx agent-traffic-light-monitor --help
```

## Initialiser un projet

Exécutez cette commande dans le projet à surveiller :

```bash
agent-traffic-light-monitor init
```

Agent Traffic Light Monitor demande les préférences de notification et écrit :

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
agent-traffic-light-monitor watch
```

Utilisez ensuite Claude Code normalement dans le même projet. Le terminal `watch` se mettra à jour quand Claude utilise des outils, termine ou demande votre attention.

## Configurer Agent Traffic Light Monitor

### Interface locale dans le navigateur

```bash
agent-traffic-light-monitor config-ui
```

Cela ouvre :

```text
http://127.0.0.1:4321
```

Vous pouvez configurer les notifications de bureau, les notifications de fin, d’erreur et de blocage, le délai de blocage et le champ Slack webhook réservé.

Appuyez sur `Ctrl+C` dans le terminal exécutant `config-ui` pour arrêter le serveur local.

### Configuration CLI

```bash
agent-traffic-light-monitor config show
agent-traffic-light-monitor config show notifyOnComplete
agent-traffic-light-monitor config set notifyOnComplete false
agent-traffic-light-monitor config set notifyOnError true
agent-traffic-light-monitor config set notifyOnStuck true
agent-traffic-light-monitor config set stuckAfterMinutes 5
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

## Prototype matériel (expérimental)

Un premier prototype fonctionne sur une carte de développement **ESP32-C3 Mini 1** en utilisant sa LED RVB intégrée, qui reçoit les changements d’état via la liaison USB-série.

Le firmware se trouve dans [`firmware/`](firmware/) — brochage, instructions de flashage et protocole JSON : voir [firmware/README.md](firmware/README.md).

Démarrage rapide après avoir flashé le firmware :

```bash
# Lister les ports série détectés (utile pour diagnostiquer les pilotes)
agent-traffic-light-monitor device list

# Envoyer l’état courant une seule fois
agent-traffic-light-monitor device push

# Diffuser les changements d’état en continu (terminal silencieux, matériel uniquement)
agent-traffic-light-monitor device watch

# Ou un seul processus `watch` qui pilote à la fois le terminal et la lampe
agent-traffic-light-monitor watch --device
```

Si plusieurs cartes ESP32 sont connectées, choisissez-en une avec `--port` :

```bash
agent-traffic-light-monitor device watch --port COM5
```

Ponts USB-série pris en charge : **Espressif USB natif (0x303A)**, **WCH CH340 / CH341 (0x1A86)**, **Silicon Labs CP210x (0x10C4)**, **FTDI (0x0403)**.

Correspondance état → couleur de LED : `green` → vert, `yellow` → jaune, `red` → rouge, autre → bleu (repli de sécurité).

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
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | agent-traffic-light-monitor hook pre-tool-use
agent-traffic-light-monitor status
```

État rouge :

```bash
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"stderr":"tests failed"}}' | agent-traffic-light-monitor hook post-tool-use
agent-traffic-light-monitor status
```

État vert :

```bash
agent-traffic-light-monitor hook stop
agent-traffic-light-monitor status
```

## Utilisation avec VS Code Claude Code

1. Ouvrez ce projet dans VS Code.
2. Exécutez :

```bash
npm install
npm run build
agent-traffic-light-monitor init
```

3. Lancez le terminal de surveillance :

```bash
agent-traffic-light-monitor watch
```

4. Redémarrez la session Claude Code dans VS Code pour recharger `.claude/settings.json`.
5. Utilisez Claude Code normalement.

Les changements d’état apparaissent dans le terminal `watch` et dans la status line Claude Code. Ce MVP ne modifie pas la barre d’état native de VS Code.

## Dépannage

```bash
agent-traffic-light-monitor doctor
```

`doctor` vérifie `.agent-pulse`, `dist/cli.js`, `.claude/settings.json`, statusLine et hooks.

Si l’état ne change pas : exécutez `npm run build`, `agent-traffic-light-monitor init`, redémarrez la session Claude Code dans VS Code, puis lancez `agent-traffic-light-monitor watch` dans un autre terminal.

## Données et confidentialité

Agent Traffic Light Monitor stocke les données localement dans `.agent-pulse/`. Le MVP actuel n’envoie pas le code, les prompts, la sortie du terminal ni les données du projet vers un serveur.
