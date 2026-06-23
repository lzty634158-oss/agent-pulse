import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import type { PulseConfig } from '../types/config.js';

function parseBooleanAnswer(answer: string, defaultValue: boolean): boolean {
  const normalized = answer.trim().toLowerCase();
  if (!normalized) return defaultValue;
  return ['y', 'yes', 'true', '1'].includes(normalized);
}

function parseNumberAnswer(answer: string, defaultValue: number): number {
  const parsed = Number.parseInt(answer.trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

export async function promptForInitConfig(config: PulseConfig): Promise<PulseConfig> {
  if (!input.isTTY || !output.isTTY) {
    return config;
  }

  const rl = readline.createInterface({ input, output });

  try {
    const desktopNotifications = parseBooleanAnswer(await rl.question(`Enable desktop notifications? (${config.desktopNotifications ? 'Y/n' : 'y/N'}) `), config.desktopNotifications);
    const notifyOnComplete = desktopNotifications ? parseBooleanAnswer(await rl.question(`Notify when Claude finishes? (${config.notifyOnComplete ? 'Y/n' : 'y/N'}) `), config.notifyOnComplete) : false;
    const notifyOnError = desktopNotifications ? parseBooleanAnswer(await rl.question(`Notify when Claude needs attention or fails? (${config.notifyOnError ? 'Y/n' : 'y/N'}) `), config.notifyOnError) : false;
    const notifyOnStuck = desktopNotifications ? parseBooleanAnswer(await rl.question(`Notify when Claude may be stuck? (${config.notifyOnStuck ? 'Y/n' : 'y/N'}) `), config.notifyOnStuck) : false;
    const stuckAfterMinutes = notifyOnStuck ? parseNumberAnswer(await rl.question(`Consider yellow stuck after how many minutes? (${config.stuckAfterMinutes}) `), config.stuckAfterMinutes) : config.stuckAfterMinutes;

    return {
      ...config,
      desktopNotifications,
      notifyOnComplete,
      notifyOnError,
      notifyOnStuck,
      stuckAfterMinutes,
    };
  } finally {
    rl.close();
  }
}
