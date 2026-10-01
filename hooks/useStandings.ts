import { useQuery } from '@tanstack/react-query';

import { getCurrentSeason } from '@/lib/api/currentSeason';
import { isUnsupportedEndpoint } from '@/lib/api/errors';
import { getApiLeagueId } from '@/lib/api/leagueIds';
import { standingsStaleTime } from '@/lib/api/queryConfig';
import { queryKeys } from '@/lib/api/queryKeys';
import { footballRepository } from '@/lib/api/repository';
import { useLeagueSeason } from '@/hooks/useSeason';
import { usePreferencesStore } from '@/store/usePreferencesStore';

export function useStandings(competitionId?: string) {
  const dataSaver = usePreferencesStore((state) => state.dataSaver);
  const apiLeagueId = competitionId ? getApiLeagueId(competitionId) : undefined;
  const { data: season, isLoading: isSeasonLoading } = useLeagueSeason(apiLeagueId, 'standings');

  const query = useQuery({
    queryKey: queryKeys.standings(competitionId ?? '', season ?? 0),
    queryFn: () => footballRepository.standings(apiLeagueId!, season!),
    enabled: Boolean(apiLeagueId && season),
    staleTime: standingsStaleTime(dataSaver),
    retry: false,
  });

  return {
    ...query,
    isLoading: Boolean(apiLeagueId) && (isSeasonLoading || query.isLoading),
    unavailable: isUnsupportedEndpoint(query.error),
    season: season ?? getCurrentSeason(),
  };
}
