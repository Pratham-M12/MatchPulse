import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';
import type { Competition, Match, Team } from '@/types/football';

import { useShallow } from 'zustand/react/shallow';

type FavoritesState = {
  favoriteTeams: Team[];
  favoriteLeagues: Competition[];
  favoriteMatches: Match[];
  toggleFavoriteTeam: (team: Team) => void;
  toggleFavoriteLeague: (league: Competition) => void;
  toggleFavoriteMatch: (match: Match) => void;
};

function toggleById<T extends { id: string }>(items: T[], item: T): T[] {
  return items.some((entry) => entry.id === item.id)
    ? items.filter((entry) => entry.id !== item.id)
    : [...items, item];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favoriteTeams: [],
      favoriteLeagues: [],
      favoriteMatches: [],
      toggleFavoriteTeam: (team) => {
        set((state) => ({ favoriteTeams: toggleById(state.favoriteTeams, team) }));
      },
      toggleFavoriteLeague: (league) => {
        set((state) => ({ favoriteLeagues: toggleById(state.favoriteLeagues, league) }));
      },
      toggleFavoriteMatch: (match) => {
        set((state) => ({ favoriteMatches: toggleById(state.favoriteMatches, match) }));
      },
    }),
    {
      name: 'matchpulse-favorites',
      storage: persistStorage,
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<FavoritesState> & {
          favoriteTeamIds?: string[];
          favoriteLeagueIds?: string[];
        };
        return {
          favoriteTeams: state.favoriteTeams ?? [],
          favoriteLeagues: state.favoriteLeagues ?? [],
          favoriteMatches: state.favoriteMatches ?? [],
        };
      },
    }
  )
);

export const useFavoriteTeamIds = () =>
  useFavoritesStore(
    useShallow((state) => state.favoriteTeams.map((team) => team.id))
  );

export const useFavoriteLeagueIds = () =>
  useFavoritesStore(
    useShallow((state) => state.favoriteLeagues.map((league) => league.id))
  );

export const useIsFavoriteTeam = (teamId: string) =>
  useFavoritesStore((state) => state.favoriteTeams.some((team) => team.id === teamId));

export const useIsFavoriteLeague = (leagueId: string) =>
  useFavoritesStore((state) => state.favoriteLeagues.some((league) => league.id === leagueId));

export const useIsFavoriteMatch = (matchId: string) =>
  useFavoritesStore((state) => state.favoriteMatches.some((match) => match.id === matchId));
