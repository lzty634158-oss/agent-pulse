import { SerialPort } from 'serialport';
import type { PulseStatus } from '../types/status.js';

const DEFAULT_BAUD = 115200;

const ESP32_VENDOR_IDS: ReadonlySet<string> = new Set([
  '303A', // Espressif native USB (ESP32-S2/S3/C3 USB CDC, USB-Serial/JTAG)
  '1A86', // WCH CH340 / CH341 / CH343 / CH9102 — common on clone boards
  '10C4', // Silicon Labs CP2102 / CP2104
  '0403', // FTDI FT232 / FT2232
]);

export interface DiscoveredDevice {
  path: string;
  manufacturer?: string;
  productId?: string;
  vendorId?: string;
}

function normalizeVendorId(vendorId: string | undefined): string {
  return (vendorId ?? '').replace(/^0x/i, '').toUpperCase();
}

export function isLikelyEsp32Device(vendorId: string | undefined): boolean {
  return ESP32_VENDOR_IDS.has(normalizeVendorId(vendorId));
}

export async function listAllPorts(): Promise<DiscoveredDevice[]> {
  const ports = await SerialPort.list();
  return ports.map((port) => ({
    path: port.path,
    manufacturer: port.manufacturer,
    productId: port.productId,
    vendorId: port.vendorId,
  }));
}

export async function listDevices(): Promise<DiscoveredDevice[]> {
  const ports = await SerialPort.list();
  return ports
    .filter((port) => isLikelyEsp32Device(port.vendorId))
    .map((port) => ({
      path: port.path,
      manufacturer: port.manufacturer,
      productId: port.productId,
      vendorId: port.vendorId,
    }));
}

export async function findDevice(): Promise<DiscoveredDevice> {
  const devices = await listDevices();
  if (devices.length === 0) {
    throw new Error(
      'No ESP32 device found. Make sure it is plugged in via USB and the serial driver is installed.',
    );
  }
  if (devices.length > 1) {
    const paths = devices.map((d) => d.path).join(', ');
    throw new Error(
      `Multiple ESP32 devices found (${paths}). Re-run with --port <path> to choose one.`,
    );
  }
  return devices[0]!;
}

/**
 * Non-throwing variant of findDevice(). Returns null when no device is
 * detected so callers can degrade gracefully (e.g. `watch --device` falling
 * back to terminal-only output with a warning).
 */
export async function tryFindDevice(): Promise<DiscoveredDevice | null> {
  const devices = await listDevices();
  return devices[0] ?? null;
}

export async function openDevice(path: string, baudRate = DEFAULT_BAUD): Promise<SerialPort> {
  const port = new SerialPort({ path, baudRate, autoOpen: false });

  await new Promise<void>((resolve, reject) => {
    port.open((err) => (err ? reject(err) : resolve()));
  });

  // Give the ESP32 a moment to finish its USB-CDC reset handshake
  // before we send the first frame. CH340 clones in particular can take
  // 200-300ms before they're ready to receive data; the shorter 100ms
  // caused the first push after open to be silently dropped (LED didn't
  // change even though the CLI reported success).
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 300);
  });

  return port;
}

export async function pushStatus(port: SerialPort, status: PulseStatus): Promise<void> {
  // The firmware parser is line-based: it only acts on a '\n'.
  // The "\n" here is what makes the board light up.
  const line = `${JSON.stringify(status)}\n`;
  await new Promise<void>((resolve, reject) => {
    port.write(line, (err) => (err ? reject(err) : resolve()));
  });
  // Wait until the bytes are out of the OS buffer.
  // Without drain(), close() can race the last write.
  await new Promise<void>((resolve, reject) => {
    port.drain((err) => (err ? reject(err) : resolve()));
  });
  // drain() empties the kernel buffer, but the USB bridge (CH340 / CP210x /
  // FTDI) may still be holding the bytes for physical transmission. Without
  // this, the close() that follows in `device push` can race the last frame
  // and the firmware never sees the message.
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 200);
  });
}
