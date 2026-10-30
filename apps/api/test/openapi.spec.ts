// The OpenAPI contract, derived from the real app. Fails when the committed @dgd/api-client files
// are stale; `pnpm --filter @dgd/api openapi` (vitest -u) regenerates them.
import type { INestApplication } from '@nestjs/common';
import { HealthLiveSchema } from '@dgd/contracts';
import openapiTS, { astToString } from 'openapi-typescript';
import request from 'supertest';
import { buildOpenApiDocument } from '../src/common/openapi/openapi.js';
import { createTestApp } from './helpers.js';

const CLIENT = '../../../packages/api-client';

describe('OpenAPI contract', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Building the document needs the module graph, not a reachable database.
    app = await createTestApp('postgresql://u:p@127.0.0.1:1/none');
  });

  afterAll(() => app.close());

  it('matches the committed document and generated client types', async () => {
    const document = buildOpenApiDocument(app);
    await expect(`${JSON.stringify(document, null, 2)}\n`).toMatchFileSnapshot(
      `${CLIENT}/openapi.json`,
    );
    const types = astToString(await openapiTS(document as never));
    await expect(
      `// Generated from the API's OpenAPI document. Do not edit.\n\n${types}`,
    ).toMatchFileSnapshot(`${CLIENT}/src/schema.ts`);
  });

  it('serves responses that satisfy the documented contract schemas', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health/live').expect(200);
    expect(HealthLiveSchema.parse(res.body)).toEqual({ status: 'ok' });
  });
});
