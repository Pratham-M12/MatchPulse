export const API_FOOTBALL_ORIGIN = 'https://v3.football.api-sports.io';
// Cache API keys are Request URLs, but this synthetic origin is never fetched.
// Keeping it fixed prevents cache fragmentation across public Worker hostnames.
export const FOOTBALL_PROXY_CACHE_ORIGIN = 'https://football-proxy.matchpulse.invalid';
export const DEFAULT_DAILY_UPSTREAM_BUDGET = 80;

type RateLimiter = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};

type BudgetStub = {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
};

export type Env = {
  API_FOOTBALL_KEY?: string;
  DAILY_UPSTREAM_BUDGET?: string;
  DAILY_BUDGET?: { idFromName(name: string): unknown; get(id: unknown): BudgetStub };
  EDGE_RATE_LIMITER?: RateLimiter;
};

type ExecutionContextLike = { waitUntil(promise: Promise<unknown>): void };
type CacheLike = Pick<Cache, 'match' | 'put'>;
export type Runtime = {
  cache?: CacheLike;
  fetch?: typeof fetch;
  now?: () => Date;
};

type ValidatedRequest = {
  path: string;
  params: URLSearchParams;
  ttl: number;
};

type RouteRule = {
  ttl: number;
  alternatives: readonly (readonly string[])[];
};

const ID = /^(?:[1-9]\d{0,9})$/;
const SEASON = /^(?:19|20)\d{2}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_SEARCH_LENGTH = 80;

const ROUTES: Record<string, RouteRule> = {
  '/fixtures': { ttl: 180, alternatives: [['live'], ['date'], ['id'], ['team', 'season'], ['league', 'season', 'from', 'to']] },
  '/fixtures/events': { ttl: 25, alternatives: [['fixture']] },
  '/fixtures/statistics': { ttl: 25, alternatives: [['fixture']] },
  '/fixtures/lineups': { ttl: 900, alternatives: [['fixture']] },
  '/predictions': { ttl: 1800, alternatives: [['fixture']] },
  '/standings': { ttl: 1800, alternatives: [['league', 'season']] },
  '/teams': { ttl: 21600, alternatives: [['id'], ['search']] },
  '/players/squads': { ttl: 21600, alternatives: [['team']] },
  '/players/topscorers': { ttl: 1800, alternatives: [['league', 'season']] },
  '/players': { ttl: 21600, alternatives: [['id', 'season']] },
  '/leagues': { ttl: 21600, alternatives: [['id'], ['search']] },
  '/players/seasons': { ttl: 21600, alternatives: [['player']] },
  '/teams/seasons': { ttl: 21600, alternatives: [['team']] },
  '/status': { ttl: 0, alternatives: [[]] },
};

export function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(body: unknown, status: number, extra: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...corsHeaders(), ...extra },
  });
}

function validDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateValue(name: string, value: string): string | null {
  if (!value) return `Missing value for ${name}`;
  if (['id', 'team', 'league', 'fixture', 'player'].includes(name) && !ID.test(value)) return `Invalid ${name}`;
  if (name === 'season' && !SEASON.test(value)) return 'Invalid season';
  if (['date', 'from', 'to'].includes(name) && !validDate(value)) return `Invalid ${name}`;
  if (name === 'live' && value !== 'all') return 'Invalid live value';
  if (name === 'search' && (value.length > MAX_SEARCH_LENGTH || !value.trim())) return 'Invalid search';
  return null;
}

export function validateRequest(url: URL): ValidatedRequest | string {
  const rule = ROUTES[url.pathname];
  if (!rule) return 'Not found';

  const entries = [...url.searchParams.entries()];
  const names = entries.map(([name]) => name);
  if (new Set(names).size !== names.length) return 'Duplicate query parameter';
  const supplied = names.sort();
  const allowed = rule.alternatives.find((alternative) => [...alternative].sort().join(',') === supplied.join(','));
  if (!allowed) return 'Unsupported query parameters';

  for (const [name, value] of entries) {
    const error = validateValue(name, value);
    if (error) return error;
  }
  if (url.searchParams.has('from') && url.searchParams.get('from')! > url.searchParams.get('to')!) {
    return 'Invalid date range';
  }

  const params = new URLSearchParams(entries.sort(([a], [b]) => a.localeCompare(b)));
  let ttl = rule.ttl;
  if (url.pathname === '/fixtures') {
    // Live and by-id fixture state changes frequently; bounded date/team lists do not.
    ttl = params.has('live') || params.has('id') ? 25 : params.has('league') ? 300 : 180;
  }
  return { path: url.pathname, params, ttl };
}

