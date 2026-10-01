import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { allCompetitions } from '@/data/competitions';
import { allTeams } from '@/data/teams';
import { players } from '@/data/players';
import { matches as localMatches } from '@/data/matches';
import { queryKeys } from '@/lib/api/queryKeys';
import { footballRepository } from '@/lib/api/repository';
import { isUnsupportedEndpoint } from '@/lib/api/errors';
import type { SearchResults } from '@/types/football';

function matchesQuery(query: string) {
  const q = query.toLowerCase();
  return (name: string) => name.toLowerCase().includes(q);
}

export function useFootballSearch(rawQuery: string) {
  const [debounced, setDebounced] = useState(rawQuery.trim());

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(rawQuery.trim()), 400);
    return () => clearTimeout(handle);
  }, [rawQuery]);

  const local = useMemo<SearchResults>(() => {
    const q = debounced.toLowerCase();
    if (q.length < 2) {
      return { teams: [], leagues: [], players: [], matches: [] };
    }
    const test = matchesQuery(q);
    return {
      teams: allTeams.filter((team) => test(team.name) || test(team.shortName)),
      leagues: allCompetitions.filter((league) => test(league.name) || test(league.shortName ?? '')),
      players: players.filter((player) => test(player.name)),
      matches: localMatches.filter(
        (match) => test(match.homeTeam.name) || test(match.awayTeam.name) || test(match.competition.name)
      ),
    };
  }, [debounced]);

  const apiEnabled = debounced.length >= 3;

  const apiQuery = useQuery({
    queryKey: queryKeys.search(debounced),
    queryFn: () => footballRepository.searchCatalog(debounced),
    enabled: apiEnabled,
    staleTime: 10 * 60_000,
    retry: false,
  });

  const results: SearchResults = {
    teams: uniqueById([...local.teams, ...(apiQuery.data?.teams ?? [])]),
    leagues: uniqueById([...local.leagues, ...(apiQuery.data?.leagues ?? [])]),
    players: local.players,
    matches: local.matches,
  };

  return {
    query: debounced,
    results,
    isLoading: apiEnabled && apiQuery.isFetching,
    isError: apiQuery.isError && !isUnsupportedEndpoint(apiQuery.error),
    unavailable: isUnsupportedEndpoint(apiQuery.error),
  };
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}
