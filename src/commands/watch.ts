import process from 'node:process';
import chokidar from 'chokidar';
import { readConfig } from '../core/config.js';
import { getStatusPath } from '../core/paths.js';
import { readStatus } from '../core/status.js';
import { notifyStatus, notifyStuck } from '../integrations/notifier.js';
import type { PulseStatus } from '../types/status.js';
import { renderStatus } from '../ui/render-status.js';

let lastNotifiedUpdatedAt: string | undefined;
let lastStuckNotifiedStartedAt: string | undefined;

function clearTerminal(): void {
  process.stdout.write('c');
}

function isStuck(status: PulseStatus, stuckAfterMinutes: number): boolean {
  return status.status === 'yellow' && Date.now() - new Date(status.startedAt).getTime() >= stuckAfterMinutes * 60 * 1000;
}

async function renderCurrentStatus(): Promise<void> {
  const [status, config] = await Promise.all([readStatus(), readConfig()]);

  clearTerminal();
  console.log(renderStatus(status, { stuckAfterMinutes: config.stuckAfterMinutes }));
  console.log('');
  console.log('Watching .agent-pulse/status.json. Press Ctrl+C to stop.');

  if (!config.desktopNotifications) {
    return;
  }

  const shouldNotifyComplete = status.status === 'green' && config.notifyOnComplete;
  const shouldNotifyError = status.status === 'red' && config.notifyOnError;

  if (status.updatedAt !== lastNotifiedUpdatedAt && (shouldNotifyComplete || shouldNotifyError)) {
    notifyStatus(status);
    lastNotifiedUpdatedAt = status.updatedAt;
  }

  if (config.notifyOnStuck && isStuck(status, config.stuckAfterMinutes) && status.startedAt !== lastStuckNotifiedStartedAt) {
    notifyStuck(status, config.stuckAfterMinutes);
    lastStuckNotifiedStartedAt = status.startedAt;
  }
}

export async function watchCommand(): Promise<void> {
  await renderCurrentStatus();

  const interval = setInterval(() => {
    renderCurrentStatus().catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
    });
  }, 1000);

  const watcher = chokidar.watch(getStatusPath(), {
    ignoreInitial: true,
  });

  watcher.on('change', async () => {
    await renderCurrentStatus();
  });

  process.on('SIGINT', async () => {
    clearInterval(interval);
    await watcher.close();
    process.stdout.write('\n');
    process.exit(0);
  });
}
