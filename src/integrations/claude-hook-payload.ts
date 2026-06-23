type JsonObject = Record<string, unknown>;

export interface ParsedHookPayload {
  toolName?: string;
  command?: string;
  filePath?: string;
  notification?: string;
  notificationTitle?: string;
  notificationType?: string;
  error?: string;
  lastAssistantMessage?: string;
  rawDetail?: string;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringField(object: JsonObject, key: string): string | undefined {
  const value = object[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function booleanField(object: JsonObject, key: string): boolean | undefined {
  const value = object[key];
  return typeof value === 'boolean' ? value : undefined;
}

function nestedObject(object: JsonObject, key: string): JsonObject | undefined {
  const value = object[key];
  return isObject(value) ? value : undefined;
}

function firstString(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value !== undefined && value.trim().length > 0);
}

export function parseClaudeHookPayload(payload: unknown): ParsedHookPayload {
  if (!isObject(payload)) {
    return {};
  }

  const toolInput = nestedObject(payload, 'tool_input') ?? nestedObject(payload, 'toolInput') ?? nestedObject(payload, 'input');
  const toolResponse = nestedObject(payload, 'tool_response') ?? nestedObject(payload, 'toolResponse') ?? nestedObject(payload, 'response');
  const interrupted = toolResponse ? booleanField(toolResponse, 'interrupted') : undefined;
  const stderr = toolResponse ? stringField(toolResponse, 'stderr') : undefined;

  return {
    toolName: stringField(payload, 'tool_name') ?? stringField(payload, 'toolName') ?? stringField(payload, 'tool'),
    command: toolInput ? stringField(toolInput, 'command') : undefined,
    filePath: toolInput ? stringField(toolInput, 'file_path') ?? stringField(toolInput, 'filePath') : undefined,
    notification: stringField(payload, 'message') ?? stringField(payload, 'notification'),
    notificationTitle: stringField(payload, 'title'),
    notificationType: stringField(payload, 'notification_type') ?? stringField(payload, 'notificationType'),
    error: firstString(stringField(payload, 'error'), stderr, toolResponse ? stringField(toolResponse, 'error') : undefined, toolResponse ? stringField(toolResponse, 'message') : undefined, interrupted ? 'Tool was interrupted' : undefined),
    lastAssistantMessage: stringField(payload, 'last_assistant_message') ?? stringField(payload, 'lastAssistantMessage'),
    rawDetail: stringField(payload, 'detail'),
  };
}

export function buildHookDetail(parsed: ParsedHookPayload, fallback?: string): string | undefined {
  if (parsed.command && parsed.toolName) {
    return `${parsed.toolName}: ${parsed.command}`;
  }

  if (parsed.filePath && parsed.toolName) {
    return `${parsed.toolName}: ${parsed.filePath}`;
  }

  if (parsed.command) {
    return parsed.command;
  }

  if (parsed.filePath) {
    return parsed.filePath;
  }

  if (parsed.notificationTitle && parsed.notification) {
    return `${parsed.notificationTitle}: ${parsed.notification}`;
  }

  if (parsed.notificationType && parsed.notification) {
    return `${parsed.notificationType}: ${parsed.notification}`;
  }

  if (parsed.toolName) {
    return parsed.toolName;
  }

  return parsed.error ?? parsed.notification ?? parsed.lastAssistantMessage ?? parsed.rawDetail ?? fallback;
}

export function buildHookMessage(event: string, parsed: ParsedHookPayload): string {
  const tool = parsed.toolName ?? 'tool';

  if (event === 'pre-tool-use') {
    if (parsed.command) return `Running ${parsed.command}`;
    if (parsed.filePath) return `${tool} ${parsed.filePath}`;
    return `Using ${tool}`;
  }

  if (event === 'post-tool-use') {
    if (parsed.error) return `${tool} failed`;
    if (parsed.command) return `Finished ${parsed.command}`;
    if (parsed.filePath) return `Finished ${tool} ${parsed.filePath}`;
    return `Finished ${tool}`;
  }

  if (event === 'notification') {
    return parsed.notificationTitle ?? parsed.notification ?? 'Claude Code needs attention';
  }

  if (event === 'error') {
    return parsed.error ?? 'Claude Code hit an error';
  }

  if (event === 'stop') {
    return 'Claude Code stopped. Ready to review.';
  }

  return 'Claude Code status updated';
}
