import { normalizeGNewsArticles } from './normalize.ts';
import type { Env, GNewsResponseRaw } from './types.ts';

export const GNEWS_API_BASE = 'https://gnews.io/api/v4/search';
export const CACHE_MAX_AGE_SECONDS = 1800; // 30 minutes

export function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function handleRequest(
  request: Request,
  env: Env,
  ctx?: { waitUntil: (promise: Promise<unknown>) => void }
): Promise<Response> {
  const url = new URL(request.url);

  // 1. CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  // 2. Reject non-GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(),
      },
    });
  }

  // 3. Health check endpoint
  if (url.pathname === '/health') {
    return new Response(
      JSON.stringify({ status: 'ok', service: 'matchpulse-news-proxy' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          ...corsHeaders(),
        },
      }
    );
  }

  // 4. Normalized news endpoint
  if (url.pathname === '/api/news') {
    const apiKey = env.GNEWS_API_KEY?.trim();
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'News proxy service is not configured' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...corsHeaders(),
          },
        }
      );
    }

    // Canonical cache key for the fixed news request
    const cacheUrl = new URL('/api/news', request.url).toString();
    const cacheKey = new Request(cacheUrl, { method: 'GET' });

    // Cloudflare response cache check
    const cache = typeof caches !== 'undefined' && caches.default ? caches.default : null;
    if (cache) {
      try {
        const cached = await cache.match(cacheKey);
        if (cached) {
          const cachedHeaders = new Headers(cached.headers);
          cachedHeaders.set('X-Cache', 'HIT');
          cachedHeaders.set('Access-Control-Allow-Origin', '*');
          return new Response(cached.body, {
            status: cached.status,
            statusText: cached.statusText,
            headers: cachedHeaders,
          });
        }
      } catch {
        // Continue to upstream fetch if cache read throws
      }
    }

    // Upstream GNews request with fixed parameters
    const upstreamUrl = new URL(GNEWS_API_BASE);
    upstreamUrl.searchParams.set('q', 'football OR soccer');
    upstreamUrl.searchParams.set('lang', 'en');
    upstreamUrl.searchParams.set('max', '10');
    upstreamUrl.searchParams.set('in', 'title,description');
    upstreamUrl.searchParams.set('sortby', 'publishedAt');

    let upstreamRes: Response;
    try {
      upstreamRes = await fetch(upstreamUrl.toString(), {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
          'Accept': 'application/json',
          'User-Agent': 'MatchPulseNewsProxy/1.0',
        },
      });
    } catch {
      return new Response(
        JSON.stringify({ error: 'Failed to connect to upstream news service' }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...corsHeaders(),
          },
        }
      );
    }

    // Handle upstream rate limiting (429)
    if (upstreamRes.status === 429) {
      return new Response(
        JSON.stringify({ error: 'Upstream news request limit reached' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...corsHeaders(),
          },
        }
      );
    }

    // Handle upstream authentication errors (401/403) without leaking keys
    if (upstreamRes.status === 401 || upstreamRes.status === 403) {
      return new Response(
        JSON.stringify({ error: 'Upstream authentication failed' }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...corsHeaders(),
          },
        }
      );
    }

    if (!upstreamRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Upstream news provider returned an error' }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...corsHeaders(),
          },
        }
      );
    }

    let rawData: GNewsResponseRaw;
    try {
      rawData = (await upstreamRes.json()) as GNewsResponseRaw;
    } catch {
      return new Response(
        JSON.stringify({ error: 'Malformed response from upstream news provider' }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...corsHeaders(),
          },
        }
      );
    }

    if (!rawData || !Array.isArray(rawData.articles)) {
      return new Response(
        JSON.stringify({ error: 'Invalid articles structure from upstream news provider' }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...corsHeaders(),
          },
        }
      );
    }

    const articles = normalizeGNewsArticles(rawData.articles);

    const responseBody = JSON.stringify({ articles });
    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${CACHE_MAX_AGE_SECONDS}, s-maxage=${CACHE_MAX_AGE_SECONDS}`,
      'X-Cache': 'MISS',
      ...corsHeaders(),
    };

    const response = new Response(responseBody, {
      status: 200,
      headers: responseHeaders,
    });

    // Cache successful, validated 200 responses in Cloudflare Cache API
    if (cache) {
      try {
        const toCache = response.clone();
        if (ctx?.waitUntil) {
          ctx.waitUntil(cache.put(cacheKey, toCache));
        } else {
          await cache.put(cacheKey, toCache);
        }
      } catch {
        // Cache put error should not fail client response
      }
    }

    return response;
  }

  // 5. Route not found
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
  });
}

export default {
  fetch: handleRequest,
};
