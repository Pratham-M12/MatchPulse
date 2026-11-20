import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { afterEach, describe, it } from 'node:test';
import { API_FOOTBALL_ORIGIN, DailyBudget, FOOTBALL_PROXY_CACHE_ORIGIN, canonicalCacheKey, handleRequest, validateRequest } from '../src/index.ts';
import type { Env, Runtime } from '../src/index.ts';

const secret = 'test-only-football-key';
const originalCaches = (globalThis as unknown as { caches?: unknown }).caches;

function budget(allowed = true): Env['DAILY_BUDGET'] {
  return {
    idFromName: () => 'global',
    get: () => ({ fetch: async () => Response.json(allowed ? { allowed: true } : { allowed: false, retryAfter: 60 }) }),
  };
}

function env(overrides: Partial<Env> = {}): Env {
  return { API_FOOTBALL_KEY: secret, DAILY_BUDGET: budget(), ...overrides };
}

function upstream(body: unknown = { response: [], errors: [], results: 0 }): typeof fetch {
  return async () => Response.json(body);
}

function runtime(fetcher: typeof fetch = upstream()): Runtime {
  return { fetch: fetcher, now: () => new Date('2026-11-17T12:00:00Z') };
}

afterEach(() => {
  (globalThis as unknown as { caches?: unknown }).caches = originalCaches;
});

describe('route validation', () => {
  const validRoutes = [
    '/fixtures?live=all', '/fixtures?date=2026-01-02', '/fixtures?id=1', '/fixtures?team=1&season=2024',
    '/fixtures?league=39&season=2024&from=2024-08-01&to=2025-05-31', '/fixtures/events?fixture=1',
    '/fixtures/statistics?fixture=1', '/fixtures/lineups?fixture=1', '/predictions?fixture=1',
    '/standings?league=39&season=2024', '/teams?id=1', '/teams?search=Arsenal', '/players/squads?team=1',
    '/players/topscorers?league=39&season=2024', '/players?id=1&season=2024', '/leagues?id=39',
    '/leagues?search=Premier%20League', '/players/seasons?player=1', '/teams/seasons?team=1', '/status',
  ];

  for (const path of validRoutes) {
    it(`allows ${path}`, () => assert.notEqual(typeof validateRequest(new URL(`https://proxy.test${path}`)), 'string'));
  }

  for (const path of ['/fixtures?live=yes', '/fixtures?id=0', '/fixtures?date=2026-02-30', '/fixtures?team=1', '/fixtures?league=39&season=2024&from=2025-05-31&to=2024-08-01', '/status?x=1', '/anything?url=https://evil.test', `/teams?search=${'x'.repeat(81)}`]) {
    it(`rejects ${path}`, () => assert.equal(typeof validateRequest(new URL(`https://proxy.test${path}`)), 'string'));
  }

  it('rejects duplicate query parameters and non-GET requests', async () => {
    assert.equal(typeof validateRequest(new URL('https://proxy.test/fixtures?id=1&id=2')), 'string');
    assert.equal((await handleRequest(new Request('https://proxy.test/fixtures?live=all', { method: 'POST' }), env(), undefined, runtime())).status, 405);
  });
});

