import { useIsFocused } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import { livePollMs, liveStaleTime, shouldPollLiveList } from '@/lib/api/queryConfig';
import { queryKeys } from '@/lib/api/queryKeys';
import { footballRepository } from '@/lib/api/repository';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import type { Match } from '@/types/football';

export function useLiveFixtures(options?: { poll?: boolean; focused?: boolean }) {
  const dataSaver = usePreferencesStore((state) => state.dataSaver);
  const liveAutoRefresh = usePreferencesStore((state) => state.liveAutoRefresh);
  const navigationFocused = useIsFocused();
  const focused = options?.focused ?? navigationFocused;
  const poll = options?.poll === true;

  return useQuery({
    queryKey: queryKeys.live,
    queryFn: (): Promise<Match[]> => footballRepository.liveMatches(),
    staleTime: liveStaleTime(dataSaver),
    refetchInterval: () => {
      if (!shouldPollLiveList({ poll, focused, dataSaver, liveAutoRefresh })) {
        return false;
      }
      return livePollMs.normal;
    },
    refetchIntervalInBackground: false,
  });
}
