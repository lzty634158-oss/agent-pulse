import { readEvents } from '../core/events.js';
import { statusIcon } from '../ui/render-status.js';

export async function historyCommand(limit = 20): Promise<void> {
  const events = await readEvents();
  const recentEvents = events.slice(-limit);

  if (recentEvents.length === 0) {
    console.log('No Agent Traffic Light Monitor events yet.');
    return;
  }

  for (const event of recentEvents) {
    const time = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const detail = event.detail ? ` · ${event.detail}` : '';
    console.log(`${time} ${statusIcon(event.status)} ${event.event}  ${event.message}${detail}`);
  }
}
