import notifier from 'node-notifier';
import type { PulseStatus } from '../types/status.js';

export function notifyStatus(status: PulseStatus): void {
  if (status.status === 'yellow') {
    return;
  }

  notifier.notify({
    title: 'Agent Pulse',
    message: status.status === 'green' ? 'Claude Code finished. Ready to review.' : status.message,
    wait: false,
  });
}

export function notifyStuck(status: PulseStatus, minutes: number): void {
  notifier.notify({
    title: 'Agent Pulse',
    message: `${status.message} has been running for more than ${minutes} minutes.`,
    wait: false,
  });
}
