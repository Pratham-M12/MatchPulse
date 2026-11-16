import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest, isGNewsQuotaExhausted } from '../src/index.ts';
import type { Env, NormalizedNewsResponse } from '../src/types.ts';

describe('worker handler', () => {
  const originalFetch = globalThis.fetch;
  const originalCaches = (globalThis as unknown as { caches?: unknown }).caches;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    (globalThis as unknown as { caches?: unknown }).caches = originalCaches;
  });

  // ---------------------------------------------------------------------------
  // /health
  // ---------------------------------------------------------------------------
  describe('GET /health', () => {
    it('returns 200 with service health info and no secrets', async () => {
      const request = new Request('http://localhost:8787/health', { method: 'GET' });
      const env: Env = { GNEWS_API_KEY: 'super-secret-key-12345' };

      const response = await handleRequest(request, env);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'application/json');
      assert.equal(response.headers.get('access-control-allow-origin'), '*');

      const body = await response.json();
      assert.deepEqual(body, { status: 'ok', service: 'matchpulse-news-proxy' });
      assert.equal(JSON.stringify(body).includes('super-secret-key-12345'), false);
    });
  });

  // ---------------------------------------------------------------------------
  // CORS and HTTP method enforcement
  // ---------------------------------------------------------------------------
  describe('CORS and HTTP method enforcement', () => {
    it('handles OPTIONS preflight with 204 and CORS headers', async () => {
      const request = new Request('http://localhost:8787/api/news', { method: 'OPTIONS' });
      const response = await handleRequest(request, {});

      assert.equal(response.status, 204);
      assert.equal(response.headers.get('access-control-allow-origin'), '*');
      assert.equal(response.headers.get('access-control-allow-methods'), 'GET, OPTIONS');
    });

    it('rejects POST requests with 405 Method Not Allowed', async () => {
      const request = new Request('http://localhost:8787/api/news', { method: 'POST' });
      const response = await handleRequest(request, {});

      assert.equal(response.status, 405);
      const body = await response.json();
      assert.deepEqual(body, { error: 'Method not allowed' });
    });

    it('returns 404 for unknown endpoints', async () => {
      const request = new Request('http://localhost:8787/api/unknown', { method: 'GET' });
      const response = await handleRequest(request, {});

      assert.equal(response.status, 404);
      const body = await response.json();
      assert.deepEqual(body, { error: 'Not found' });
    });
  });

  // ---------------------------------------------------------------------------
  // /api/news configuration checks
  // ---------------------------------------------------------------------------
  describe('GET /api/news configuration checks', () => {
    it('returns 500 when GNEWS_API_KEY is missing or empty', async () => {
      const request = new Request('http://localhost:8787/api/news', { method: 'GET' });

      const response1 = await handleRequest(request, {});
      assert.equal(response1.status, 500);
      const body1 = await response1.json();
      assert.deepEqual(body1, { error: 'News proxy service is not configured' });

      const response2 = await handleRequest(request, { GNEWS_API_KEY: '   ' });
      assert.equal(response2.status, 500);
    });
  });

  // ---------------------------------------------------------------------------
  // /api/news upstream error handling
  // ---------------------------------------------------------------------------
  describe('GET /api/news upstream error handling', () => {
    const env: Env = { GNEWS_API_KEY: 'test-api-key-999' };

    it('returns 429 when upstream returns HTTP 429 (rate limit)', async () => {
      globalThis.fetch = async () => new Response('Too Many Requests', { status: 429 });

      const request = new Request('http://localhost:8787/api/news', { method: 'GET' });
      const response = await handleRequest(request, env);

      assert.equal(response.status, 429);
      const body = await response.json();
      assert.deepEqual(body, { error: 'Upstream news request limit reached' });
    });

    it('returns 429 when upstream returns HTTP 403 with GNews quota-exhaustion body', async () => {
      // GNews Free plan returns 403 for daily quota exhaustion with body
      // indicating the plan/limit was reached.
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({ errors: ['You have exceeded your daily request limit for the free plan.'] }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        );

      const request = new Request('http://localhost:8787/api/news', { method: 'GET' });
      const response = await handleRequest(request, env);

      assert.equal(response.status, 429);
      const body = await response.json();
      assert.deepEqual(body, { error: 'Upstream news request limit reached' });
      // Raw upstream body must never be forwarded
      assert.equal(JSON.stringify(body).includes('free plan'), false);
    });

    it('returns 502 when upstream returns HTTP 403 for an unverified email account', async () => {
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({ errors: ["Your account's email address isn't verified."] }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        );

      const request = new Request('http://localhost:8787/api/news', { method: 'GET' });
      const response = await handleRequest(request, env);

      assert.equal(response.status, 502);
      const body = await response.json();
      assert.deepEqual(body, { error: 'Upstream authentication failed' });
    });

    it('returns 502 when upstream returns HTTP 401 for invalid credentials (never reveals key)', async () => {
      globalThis.fetch = async () =>
        new Response(JSON.stringify({ errors: ['The API key does not match any account.'] }), { status: 401 });

      const request = new Request('http://localhost:8787/api/news', { method: 'GET' });
      const response = await handleRequest(request, env);

      assert.equal(response.status, 502);
      const body = await response.json();
      assert.deepEqual(body, { error: 'Upstream authentication failed' });
      assert.equal(JSON.stringify(body).includes('test-api-key-999'), false);
    });

    it('returns 502 when upstream network fetch fails', async () => {
      globalThis.fetch = async () => {
        throw new Error('Connection refused');
      };

      const request = new Request('http://localhost:8787/api/news', { method: 'GET' });
      const response = await handleRequest(request, env);

      assert.equal(response.status, 502);
      const body = await response.json();
      assert.deepEqual(body, { error: 'Failed to connect to upstream news service' });
    });

    it('returns 502 when upstream returns malformed non-JSON data', async () => {
      globalThis.fetch = async () =>
        new Response('<html>Error</html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        });

      const request = new Request('http://localhost:8787/api/news', { method: 'GET' });
      const response = await handleRequest(request, env);

      assert.equal(response.status, 502);
      const body = await response.json();
      assert.deepEqual(body, { error: 'Malformed response from upstream news provider' });
    });

    it('returns 502 when upstream JSON does not contain an articles array', async () => {
      globalThis.fetch = async () =>
        new Response(JSON.stringify({ totalArticles: 0 }), { status: 200 });

      const request = new Request('http://localhost:8787/api/news', { method: 'GET' });
      const response = await handleRequest(request, env);

      assert.equal(response.status, 502);
      const body = await response.json();
      assert.deepEqual(body, { error: 'Invalid articles structure from upstream news provider' });
    });
  });

  // ---------------------------------------------------------------------------
  // isGNewsQuotaExhausted helper
  // ---------------------------------------------------------------------------
  describe('isGNewsQuotaExhausted', () => {
    it('returns true for bodies containing quota-related keywords', async () => {
      const bodies = [
        '{"errors":["You have exceeded your daily request limit."]}',
        '{"errors":["quota exhausted"]}',
        '{"errors":["Your plan limit has been reached."]}',
        '{"message":"Daily limit exceeded"}',
      ];
      for (const body of bodies) {
        const res = new Response(body, { status: 403 });
        assert.equal(await isGNewsQuotaExhausted(res), true, `Expected quota for: ${body}`);
      }
    });

    it('returns false for non-quota 403 bodies', async () => {
      const bodies = [
        '{"errors":["Your account email is not verified."]}',
        '{"errors":["Verify your email address."]}',
        '{"message":"Email verification is required."}',
      ];
      for (const body of bodies) {
        const res = new Response(body, { status: 403 });
        assert.equal(await isGNewsQuotaExhausted(res), false, `Expected non-quota response for: ${body}`);
      }
    });

    it('returns false conservatively when body is empty or unreadable', async () => {
      const res = new Response('', { status: 403 });
      assert.equal(await isGNewsQuotaExhausted(res), false);
    });
  });

  // ---------------------------------------------------------------------------
  // /api/news successful normalization and secret protection
  // ---------------------------------------------------------------------------
  describe('GET /api/news successful normalization and secret protection', () => {
    it('authenticates with X-Api-Key header and normalizes response without leaking key', async () => {
      const secretKey = 'gnews-super-secret-key-xyz';
      const env: Env = { GNEWS_API_KEY: secretKey };

      let capturedHeaders: Headers | undefined;
      let capturedUrl: string | undefined;

      globalThis.fetch = async (input, init) => {
        capturedUrl = String(input);
        capturedHeaders = new Headers(init?.headers);
        return new Response(
          JSON.stringify({
            totalArticles: 1,
            articles: [
              {
                id: 'article-123',
                title: 'Premier League Matchday Review',
                description: 'Key highlights from the weekend games.',
                url: 'https://news.example.com/epl-review',
                image: 'https://images.example.com/epl.jpg',
                publishedAt: '2026-10-25T18:00:00Z',
                source: { name: 'Premier League News' },
              },
            ],
          }),
          { status: 200 }
        );
      };

      const request = new Request('http://localhost:8787/api/news', { method: 'GET' });
      const response = await handleRequest(request, env);

      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'application/json');
      assert.match(response.headers.get('cache-control') || '', /max-age=1800/);

      // Verify upstream request headers
      assert.equal(capturedHeaders?.get('x-api-key'), secretKey);
      assert.equal(capturedUrl?.includes(secretKey), false);

      const body = (await response.json()) as NormalizedNewsResponse;
      assert.equal(Array.isArray(body.articles), true);
      assert.equal(body.articles.length, 1);
      assert.equal(body.articles[0].id, 'article-123');
      assert.equal(body.articles[0].title, 'Premier League Matchday Review');

      // CRITICAL: Ensure the secret key never appears in the output body or response headers
      const bodyStr = JSON.stringify(body);
      assert.equal(bodyStr.includes(secretKey), false);
      for (const [, headerVal] of response.headers.entries()) {
        assert.equal(headerVal.includes(secretKey), false);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // /api/news caching behavior
  // ---------------------------------------------------------------------------
  describe('GET /api/news caching behavior', () => {
    it('serves cached response on subsequent requests without calling upstream fetch', async () => {
      const env: Env = { GNEWS_API_KEY: 'test-key' };
      const cacheStore = new Map<string, Response>();

      // Mock Cloudflare Cache API
      const mockCache = {
        async match(req: Request) {
          const res = cacheStore.get(req.url);
          return res ? res.clone() : undefined;
        },
        async put(req: Request, res: Response) {
          cacheStore.set(req.url, res.clone());
        },
      };

      (globalThis as unknown as { caches: { default: typeof mockCache } }).caches = {
        default: mockCache,
      };

      let upstreamCalls = 0;
      globalThis.fetch = async () => {
        upstreamCalls++;
        return new Response(
          JSON.stringify({
            totalArticles: 1,
            articles: [
              {
                id: 'cached-art-1',
                title: 'Cached Article',
                url: 'https://example.com/cached',
                publishedAt: '2026-10-25T12:00:00Z',
              },
            ],
          }),
          { status: 200 }
        );
      };

      // Request 1: Cache Miss
      const req1 = new Request('http://localhost:8787/api/news', { method: 'GET' });
      const res1 = await handleRequest(req1, env);
      assert.equal(res1.status, 200);
      assert.equal(res1.headers.get('x-cache'), 'MISS');
      assert.equal(upstreamCalls, 1);

      // Request 2: Cache Hit
      const req2 = new Request('http://localhost:8787/api/news', { method: 'GET' });
      const res2 = await handleRequest(req2, env);
      assert.equal(res2.status, 200);
      assert.equal(res2.headers.get('x-cache'), 'HIT');
      assert.equal(upstreamCalls, 1); // Upstream was NOT called again

      const body = (await res2.json()) as NormalizedNewsResponse;
      assert.equal(body.articles[0].id, 'cached-art-1');
    });

    it('does NOT cache upstream error responses (non-200)', async () => {
      const env: Env = { GNEWS_API_KEY: 'test-key' };
      const cacheStore = new Map<string, Response>();

      const mockCache = {
        async match(req: Request) {
          const res = cacheStore.get(req.url);
          return res ? res.clone() : undefined;
        },
        async put(req: Request, res: Response) {
          cacheStore.set(req.url, res.clone());
        },
      };

      (globalThis as unknown as { caches: { default: typeof mockCache } }).caches = {
        default: mockCache,
      };

      let upstreamCalls = 0;
      globalThis.fetch = async () => {
        upstreamCalls++;
        return new Response('Too Many Requests', { status: 429 });
      };

      // Request 1: upstream returns 429 — should NOT be cached
      const req1 = new Request('http://localhost:8787/api/news', { method: 'GET' });
      const res1 = await handleRequest(req1, env);
      assert.equal(res1.status, 429);

      // Request 2: should go to upstream again (nothing cached)
      const req2 = new Request('http://localhost:8787/api/news', { method: 'GET' });
      const res2 = await handleRequest(req2, env);
      assert.equal(res2.status, 429);
      assert.equal(upstreamCalls, 2); // Both went upstream — error was not cached
    });
  });
});
