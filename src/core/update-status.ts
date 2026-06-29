import type { PulseEvent } from '../types/event.js';
import type { AgentStatus, PulseStatus } from '../types/status.js';
import { appendEvent } from './events.js';
import { statusEvents } from './status-events.js';
import { readStatus, writeStatus } from './status.js';

interface StatusUpdateInput {
  status: AgentStatus;
  event: string;
  message: string;
  detail?: string;
}

export async function updateStatus(input: StatusUpdateInput, cwd = process.cwd()): Promise<PulseStatus> {
  const now = new Date().toISOString();
  const previous = await readStatus(cwd).catch(() => undefined);
  const startedAt = previous?.status === input.status && previous.event === input.event && previous.detail === input.detail ? previous.startedAt : now;

  const nextStatus: PulseStatus = {
    status: input.status,
    agent: previous?.agent ?? 'claude-code',
    event: input.event,
    message: input.message,
    detail: input.detail,
    startedAt,
    updatedAt: now,
  };

  await writeStatus(nextStatus, cwd);

  const event: PulseEvent = {
    timestamp: now,
    status: input.status,
    event: input.event,
    message: input.message,
    detail: input.detail,
  };
  await appendEvent(event, cwd);

  statusEvents.emit('status-change', { status: nextStatus, previous });

  return nextStatus;
}
