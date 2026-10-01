import { useQuery } from '@tanstack/react-query';

import { staleTimes } from '@/lib/api/queryConfig';
import { queryKeys } from '@/lib/api/queryKeys';
import { footballRepository } from '@/lib/api/repository';
import type { LeagueCoverageType } from '@/lib/api/seasonResolver';

export function useLeagueSeason(leagueId?: number, coverage?: LeagueCoverageType) {
  return useQuery({
    queryKey: leagueId ? queryKeys.leagueSeason(leagueId, coverage) : ['leagueSeason', 'none'],
    queryFn: () => (leagueId ? footballRepository.resolveLeagueSeason(leagueId, coverage) : undefined),
    enabled: Boolean(leagueId),
    staleTime: staleTimes.entity,
    retry: false,
  });
}

export function usePlayerSeason(playerId?: string | number) {
  const isNumeric = Boolean(playerId && /^\d+$/.test(String(playerId)));
  return useQuery({
    queryKey: playerId ? queryKeys.playerSeason(playerId) : ['playerSeason', 'none'],
    queryFn: () => (playerId ? footballRepository.resolvePlayerSeason(playerId) : undefined),
    enabled: isNumeric,
    staleTime: staleTimes.entity,
    retry: false,
  });
}

export function useTeamSeason(teamId?: string | number) {
  const isNumeric = Boolean(teamId && /^\d+$/.test(String(teamId)));
  return useQuery({
    queryKey: teamId ? queryKeys.teamSeason(teamId) : ['teamSeason', 'none'],
    queryFn: () => (teamId ? footballRepository.resolveTeamSeason(teamId) : undefined),
    enabled: isNumeric,
    staleTime: staleTimes.entity,
    retry: false,
  });
}
