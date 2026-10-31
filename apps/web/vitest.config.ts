import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests for pure web modules (src/**/*.spec.ts); pages and components are covered by e2e/.
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { globals: true, include: ['src/**/*.spec.ts'] },
});