describe('upstream compatibility and safety', () => {
  it('uses the fixed origin and key header, never a client-supplied host', async () => {
    let url = ''; let headers = new Headers();
    const response = await handleRequest(new Request('https://attacker.test/fixtures?live=all'), env(), undefined, runtime(async (input, init) => {
      url = String(input); headers = new Headers(init?.headers); return Response.json({ response: [], errors: [], results: 0 });
    }));
    assert.equal(response.status, 200);
    assert.equal(url.startsWith(`${API_FOOTBALL_ORIGIN}/fixtures?live=all`), true);
    assert.equal(headers.get('x-apisports-key'), secret);
    assert.equal(url.includes(secret), false);
    assert.equal((await response.text()).includes(secret), false);
  });

  it('preserves HTTP 200 API error envelopes without caching them', async () => {
    let calls = 0;
    const store = new Map<string, Response>();
    const cache = { match: async (key: Request) => store.get(key.url)?.clone(), put: async (key: Request, value: Response) => { store.set(key.url, value.clone()); } };
    const fetcher: typeof fetch = async () => { calls++; return Response.json({ response: [], errors: { requests: 'limit reached' }, results: 0 }); };
    const one = await handleRequest(new Request('https://proxy.test/fixtures?live=all'), env(), undefined, { ...runtime(fetcher), cache });
    const two = await handleRequest(new Request('https://proxy.test/fixtures?live=all'), env(), undefined, { ...runtime(fetcher), cache });
    assert.equal(one.status, 200); assert.deepEqual((await one.json() as { errors: unknown }).errors, { requests: 'API request limit reached' });
    assert.equal(two.headers.get('x-cache'), 'MISS'); assert.equal(calls, 2);
  });

  for (const status of [400, 401, 403, 429, 500]) {
    it(`sanitizes upstream HTTP ${status}`, async () => {
      const response = await handleRequest(new Request('https://proxy.test/fixtures?live=all'), env(), undefined, runtime(async () => new Response('raw provider detail', { status })));
      assert.equal(response.status, status === 429 ? 429 : status === 403 ? 403 : 502);
      assert.equal((await response.text()).includes('raw provider detail'), false);
    });
  }

  it('handles network and malformed JSON failures safely', async () => {
    const network = await handleRequest(new Request('https://proxy.test/fixtures?live=all'), env(), undefined, runtime(async () => { throw new Error('network key ' + secret); }));
    const malformed = await handleRequest(new Request('https://proxy.test/fixtures?live=all'), env(), undefined, runtime(async () => new Response('<html>', { status: 200 })));
    assert.equal(network.status, 502); assert.equal(malformed.status, 502);
    assert.equal((await network.text()).includes(secret), false);
  });
});

describe('cache, privacy and budget', () => {
  it('uses the project-specific rate-limit namespace configuration', async () => {
    const config = await readFile('wrangler.toml', 'utf8');
    assert.match(config, /namespace_id\s*=\s*"2611171701"/);
    assert.match(config, /limit\s*=\s*120/);
    assert.match(config, /period\s*=\s*60/);
  });

  it('uses one fixed cache key across incoming hostnames without including secrets', () => {
    const first = validateRequest(new URL('https://worker-a.example.test/standings?league=39&season=2024'));
    const second = validateRequest(new URL('https://worker-b.example.test/standings?season=2024&league=39'));
    assert.notEqual(typeof first, 'string');
    assert.notEqual(typeof second, 'string');
    const firstKey = canonicalCacheKey(first as Exclude<typeof first, string>);
    const secondKey = canonicalCacheKey(second as Exclude<typeof second, string>);
    assert.equal(firstKey.url, secondKey.url);
    assert.equal(new URL(firstKey.url).origin, FOOTBALL_PROXY_CACHE_ORIGIN);
    assert.equal(firstKey.url.includes(secret), false);
  });

  it('uses distinct cache keys for different validated query values', () => {
    const current = validateRequest(new URL('https://proxy.test/standings?league=39&season=2024'));
    const prior = validateRequest(new URL('https://proxy.test/standings?league=39&season=2023'));
    assert.notEqual(typeof current, 'string');
    assert.notEqual(typeof prior, 'string');
    assert.notEqual(
      canonicalCacheKey(current as Exclude<typeof current, string>).url,
      canonicalCacheKey(prior as Exclude<typeof prior, string>).url
    );
  });

  it('serves canonical cache hits without consuming a second upstream attempt', async () => {
    const store = new Map<string, Response>(); let calls = 0; let budgetCalls = 0;
    const cache = { match: async (key: Request) => store.get(key.url)?.clone(), put: async (key: Request, value: Response) => { store.set(key.url, value.clone()); } };
    const guarded = budget();
    const counted: Env = { API_FOOTBALL_KEY: secret, DAILY_BUDGET: { idFromName: guarded!.idFromName, get: () => ({ fetch: async (...args) => { budgetCalls++; return guarded!.get('x').fetch(...args); } }) } };
    const fetcher: typeof fetch = async () => { calls++; return Response.json({ response: [], errors: [], results: 0 }); };
    const first = await handleRequest(new Request('https://proxy.test/standings?season=2024&league=39'), counted, undefined, { ...runtime(fetcher), cache });
    const second = await handleRequest(new Request('https://proxy.test/standings?league=39&season=2024'), counted, undefined, { ...runtime(fetcher), cache });
    assert.equal(first.headers.get('x-cache'), 'MISS'); assert.equal(second.headers.get('x-cache'), 'HIT');
    assert.equal(calls, 1); assert.equal(budgetCalls, 1);
  });

  it('projects status to the plan required by season resolution and removes PII', async () => {
    const response = await handleRequest(new Request('https://proxy.test/status'), env(), undefined, runtime(upstream({ response: { account: { email: 'private@example.test', firstname: 'Private' }, subscription: { plan: 'Free' }, requests: { limit_day: 100 } }, errors: [], results: 1 })));
    const text = await response.text();
    assert.equal(text.includes('private@example.test'), false); assert.equal(text.includes('Free'), true);
  });

  it('fails closed when budget is unavailable and returns retry-after when exhausted', async () => {
    const unavailable = await handleRequest(new Request('https://proxy.test/fixtures?live=all'), { API_FOOTBALL_KEY: secret }, undefined, runtime());
    const exhausted = await handleRequest(new Request('https://proxy.test/fixtures?live=all'), env({ DAILY_BUDGET: budget(false) }), undefined, runtime());
    assert.equal(unavailable.status, 503); assert.equal(exhausted.status, 429); assert.notEqual(exhausted.headers.get('retry-after'), null);
  });

  it('uses short fixture TTLs and longer bounded-list TTLs', async () => {
    const live = await handleRequest(new Request('https://proxy.test/fixtures?live=all'), env(), undefined, runtime());
    const league = await handleRequest(new Request('https://proxy.test/fixtures?league=39&season=2024&from=2024-08-01&to=2025-05-31'), env(), undefined, runtime());
    assert.match(live.headers.get('cache-control') ?? '', /max-age=25/);
    assert.match(league.headers.get('cache-control') ?? '', /max-age=300/);
  });
});

