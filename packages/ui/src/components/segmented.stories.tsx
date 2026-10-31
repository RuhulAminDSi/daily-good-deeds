import type { Meta, StoryObj } from '@storybook/react-vite';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { BN, BN_DARK, DARK, t } from '../stories';
import { SegmentedControl } from './segmented';

const copy = {
  theme: { en: 'Theme', bn: 'থিম' },
  light: { en: 'Light', bn: 'লাইট' },
  dark: { en: 'Dark', bn: 'ডার্ক' },
  system: { en: 'System', bn: 'সিস্টেম' },
  day: { en: 'Day', bn: 'দিন' },
  week: { en: 'Week', bn: 'সপ্তাহ' },
  month: { en: 'Month', bn: 'মাস' },
  view: { en: 'Calendar view', bn: 'ক্যালেন্ডার ভিউ' },
};

function Demo({ locale }: { locale: 'en' | 'bn' }) {
  const g = { locale };
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  return (
    <div className="flex flex-col items-start gap-4">
      <SegmentedControl
        label={t(g, copy.theme)}
        iconOnly
        value={theme}
        onValueChange={setTheme}
        options={[
          { value: 'light', label: t(g, copy.light), icon: <Sun className="size-4" /> },
          { value: 'dark', label: t(g, copy.dark), icon: <Moon className="size-4" /> },
          { value: 'system', label: t(g, copy.system), icon: <Monitor className="size-4" /> },
        ]}
      />
      <SegmentedControl
        label={t(g, copy.view)}
        value={view}
        onValueChange={setView}
        options={(['day', 'week', 'month'] as const).map((v) => ({
          value: v,
          label: t(g, copy[v]),
        }))}
      />
    </div>
  );
}

const meta = {
  title: 'Primitives/SegmentedControl',
  component: Demo,
  args: { locale: 'en' },
} satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_args, { globals }) => <Demo locale={globals.locale === 'bn' ? 'bn' : 'en'} />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const theme = canvas.getByRole('radiogroup', { name: t(globals, copy.theme) });
    const system = within(theme).getByRole('radio', { name: t(globals, copy.system) });
    await expect(system).toBeChecked();
    // Keyboard: focus the selected option, arrows move, Space selects.
    await userEvent.click(system);
    await userEvent.keyboard('{ArrowLeft}');
    const dark = within(theme).getByRole('radio', { name: t(globals, copy.dark) });
    await expect(dark).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(dark).toBeChecked();
    await expect(system).not.toBeChecked();
    // Pressing the selected option again keeps it selected.
    await userEvent.click(dark);
    await expect(dark).toBeChecked();
    await expect(canvas.getByRole('radio', { name: t(globals, copy.week) })).toBeChecked();
  },
};
export const Bengali: Story = { ...Default, globals: BN };
export const Dark: Story = { ...Default, globals: DARK };
export const BengaliDark: Story = { ...Default, globals: BN_DARK };
