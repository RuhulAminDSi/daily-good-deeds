// ESLint preset for NestJS packages (API, worker).
import { defineConfig } from 'eslint/config';
import node from './node.js';

export default defineConfig(node, {
  // Nest DI reads constructor parameter types from decorator metadata, so those imports must stay
  // value imports; this makes consistent-type-imports aware of it (mirrors the tsconfig flags).
  languageOptions: { parserOptions: { emitDecoratorMetadata: true, experimentalDecorators: true } },
});
