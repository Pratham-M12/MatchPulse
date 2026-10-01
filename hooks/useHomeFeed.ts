import { useMemo } from 'react';

import { localIsoDateOffset } from '@/lib/api/currentSeason';
import { useFixturesByDate } from '@/hooks/useFixturesByDate';
import { useLiveFixtures } from '@/hooks/useLiveFixtures';
import { involvesTeam, rankMatches, uniqueMatches } from '@/lib/football/ranking';
import { useFavoriteLeagueIds, useFavoriteTeamIds } from '@/store/useFavoritesStore';
import type { Match } from '@/types/football';

export function useHomeFeed(options?: { pollLive?: boolean }) {
  const favoriteTeamIds = useFavoriteTeamIds();
  const favoriteLeagueIds = useFavoriteLeagueIds();
  const liveQuery = useLiveFixtures({ poll: options?.pollLive });
  const todayQuery = useFixturesByDate(localIsoDateOffset(0));
  const tomorrowQuery = useFixturesByDate(localIsoDateOffset(1));
  const yesterdayQuery = useFixturesByDate(localIsoDateOffset(-1));

  const live = liveQuery.data ?? [];
  const today = todayQuery.data ?? [];
  const tomorrow = tomorrowQuery.data ?? [];
  const yesterday = yesterdayQuery.data ?? [];

  const ranking = { favoriteTeamIds, favoriteLeagueIds };

  const upcoming = useMemo(
    () =>
      rankMatches(
        uniqueMatches([...today, ...tomorrow]).filter((match) => match.status === 'scheduled'),
        ranking
      ),
    [today, tomorrow, favoriteTeamIds, favoriteLeagueIds]
  );

  const recent = useMemo(
    () => uniqueMatches([...today, ...yesterday]).filter((match) => match.status === 'finished'),
    [today, yesterday]
  );

  const forYou = useMemo(
    () =>
      rankMatches(
        uniqueMatches([...live, ...upcoming, ...recent]).filter(
          (match) => involvesTeam(match, favoriteTeamIds) || favoriteLeagueIds.includes(match.competition.id)
        ),
        ranking
      ),
    [live, upcoming, recent, favoriteTeamIds, favoriteLeagueIds]
  );

  const featured: Match | undefined =
    rankMatches(
      live.filter((match) => involvesTeam(match, favoriteTeamIds)).concat(live),
      ranking
    )[0] ?? upcoming[0];

  const matchday = live.find((match) => involvesTeam(match, favoriteTeamIds));
  const nextForYou = upcoming.find((match) => involvesTeam(match, favoriteTeamIds)) ?? upcoming[0];
  const trending = rankMatches(uniqueMatches([...live, ...upcoming]), ranking).slice(0, 8);

  const isLoading = liveQuery.isLoading && todayQuery.isLoading;
  const isError = liveQuery.isError && todayQuery.isError;
  const refetch = () =>
    Promise.all([liveQuery.refetch(), todayQuery.refetch(), tomorrowQuery.refetch(), yesterdayQuery.refetch()]);

  return {
    live,
    upcoming,
    recent,
    forYou,
    featured,
    matchday,
    nextForYou,
    trending,
    favoriteTeamMatches: uniqueMatches([...live, ...upcoming]).filter((match) => involvesTeam(match, favoriteTeamIds)),
    isLoading,
    isError,
    isLiveLoading: liveQuery.isLoading,
    isLiveError: liveQuery.isError,
    refetchLive: liveQuery.refetch,
    refetch,
    updatedAt: Math.max(liveQuery.dataUpdatedAt, todayQuery.dataUpdatedAt),
  };
}
