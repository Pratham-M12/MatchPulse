import { useQuery } from '@tanstack/react-query';

import { fixtureStaleTime } from '@/lib/api/queryConfig';
import { queryKeys } from '@/lib/api/queryKeys';
import { footballRepository } from '@/lib/api/repository';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import type { Match } from '@/types/football';

export function useFixturesByDate(date: string, enabled = true) {
  const dataSaver = usePreferencesStore((state) => state.dataSaver);

  return useQuery({
    queryKey: queryKeys.byDate(date),
    queryFn: (): Promise<Match[]> => footballRepository.matchesByDate(date),
    staleTime: fixtureStaleTime(dataSaver),
    enabled: enabled && Boolean(date),
  });
}
