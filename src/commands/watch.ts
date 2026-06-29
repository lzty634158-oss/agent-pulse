import process from 'node:process';
import { readConfig } from '../core/config.js';
import { watchStatus } from '../core/status-watcher.js';
import { readStatus } from '../core/status.js';
import {
  openDevice,
  pushStatus,
  tryFindDevice,
  type DiscoveredDevice,
} from '../integrations/device-serial.js';
import { notifyStatus, notifyStuck } from '../integrations/notifier.js';
import type { SerialPort } from 'serialport';
import type { PulseStatus } from '../types/status.js';
import { renderStatus } from '../ui/render-status.js';

interface WatchOptions {
  device?: boolean;
  noDevice?: boolean;
  port?: string;
}

let lastNotifiedUpdatedAt: string | undefined;
let lastStuckNotifiedStartedAt: string | undefined;
let lastNotifiedKey: string | undefined;

function clearTerminal(): void {
  process.stdout.write('c');
}

function isStuck(status: PulseStatus, stuckAfterMinutes: number): boolean {
  return status.status === 'yellow' && Date.now() - new Date(status.startedAt).getTime() >= stuckAfterMinutes * 60 * 1000;
}

async function checkStuckNotification(config: Awaited<ReturnType<typeof readConfig>>): Promise<void> {
  if (!config.notifyOnStuck) return;
  const status = await readStatus();
  if (!isStuck(status, config.stuckAfterMinutes)) return;
  if (status.startedAt === lastStuckNotifiedStartedAt) return;
  notifyStuck(status, config.stuckAfterMinutes);
  lastStuckNotifiedStartedAt = status.startedAt;
}

interface DeviceTarget {
  port: SerialPort;
  path: string;
}

async function openDeviceTarget(options: WatchOptions): Promise<DeviceTarget | null> {
  if (options.port) {
    const port = await openDevice(options.port);
    return { port, path: options.port };
  }
  const discovered: DiscoveredDevice | null = await tryFindDevice();
  if (!discovered) return null;
  const port = await openDevice(discovered.path);
  return { port, path: discovered.path };
}

export async function watchCommand(options: WatchOptions = {}): Promise<void> {
  const config = await readConfig();
  const enableDevice = !options.noDevice;

  let deviceTarget: DeviceTarget | null = null;
  if (enableDevice) {
    deviceTarget = await openDeviceTarget(options);
    if (!deviceTarget && (options.device || options.port)) {
      console.warn('No ESP32 device found, skipping device push. Run `device list` to debug.');
    } else if (deviceTarget) {
      console.log(`Streaming status to ${deviceTarget.path} and the terminal. Press Ctrl+C to stop.`);
    }
  }

  if (!deviceTarget && !options.device) {
    console.log('Watching .agent-pulse/status.json. Press Ctrl+C to stop.');
  }

  const handleStatus = async (status: PulseStatus): Promise<void> => {
    clearTerminal();
    console.log(renderStatus(status, { stuckAfterMinutes: config.stuckAfterMinutes }));
    console.log('');

    if (config.desktopNotifications) {
      const shouldNotifyComplete = status.event === 'stop' && status.status === 'green' && config.notifyOnComplete;
      const shouldNotifyError = status.status === 'red' && config.notifyOnError;
      const notifyKey = `${status.status}:${status.event}`;

      if ((shouldNotifyComplete || shouldNotifyError) && notifyKey !== lastNotifiedKey) {
        notifyStatus(status);
        lastNotifiedKey = notifyKey;
        lastNotifiedUpdatedAt = status.updatedAt;
      }
    }

    if (deviceTarget) {
      try {
        await pushStatus(deviceTarget.port, status);
      } catch (error) {
        console.error(error instanceof Error ? error.message : error);
      }
    }
  };

  const statusWatcher = await watchStatus(handleStatus);

  const stuckInterval = setInterval(() => {
    void checkStuckNotification(config);
  }, 1000);

  await new Promise<void>((resolve) => {
    process.on('SIGINT', () => resolve());
  });

  clearInterval(stuckInterval);
  await statusWatcher.close();
  if (deviceTarget) {
    await new Promise<void>((resolve) => deviceTarget!.port.close(() => resolve()));
  }
  process.stdout.write('\n');
  process.exit(0);
}
