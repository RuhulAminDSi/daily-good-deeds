'use client';

import type { Problem } from '@dgd/contracts';
import { Button, Field, Input } from '@dgd/ui';
import { useState } from 'react';
import { useProblemMessages } from '@/i18n/problem';

/** What the API returns for `{ email: "nope" }` (see apps/api/test/app.spec.ts), in English. */
const PROBLEM: Problem = {
  type: 'https://docs.dailygooddeeds.app/errors/validation-failed',
  title: 'Some fields are invalid',
  status: 400,
  code: 'VALIDATION_FAILED',
  i18nKey: 'errors.validation_failed',
  errors: [
    {
      pointer: '/title',
      code: 'too_big',
      i18nKey: 'validation.too_big',
      params: { max: 120, origin: 'string' },
    },
    {
      pointer: '/email',
      code: 'invalid_format',
      i18nKey: 'validation.invalid_format',
      params: { format: 'email' },
    },
    { pointer: '/note', code: 'from_a_newer_api' },
  ],
};

/** A form that "submits" to a canned problem, rendered by the client field-error renderer. */
export function FieldErrorsForm() {
  const [problem, setProblem] = useState<Problem>();
  const messages = useProblemMessages();
  const errors = problem ? messages.fieldErrors(problem) : {};
  return (
    <form
      noValidate
      className="flex flex-col gap-4 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        setProblem(PROBLEM);
      }}
    >
      {problem && <p role="alert">{messages.title(problem)}</p>}
      <Field label="Title" error={errors['/title']}>
        <Input name="title" />
      </Field>
      <Field label="Email" error={errors['/email']}>
        <Input name="email" />
      </Field>
      <Field label="Note" error={errors['/note']}>
        <Input name="note" />
      </Field>
      <Button type="submit">Save</Button>
    </form>
  );
}
