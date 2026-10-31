import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Leaf, Sprout } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';
import { BN, BN_DARK, DARK, t } from '../stories';
import { Avatar, initials } from './avatar';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardFooter, CardHeader, CardLink, CardTitle } from './card';
import { EmptyState, Skeleton } from './feedback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta = { title: 'Display/Overview', component: Card } satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

const copy = {
  today: { en: 'Today', bn: 'আজ' },
  week: { en: 'Week', bn: 'সপ্তাহ' },
  month: { en: 'Month', bn: 'মাস' },
  deed: { en: 'Smile at someone', bn: 'কারও দিকে তাকিয়ে হাসুন' },
  minutes: { en: '~1 min · Kindness', bn: '~১ মিনিট · দয়া' },
  progress: { en: '3 of 5 done', bn: '৫টির মধ্যে ৩টি সম্পন্ন' },
  add: { en: 'Add to my plan', bn: 'আমার পরিকল্পনায় যোগ করুন' },
  unread: { en: '3 unread notifications', bn: '৩টি অপঠিত বিজ্ঞপ্তি' },
  many: { en: '120 unread notifications', bn: '১২০টি অপঠিত বিজ্ঞপ্তি' },
  emptyTitle: { en: 'Your journal is waiting', bn: 'আপনার জার্নাল অপেক্ষা করছে' },
  emptyBody: {
    en: 'A single sentence is a great start.',
    bn: 'একটি বাক্য দিয়েই শুরু করা যায়।',
  },
  write: { en: 'Write an entry', bn: 'লেখা শুরু করুন' },
};

export const Overview: Story = {
  render: (_args, { globals }) => {
    const locale = globals.locale === 'bn' ? 'bn' : 'en';
    return (
      <div className="flex max-w-md flex-col gap-6">
        <Tabs defaultValue="today">
          <TabsList>
            <TabsTrigger value="today">{t(globals, copy.today)}</TabsTrigger>
            <TabsTrigger value="week">{t(globals, copy.week)}</TabsTrigger>
            <TabsTrigger value="month">{t(globals, copy.month)}</TabsTrigger>
          </TabsList>
          <TabsContent value="today">{t(globals, copy.progress)}</TabsContent>
          <TabsContent value="week">{t(globals, copy.week)}</TabsContent>
          <TabsContent value="month">{t(globals, copy.month)}</TabsContent>
        </Tabs>

        <Card as="article" variant="interactive">
          <CardHeader>
            <CardTitle>
              <CardLink href="#deed">{t(globals, copy.deed)}</CardLink>
            </CardTitle>
            <Leaf aria-hidden className="size-5 text-primary" />
          </CardHeader>
          <p className="mt-1 text-body-sm text-text-muted">{t(globals, copy.minutes)}</p>
        </Card>

        <Card variant="highlight">
          <CardTitle level={2}>{t(globals, copy.progress)}</CardTitle>
          <CardFooter>
            <Button size="sm">{t(globals, copy.add)}</Button>
          </CardFooter>
        </Card>

        <div className="flex items-center gap-4">
          <span className="relative inline-flex">
            <Bell aria-hidden className="size-6" />
            <Badge className="absolute -end-2 -top-2" count={3} label={t(globals, copy.unread)} />
          </span>
          <Badge count={120} label={t(globals, copy.many)} />
          <Avatar name={locale === 'bn' ? 'ক্ষমা রহমান' : 'Asha Rahman'} size={40} />
          <Avatar name="Karim" size={24} />
          <Avatar name="নুসরাত জাহান" size={64} />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>

        <EmptyState
          icon={<Sprout className="size-10" />}
          title={t(globals, copy.emptyTitle)}
          body={t(globals, copy.emptyBody)}
          action={<Button>{t(globals, copy.write)}</Button>}
        />
      </div>
    );
  },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    // Tabs: arrow keys move between tabs and select them (roving tabindex).
    const today = canvas.getByRole('tab', { name: t(globals, copy.today) });
    await userEvent.click(today);
    await userEvent.keyboard('{ArrowRight}');
    const week = canvas.getByRole('tab', { name: t(globals, copy.week) });
    await expect(week).toHaveFocus();
    await expect(week).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: t(globals, copy.month) })).toHaveFocus();

    // Interactive card: one link, named by the title.
    await expect(canvas.getByRole('link', { name: t(globals, copy.deed) })).toHaveAttribute(
      'href',
      '#deed',
    );

    // Badge: localized digits, capped at 99+, full text for screen readers.
    await expect(canvas.getByText(t(globals, copy.unread))).toHaveClass('sr-only');
    await expect(canvas.getByText(globals.locale === 'bn' ? '৯৯+' : '99+')).toBeVisible();

    // Avatar: named for screen readers, initials as whole letters.
    await expect(canvas.getByRole('img', { name: 'নুসরাত জাহান' })).toHaveTextContent('নুজা');
    await expect(canvas.getByRole('heading', { name: t(globals, copy.emptyTitle) })).toBeVisible();
  },
};
export const OverviewBengali: Story = { ...Overview, globals: BN };
export const OverviewDark: Story = { ...Overview, globals: DARK };
export const OverviewBengaliDark: Story = { ...Overview, globals: BN_DARK };

export const Initials: Story = {
  render: () => <span />,
  play: async () => {
    await expect(initials('Asha Rahman')).toBe('AR');
    await expect(initials('  karim ')).toBe('K');
    // Grapheme clusters keep Bengali conjuncts and vowel signs whole.
    await expect(initials('ক্ষমা রহমান')).toBe('ক্ষর');
    await expect(initials('জ্ঞান')).toBe('জ্ঞা');
  },
};
