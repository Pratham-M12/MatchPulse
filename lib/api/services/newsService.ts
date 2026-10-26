/**
 * News service — fetches football news from the MatchPulse GNews proxy.
 *
 * The proxy (services/news-proxy/) shields the GNews API key from the client
 * bundle.  The public URL is configured via EXPO_PUBLIC_NEWS_PROXY_URL.
 *
 * Falls back gracefully when the proxy URL is not configured so that the
 * existing UnsupportedEndpointError handling in the UI continues to work.
 */
import type { ProxyNewsResponse } from '@/lib/api/dto/newsDto';
import { UnsupportedEndpointError, QuotaExceededError } from '@/lib/api/errors';

const NEWS_PROXY_URL =
  process.env.EXPO_PUBLIC_NEWS_PROXY_URL?.trim() ?? '';

export async function fetchFootballNews(): Promise<ProxyNewsResponse> {
  if (!NEWS_PROXY_URL) {
    // Proxy not configured — surface as "not available on current plan" so the
    // UI can display its neutral placeholder instead of an error screen.
    throw new UnsupportedEndpointError('/news', 'Football news proxy is not configured.');
  }

  const endpoint = `${NEWS_PROXY_URL.replace(/\/+$/, '')}/api/news`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new Error('Failed to connect to football news proxy.');
  }

  if (response.status === 429) {
    throw new QuotaExceededError('Football news request limit reached.');
  }

  if (!response.ok) {
    throw new UnsupportedEndpointError('/news', `News proxy returned ${response.status}.`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error('Malformed response from football news proxy.');
  }

  if (!data || typeof data !== 'object' || !Array.isArray((data as ProxyNewsResponse).articles)) {
    throw new Error('Invalid articles structure from football news proxy.');
  }

  return data as ProxyNewsResponse;
}
