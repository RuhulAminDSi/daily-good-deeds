'use client';

import { createApiClient } from '@dgd/api-client';
import {
  type FieldError,
  fieldErrorFromIssue,
  PASSWORD_MIN,
  ProblemSchema,
  RegisterRequestSchema,
  TERMS_VERSION,
} from '@dgd/contracts';
import { Button, Checkbox, Field, Input, Select } from '@dgd/ui';
import { useLocale } from 'next-intl';
import { type FormEvent, useEffect, useId, useState } from 'react';
import { useClientTranslations } from '@/i18n/client';
import { useProblemMessages } from '@/i18n/problem';

const DEFAULT_TIMEZONE = 'Asia/Dhaka';
const ZONES = Intl.supportedValuesOf('timeZone').map((zone) => ({ value: zone, label: zone }));

/** Same-origin: `/api/v1` is rewritten to the API (next.config.ts). */
const api = createApiClient('');

type State =
  | { step: 'editing'; errors: Record<string, string>; summary?: string }
  | { step: 'submitting' }
  | { step: 'done'; email: string };

/**
 * Sign-up (F-AUTH-001, FR-AUTH-001-01..04). Validated in the browser with the same contract schema
 * the API uses, so both report the same localized messages per field; the API's answer (rate
 * limit, breached password) renders the same way.
 */
export function RegisterForm() {
  const t = useClientTranslations('register');
  const locale = useLocale();
  const problems = useProblemMessages();
  const termsErrorId = useId();
  const [state, setState] = useState<State>({ step: 'editing', errors: {} });
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);

  // The device's zone, after hydration (the server cannot know it).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of browser state
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE);
  }, []);

  const fail = (errors: FieldError[], summary?: string) =>
    setState({ step: 'editing', errors: problems.fieldMessages(errors), summary });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = RegisterRequestSchema.safeParse({
      email: form.get('email'),
      password: form.get('password'),
      displayName: form.get('displayName'),
      locale,
      timezone,
      acceptTermsVersion: form.get('terms') ? TERMS_VERSION : undefined,
    });
    if (!parsed.success) return fail(parsed.error.issues.map(fieldErrorFromIssue));

    setState({ step: 'submitting' });
    try {
      const { response, error } = await api.POST('/api/v1/auth/register', {
        body: parsed.data,
        headers: { 'Accept-Language': locale },
      });
      if (response.ok) return setState({ step: 'done', email: parsed.data.email });
      const problem = ProblemSchema.safeParse(error).data;
      fail(problem?.errors ?? [], problem ? problems.title(problem) : t('failed'));
    } catch {
      fail([], t('failed'));
    }
  };

  if (state.step === 'done') {
    return (
      <section aria-labelledby="register-done" role="status" className="flex flex-col gap-2">
        <h2 id="register-done" className="text-h2">
          {t('doneTitle')}
        </h2>
        <p className="text-body">{t('doneBody', { email: state.email })}</p>
      </section>
    );
  }

  const errors = state.step === 'editing' ? state.errors : {};
  const submitting = state.step === 'submitting';
  const termsError = errors['/acceptTermsVersion'];
  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      {state.step === 'editing' && state.summary && (
        <p role="alert" className="text-body-sm text-danger">
          {state.summary}
        </p>
      )}
      <Field label={t('displayName')} error={errors['/displayName']} required>
        <Input name="displayName" autoComplete="name" maxLength={60} />
      </Field>
      <Field label={t('email')} error={errors['/email']} required>
        <Input name="email" type="email" autoComplete="email" inputMode="email" />
      </Field>
      <Field
        label={t('password')}
        hint={t('passwordHint', { min: PASSWORD_MIN })}
        error={errors['/password']}
        required
      >
        <Input name="password" type="password" autoComplete="new-password" />
      </Field>
      <Field label={t('timezone')} hint={t('timezoneHint')} error={errors['/timezone']}>
        <Select options={ZONES} value={timezone} onValueChange={setTimezone} />
      </Field>
      <div className="flex flex-col gap-1">
        <Checkbox
          name="terms"
          label={t('terms')}
          aria-invalid={termsError ? true : undefined}
          aria-describedby={termsError ? termsErrorId : undefined}
        />
        {termsError && (
          <p id={termsErrorId} className="text-body-sm text-danger">
            {termsError}
          </p>
        )}
      </div>
      <Button type="submit" loading={submitting} loadingLabel={t('submitting')}>
        {t('submit')}
      </Button>
    </form>
  );
}
