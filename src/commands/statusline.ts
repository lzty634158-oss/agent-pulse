import { readStatus } from '../core/status.js';
import { formatDuration } from '../ui/format-time.js';
import { statusIcon } from '../ui/render-status.js';

export async function statuslineCommand(): Promise<void> {
  const status = await readStatus();
  const duration = status.status === 'yellow' ? ` ${formatDuration(status.startedAt)}` : '';
  const message = status.message.length > 40 ? `${status.message.slice(0, 37)}...` : status.message;
  process.stdout.write(`${statusIcon(status.status)} ${message}${duration}`);
}
