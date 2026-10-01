import { useQuery } from '@tanstack/react-query';

import { getCurrentSeason } from '@/lib/api/currentSeason';
import { staleTimes } from '@/lib/api/queryConfig';
import { queryKeys } from '@/lib/api/queryKeys';
import { footballRepository } from '@/lib/api/repository';
import { isUnsupportedEndpoint } from '@/lib/api/errors';
import { getMatchesByTeam, getPlayersByTeam, getTeamById } from '@/data';
import { useTeamSeason } from '@/hooks/useSeason';
import { getResultForTeam } from '@/lib/matchResult';
import type { MatchResult } from '@/lib/matchResult';
import type { Match, TeamStats } from '@/types/football';

function isApiEntityId(id: string) {
  return /^\d+$/.test(id);
}

export function useTeamPage(teamId: string) {
  const localTeam = getTeamById(teamId);
  const useApi = isApiEntityId(teamId);
  const { data: season, isLoading: isSeasonLoading } = useTeamSeason(teamId);

  const teamQuery = useQuery({
    queryKey: queryKeys.team(teamId),
    queryFn: () => footballRepository.team(teamId),
    enabled: useApi,
    staleTime: staleTimes.entity,
    retry: false,
  });

  const fixturesQuery = useQuery({
    queryKey: queryKeys.byTeam(teamId, season),
    queryFn: () => footballRepository.matchesByTeam(teamId, season!),
    enabled: Boolean(useApi && season),
    staleTime: staleTimes.fixtures,
    retry: false,
  });

  const squadQuery = useQuery({
    queryKey: queryKeys.squad(teamId),
    queryFn: () => footballRepository.squad(teamId),
    enabled: useApi,
    staleTime: staleTimes.entity,
    retry: false,
  });

  const team = localTeam ?? teamQuery.data;
  const matches = useApi ? (fixturesQuery.data ?? []) : getMatchesByTeam(teamId);
  const squad = useApi ? (squadQuery.data ?? []) : getPlayersByTeam(teamId);

  const nowTime = Date.now();
  const isRecent = (match: Match) => match.status === 'finished';
  const isUpcoming = (match: Match) =>
    match.status === 'scheduled' ||
    (match.status === 'postponed' && new Date(match.kickoff).getTime() >= nowTime - 24 * 3600 * 1000);

  const results = matches
    .filter(isRecent)
    .sort((a, b) => new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime());

  const fixtures = matches
    .filter(isUpcoming)
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());

  const form = results
    .map((match) => getResultForTeam(match, teamId))
    .filter((value): value is MatchResult => Boolean(value))
    .slice(0, 5);

  const stats: TeamStats = {
    played: results.length || undefined,
    wins: form.filter((item) => item === 'W').length || undefined,
    draws: form.filter((item) => item === 'D').length || undefined,
    losses: form.filter((item) => item === 'L').length || undefined,
  };

  return {
    team,
    matches,
    fixtures,
    results,
    form,
    squad,
    stats,
    isLoading: useApi && (teamQuery.isLoading || isSeasonLoading || fixturesQuery.isLoading),
    isError: useApi && teamQuery.isError && !teamQuery.data,
    squadUnavailable: isUnsupportedEndpoint(squadQuery.error),
    season: season ?? getCurrentSeason(),
    refetch: () => Promise.all([teamQuery.refetch(), fixturesQuery.refetch(), squadQuery.refetch()]),
  };
}
