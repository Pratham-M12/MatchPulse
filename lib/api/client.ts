import axios from 'axios';

import { recordApiCall } from '@/lib/api/diagnostics';
import {
  assertNoApiFootballErrors,
  QuotaExceededError,
  UnsupportedEndpointError,
} from '@/lib/api/errors';

export const DEFAULT_FOOTBALL_PROXY_URL =
  'https://matchpulse-football-proxy.prathammendon12.workers.dev';

/**
 * MatchPulse API-Football client.
 *
 * All football data requests route through the MatchPulse Cloudflare Worker
 * proxy (services/football-proxy/), which holds the upstream API-Football key
 * securely as a Cloudflare Worker secret and enforces request budgets,
 * edge rate limiting, and response caching.
 *
 * The mobile client never receives or transmits API-Football provider keys.
 * Base URL can be overridden via EXPO_PUBLIC_FOOTBALL_PROXY_URL for staging/testing.
 */
const baseURL =
  process.env.EXPO_PUBLIC_FOOTBALL_PROXY_URL?.trim() || DEFAULT_FOOTBALL_PROXY_URL;

export const apiFootballClient = axios.create({
  baseURL,
  timeout: 12000,
  headers: {
    Accept: 'application/json',
  },
});

apiFootballClient.interceptors.request.use((config) => {
  recordApiCall(config.method ?? 'get', config.url ?? '', config.params);
  return config;
});

apiFootballClient.interceptors.response.use(
  (response) => {
    assertNoApiFootballErrors(response.data, response.config.url ?? '');
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.data) {
        assertNoApiFootballErrors(error.response.data, error.config?.url ?? '');
      }
      if (error.response?.status === 429) {
        return Promise.reject(new QuotaExceededError('API request limit reached (HTTP 429).'));
      }
      if (error.response?.status === 403) {
        return Promise.reject(
          new UnsupportedEndpointError(error.config?.url ?? '', 'Endpoint access forbidden (HTTP 403).')
        );
      }
    }
    return Promise.reject(error);
  }
);

/** Seam for a future backend proxy. Screens never import this client. */
export type FootballApiClient = typeof apiFootballClient;