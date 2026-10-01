import axios from 'axios';

export class UnsupportedEndpointError extends Error {
  readonly endpoint: string;

  constructor(endpoint: string, message?: string) {
    super(message ?? `This data source is not available on the current API plan (${endpoint}).`);
    this.name = 'UnsupportedEndpointError';
    this.endpoint = endpoint;
  }
}

export class QuotaExceededError extends Error {
  readonly details?: string;

  constructor(message = 'API request limit reached for today.', details?: string) {
    super(details ? `${message} (${details})` : message);
    this.name = 'QuotaExceededError';
    this.details = details;
  }
}

export class ApiFootballError extends Error {
  readonly errors: Record<string, string>;

  constructor(errors: Record<string, string>, message?: string) {
    super(message ?? `API-Football error: ${Object.values(errors).join(', ')}`);
    this.name = 'ApiFootballError';
    this.errors = errors;
  }
}

export function isUnsupportedEndpoint(error: unknown): boolean {
  if (error instanceof UnsupportedEndpointError) return true;
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  const data = error.response?.data as { errors?: Record<string, string> } | undefined;
  const errMap = data?.errors;
  const hasPlanErr = Boolean(errMap && typeof errMap === 'object' && 'plan' in errMap);
  return status === 403 || hasPlanErr;
}

export function isQuotaError(error: unknown): boolean {
  if (error instanceof QuotaExceededError) return true;
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  const data = error.response?.data as { errors?: Record<string, string> } | undefined;
  const errMap = data?.errors;
  const hasQuotaErr = Boolean(
    errMap && typeof errMap === 'object' && ('requests' in errMap || 'rateLimit' in errMap)
  );
  return status === 429 || hasQuotaErr;
}

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (isUnsupportedEndpoint(error) || isQuotaError(error)) return false;
  return failureCount < 1;
}

/**
 * Validates API-Football v3 response envelope for HTTP 200 error payloads.
 *
 * API-Football returns HTTP 200 with an `errors` map when:
 * - Daily quota is exceeded: `{ errors: { requests: "..." } }`
 * - Feature not in plan: `{ errors: { plan: "..." } }`
 * - Parameter or auth error: `{ errors: { token: "..." } }`
 *
 * Legitimate empty responses have `errors: []` or empty `errors: {}`.
 */
export function assertNoApiFootballErrors(data: unknown, endpoint = ''): void {
  if (!data || typeof data !== 'object') return;

  const { errors } = data as { errors?: unknown };
  if (!errors) return;

  // Case 1: errors is an array (API-Football standard for empty errors: errors: [])
  if (Array.isArray(errors)) {
    if (errors.length === 0) return;
    const firstErr = String(errors[0]);
    if (firstErr.toLowerCase().includes('plan')) {
      throw new UnsupportedEndpointError(endpoint, firstErr);
    }
    if (firstErr.toLowerCase().includes('limit') || firstErr.toLowerCase().includes('request')) {
      throw new QuotaExceededError(firstErr);
    }
    throw new Error(firstErr);
  }

  // Case 2: errors is an object map
  if (typeof errors === 'object' && errors !== null) {
    const errorMap = errors as Record<string, string>;
    const keys = Object.keys(errorMap);
    if (keys.length === 0) return;

    if (errorMap.plan) {
      throw new UnsupportedEndpointError(endpoint, errorMap.plan);
    }

    if (errorMap.requests) {
      throw new QuotaExceededError(errorMap.requests);
    }

    if (errorMap.rateLimit) {
      throw new QuotaExceededError(errorMap.rateLimit);
    }

    throw new ApiFootballError(errorMap);
  }
}