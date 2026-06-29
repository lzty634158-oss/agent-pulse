import { EventEmitter } from 'node:events';
import type { PulseStatus } from '../types/status.js';

export interface StatusChangeEvent {
  status: PulseStatus;
  previous?: PulseStatus;
}

class StatusEvents extends EventEmitter {}

export const statusEvents = new StatusEvents();
