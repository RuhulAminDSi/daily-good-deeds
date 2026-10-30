// ESLint preset for Node.js code (API, worker, tooling).
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import base from './base.js';

export default defineConfig(base, {
  languageOptions: { globals: globals.node },
  rules: { 'no-console': 'off' },
});
