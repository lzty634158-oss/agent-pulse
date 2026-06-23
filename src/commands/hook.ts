import { readStdinJson } from '../core/stdin.js';
import { updateStatus } from '../core/update-status.js';
import { buildHookDetail, buildHookMessage, parseClaudeHookPayload } from '../integrations/claude-hook-payload.js';
import type { AgentStatus } from '../types/status.js';

interface HookMapping {
  status: AgentStatus;
  message: string;
}

const hookMappings: Record<string, HookMapping> = {
  'session-start': { status: 'green', message: 'Claude Code session started' },
  'pre-tool-use': { status: 'yellow', message: 'Claude Code is using a tool' },
  'post-tool-use': { status: 'yellow', message: 'Claude Code finished a tool call' },
  stop: { status: 'green', message: 'Claude Code stopped. Ready to review.' },
  notification: { status: 'red', message: 'Claude Code needs attention' },
  error: { status: 'red', message: 'Claude Code hit an error' },
};

export async function hookCommand(event: string, detail?: string): Promise<void> {
  const normalizedEvent = event.toLowerCase();
  const mapping = hookMappings[normalizedEvent];

  if (!mapping) {
    throw new Error(`Unknown hook event: ${event}`);
  }

  const payload = await readStdinJson();
  const parsedPayload = parseClaudeHookPayload(payload);
  const message = buildHookMessage(normalizedEvent, parsedPayload) || mapping.message;
  const resolvedDetail = buildHookDetail(parsedPayload, detail);
  const status = normalizedEvent === 'post-tool-use' && parsedPayload.error ? 'red' : mapping.status;

  await updateStatus({
    status,
    event: normalizedEvent,
    message,
    detail: resolvedDetail,
  });
}
