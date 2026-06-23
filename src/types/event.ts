import type { AgentStatus } from './status.js';

export interface PulseEvent {
  timestamp: string;
  status: AgentStatus;
  event: string;
  message: string;
  detail?: string;
}
