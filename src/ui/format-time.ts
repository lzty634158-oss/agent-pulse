export function formatRelativeTime(dateIso: string, now = new Date()): string {
  const date = new Date(dateIso);
  const seconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function formatDuration(startIso: string, now = new Date()): string {
  const start = new Date(startIso);
  const totalSeconds = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}
