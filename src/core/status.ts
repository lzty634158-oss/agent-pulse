import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { PulseStatus } from '../types/status.js';
import { getStatusPath } from './paths.js';

export function createInitialStatus(): PulseStatus {
  const now = new Date().toISOString();
  return {
    status: 'green',
    agent: 'claude-code',
    event: 'initialized',
    message: 'Agent Traffic Light Monitor initialized',
    startedAt: now,
    updatedAt: now,
  };
}

export async function readStatus(cwd = process.cwd()): Promise<PulseStatus> {
  const raw = await readFile(getStatusPath(cwd), 'utf8');
  return JSON.parse(raw) as PulseStatus;
}

export async function writeStatus(status: PulseStatus, cwd = process.cwd()): Promise<void> {
  const statusPath = getStatusPath(cwd);
  const tempPath = path.join(path.dirname(statusPath), `.status.${process.pid}.tmp`);
  await writeFile(tempPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  await rename(tempPath, statusPath);
}
