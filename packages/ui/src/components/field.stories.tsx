import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { BN, BN_DARK, DARK, t } from '../stories';
import { Field, Input, Textarea } from './field';

const meta = { title: 'Primitives/Field', component: Field } satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: '', children: null },
  render: (_args, { globals }) => (
    <div className="flex max-w-sm flex-col gap-6">
      <Field
        label={t(globals, { en: 'Deed title', bn: 'কাজের শিরোনাম' })}
        hint={t(globals, { en: 'Up to 120 characters', bn: 'সর্বোচ্চ ১২০ অক্ষর' })}
        required
      >
        <Input
          placeholder={t(globals, { en: 'e.g. Help a neighbour', bn: 'যেমন: প্রতিবেশীকে সাহায্য' })}
        />
      </Field>
      <Field
        label={t(globals, { en: 'Email', bn: 'ইমেইল' })}
        error={t(globals, {
          en: 'Please enter an email address, like name@example.com.',
          bn: 'অনুগ্রহ করে একটি ইমেইল ঠিকানা লিখুন, যেমন name@example.com।',
        })}
      >
        <Input type="email" defaultValue="asha@" />
      </Field>
      <Field label={t(globals, { en: 'Note', bn: 'নোট' })}>
        <Textarea />
      </Field>
    </div>
  ),
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByRole('textbox', {
      name: new RegExp(t(globals, { en: 'Deed title', bn: 'কাজের শিরোনাম' })),
    });
    // Label, hint and required state are wired to the control.
    await expect(title).toBeRequired();
    await expect(title).toHaveAccessibleDescription(
      t(globals, { en: 'Up to 120 characters', bn: 'সর্বোচ্চ ১২০ অক্ষর' }),
    );
    await userEvent.click(canvas.getByText(t(globals, { en: 'Deed title', bn: 'কাজের শিরোনাম' })));
    await expect(title).toHaveFocus();
    await userEvent.keyboard('Feed a bird');
    await expect(title).toHaveValue('Feed a bird');
    // The error is announced with the field and marks it invalid.
    const email = canvas.getByRole('textbox', { name: t(globals, { en: 'Email', bn: 'ইমেইল' }) });
    await expect(email).toBeInvalid();
    await expect(email).toHaveAccessibleDescription(/name@example\.com/);
  },
};
export const Bengali: Story = { ...Default, globals: BN };
export const Dark: Story = { ...Default, globals: DARK };
export const BengaliDark: Story = { ...Default, globals: BN_DARK };
