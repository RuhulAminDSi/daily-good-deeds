import { defineConfig } from 'eslint/config';
import base from '@dgd/config/eslint';
import ui from '@dgd/config/eslint/ui';

export default defineConfig(base, ui, { ignores: ['storybook-static/**'] });
