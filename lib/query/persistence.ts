import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  dehydrate,
  hydrate,
  type DehydratedState,
  type Query,
  type QueryClient,
} from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';

export const PERSISTENCE_KEY = 'matchpulse-query-cache-v1';
export const PERSISTENCE_VERSION = 1;
export const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60_000; // 7 days max cache age
export const PERSIST_DEBOUNCE_MS = 1000; // 1s throttle/debounce

export interface PersistedQueryCachePayload {
  version: number;
  timestamp: number;
  clientState: DehydratedState;
}

/**
 * Filter for queries eligible for offline persistence.
 * Only successfully resolved, user-facing queries are persisted.
 */
export function shouldDehydrateQuery(query: Query): boolean {
  if (query.state.status !== 'success' || query.state.data == null) {
    return false;
  }

  const rootKey = String(query.queryKey[0]);
  const allowedRoots = new Set([
    'fixtures',
    'fixture',
    'standings',
    'team',
    'squad',
    'topscorers',
    'player',
    'search',
    'league',
    'account',
    'news',
  ]);

  return allowedRoots.has(rootKey);
}

/**
 * Validates a payload read from storage.
 */
export function isValidPersistedPayload(payload: unknown): payload is PersistedQueryCachePayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  if (typeof p.version !== 'number' || typeof p.timestamp !== 'number') return false;
  if (!p.clientState || typeof p.clientState !== 'object') return false;
  const cs = p.clientState as Record<string, unknown>;
  if (!Array.isArray(cs.queries)) return false;
  return true;
}

/**
 * Hydrates the query client from AsyncStorage.
 * Gracefully handles corrupted data, expiration, or missing storage.
 */
export async function hydrateQueryClient(queryClient: QueryClient): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(PERSISTENCE_KEY);
    if (!raw) return false;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Corrupt JSON string
      if (__DEV__) console.warn('[persistence] Corrupt cache found, purging.');
      await AsyncStorage.removeItem(PERSISTENCE_KEY).catch(() => {});
      return false;
    }

    if (!isValidPersistedPayload(parsed)) {
      if (__DEV__) console.warn('[persistence] Invalid cache payload structure, purging.');
      await AsyncStorage.removeItem(PERSISTENCE_KEY).catch(() => {});
      return false;
    }

    // Version check
    if (parsed.version !== PERSISTENCE_VERSION) {
      if (__DEV__) {
        console.log(`[persistence] Cache version mismatch (${parsed.version} vs ${PERSISTENCE_VERSION}), purging.`);
      }
      await AsyncStorage.removeItem(PERSISTENCE_KEY).catch(() => {});
      return false;
    }

    // Expiry check
    const age = Date.now() - parsed.timestamp;
    if (age > MAX_CACHE_AGE_MS || age < 0) {
      if (__DEV__) console.log('[persistence] Cache expired, purging.');
      await AsyncStorage.removeItem(PERSISTENCE_KEY).catch(() => {});
      return false;
    }

    hydrate(queryClient, parsed.clientState);
    if (__DEV__) {
      console.log(`[persistence] Hydrated ${parsed.clientState.queries.length} queries from offline cache.`);
    }
    return true;
  } catch (error) {
    if (__DEV__) console.warn('[persistence] Failed to hydrate cache:', error);
    return false;
  }
}

/**
 * Saves current query client state to AsyncStorage immediately.
 */
export async function saveQueryCacheNow(queryClient: QueryClient): Promise<void> {
  try {
    const clientState = dehydrate(queryClient, {
      shouldDehydrateQuery,
    });

    // Don't overwrite existing persisted cache with empty state if no queries exist yet
    if (!clientState.queries.length) {
      return;
    }

    const payload: PersistedQueryCachePayload = {
      version: PERSISTENCE_VERSION,
      timestamp: Date.now(),
      clientState,
    };

    await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(payload));
  } catch (error) {
    if (__DEV__) console.warn('[persistence] Failed to persist cache:', error);
  }
}

/**
 * Attaches a debounced persistence listener to the query cache,
 * and flushes immediately when app is backgrounded.
 * Returns an unsubscribe function.
 */
export function attachQueryPersistence(
  queryClient: QueryClient,
  debounceMs = PERSIST_DEBOUNCE_MS
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    // Only persist on meaningful cache events
    if (
      event.type === 'added' ||
      event.type === 'updated' ||
      event.type === 'removed'
    ) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void saveQueryCacheNow(queryClient);
      }, debounceMs);
    }
  });

  const appStateSub = AppState.addEventListener('change', (status: AppStateStatus) => {
    if (status === 'background' || status === 'inactive') {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      void saveQueryCacheNow(queryClient);
    }
  });

  return () => {
    if (timer) clearTimeout(timer);
    appStateSub.remove();
    unsubscribe();
  };
}

/**
 * Clears the persisted cache from AsyncStorage.
 */
export async function clearQueryCacheStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PERSISTENCE_KEY);
  } catch (error) {
    if (__DEV__) console.warn('[persistence] Failed to clear storage:', error);
  }
}
