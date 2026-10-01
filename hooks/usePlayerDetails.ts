import { useQuery } from '@tanstack/react-query';

import { getCurrentSeason } from '@/lib/api/currentSeason';
import { staleTimes } from '@/lib/api/queryConfig';
import { queryKeys } from '@/lib/api/queryKeys';
import { footballRepository } from '@/lib/api/repository';
import { getPlayerById, getTeamById } from '@/data';
import { usePlayerSeason } from '@/hooks/useSeason';
import type { Player, Team } from '@/types/football';

function isNumericId(id?: string): boolean {
  if (!id) return false;
  return /^\d+$/.test(id);
}

export function usePlayerDetails(playerId?: string) {
  const isNumeric = isNumericId(playerId);
  const { data: season, isLoading: isSeasonLoading } = usePlayerSeason(playerId);

  const localPlayer: Player | undefined = playerId && !isNumeric ? getPlayerById(playerId) : undefined;
  const localTeam: Team | undefined = localPlayer ? getTeamById(localPlayer.teamId) : undefined;

  const query = useQuery({
    queryKey: playerId ? queryKeys.player(playerId, season ?? 0) : ['player', 'none', 0],
    queryFn: () => (playerId ? footballRepository.player(playerId, season!) : undefined),
    enabled: Boolean(playerId && isNumeric && season),
    staleTime: staleTimes.entity,
    retry: false,
  });

  const player: Player | undefined = localPlayer ?? query.data?.player;
  const team: Team | undefined = localTeam ?? query.data?.team;

  return {
    player,
    team,
    isLoading: isNumeric && (isSeasonLoading || query.isLoading),
    isError: isNumeric && query.isError,
    error: isNumeric ? query.error : null,
    refetch: query.refetch,
    isLocal: Boolean(localPlayer),
    fromApi: Boolean(query.data?.player?.fromApi),
    season: season ?? getCurrentSeason(),
  };
}
