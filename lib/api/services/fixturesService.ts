import { apiFootballClient } from '@/lib/api/client';
import { getCurrentSeason } from '@/lib/api/currentSeason';
import type {
  ApiAccountStatusResponse,
  ApiLeagueDetailsResponse,
  ApiLeaguesSearchResponse,
  ApiLineupsResponse,
  ApiPlayersResponse,
  ApiPredictionsResponse,
  ApiSeasonsResponse,
  ApiSquadResponse,
  ApiStandingsResponse,
  ApiTeamsResponse,
  ApiTopScorersResponse,
} from '@/lib/api/dto/extraDto';
import type { ApiFixtureEventsResponse } from '@/lib/api/dto/eventDto';
import type { ApiFixturesResponse } from '@/lib/api/dto/fixtureDto';
import type { ApiFixtureStatisticsResponse } from '@/lib/api/dto/statisticsDto';
import {
  QuotaExceededError,
  UnsupportedEndpointError,
  isQuotaError,
  isUnsupportedEndpoint,
} from '@/lib/api/errors';

async function get<T>(path: string, params: Record<string, string | number>): Promise<T> {
  try {
    const response = await apiFootballClient.get<T>(path, { params });
    return response.data;
  } catch (error) {
    if (error instanceof UnsupportedEndpointError || error instanceof QuotaExceededError) {
      throw error;
    }
    if (isUnsupportedEndpoint(error)) {
      throw new UnsupportedEndpointError(path);
    }
    if (isQuotaError(error)) {
      throw new QuotaExceededError();
    }
    throw error;
  }
}

export async function fetchLiveFixtures(): Promise<ApiFixturesResponse> {
  return get<ApiFixturesResponse>('/fixtures', { live: 'all' });
}

/** date must be 'YYYY-MM-DD'. */
export async function fetchFixturesByDate(date: string): Promise<ApiFixturesResponse> {
  return get<ApiFixturesResponse>('/fixtures', { date });
}

export async function fetchFixtureById(fixtureId: string): Promise<ApiFixturesResponse> {
  return get<ApiFixturesResponse>('/fixtures', { id: fixtureId });
}

export async function fetchFixturesByTeam(teamId: string, season?: number): Promise<ApiFixturesResponse> {
  const targetSeason = season ?? getCurrentSeason();
  return get<ApiFixturesResponse>('/fixtures', { team: teamId, season: targetSeason });
}

export async function fetchFixturesByLeague(
  leagueId: number,
  season: number,
  from: string,
  to: string
): Promise<ApiFixturesResponse> {
  return get<ApiFixturesResponse>('/fixtures', { league: leagueId, season, from, to });
}

export async function fetchFixtureEvents(fixtureId: string): Promise<ApiFixtureEventsResponse> {
  return get<ApiFixtureEventsResponse>('/fixtures/events', { fixture: fixtureId });
}

export async function fetchFixtureStatistics(fixtureId: string): Promise<ApiFixtureStatisticsResponse> {
  return get<ApiFixtureStatisticsResponse>('/fixtures/statistics', { fixture: fixtureId });
}

export async function fetchFixtureLineups(fixtureId: string): Promise<ApiLineupsResponse> {
  return get<ApiLineupsResponse>('/fixtures/lineups', { fixture: fixtureId });
}

export async function fetchFixturePredictions(fixtureId: string): Promise<ApiPredictionsResponse> {
  return get<ApiPredictionsResponse>('/predictions', { fixture: fixtureId });
}

export async function fetchStandings(leagueId: number, season: number): Promise<ApiStandingsResponse> {
  return get<ApiStandingsResponse>('/standings', { league: leagueId, season });
}

export async function fetchTeam(teamId: string): Promise<ApiTeamsResponse> {
  return get<ApiTeamsResponse>('/teams', { id: teamId });
}

export async function searchTeams(query: string): Promise<ApiTeamsResponse> {
  return get<ApiTeamsResponse>('/teams', { search: query });
}

export async function searchLeagues(query: string): Promise<ApiLeaguesSearchResponse> {
  return get<ApiLeaguesSearchResponse>('/leagues', { search: query });
}

export async function fetchSquad(teamId: string): Promise<ApiSquadResponse> {
  return get<ApiSquadResponse>('/players/squads', { team: teamId });
}

export async function fetchTopScorers(leagueId: number, season: number): Promise<ApiTopScorersResponse> {
  return get<ApiTopScorersResponse>('/players/topscorers', { league: leagueId, season });
}

export async function fetchPlayer(playerId: string | number, season?: number): Promise<ApiPlayersResponse> {
  const targetSeason = season ?? getCurrentSeason();
  return get<ApiPlayersResponse>('/players', { id: playerId, season: targetSeason });
}

export async function fetchLeague(leagueId: number): Promise<ApiLeagueDetailsResponse> {
  return get<ApiLeagueDetailsResponse>('/leagues', { id: leagueId });
}

export async function fetchPlayerSeasons(playerId: string | number): Promise<ApiSeasonsResponse> {
  return get<ApiSeasonsResponse>('/players/seasons', { player: playerId });
}

export async function fetchTeamSeasons(teamId: string | number): Promise<ApiSeasonsResponse> {
  return get<ApiSeasonsResponse>('/teams/seasons', { team: teamId });
}

export async function fetchAccountStatus(): Promise<ApiAccountStatusResponse> {
  return get<ApiAccountStatusResponse>('/status', {});
}
