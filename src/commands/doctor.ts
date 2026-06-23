import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getConfigPath, getEventsPath, getPulseDir, getStatusPath } from '../core/paths.js';
import { getClaudeSettingsPath } from '../integrations/claude-code.js';

interface CheckResult {
  label: string;
  ok: boolean;
  detail?: string;
}

function formatCheck(result: CheckResult): string {
  return `${result.ok ? '✅' : '❌'} ${result.label}${result.detail ? ` — ${result.detail}` : ''}`;
}

async function readJsonFile(filePath: string): Promise<unknown> {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as unknown;
}

function hasAgentPulseCommand(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.includes('dist/cli.js') || value.includes('dist\\cli.js') || value.includes('agent-pulse');
  }

  if (Array.isArray(value)) {
    return value.some(hasAgentPulseCommand);
  }

  if (typeof value === 'object' && value !== null) {
    return Object.values(value).some(hasAgentPulseCommand);
  }

  return false;
}

function hasHook(settings: unknown, hookName: string): boolean {
  if (typeof settings !== 'object' || settings === null) {
    return false;
  }

  const hooks = (settings as { hooks?: unknown }).hooks;
  if (typeof hooks !== 'object' || hooks === null) {
    return false;
  }

  return hasAgentPulseCommand((hooks as Record<string, unknown>)[hookName]);
}

export async function doctorCommand(): Promise<void> {
  const checks: CheckResult[] = [];
  const distCliPath = path.join(process.cwd(), 'dist', 'cli.js');
  const claudeSettingsPath = getClaudeSettingsPath();

  checks.push({ label: '.agent-pulse directory', ok: existsSync(getPulseDir()) });
  checks.push({ label: '.agent-pulse/config.json', ok: existsSync(getConfigPath()) });
  checks.push({ label: '.agent-pulse/status.json', ok: existsSync(getStatusPath()) });
  checks.push({ label: '.agent-pulse/events.jsonl', ok: existsSync(getEventsPath()) });
  checks.push({ label: 'dist/cli.js build output', ok: existsSync(distCliPath), detail: existsSync(distCliPath) ? distCliPath : 'run npm run build' });
  checks.push({ label: '.claude/settings.json', ok: existsSync(claudeSettingsPath), detail: claudeSettingsPath });

  if (existsSync(claudeSettingsPath)) {
    try {
      const settings = await readJsonFile(claudeSettingsPath);
      const statusLine = typeof settings === 'object' && settings !== null ? (settings as { statusLine?: unknown }).statusLine : undefined;

      checks.push({ label: 'Claude Code statusLine configured', ok: hasAgentPulseCommand(statusLine) });
      checks.push({ label: 'Claude Code PreToolUse hook configured', ok: hasHook(settings, 'PreToolUse') });
      checks.push({ label: 'Claude Code PostToolUse hook configured', ok: hasHook(settings, 'PostToolUse') });
      checks.push({ label: 'Claude Code Notification hook configured', ok: hasHook(settings, 'Notification') });
      checks.push({ label: 'Claude Code Stop hook configured', ok: hasHook(settings, 'Stop') });
    } catch (error) {
      checks.push({ label: 'Claude Code settings JSON parse', ok: false, detail: error instanceof Error ? error.message : 'invalid JSON' });
    }
  }

  console.log('Agent Pulse doctor');
  console.log('');
  for (const check of checks) {
    console.log(formatCheck(check));
  }

  const failed = checks.filter((check) => !check.ok);
  if (failed.length > 0) {
    console.log('');
    console.log('Suggested fix:');
    console.log('1. Run npm run build');
    console.log('2. Run node dist/cli.js init');
    console.log('3. Restart your Claude Code session in VS Code');
    process.exitCode = 1;
    return;
  }

  console.log('');
  console.log('Setup looks good. Run node dist/cli.js watch, then use Claude Code in this project.');
}