describe('DailyBudget Durable Object', () => {
  function state() {
    let row: { date: string; attempts: number } | undefined;
    let initializationCalls = 0;
    const sql = {
      exec(query: string, ...values: unknown[]) {
        if (query.startsWith('SELECT')) return { one: () => row, toArray: () => row ? [row] : [] };
        if (query.startsWith('INSERT')) { row = { date: values[0] as string, attempts: values[1] as number }; }
        return { one: () => undefined };
      },
    };
    return {
      storage: { sql },
      blockConcurrencyWhile: async (callback: () => Promise<unknown>) => {
        initializationCalls++;
        await callback();
      },
      initializationCalls: () => initializationCalls,
    } as unknown as DurableObjectState & { initializationCalls(): number };
  }

  function consume(object: DailyBudget, date: string, limit = 2) {
    return object.fetch(new Request('https://budget.test/consume', { method: 'POST', body: JSON.stringify({ date, limit, retryAfter: 60 }) }));
  }

  it('enforces the exact cap atomically across concurrent consume requests', async () => {
    const object = new DailyBudget(state());
    const responses = await Promise.all([consume(object, '2026-11-17'), consume(object, '2026-11-17'), consume(object, '2026-11-17')]);
    const results = await Promise.all(responses.map((response) => response.json() as Promise<{ allowed: boolean }>));
    assert.deepEqual(results.map((result) => result.allowed), [true, true, false]);
  });

  it('initializes the SQLite schema through the constructor concurrency gate', async () => {
    const testState = state();
    new DailyBudget(testState);
    await Promise.resolve();
    assert.equal(testState.initializationCalls(), 1);
  });

  it('rolls the persistent counter over at the next UTC date', async () => {
    const object = new DailyBudget(state());
    assert.equal((await (await consume(object, '2026-11-17', 1)).json() as { allowed: boolean }).allowed, true);
    assert.equal((await (await consume(object, '2026-11-17', 1)).json() as { allowed: boolean }).allowed, false);
    assert.equal((await (await consume(object, '2026-11-18', 1)).json() as { allowed: boolean }).allowed, true);
  });
});
