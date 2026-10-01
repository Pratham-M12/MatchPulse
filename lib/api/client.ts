import axios from 'axios';

import { recordApiCall } from '@/lib/api/diagnostics';
import {
  assertNoApiFootballErrors,
  QuotaExceededError,
  UnsupportedEndpointError,
} from '@/lib/api/errors';

/**
 * API-Football (API-SPORTS) client.
 *
 * The key must be set as EXPO_PUBLIC_API_FOOTBALL_KEY in a local .env
 * file (see .env.example) — never hardcoded here or committed to Git.
 *
 * Security note: EXPO_PUBLIC_ variables are inlined into the JS bundle
 * at build time, so this key IS technically extractable from a built
 * app. This client is behind a repository interface so a backend proxy
 * can replace it later without rewriting screens.
 */
export const apiFootballClient = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  timeout: 12000,
  headers: {
    'x-apisports-key': process.env.EXPO_PUBLIC_API_FOOTBALL_KEY ?? '',
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