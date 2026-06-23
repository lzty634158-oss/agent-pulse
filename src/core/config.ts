import { readFile, writeFile } from 'node:fs/promises';
import type { PulseConfig } from '../types/config.js';
import { getConfigPath } from './paths.js';

export const defaultConfig: PulseConfig = {
  stuckAfterMinutes: 5,
  desktopNotifications: true,
  notifyOnComplete: true,
  notifyOnError: true,
  notifyOnStuck: true,
  slackWebhookUrl: null,
  agent: 'claude-code',
};

export async function readConfig(cwd = process.cwd()): Promise<PulseConfig> {
  const configPath = getConfigPath(cwd);
  const raw = await readFile(configPath, 'utf8');
  return { ...defaultConfig, ...JSON.parse(raw) };
}

export async function writeConfig(config: PulseConfig, cwd = process.cwd()): Promise<void> {
  await writeFile(getConfigPath(cwd), `${JSON.stringify(config, null, 2)}\n`, 'utf8');
}

export async function ensureConfig(cwd = process.cwd()): Promise<PulseConfig> {
  const config = await readConfig(cwd).catch(() => defaultConfig);
  const mergedConfig = { ...defaultConfig, ...config };
  await writeConfig(mergedConfig, cwd);
  return mergedConfig;
}
