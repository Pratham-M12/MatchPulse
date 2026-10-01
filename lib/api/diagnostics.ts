type ApiCallRecord = {
  at: number;
  method: string;
  path: string;
  params?: unknown;
};

const MAX_LOG = 80;
const log: ApiCallRecord[] = [];
let totalRequests = 0;

export function recordApiCall(method: string, path: string, params?: unknown) {
  totalRequests += 1;
  log.unshift({ at: Date.now(), method, path, params });
  if (log.length > MAX_LOG) log.pop();
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[api-football #${totalRequests}]`, method.toUpperCase(), path, params ?? '');
  }
}

export function getApiDiagnostics() {
  return {
    totalRequests,
    recent: [...log],
  };
}

export function resetApiDiagnostics() {
  totalRequests = 0;
  log.length = 0;
}
