import { useIsFocused } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import { detailStaleTime, livePollMs, shouldPollLiveMatch } from '@/lib/api/queryConfig';
import { queryKeys } from '@/lib/api/queryKeys';
import { footballRepository } from '@/lib/api/repository';
import { isUnsupportedEndpoint } from '@/lib/api/errors';
import { getMatchById, getMatchDetailsById } from '@/data';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import type { Match, MatchDetails, MatchLineup, MatchPrediction } from '@/types/football';

export function useFixtureDetails(fixtureId: string, options?: { focused?: boolean }) {
  const dataSaver = usePreferencesStore((state) => state.dataSaver);
  const liveAutoRefresh = usePreferencesStore((state) => state.liveAutoRefresh);
  const navigationFocused = useIsFocused();
  const focused = options?.focused ?? navigationFocused;

  const staleTime = detailStaleTime(dataSaver);
  const mockMatch = getMatchById(fixtureId);
  const mockDetails = mockMatch ? getMatchDetailsById(mockMatch.id) : undefined;
  const shouldUseApi = !mockMatch;

  const fixtureQuery = useQuery({
    queryKey: queryKeys.fixture(fixtureId),
    queryFn: () => footballRepository.matchById(fixtureId),
    enabled: shouldUseApi && Boolean(fixtureId),
    staleTime,
    refetchInterval: (query) => {
      const currentMatch = (query.state.data as Match | undefined) ?? mockMatch;
      const isMatchLive = currentMatch?.status === 'live';
      if (!shouldPollLiveMatch({ isLive: isMatchLive, focused, dataSaver, liveAutoRefresh })) {
        return false;
      }
      return livePollMs.matchDetail;
    },
    refetchIntervalInBackground: false,
  });

  const match: Match | undefined = mockMatch ?? fixtureQuery.data;
  const hasStarted = Boolean(match && match.status !== 'scheduled' && match.status !== 'postponed');
  const isLive = match?.status === 'live';
  const shouldPoll = shouldPollLiveMatch({ isLive, focused, dataSaver, liveAutoRefresh });

  const eventsQuery = useQuery({
    queryKey: queryKeys.events(fixtureId),
    queryFn: () => footballRepository.events(fixtureId, match!.homeTeam.id),
    enabled: shouldUseApi && hasStarted,
    staleTime: isLive ? 15_000 : 10 * 60_000,
    refetchInterval: () => (shouldPoll ? livePollMs.matchDetail : false),
    refetchIntervalInBackground: false,
  });

  const statsQuery = useQuery({
    queryKey: queryKeys.statistics(fixtureId),
    queryFn: () => footballRepository.statistics(fixtureId, match!.homeTeam.id),
    enabled: shouldUseApi && hasStarted,
    staleTime: isLive ? 15_000 : 10 * 60_000,
    refetchInterval: () => (shouldPoll ? livePollMs.matchDetail : false),
    refetchIntervalInBackground: false,
  });

  const lineupsQuery = useQuery({
    queryKey: queryKeys.lineups(fixtureId),
    queryFn: async (): Promise<MatchLineup[]> => footballRepository.lineups(fixtureId),
    enabled: shouldUseApi && Boolean(match),
    staleTime: 30 * 60_000,
    retry: false,
    refetchInterval: false,
  });

  const predictionQuery = useQuery({
    queryKey: queryKeys.prediction(fixtureId),
    queryFn: () => footballRepository.prediction(fixtureId),
    enabled: shouldUseApi && Boolean(match) && match?.status === 'scheduled',
    staleTime: 60 * 60_000,
    retry: false,
    refetchInterval: false,
  });

  const lineupsUnavailable = isUnsupportedEndpoint(lineupsQuery.error);
  const predictionUnavailable = isUnsupportedEndpoint(predictionQuery.error);

  const details: MatchDetails | undefined = mockMatch
    ? mockDetails
    : match
      ? {
          events: eventsQuery.data ?? [],
          stats: statsQuery.data,
          lineups: lineupsQuery.data,
          prediction: predictionQuery.data,
        }
      : undefined;

  return {
    match,
    details,
    isLocal: Boolean(mockMatch),
    isLoading: shouldUseApi && fixtureQuery.isLoading,
    isError: shouldUseApi && fixtureQuery.isError,
    isFetching: shouldUseApi && fixtureQuery.isFetching,
    dataUpdatedAt: fixtureQuery.dataUpdatedAt,
    refetch: async () => {
      await Promise.all([
        fixtureQuery.refetch(),
        hasStarted ? eventsQuery.refetch() : undefined,
        hasStarted ? statsQuery.refetch() : undefined,
      ]);
    },
    lineups: (lineupsQuery.data ?? []) as MatchLineup[],
    prediction: predictionQuery.data as MatchPrediction | undefined,
    lineupsUnavailable,
    predictionUnavailable,
    eventsLoading: eventsQuery.isLoading,
    statsLoading: statsQuery.isLoading,
  };
}