function hasApiErrors(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return true;
  const errors = (payload as { errors?: unknown }).errors;
  if (Array.isArray(errors)) return errors.length > 0;
  return Boolean(errors && typeof errors === 'object' && Object.keys(errors).length > 0);
}

function sanitizeErrorEnvelope(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;
  const envelope = payload as { errors?: unknown; get?: unknown; parameters?: unknown; results?: unknown };
  const errors = envelope.errors;
  if (Array.isArray(errors)) {
    if (errors.length === 0) return payload;
    return { get: envelope.get, parameters: envelope.parameters ?? {}, errors: ['Football data provider rejected the request'], results: 0, response: [] };
  }
  if (!errors || typeof errors !== 'object' || Object.keys(errors).length === 0) return payload;
  const source = errors as Record<string, unknown>;
  const safeErrors: Record<string, string> = source.plan
    ? { plan: 'Endpoint is not available on this API plan' }
    : source.requests
      ? { requests: 'API request limit reached' }
      : source.rateLimit
        ? { rateLimit: 'API request rate limit reached' }
        : { provider: 'Football data provider rejected the request' };
  return { get: envelope.get, parameters: envelope.parameters ?? {}, errors: safeErrors, results: 0, response: [] };
}

function projectStatus(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;
  const envelope = payload as { response?: unknown; errors?: unknown; results?: unknown; get?: unknown; parameters?: unknown };
  const response = envelope.response;
  if (!response || typeof response !== 'object') return payload;
  const subscription = (response as { subscription?: unknown }).subscription;
  if (!subscription || typeof subscription !== 'object') return { ...envelope, response: {} };
  const plan = (subscription as { plan?: unknown }).plan;
  // seasonResolver consumes only response.subscription.plan; omit account, email and request data.
  return { get: envelope.get ?? 'status', parameters: envelope.parameters ?? {}, errors: envelope.errors ?? [], results: envelope.results ?? 1, response: { subscription: typeof plan === 'string' ? { plan } : {} } };
}

export function canonicalCacheKey(valid: ValidatedRequest): Request {
  const url = new URL(valid.path, FOOTBALL_PROXY_CACHE_ORIGIN);
  url.search = valid.params.toString();
  return new Request(url.toString(), { method: 'GET' });
}

function cacheFor(runtime?: Runtime): CacheLike | undefined {
  if (runtime?.cache) return runtime.cache;
  return typeof caches !== 'undefined' ? caches.default : undefined;
}

function utcDate(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function secondsUntilNextUtcDay(now: Date): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

async function consumeBudget(env: Env, now: Date): Promise<Response | null> {
  if (!env.DAILY_BUDGET) return json({ error: 'Proxy budget service is unavailable' }, 503);
  const configured = Number.parseInt(env.DAILY_UPSTREAM_BUDGET ?? '', 10);
  const limit = Number.isSafeInteger(configured) && configured > 0 ? configured : DEFAULT_DAILY_UPSTREAM_BUDGET;
  try {
    const id = env.DAILY_BUDGET.idFromName('global-api-football-budget');
    const response = await env.DAILY_BUDGET.get(id).fetch('https://daily-budget/consume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: utcDate(now), limit, retryAfter: secondsUntilNextUtcDay(now) }),
    });
    if (!response.ok) return json({ error: 'Proxy budget service is unavailable' }, 503);
    const result = (await response.json()) as { allowed?: boolean; retryAfter?: number };
    return result.allowed ? null : json({ error: 'Daily upstream request budget reached' }, 429, { 'Retry-After': String(result.retryAfter ?? secondsUntilNextUtcDay(now)) });
  } catch {
    return json({ error: 'Proxy budget service is unavailable' }, 503);
  }
}

async function applyEdgeLimit(request: Request, env: Env): Promise<Response | null> {
  if (!env.EDGE_RATE_LIMITER) return null;
  try {
    const key = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const result = await env.EDGE_RATE_LIMITER.limit({ key });
    return result.success ? null : json({ error: 'Too many requests' }, 429, { 'Retry-After': '60' });
  } catch {
    // This control is deliberately best-effort; the Durable Object is the fail-closed quota gate.
    return null;
  }
}

