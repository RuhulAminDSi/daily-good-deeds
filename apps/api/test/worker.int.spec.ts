// Worker integration tests against the Neon `test` branch (pg-boss schema `pgboss`).
import { randomUUID } from 'node:crypto';
import { type INestApplicationContext, Injectable } from '@nestjs/common';
import { PgBoss } from 'pg-boss';
import { z } from 'zod';
import { defineJob, Job, type JobContext, type JobHandler } from '../src/jobs/job.js';
import { JobsClient, PG_BOSS } from '../src/jobs/jobs.client.js';
import { createTestWorker } from './helpers.js';

const { TEST_DIRECT_URL, CI } = process.env;
if (CI && !TEST_DIRECT_URL) throw new Error('CI must set TEST_DIRECT_URL for integration tests.');

const Echo = defineJob({
  name: 'test.echo',
  schema: z.object({ runId: z.string(), n: z.number() }),
  queue: { retryLimit: 0 }, // fail straight to the dead-letter queue
});
const Slow = defineJob({ name: 'test.slow', schema: z.object({}) });

const seen: string[] = [];
const slow = { started: false, finished: false };

@Injectable()
@Job(Echo)
class EchoJob implements JobHandler<typeof Echo.schema> {
  async handle(data: z.infer<typeof Echo.schema>) {
    seen.push(`${data.runId}:${data.n}`);
  }
}

@Injectable()
@Job(Slow)
class SlowJob implements JobHandler {
  async handle(_: unknown, { signal }: JobContext) {
    slow.started = true;
    await new Promise((r) => setTimeout(r, 1500));
    slow.finished = !signal.aborted;
  }
}

const WAIT = { timeout: 20_000, interval: 200 };

describe.skipIf(!TEST_DIRECT_URL)('worker (integration)', { timeout: 60_000 }, () => {
  let worker: INestApplicationContext;
  let boss: PgBoss;
  let jobs: JobsClient;
  let closed = false;
  const runId = randomUUID();
  const state = (queue: string, id: string) => boss.getJobById(queue, id).then((j) => j?.state);

  beforeAll(async () => {
    worker = await createTestWorker(TEST_DIRECT_URL!, [EchoJob, SlowJob]);
    boss = worker.get(PG_BOSS);
    jobs = worker.get(JobsClient);
  });

  afterAll(async () => {
    if (!closed) await worker?.close();
  });

  it('runs a job sent through JobsClient to completion', async () => {
    const id = await jobs.send(Echo, { runId, n: 1 });
    await vi.waitUntil(async () => (await state(Echo.name, id!)) === 'completed', WAIT);
    expect(seen).toContain(`${runId}:1`);
  });

  it('rejects an invalid payload at send time', () => {
    // @ts-expect-error n must be a number
    expect(() => jobs.send(Echo, { runId, n: 'x' })).toThrow();
  });

  it('keeps a job that fails on the worker in its dead-letter queue', async () => {
    // Bypass the client to simulate a payload that slipped past producer validation.
    const id = await boss.send(Echo.name, { runId, n: 'not a number' });
    await vi.waitUntil(async () => (await state(Echo.name, id!)) === 'failed', WAIT);
    const dead = await vi.waitUntil(async () => {
      const found = await boss.findJobs('test.echo.dlq', { data: { runId } });
      return found.length ? found : undefined;
    }, WAIT);
    expect(dead[0]?.state).toBe('created'); // left for inspection/retry, not consumed
  });

  it('drains an in-flight job on shutdown instead of abandoning it', async () => {
    const id = await jobs.send(Slow, {});
    await vi.waitUntil(() => slow.started, WAIT);
    closed = true;
    await worker.close(); // what SIGTERM triggers via enableShutdownHooks
    expect(slow.finished).toBe(true);

    // The pool is closed now; check the job's final state with a separate client.
    const check = new PgBoss({ connectionString: TEST_DIRECT_URL!, schema: 'pgboss', max: 1 });
    await check.start();
    try {
      expect((await check.getJobById(Slow.name, id!))?.state).toBe('completed');
    } finally {
      await check.stop({ graceful: false });
    }
  });
});
