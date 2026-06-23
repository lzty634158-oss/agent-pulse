import path from 'node:path';

export function getPulseDir(cwd = process.cwd()): string {
  return path.join(cwd, '.agent-pulse');
}

export function getStatusPath(cwd = process.cwd()): string {
  return path.join(getPulseDir(cwd), 'status.json');
}

export function getEventsPath(cwd = process.cwd()): string {
  return path.join(getPulseDir(cwd), 'events.jsonl');
}

export function getConfigPath(cwd = process.cwd()): string {
  return path.join(getPulseDir(cwd), 'config.json');
}
