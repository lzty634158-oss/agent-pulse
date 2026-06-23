import { readFile, writeFile } from 'node:fs/promises';
import type { PulseStatus } from '../types/status.js';
import { getStatusPath } from './paths.js';

export function createInitialStatus(): PulseStatus {
  const now = new Date().toISOString();
  return {
    status: 'green',
    agent: 'claude-code',
    event: 'initialized',
    message: 'Agent Pulse initialized',
    startedAt: now,
    updatedAt: now,
  };
}

export async function readStatus(cwd = process.cwd()): Promise<PulseStatus> {
  const raw = await readFile(getStatusPath(cwd), 'utf8');
  return JSON.parse(raw) as PulseStatus;
}

export async function writeStatus(status: PulseStatus, cwd = process.cwd()): Promise<void> {
  await writeFile(getStatusPath(cwd), `${JSON.stringify(status, null, 2)}\n`, 'utf8');
}
