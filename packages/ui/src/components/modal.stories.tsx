import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { BN, BN_DARK, DARK, t } from '../stories';
import { Button } from './button';
import { Dialog, DialogClose, Sheet } from './modal';

const meta = { title: 'Layout/Dialog & Sheet', component: Dialog } satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

const copy = {
  open: { en: 'Delete deed', bn: 'কাজটি মুছুন' },
  title: { en: 'Delete this deed?', bn: 'এই কাজটি মুছে ফেলবেন?' },
  description: {
    en: 'Its history stays in your calendar.',
    bn: 'এর ইতিহাস আপনার ক্যালেন্ডারে থেকে যাবে।',
  },
  close: { en: 'Close', bn: 'বন্ধ করুন' },
  cancel: { en: 'Cancel', bn: 'বাতিল' },
  confirm: { en: 'Delete', bn: 'মুছে ফেলুন' },
};

export const ConfirmDialog: Story = {
  args: { title: '' },
  render: (_args, { globals }) => (
    <Dialog
      trigger={<Button variant="danger">{t(globals, copy.open)}</Button>}
      title={t(globals, copy.title)}
      description={t(globals, copy.description)}
      footer={
        <>
          <DialogClose asChild>
            <Button variant="secondary">{t(globals, copy.cancel)}</Button>
          </DialogClose>
          <Button variant="danger">{t(globals, copy.confirm)}</Button>
        </>
      }
    />
  ),
  play: async ({ canvasElement, globals }) => {
    const trigger = within(canvasElement).getByRole('button', { name: t(globals, copy.open) });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: t(globals, copy.title) });
    await expect(dialog).toHaveAccessibleDescription(t(globals, copy.description));
    // The ✕ sits in the top-end corner (a regression once let it fall to the bottom).
    const close = within(dialog).getByRole('button', { name: t(globals, copy.close) });
    const [d, c] = [dialog.getBoundingClientRect(), close.getBoundingClientRect()];
    await expect(c.top - d.top).toBeLessThan(24);
    await expect(d.right - c.right).toBeLessThan(24);
    // Focus moves inside, Tab stays inside, Esc closes and focus returns to the trigger.
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
    for (let i = 0; i < 4; i++) {
      await userEvent.tab();
      await expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
export const ConfirmDialogBengali: Story = { ...ConfirmDialog, globals: BN };
export const ConfirmDialogDark: Story = { ...ConfirmDialog, globals: DARK };
export const ConfirmDialogBengaliDark: Story = { ...ConfirmDialog, globals: BN_DARK };

const sheet = {
  open: { en: 'Filters', bn: 'ফিল্টার' },
  title: { en: 'Filter deeds', bn: 'কাজ ফিল্টার করুন' },
};

export const BottomSheet: Story = {
  args: { title: '' },
  render: (_args, { globals }) => (
    <Sheet
      trigger={<Button variant="secondary">{t(globals, sheet.open)}</Button>}
      title={t(globals, sheet.title)}
    >
      <p>{t(globals, copy.description)}</p>
    </Sheet>
  ),
  play: async ({ canvasElement, globals }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: t(globals, sheet.open) }),
    );
    const dialog = await screen.findByRole('dialog', { name: t(globals, sheet.title) });
    // (No tooltip-on-open check here: user-event's synthetic clicks don't update the browser's
    // focus-visible state. apps/web/e2e/app-shell.spec.ts checks it with a real click.)
    const close = within(dialog).getByRole('button', { name: t(globals, copy.close) });
    // A sheet is still a dialog: the close button closes it.
    await userEvent.click(close);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  },
};
export const BottomSheetBengaliDark: Story = { ...BottomSheet, globals: BN_DARK };
