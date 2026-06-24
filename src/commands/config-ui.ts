import { exec } from 'node:child_process';
import http from 'node:http';
import { ensureConfig, writeConfig } from '../core/config.js';
import type { PulseConfig } from '../types/config.js';

const DEFAULT_PORT = 4321;

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderConfigPage(config: PulseConfig, saved = false): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Agent Traffic Light Monitor Config</title>
  <style>
    :root { color-scheme: light dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { margin: 0; background: #0f172a; color: #e2e8f0; }
    main { max-width: 720px; margin: 48px auto; padding: 0 24px; }
    .card { background: #111827; border: 1px solid #334155; border-radius: 18px; padding: 28px; box-shadow: 0 20px 60px rgba(0,0,0,.35); }
    h1 { margin: 0 0 8px; font-size: 32px; }
    p { color: #94a3b8; line-height: 1.6; }
    label { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 16px 0; border-top: 1px solid #1f2937; }
    label:first-of-type { border-top: 0; }
    .label-text { display: grid; gap: 4px; }
    .label-text strong { color: #f8fafc; }
    .label-text span { color: #94a3b8; font-size: 14px; }
    input[type="checkbox"] { width: 22px; height: 22px; accent-color: #22c55e; }
    input[type="number"], input[type="text"] { width: 260px; max-width: 50vw; padding: 10px 12px; border-radius: 10px; border: 1px solid #334155; background: #020617; color: #e2e8f0; }
    button { margin-top: 24px; width: 100%; border: 0; border-radius: 12px; padding: 14px 18px; background: #22c55e; color: #052e16; font-weight: 700; cursor: pointer; }
    button:hover { background: #16a34a; }
    .saved { margin: 0 0 18px; padding: 12px 14px; border-radius: 12px; background: rgba(34,197,94,.15); color: #86efac; border: 1px solid rgba(34,197,94,.35); }
    .hint { margin-top: 18px; font-size: 13px; }
  </style>
</head>
<body>
  <main>
    <div class="card">
      <h1>Agent Traffic Light Monitor Config</h1>
      <p>Configure local notifications and stuck detection for this project.</p>
      ${saved ? '<div class="saved">Saved. You can close this tab or keep adjusting.</div>' : ''}
      <form method="post" action="/config">
        <label>
          <span class="label-text"><strong>Desktop notifications</strong><span>Enable all local desktop notifications.</span></span>
          <input type="checkbox" name="desktopNotifications" ${config.desktopNotifications ? 'checked' : ''} />
        </label>
        <label>
          <span class="label-text"><strong>Notify on complete</strong><span>Show a notification when Claude finishes.</span></span>
          <input type="checkbox" name="notifyOnComplete" ${config.notifyOnComplete ? 'checked' : ''} />
        </label>
        <label>
          <span class="label-text"><strong>Notify on error</strong><span>Show a notification when Claude needs attention or fails.</span></span>
          <input type="checkbox" name="notifyOnError" ${config.notifyOnError ? 'checked' : ''} />
        </label>
        <label>
          <span class="label-text"><strong>Notify on stuck</strong><span>Show a notification when yellow state lasts too long.</span></span>
          <input type="checkbox" name="notifyOnStuck" ${config.notifyOnStuck ? 'checked' : ''} />
        </label>
        <label>
          <span class="label-text"><strong>Stuck after minutes</strong><span>How long yellow can run before it is considered stuck.</span></span>
          <input type="number" min="1" max="120" name="stuckAfterMinutes" value="${config.stuckAfterMinutes}" />
        </label>
        <label>
          <span class="label-text"><strong>Slack webhook</strong><span>Reserved for future Slack notifications.</span></span>
          <input type="text" name="slackWebhookUrl" value="${escapeHtml(config.slackWebhookUrl ?? '')}" placeholder="https://hooks.slack.com/..." />
        </label>
        <button type="submit">Save configuration</button>
      </form>
      <p class="hint">This page only writes .agent-pulse/config.json in the current project.</p>
    </div>
  </main>
</body>
</html>`;
}

function parseFormBody(body: string, current: PulseConfig): PulseConfig {
  const params = new URLSearchParams(body);
  const stuckAfterMinutes = Number.parseInt(params.get('stuckAfterMinutes') ?? '', 10);
  const slackWebhookUrl = params.get('slackWebhookUrl')?.trim() || null;

  return {
    ...current,
    desktopNotifications: params.has('desktopNotifications'),
    notifyOnComplete: params.has('notifyOnComplete'),
    notifyOnError: params.has('notifyOnError'),
    notifyOnStuck: params.has('notifyOnStuck'),
    stuckAfterMinutes: Number.isFinite(stuckAfterMinutes) && stuckAfterMinutes > 0 ? stuckAfterMinutes : current.stuckAfterMinutes,
    slackWebhookUrl,
  };
}

function readRequestBody(request: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

function openBrowser(url: string): void {
  const command = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
  exec(command, () => undefined);
}

export async function configUiCommand(port = DEFAULT_PORT): Promise<void> {
  await ensureConfig();

  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', `http://localhost:${port}`);

      if (request.method === 'POST' && url.pathname === '/config') {
        const current = await ensureConfig();
        const body = await readRequestBody(request);
        const nextConfig = parseFormBody(body, current);
        await writeConfig(nextConfig);
        response.writeHead(303, { Location: '/?saved=1' });
        response.end();
        return;
      }

      if (request.method === 'GET' && url.pathname === '/') {
        const config = await ensureConfig();
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(renderConfigPage(config, url.searchParams.get('saved') === '1'));
        return;
      }

      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    } catch (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(error instanceof Error ? error.message : 'Unknown error');
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(port, '127.0.0.1', resolve);
  });

  const url = `http://127.0.0.1:${port}`;
  console.log(`Agent Traffic Light Monitor config UI is running at ${url}`);
  console.log('Press Ctrl+C to stop.');
  openBrowser(url);
}
