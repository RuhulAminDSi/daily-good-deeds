import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { BN, BN_DARK, DARK, t } from '../stories';
import { Button } from './button';
import { useToast } from './toast';

const copy = {
  region: { en: 'Notifications', bn: 'বিজ্ঞপ্তিসমূহ' },
  mark: { en: 'Mark done', bn: 'সম্পন্ন করুন' },
  done: { en: 'Done. May it bring goodness.', bn: 'সম্পন্ন। এটি কল্যাণ বয়ে আনুক।' },
  undo: { en: 'Undo', bn: 'আগের অবস্থায় ফেরান' },
  undoAlt: {
    en: 'Undo from the deed’s menu',
    bn: 'কাজের মেনু থেকে আগের অবস্থায় ফেরান',
  },
};

function Demo({ locale, onUndo }: { locale: 'en' | 'bn'; onUndo: () => void }) {
  const toast = useToast();
  const g = { locale };
  return (
    <Button
      onClick={() =>
        toast({
          title: t(g, copy.done),
          action: { label: t(g, copy.undo), altText: t(g, copy.undoAlt), onClick: onUndo },
        })
      }
    >
      {t(g, copy.mark)}
    </Button>
  );
}

const meta = {
  title: 'Layout/Toast',
  component: Demo,
  args: { locale: 'en', onUndo: fn() },
} satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithUndo: Story = {
  render: (args, { globals }) => <Demo {...args} locale={globals.locale === 'bn' ? 'bn' : 'en'} />,
  play: async ({ args, canvasElement, globals }) => {
    const trigger = within(canvasElement).getByRole('button', { name: t(globals, copy.mark) });
    await userEvent.click(trigger);
    // Toasts render in the labelled region; Radix announces them politely (type="background").
    const region = screen.getByRole('region', { name: new RegExp(t(globals, copy.region)) });
    await expect(await within(region).findByText(t(globals, copy.done))).toBeVisible();
    // A toast never steals focus.
    await expect(trigger).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: t(globals, copy.undo) }));
    await expect(args.onUndo).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText(t(globals, copy.done))).not.toBeInTheDocument());
  },
};
export const WithUndoBengali: Story = { ...WithUndo, globals: BN };
export const WithUndoDark: Story = { ...WithUndo, globals: DARK };
export const WithUndoBengaliDark: Story = { ...WithUndo, globals: BN_DARK };
