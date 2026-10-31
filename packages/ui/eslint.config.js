import { defineConfig } from 'eslint/config';
import base from '@dgd/config/eslint';
import tokens from '@dgd/config/eslint/tokens';

export default defineConfig(base, tokens, { ignores: ['storybook-static/**'] });
