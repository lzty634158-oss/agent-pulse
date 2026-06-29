import { readStatus } from '../core/status.js';
import { watchStatus } from '../core/status-watcher.js';
import {
  findDevice,
  isLikelyEsp32Device,
  listAllPorts,
  openDevice,
  pushStatus,
} from '../integrations/device-serial.js';
import type { SerialPort } from 'serialport';
import type { PulseStatus } from '../types/status.js';

interface DeviceOptions {
  port?: string;
}

async function resolveDevicePath(options: DeviceOptions): Promise<string> {
  if (options.port) {
    return options.port;
  }
  const device = await findDevice();
  return device.path;
}

export async function deviceListCommand(): Promise<void> {
  const all = await listAllPorts();

  console.log('All serial ports:');
  if (all.length === 0) {
    console.log('  (none)');
  } else {
    for (const port of all) {
      const tags: string[] = [];
      if (port.vendorId) tags.push(`VID=${port.vendorId}`);
      if (port.productId) tags.push(`PID=${port.productId}`);
      if (port.manufacturer) tags.push(port.manufacturer);
      if (isLikelyEsp32Device(port.vendorId)) tags.push('likely ESP32');
      const suffix = tags.length > 0 ? `  [${tags.join(', ')}]` : '';
      console.log(`  ${port.path}${suffix}`);
    }
  }

  const esp32 = all.filter((port) => isLikelyEsp32Device(port.vendorId));
  console.log('');
  if (esp32.length === 0) {
    console.log('No ESP32 / serial-bridge device detected.');
    console.log('');
    console.log('If your board is plugged in but not listed:');
    console.log('  1. Make sure the USB cable supports data, not just power.');
    console.log('  2. Open Device Manager and look under "Ports (COM & LPT)".');
    console.log('  3. If the board shows up there, use --port COMx to connect manually.');
    console.log('  4. If it does NOT show up, your firmware may have USB CDC disabled.');
    return;
  }

  console.log('Run:');
  for (const port of esp32) {
    console.log(`  agent-traffic-light-monitor device push --port ${port.path}`);
  }
}

export async function devicePushCommand(options: DeviceOptions): Promise<void> {
  const devicePath = await resolveDevicePath(options);
  const port = await openDevice(devicePath);
  try {
    const status = await readStatus();
    await pushStatus(port, status);
    console.log(`Pushed ${status.status} (${status.event}) to ${devicePath}.`);
  } finally {
    await new Promise<void>((resolve) => port.close(() => resolve()));
  }
}

export async function deviceWatchCommand(options: DeviceOptions): Promise<void> {
  const devicePath = await resolveDevicePath(options);
  const port: SerialPort = await openDevice(devicePath);

  console.log(`Streaming status to ${devicePath}. Press Ctrl+C to stop.`);

  const watcher = await watchStatus(async (status: PulseStatus) => {
    await pushStatus(port, status);
  });

  await new Promise<void>((resolve) => {
    process.on('SIGINT', () => resolve());
  });

  await watcher.close();
  await new Promise<void>((resolve) => port.close(() => resolve()));
}
