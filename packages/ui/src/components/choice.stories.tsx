import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { BN, BN_DARK, DARK, t } from '../stories';
import { Checkbox, Switch } from './choice';

const copy = {
  neighbour: { en: 'Help a neighbour', bn: 'প্রতিবেশীকে সাহায্য করুন' },
  quran: { en: 'Read 1 page of Quran', bn: 'কুরআনের ১ পৃষ্ঠা পড়ুন' },
  unavailable: { en: 'Unavailable', bn: 'উপলভ্য নয়' },
  reminders: { en: 'Daily reminders', bn: 'দৈনিক রিমাইন্ডার' },
  ai: { en: 'AI suggestions', bn: 'এআই পরামর্শ' },
};

const meta = { title: 'Primitives/Checkbox & Switch', component: Checkbox } satisfies Meta<
  typeof Checkbox
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: '' },
  render: (_args, { globals }) => (
    <div className="flex flex-col gap-2">
      <Checkbox label={t(globals, copy.neighbour)} />
      <Checkbox defaultChecked label={t(globals, copy.quran)} />
      <Checkbox disabled label={t(globals, copy.unavailable)} />
      <Switch label={t(globals, copy.reminders)} />
      <Switch defaultChecked label={t(globals, copy.ai)} />
    </div>
  ),
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const deed = canvas.getByRole('checkbox', {
      name: t(globals, copy.neighbour),
    });
    // The whole label is the tap target.
    await userEvent.click(canvas.getByText(t(globals, copy.neighbour)));
    await expect(deed).toBeChecked();
    // Space toggles from the keyboard.
    deed.focus();
    await userEvent.keyboard(' ');
    await expect(deed).not.toBeChecked();
    await expect(
      canvas.getByRole('checkbox', { name: t(globals, copy.unavailable) }),
    ).toBeDisabled();

    const reminders = canvas.getByRole('switch', {
      name: t(globals, copy.reminders),
    });
    reminders.focus();
    await userEvent.keyboard(' ');
    await expect(reminders).toBeChecked();
  },
};
export const Bengali: Story = { ...Default, globals: BN };
export const Dark: Story = { ...Default, globals: DARK };
export const BengaliDark: Story = { ...Default, globals: BN_DARK };
