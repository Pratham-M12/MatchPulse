import NetInfo from '@react-native-community/netinfo';
import { onlineManager, QueryClient } from '@tanstack/react-query';

import { QUERY_GC_TIME } from '@/lib/api/queryConfig';
import { shouldRetryQuery } from '@/lib/api/errors';

// Synchronize TanStack Query online state with React Native NetInfo
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(state.isConnected !== false);
  });
});

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetryQuery,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        gcTime: QUERY_GC_TIME,
        staleTime: 5 * 60_000,
      },
    },
  });
}
