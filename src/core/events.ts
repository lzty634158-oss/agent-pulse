import { appendFile, readFile } from 'node:fs/promises';
import type { PulseEvent } from '../types/event.js';
import { getEventsPath } from './paths.js';

export async function appendEvent(event: PulseEvent, cwd = process.cwd()): Promise<void> {
  await appendFile(getEventsPath(cwd), `${JSON.stringify(event)}\n`, 'utf8');
}

export async function readEvents(cwd = process.cwd()): Promise<PulseEvent[]> {
  const raw = await readFile(getEventsPath(cwd), 'utf8');
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as PulseEvent);
}
