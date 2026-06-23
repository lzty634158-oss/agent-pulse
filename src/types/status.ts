export type AgentStatus = 'green' | 'yellow' | 'red';

export interface PulseStatus {
  status: AgentStatus;
  agent: string;
  event: string;
  message: string;
  detail?: string;
  startedAt: string;
  updatedAt: string;
}
