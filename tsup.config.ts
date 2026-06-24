import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    splitting: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: false,
    splitting: false,
  },
]);
