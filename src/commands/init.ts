import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { ensureConfig, writeConfig } from '../core/config.js';
import { appendEvent } from '../core/events.js';
import { getEventsPath, getPulseDir, getStatusPath } from '../core/paths.js';
import { createInitialStatus, writeStatus } from '../core/status.js';
import { installClaudeCodeIntegration } from '../integrations/claude-code.js';
import { promptForInitConfig } from '../ui/prompts.js';

export async function initCommand(): Promise<void> {
  const pulseDir = getPulseDir();
  await mkdir(pulseDir, { recursive: true });

  if (!existsSync(getStatusPath())) {
    await writeStatus(createInitialStatus());
  }

  if (!existsSync(getEventsPath())) {
    await writeFile(getEventsPath(), '', 'utf8');
  }

  const config = await ensureConfig();
  const selectedConfig = await promptForInitConfig(config);
  await writeConfig(selectedConfig);

  await appendEvent({
    timestamp: new Date().toISOString(),
    status: 'green',
    event: 'initialized',
    message: 'Agent Traffic Light Monitor initialized',
  });

  const claudeSettingsPath = await installClaudeCodeIntegration();

  console.log('Agent Traffic Light Monitor initialized.');
  console.log('');
  console.log('Created:');
  console.log('- .agent-pulse/config.json');
  console.log('- .agent-pulse/status.json');
  console.log('- .agent-pulse/events.jsonl');
  console.log(`- ${claudeSettingsPath}`);
  console.log('');
  console.log('Next:');
  console.log('Run agent-traffic-light-monitor watch in another terminal, then use Claude Code in this project.');
}
