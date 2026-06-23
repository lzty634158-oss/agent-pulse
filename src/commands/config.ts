import { ensureConfig, writeConfig } from '../core/config.js';
import type { PulseConfig } from '../types/config.js';

type ConfigKey = keyof PulseConfig;

const configKeys: ConfigKey[] = ['stuckAfterMinutes', 'desktopNotifications', 'notifyOnComplete', 'notifyOnError', 'notifyOnStuck', 'slackWebhookUrl', 'agent'];

function isConfigKey(key: string): key is ConfigKey {
  return configKeys.includes(key as ConfigKey);
}

function parseConfigValue(key: ConfigKey, value: string): PulseConfig[ConfigKey] {
  if (key === 'stuckAfterMinutes') {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error('stuckAfterMinutes must be a positive number');
    }
    return parsed;
  }

  if (key === 'desktopNotifications' || key === 'notifyOnComplete' || key === 'notifyOnError' || key === 'notifyOnStuck') {
    const normalized = value.toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    throw new Error(`${key} must be true or false`);
  }

  if (key === 'slackWebhookUrl') {
    return value.trim() ? value.trim() : null;
  }

  return value;
}

export async function configShowCommand(key?: string): Promise<void> {
  const config = await ensureConfig();

  if (key !== undefined) {
    if (!isConfigKey(key)) {
      throw new Error(`Unknown config key: ${key}`);
    }
    console.log(JSON.stringify(config[key], null, 2));
    return;
  }

  console.log(JSON.stringify(config, null, 2));
}

export async function configSetCommand(key: string, value: string): Promise<void> {
  if (!isConfigKey(key)) {
    throw new Error(`Unknown config key: ${key}`);
  }

  const config = await ensureConfig();
  const nextConfig = {
    ...config,
    [key]: parseConfigValue(key, value),
  };

  await writeConfig(nextConfig);
  console.log(`Updated ${key}: ${JSON.stringify(nextConfig[key])}`);
}

export function listConfigKeys(): string[] {
  return [...configKeys];
}
