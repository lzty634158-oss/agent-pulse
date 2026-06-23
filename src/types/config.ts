export interface PulseConfig {
  stuckAfterMinutes: number;
  desktopNotifications: boolean;
  notifyOnComplete: boolean;
  notifyOnError: boolean;
  notifyOnStuck: boolean;
  slackWebhookUrl: string | null;
  agent: string;
}
