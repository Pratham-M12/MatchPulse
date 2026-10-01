import type { ApiFixture, ApiFixtureStatus } from '@/lib/api/dto/fixtureDto';
import { isSupportedApiLeague, resolveCompetition } from '@/lib/api/leagueIds';
import { deriveShortName } from '@/lib/deriveShortName';
import type { Match, MatchStatus, Team } from '@/types/football';

const LIVE_STATUS_CODES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE']);
const FINISHED_STATUS_CODES = new Set(['FT', 'AET', 'PEN', 'AWD', 'WO']);
const POSTPONED_STATUS_CODES = new Set(['PST']);
const CANCELLED_STATUS_CODES = new Set(['CANC', 'ABD']);

export function mapStatus(status: ApiFixtureStatus): MatchStatus {
  if (LIVE_STATUS_CODES.has(status.short)) return 'live';
  if (FINISHED_STATUS_CODES.has(status.short)) return 'finished';
  if (POSTPONED_STATUS_CODES.has(status.short)) return 'postponed';
  if (CANCELLED_STATUS_CODES.has(status.short)) return 'cancelled';
  return 'scheduled';
}

export function mapApiTeam(apiTeam: { id: number; name: string; logo?: string | null; country?: string }): Team {
  return {
    id: String(apiTeam.id),
    name: apiTeam.name,
    shortName: deriveShortName(apiTeam.name),
    logoUrl: apiTeam.logo ?? undefined,
    country: apiTeam.country,
  };
}

/**
 * Maps one raw API-Football fixture to our domain Match type.
 * When `requireSupportedLeague` is true, unsupported competitions are dropped.
 */
export function mapFixtureToMatch(
  apiFixture: ApiFixture,
  options: { requireSupportedLeague?: boolean } = {}
): Match | undefined {
  const { requireSupportedLeague = false } = options;
  if (requireSupportedLeague && !isSupportedApiLeague(apiFixture.league.id)) {
    return undefined;
  }

  return {
    id: String(apiFixture.fixture.id),
    competition: resolveCompetition(apiFixture.league),
    homeTeam: mapApiTeam(apiFixture.teams.home),
    awayTeam: mapApiTeam(apiFixture.teams.away),
    homeScore: apiFixture.goals.home ?? undefined,
    awayScore: apiFixture.goals.away ?? undefined,
    status: mapStatus(apiFixture.fixture.status),
    minute: apiFixture.fixture.status.elapsed ?? undefined,
    kickoff: apiFixture.fixture.date,
    venue: apiFixture.fixture.venue.name ?? undefined,
    referee: apiFixture.fixture.referee ?? undefined,
    statusLabel: apiFixture.fixture.status.short,
  };
}

export function mapFixturesToMatches(
  fixtures: ApiFixture[],
  options: { requireSupportedLeague?: boolean } = { requireSupportedLeague: true }
): Match[] {
  return fixtures
    .map((fixture) => mapFixtureToMatch(fixture, options))
    .filter((match): match is Match => match !== undefined);
}
