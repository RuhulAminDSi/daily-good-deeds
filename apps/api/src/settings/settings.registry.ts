import { z } from 'zod';

type Setting = { schema: z.ZodType; default?: unknown; isPublic: boolean };
const setting = <S extends z.ZodType>(schema: S, def?: z.infer<S>, isPublic = false): Setting =>
  def === undefined ? { schema, isPublic } : { schema, default: def, isPublic };

const days = z.number().int().min(1);

/**
 * Settings registry: the code-side source of truth for `system_settings` keys
 * (docs/database/DATA_DICTIONARY.md "Settings registry"). Values are validated with these schemas.
 * A key without a default must be decided by a person and is not seeded.
 */
export const SETTINGS = {
  'completions.edit_window_days': setting(z.number().int().min(0).max(30), 7, true), // FR-CAL-011-01
  'account.deletion_grace_days': setting(days, 30, true), // FR-AUTH-009-01
  'notifications.quiet_hours_default': setting(
    z.object({ start: z.iso.time(), end: z.iso.time() }),
    { start: '22:00', end: '07:00' },
    true,
  ), // FR-NOTIF-008-01
  'ai.enabled': setting(z.boolean(), false, true), // F-AI-002
  'ai.user_daily_requests': setting(z.number().int().min(0), 30, true), // FR-AI-003-01
  'ai.user_monthly_tokens': setting(z.number().int().min(0), 150_000), // FR-AI-003-01
  'ai.monthly_budget_usd': setting(z.number().positive()), // set at the P8 kickoff
  // Retention, NFR-PRIVACY-009 (tombstones: FR-PWA-006-16).
  'retention.sync_operations_days': setting(days, 35),
  'retention.tombstones_days': setting(days, 35),
  'retention.ai_content_days': setting(days, 90),
  'retention.notifications_days': setting(days, 90),
  'retention.audit_logs_months': setting(days, 24),
} satisfies Record<string, Setting>;

/** Rows the seed inserts when missing: every setting that has a default. */
export const settingDefaults = () =>
  Object.entries(SETTINGS).flatMap(([key, s]) =>
    'default' in s ? [{ key, value: s.default, isPublic: s.isPublic }] : [],
  );
