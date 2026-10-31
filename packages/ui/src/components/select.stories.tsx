import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, within } from 'storybook/test';
import { BN, BN_DARK, DARK, t } from '../stories';
import { Field } from './field';
import { Select } from './select';

const copy = {
  category: { en: 'Category', bn: 'বিভাগ' },
  family: { en: 'Family & Relationships', bn: 'পরিবার ও সম্পর্ক' },
};

const meta = {
  title: 'Primitives/Select',
  component: Select,
  args: { options: [], onValueChange: fn() },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args, { globals }) => (
    <Field className="max-w-xs" label={t(globals, copy.category)}>
      <Select
        {...args}
        placeholder={t(globals, { en: 'Choose a category', bn: 'একটি বিভাগ বেছে নিন' })}
        options={[
          {
            value: 'spiritual',
            label: t(globals, { en: 'Spiritual Growth', bn: 'আধ্যাত্মিক উন্নতি' }),
          },
          {
            value: 'family',
            label: t(globals, copy.family),
          },
          {
            value: 'health',
            label: t(globals, { en: 'Health & Fitness', bn: 'স্বাস্থ্য ও ফিটনেস' }),
          },
        ]}
      />
    </Field>
  ),
  play: async ({ args, canvasElement, globals }) => {
    const trigger = within(canvasElement).getByRole('combobox', {
      name: t(globals, copy.category),
    });
    // Keyboard only: open with the arrow key, move, choose with Enter.
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(await screen.findByRole('listbox')).toBeVisible();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onValueChange).toHaveBeenCalledWith('family');
    await expect(trigger).toHaveTextContent(t(globals, copy.family));
    await expect(trigger).toHaveFocus();
  },
};
export const Bengali: Story = { ...Default, globals: BN };
export const Dark: Story = { ...Default, globals: DARK };
export const BengaliDark: Story = { ...Default, globals: BN_DARK };