export async function handleRequest(request: Request, env: Env, ctx?: ExecutionContextLike, runtime?: Runtime): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders() });
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const url = new URL(request.url);
  const valid = validateRequest(url);
  if (typeof valid === 'string') return json({ error: valid }, valid === 'Not found' ? 404 : 400);
  const apiKey = env.API_FOOTBALL_KEY?.trim();
  if (!apiKey) return json({ error: 'Football proxy service is not configured' }, 500);

  const edgeBlocked = await applyEdgeLimit(request, env);
  if (edgeBlocked) return edgeBlocked;

  const cache = cacheFor(runtime);
  const cacheKey = canonicalCacheKey(valid);
  if (cache && valid.ttl > 0) {
    try {
      const cached = await cache.match(cacheKey);
      if (cached) {
        const headers = new Headers(cached.headers);
        headers.set('X-Cache', 'HIT');
        headers.set('Access-Control-Allow-Origin', '*');
        return new Response(cached.body, { status: cached.status, headers });
      }
    } catch { /* cache failures must not make the public API unavailable */ }
  }

  const now = runtime?.now?.() ?? new Date();
  const budgetBlocked = await consumeBudget(env, now);
  if (budgetBlocked) return budgetBlocked;

  const upstreamUrl = new URL(valid.path, API_FOOTBALL_ORIGIN);
  upstreamUrl.search = valid.params.toString();
  let upstream: Response;
  try {
    upstream = await (runtime?.fetch ?? fetch)(upstreamUrl.toString(), { method: 'GET', headers: { 'x-apisports-key': apiKey, Accept: 'application/json' } });
  } catch {
    return json({ error: 'Failed to connect to football data provider' }, 502);
  }
  if (upstream.status === 429) return json({ error: 'Upstream request limit reached' }, 429);
  if (upstream.status === 403) return json({ error: 'Upstream endpoint access is unavailable' }, 403);
  if (!upstream.ok) return json({ error: 'Football data provider returned an error' }, 502);

  let payload: unknown;
  try { payload = await upstream.json(); } catch { return json({ error: 'Malformed response from football data provider' }, 502); }
  if (!payload || typeof payload !== 'object') return json({ error: 'Malformed response from football data provider' }, 502);
  const compatible = hasApiErrors(payload) ? sanitizeErrorEnvelope(payload) : payload;
  const body = valid.path === '/status' ? projectStatus(compatible) : compatible;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Cache-Control': valid.ttl > 0 ? `public, max-age=${valid.ttl}, s-maxage=${valid.ttl}` : 'no-store',
    'X-Cache': 'MISS',
    ...corsHeaders(),
  };
  const response = new Response(JSON.stringify(body), { status: 200, headers });
  if (cache && valid.ttl > 0 && !hasApiErrors(payload)) {
    try {
      const put = cache.put(cacheKey, response.clone());
      if (ctx) ctx.waitUntil(put); else await put;
    } catch { /* cache failures must not change a valid response */ }
  }
  return response;
}

export class DailyBudget {
  private readonly state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.state.blockConcurrencyWhile(async () => {
      // Constructor-only synchronous schema setup; no external I/O is performed here.
      this.state.storage.sql.exec('CREATE TABLE IF NOT EXISTS budget (id INTEGER PRIMARY KEY, date TEXT NOT NULL, attempts INTEGER NOT NULL)');
    });
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/consume') return new Response(null, { status: 404 });
    const input = (await request.json()) as { date?: unknown; limit?: unknown; retryAfter?: unknown };
    if (typeof input.date !== 'string' || !validDate(input.date) || typeof input.limit !== 'number' || !Number.isSafeInteger(input.limit) || input.limit < 1) return new Response(null, { status: 400 });
    const row = this.state.storage.sql.exec<{ date: string; attempts: number }>('SELECT date, attempts FROM budget WHERE id = 1').toArray()[0];
    const attempts = row?.date === input.date ? row.attempts : 0;
    if (attempts >= input.limit) return Response.json({ allowed: false, retryAfter: typeof input.retryAfter === 'number' ? input.retryAfter : 1 });
    this.state.storage.sql.exec('INSERT OR REPLACE INTO budget (id, date, attempts) VALUES (1, ?, ?)', input.date, attempts + 1);
    return Response.json({ allowed: true });
  }
}

export default { fetch: handleRequest } satisfies ExportedHandler<Env>;
