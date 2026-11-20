import { env, exports as workerExports } from 'cloudflare:workers';
import { evictDurableObject, reset, runInDurableObject } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';

type BudgetResult = { allowed: boolean; retryAfter?: number };
const BUDGET_NAME = 'global-api-football-budget';
const DAY_ONE = '2026-11-17';
const DAY_TWO = '2026-11-18';
const runtimeEnv = env as unknown as {
  API_FOOTBALL_KEY: string;
  DAILY_BUDGET: DurableObjectNamespace;
};
const runtimeWorker = workerExports as unknown as { default: { fetch(input: RequestInfo | URL): Promise<Response> } };

function budgetStub() {
  return runtimeEnv.DAILY_BUDGET.get(runtimeEnv.DAILY_BUDGET.idFromName(BUDGET_NAME));
}

async function consume(date: string, limit = 2, retryAfter = 60): Promise<BudgetResult> {
  const response = await budgetStub().fetch('https://daily-budget/consume', {
    method: 'POST',
    body: JSON.stringify({ date, limit, retryAfter }),
  });
  expect(response.status).toBe(200);
  return response.json<BudgetResult>();
}

async function storedBudget() {
  return runInDurableObject(budgetStub(), (_instance, state) =>
    state.storage.sql.exec<{ date: string; attempts: number }>('SELECT date, attempts FROM budget WHERE id = 1').one()
  );
}

afterEach(async () => {
  vi.unstubAllGlobals();
  await reset();
});

describe('DailyBudget in the Workers SQLite runtime', () => {
  it('initializes the schema and atomically enforces an exact concurrent cap', async () => {
    const reservations = await Promise.all(Array.from({ length: 5 }, () => consume(DAY_ONE, 2)));
    expect(reservations.filter((reservation) => reservation.allowed)).toHaveLength(2);
    expect(reservations.filter((reservation) => !reservation.allowed)).toHaveLength(3);
    expect(await storedBudget()).toEqual({ date: DAY_ONE, attempts: 2 });
  });

  it('preserves the stored counter across Durable Object eviction and reconstruction', async () => {
    expect((await consume(DAY_ONE, 3)).allowed).toBe(true);
    await evictDurableObject(budgetStub());
    expect((await consume(DAY_ONE, 3)).allowed).toBe(true);
    expect(await storedBudget()).toEqual({ date: DAY_ONE, attempts: 2 });
  });

  it('uses independent UTC-date counters and returns the supplied retry interval when exhausted', async () => {
    expect((await consume(DAY_ONE, 1, 123)).allowed).toBe(true);
    expect(await consume(DAY_ONE, 1, 123)).toEqual({ allowed: false, retryAfter: 123 });
    expect((await consume(DAY_TWO, 1, 456)).allowed).toBe(true);
    expect(await storedBudget()).toEqual({ date: DAY_TWO, attempts: 1 });
  });
});

describe('Worker pipeline with a real Durable Object', () => {
  it('counts cache misses, skips the budget for cache hits, and stops upstream calls at the configured cap', async () => {
    let upstreamCalls = 0;
    vi.stubGlobal('fetch', async () => {
      upstreamCalls++;
      return Response.json({ response: [], errors: [], results: 0 });
    });
    const first = await runtimeWorker.default.fetch('https://proxy.test/fixtures?live=all');
    const repeated = await runtimeWorker.default.fetch('https://another-proxy.test/fixtures?live=all');
    const secondKey = await runtimeWorker.default.fetch('https://proxy.test/fixtures?date=2026-11-17');
    const exhausted = await runtimeWorker.default.fetch('https://proxy.test/fixtures?id=1');
    expect(first.status).toBe(200);
    expect(repeated.headers.get('x-cache')).toBe('HIT');
    expect(secondKey.status).toBe(200);
    expect(exhausted.status).toBe(429);
    expect(upstreamCalls).toBe(2);
    expect(await storedBudget()).toMatchObject({ attempts: 2 });
    expect(await exhausted.text()).not.toContain(runtimeEnv.API_FOOTBALL_KEY);
  });
});
