import { allCompetitions } from '@/data/competitions';
import { deriveShortName } from '@/lib/deriveShortName';
import type { Competition } from '@/types/football';

/**
 * Maps our competition ids (from data/competitions.ts) to API-Football's
 * numeric league ids, and back.
 */
export const competitionIdToApiLeagueId: Record<string, number> = {
  'c-epl': 39,
  'c-laliga': 140,
  'c-bundesliga': 78,
  'c-seriea': 135,
  'c-ligue1': 61,
  'c-ucl': 2,
  'c-worldcup': 1,
};

const apiLeagueIdToCompetitionId: Record<number, string> = Object.fromEntries(
  Object.entries(competitionIdToApiLeagueId).map(([competitionId, apiLeagueId]) => [apiLeagueId, competitionId])
);

/** Only fixtures from these leagues are shown in browse lists. */
export const supportedApiLeagueIds: number[] = Object.values(competitionIdToApiLeagueId);

export function getCompetitionIdForApiLeagueId(apiLeagueId: number): string | undefined {
  return apiLeagueIdToCompetitionId[apiLeagueId];
}

export function getApiLeagueId(competitionId: string): number | undefined {
  if (competitionId.startsWith('api-')) {
    const numeric = Number(competitionId.slice(4));
    return Number.isFinite(numeric) ? numeric : undefined;
  }
  return competitionIdToApiLeagueId[competitionId];
}

export function resolveCompetition(apiLeague: {
  id: number;
  name: string;
  country?: string;
  logo?: string;
}): Competition {
  const competitionId = getCompetitionIdForApiLeagueId(apiLeague.id);
  const known = competitionId ? allCompetitions.find((item) => item.id === competitionId) : undefined;
  if (known) {
    return { ...known, logoUrl: known.logoUrl ?? apiLeague.logo };
  }

  return {
    id: `api-${apiLeague.id}`,
    name: apiLeague.name,
    shortName: deriveShortName(apiLeague.name),
    country: apiLeague.country,
    logoUrl: apiLeague.logo,
  };
}

export function isSupportedApiLeague(apiLeagueId: number): boolean {
  return supportedApiLeagueIds.includes(apiLeagueId);
}
