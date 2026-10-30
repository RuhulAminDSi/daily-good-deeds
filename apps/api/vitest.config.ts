import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// Integration tests use a dedicated database: CI sets TEST_DATABASE_URL/TEST_DIRECT_URL,
// locally they come from apps/api/.env.test (git-ignored). Never the dev database.
const local = existsSync('.env.test') ? parseEnv(readFileSync('.env.test', 'utf8')) : {};

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    env: {
      TEST_DATABASE_URL: process.env.TEST_DATABASE_URL ?? local.DATABASE_URL ?? '',
      TEST_DIRECT_URL: process.env.TEST_DIRECT_URL ?? local.DIRECT_URL ?? '',
    },
  },
  // SWC emits the decorator metadata Nest's dependency injection needs (esbuild does not).
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
