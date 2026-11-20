import { useQuery } from '@tanstack/react-query';

import { getCurrentSeason, localIsoDateOffset } from '@/lib/api/currentSeason';
import { getApiLeagueId } from '@/lib/api/leagueIds';
import { fixtureStaleTime, standingsStaleTime } from '@/lib/api/queryConfig';
import { queryKeys } from '@/lib/api/queryKeys';
import { footballRepository } from '@/lib/api/repository';
import { isUnsupportedEndpoint } from '@/lib/api/errors';
import { getCompetitionById, getMatchesByCompetition, getPlayersByTeam } from '@/data';
import { useLeagueSeason } from '@/hooks/useSeason';
import { usePreferencesStore } from '@/store/usePreferencesStore';

export function useLeaguePage(competitionId: string) {
  const dataSaver = usePreferencesStore((state) => state.dataSaver);
  const apiLeagueId = getApiLeagueId(competitionId);
  const local = getCompetitionById(competitionId);
  const { data: season, isLoading: isSeasonLoading, isFetching: isSeasonFetching } = useLeagueSeason(apiLeagueId);

  const standingsQuery = useQuery({
    queryKey: queryKeys.standings(competitionId, season ?? 0),
    queryFn: () => footballRepository.standings(apiLeagueId!, season!),
    enabled: Boolean(apiLeagueId && season),
    staleTime: standingsStaleTime(dataSaver),
    retry: false,
  });

  const fixturesQuery = useQuery({
    queryKey: queryKeys.byLeague(competitionId, season ?? 0),
    queryFn: () =>
      footballRepository.matchesByLeague(apiLeagueId!, season!, localIsoDateOffset(-7), localIsoDateOffset(14)),
    enabled: Boolean(apiLeagueId && season),
    staleTime: fixtureStaleTime(dataSaver),
    retry: false,
  });

  const scorersQuery = useQuery({
    queryKey: queryKeys.topScorers(competitionId, season ?? 0),
    queryFn: () => footballRepository.topScorers(apiLeagueId!, season!),
    enabled: Boolean(apiLeagueId && season),
    staleTime: standingsStaleTime(dataSaver),
    retry: false,
  });

  const apiMatches = fixturesQuery.data ?? [];
  const localMatches = getMatchesByCompetition(competitionId);
  // A successful empty response is meaningful: do not replace it with static demo fixtures.
  // Local fixtures remain available when this league has not returned an API response.
  const hasFixtureData = fixturesQuery.data !== undefined;
  const matches = hasFixtureData ? apiMatches : localMatches;
  const teams = standingsQuery.data?.rows.map((row) => row.team) ??
    Array.from(new Map(matches.flatMap((match) => [match.homeTeam, match.awayTeam]).map((team) => [team.id, team])).values());

  const hasApiLeague = Boolean(apiLeagueId);
  const isSectionLoading = (isLoading: boolean) => hasApiLeague && (isSeasonLoading || isLoading);
  const isSectionFetching = (isFetching: boolean) => hasApiLeague && (isSeasonFetching || isFetching);

  return {
    competition: standingsQuery.data?.competition ?? local,
    matches,
    teams,
    table: standingsQuery.data,
    topScorers: scorersQuery.data ?? [],
    standingsUnavailable: isUnsupportedEndpoint(standingsQuery.error),
    scorersUnavailable: isUnsupportedEndpoint(scorersQuery.error),
    fixturesUnavailable: isUnsupportedEndpoint(fixturesQuery.error),
    standings: {
      isLoading: isSectionLoading(standingsQuery.isLoading),
      isFetching: isSectionFetching(standingsQuery.isFetching),
      isError: standingsQuery.isError,
      isUnavailable: isUnsupportedEndpoint(standingsQuery.error),
      hasData: standingsQuery.data !== undefined,
    },
    fixtures: {
      isLoading: isSectionLoading(fixturesQuery.isLoading),
      isFetching: isSectionFetching(fixturesQuery.isFetching),
      isError: fixturesQuery.isError,
      isUnavailable: isUnsupportedEndpoint(fixturesQuery.error),
      hasData: hasFixtureData,
    },
    scorers: {
      isLoading: isSectionLoading(scorersQuery.isLoading),
      isFetching: isSectionFetching(scorersQuery.isFetching),
      isError: scorersQuery.isError,
      isUnavailable: isUnsupportedEndpoint(scorersQuery.error),
      hasData: scorersQuery.data !== undefined,
    },
    isLoading: hasApiLeague && (isSeasonLoading || standingsQuery.isLoading || fixturesQuery.isLoading),
    isError: standingsQuery.isError && fixturesQuery.isError,
    refetch: () => Promise.all([standingsQuery.refetch(), fixturesQuery.refetch(), scorersQuery.refetch()]),
    localPlayers: teams.flatMap((team) => getPlayersByTeam(team.id)),
    season: season ?? getCurrentSeason(),
  };
}
