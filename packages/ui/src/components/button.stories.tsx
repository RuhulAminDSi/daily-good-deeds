import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, Trash2 } from 'lucide-react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { BN, BN_DARK, DARK, t } from '../stories';
import { Button, IconButton } from './button';

const deleteDeed = { en: 'Delete deed', bn: 'কাজটি মুছুন' };

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: (args, { globals }) => (
    <div className="flex max-w-md flex-wrap items-center gap-3">
      <Button {...args}>{t(globals, { en: 'Save deed', bn: 'কাজটি সংরক্ষণ করুন' })}</Button>
      <Button {...args} variant="secondary">
        {t(globals, { en: 'Cancel', bn: 'বাতিল' })}
      </Button>
      <Button {...args} variant="ghost">
        <Plus aria-hidden className="size-4" />
        {t(globals, { en: 'Add', bn: 'যোগ করুন' })}
      </Button>
      <Button {...args} variant="danger">
        {t(globals, { en: 'Delete', bn: 'মুছে ফেলুন' })}
      </Button>
      <Button {...args} variant="link">
        {t(globals, { en: 'Learn more', bn: 'আরও জানুন' })}
      </Button>
      <Button {...args} size="sm">
        sm
      </Button>
      <Button {...args} size="lg">
        lg
      </Button>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const first = within(canvasElement).getAllByRole('button')[0]!;
    await userEvent.click(first);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    // Keyboard: Enter and Space activate a native button.
    first.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};
export const VariantsBengali: Story = { ...Variants, globals: BN };
export const VariantsDark: Story = { ...Variants, globals: DARK };
export const VariantsBengaliDark: Story = { ...Variants, globals: BN_DARK };

export const Disabled: Story = {
  args: { disabled: true, children: 'Save' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Save' });
    // Stays focusable (a tooltip can explain why) but does nothing.
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(button);
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  args: { loading: true, loadingLabel: 'Saving…', children: 'Save' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Save' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Saving…');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const IconOnly: Story = {
  render: (args, { globals }) => (
    <IconButton {...args} label={t(globals, deleteDeed)} icon={<Trash2 className="size-5" />} />
  ),
  play: async ({ args, canvasElement, globals }) => {
    const button = within(canvasElement).getByRole('button', { name: t(globals, deleteDeed) });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    // The label also appears as a tooltip on focus.
    await expect(await screen.findByRole('tooltip')).toHaveTextContent(t(globals, deleteDeed));
    // Esc dismisses the tooltip without leaving the button.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const IconOnlyBengaliDark: Story = { ...IconOnly, globals: BN_DARK };

const plan = { en: 'Open my plan', bn: 'আমার পরিকল্পনা খুলুন' };

export const AsLink: Story = {
  render: (args, { globals }) => (
    <Button {...args} asChild>
      <a href="#plan">{t(globals, plan)}</a>
    </Button>
  ),
  play: async ({ canvasElement, globals }) => {
    // Styled as a button but stays a link (navigation semantics, middle-click, etc.).
    const link = within(canvasElement).getByRole('link', { name: t(globals, plan) });
    await expect(link).toHaveAttribute('href', '#plan');
    await expect(link).toHaveClass('bg-primary');
    await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
  },
};
export const AsLinkBengaliDark: Story = { ...AsLink, globals: BN_DARK };
