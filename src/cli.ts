import { Command } from 'commander';
import { configSetCommand, configShowCommand, listConfigKeys } from './commands/config.js';
import { configUiCommand } from './commands/config-ui.js';
import { doctorCommand } from './commands/doctor.js';
import { historyCommand } from './commands/history.js';
import { hookCommand } from './commands/hook.js';
import { initCommand } from './commands/init.js';
import { statusCommand } from './commands/status.js';
import { statuslineCommand } from './commands/statusline.js';
import { watchCommand } from './commands/watch.js';
import { VERSION } from './version.js';

const program = new Command();

program
  .name('agent-traffic-light-monitor')
  .description('A status light and alerting layer for Claude Code and AI coding agents.')
  .version(VERSION);

program
  .command('init')
  .description('Initialize Agent Traffic Light Monitor in the current project')
  .action(async () => {
    await initCommand();
  });

program
  .command('status')
  .description('Show the current Claude Code status')
  .action(async () => {
    await statusCommand();
  });

program
  .command('history')
  .description('Show recent Agent Traffic Light Monitor events')
  .option('-n, --limit <number>', 'number of events to show', '20')
  .action(async (options: { limit: string }) => {
    await historyCommand(Number.parseInt(options.limit, 10));
  });

program
  .command('watch')
  .description('Watch the current Claude Code status')
  .action(async () => {
    await watchCommand();
  });

program
  .command('statusline')
  .description('Print a compact status line for Claude Code')
  .action(async () => {
    await statuslineCommand();
  });

program
  .command('hook <event>')
  .description('Record a Claude Code hook event')
  .option('-d, --detail <detail>', 'event detail')
  .action(async (event: string, options: { detail?: string }) => {
    await hookCommand(event, options.detail);
  });

program
  .command('config-ui')
  .description('Open the local Agent Traffic Light Monitor configuration UI')
  .option('-p, --port <number>', 'port to run the config UI on', '4321')
  .action(async (options: { port: string }) => {
    await configUiCommand(Number.parseInt(options.port, 10));
  });

const configCommand = program
  .command('config')
  .description(`Manage Agent Traffic Light Monitor config. Keys: ${listConfigKeys().join(', ')}`);

configCommand
  .command('show [key]')
  .description('Show all config or one config value')
  .action(async (key?: string) => {
    await configShowCommand(key);
  });

configCommand
  .command('set <key> <value>')
  .description('Set a config value')
  .action(async (key: string, value: string) => {
    await configSetCommand(key, value);
  });

program
  .command('doctor')
  .description('Check Agent Traffic Light Monitor and Claude Code integration setup')
  .action(async () => {
    await doctorCommand();
  });

program.parseAsync().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
