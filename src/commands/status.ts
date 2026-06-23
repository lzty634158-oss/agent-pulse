import { readStatus } from '../core/status.js';
import { renderStatus } from '../ui/render-status.js';

export async function statusCommand(): Promise<void> {
  const status = await readStatus();
  console.log(renderStatus(status));
}
