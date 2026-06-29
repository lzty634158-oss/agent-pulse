import chokidar from 'chokidar';
import { readStatus } from './status.js';
import { getStatusPath } from './paths.js';
import type { PulseStatus } from '../types/status.js';

export interface StatusWatcher {
  close(): Promise<void>;
}

/**
 * Watch `.agent-pulse/status.json` for changes and call `handler` with the
 * latest status on each update. Dedups by `updatedAt`, so multiple file events
 * for the same logical change collapse into one handler call.
 *
 * The handler is called once with the initial state on startup, then again
 * every time the file's `updatedAt` advances. Handler errors are caught and
 * printed to stderr — they do not kill the watcher.
 */
export async function watchStatus(
  handler: (status: PulseStatus) => Promise<void>,
): Promise<StatusWatcher> {
  let lastUpdatedAt: string | undefined;
  let closed = false;

  const dispatch = async (): Promise<void> => {
    if (closed) return;
    try {
      const status = await readStatus();
      if (status.updatedAt === lastUpdatedAt) return;
      lastUpdatedAt = status.updatedAt;
      await handler(status);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  };

  await dispatch();

  const watcher = chokidar.watch(getStatusPath(), { ignoreInitial: true });
  watcher.on('change', () => {
    void dispatch();
  });

  return {
    async close(): Promise<void> {
      closed = true;
      await watcher.close();
    },
  };
}
