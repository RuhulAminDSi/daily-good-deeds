import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
  },
  // SWC emits the decorator metadata Nest's dependency injection needs (esbuild does not).
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
