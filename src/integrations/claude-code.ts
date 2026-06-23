import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface ClaudeHookCommand {
  type: 'command';
  command: string;
}

interface ClaudeHookMatcher {
  matcher?: string;
  hooks: ClaudeHookCommand[];
}

interface ClaudeSettings {
  statusLine?: {
    type: 'command';
    command: string;
  };
  hooks?: Record<string, ClaudeHookMatcher[]>;
  [key: string]: unknown;
}

const hookEvents: Record<string, string> = {
  PreToolUse: 'pre-tool-use',
  PostToolUse: 'post-tool-use',
  Notification: 'notification',
  Stop: 'stop',
};

export function getClaudeDir(cwd = process.cwd()): string {
  return path.join(cwd, '.claude');
}

export function getClaudeSettingsPath(cwd = process.cwd()): string {
  return path.join(getClaudeDir(cwd), 'settings.json');
}

function getBuiltCliPath(cwd = process.cwd()): string {
  return path.join(cwd, 'dist', 'cli.js');
}

function getCurrentCliPath(): string {
  return fileURLToPath(import.meta.url).endsWith(`${path.sep}dist${path.sep}cli.js`) ? fileURLToPath(import.meta.url) : getBuiltCliPath();
}

function quotePath(filePath: string): string {
  return `"${filePath.replace(/"/g, '\\"')}"`;
}

function buildCliCommand(subcommand: string): string {
  return `node ${quotePath(getCurrentCliPath())} ${subcommand}`;
}

async function readClaudeSettings(settingsPath: string): Promise<ClaudeSettings> {
  if (!existsSync(settingsPath)) {
    return {};
  }

  const raw = await readFile(settingsPath, 'utf8');
  if (!raw.trim()) {
    return {};
  }

  return JSON.parse(raw) as ClaudeSettings;
}

function isAgentPulseCommand(command: string): boolean {
  return command.includes('agent-pulse') || command.includes('dist/cli.js') || command.includes('dist\\cli.js');
}

function removeOldAgentPulseHooks(matchers: ClaudeHookMatcher[]): ClaudeHookMatcher[] {
  return matchers
    .map((matcher) => ({
      ...matcher,
      hooks: matcher.hooks.filter((hook) => !(hook.type === 'command' && isAgentPulseCommand(hook.command))),
    }))
    .filter((matcher) => matcher.hooks.length > 0);
}

function mergeHook(settings: ClaudeSettings, hookName: string, command: string): void {
  settings.hooks ??= {};
  const matchers = removeOldAgentPulseHooks(settings.hooks[hookName] ?? []);

  matchers.push({
    hooks: [
      {
        type: 'command',
        command,
      },
    ],
  });

  settings.hooks[hookName] = matchers;
}

export async function installClaudeCodeIntegration(cwd = process.cwd()): Promise<string> {
  const claudeDir = getClaudeDir(cwd);
  const settingsPath = getClaudeSettingsPath(cwd);
  await mkdir(claudeDir, { recursive: true });

  const settings = await readClaudeSettings(settingsPath);
  settings.statusLine = {
    type: 'command',
    command: buildCliCommand('statusline'),
  };

  for (const [hookName, eventName] of Object.entries(hookEvents)) {
    mergeHook(settings, hookName, buildCliCommand(`hook ${eventName}`));
  }

  await writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
  return settingsPath;
}
