import chalk from 'chalk';
import type { PulseStatus } from '../types/status.js';
import { formatDuration, formatRelativeTime } from './format-time.js';

export function statusIcon(status: PulseStatus['status']): string {
  if (status === 'green') return '🟢';
  if (status === 'yellow') return '🟡';
  return '🔴';
}

export function renderStatus(status: PulseStatus, options: { stuckAfterMinutes?: number } = {}): string {
  const icon = statusIcon(status.status);
  const label = status.status === 'green' ? chalk.green('idle') : status.status === 'yellow' ? chalk.yellow('running') : chalk.red('needs attention');
  const duration = status.status === 'yellow' ? ` · ${formatDuration(status.startedAt)}` : '';
  const isStuck = status.status === 'yellow' && options.stuckAfterMinutes !== undefined && Date.now() - new Date(status.startedAt).getTime() >= options.stuckAfterMinutes * 60 * 1000;
  const stuck = isStuck ? chalk.yellow(' · maybe stuck') : '';
  const detail = status.detail ? `\nDetail: ${status.detail}` : '';

  return `${icon} ${chalk.bold('Claude Code')} ${label}\n${status.message}${duration}${stuck}\nUpdated: ${formatRelativeTime(status.updatedAt)}${detail}`;
}
