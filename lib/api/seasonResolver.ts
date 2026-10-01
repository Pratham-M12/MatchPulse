import { getCurrentSeason } from '@/lib/api/currentSeason';
import {
  fetchAccountStatus,
  fetchLeague,
  fetchPlayerSeasons,
  fetchTeamSeasons,
} from '@/lib/api/services/fixturesService';

let cachedMaxPlanSeason: number | undefined;
let planCheckPromise: Promise<number | undefined> | null = null;

/**
 * Extracts and records the upper limit of supported seasons if API-Football
 * responds with a season restriction message like:
 * "Free plans do not have access to this season, try from 2022 to 2024."
 */
export function learnMaxAllowedSeasonFromError(errorMessage: string) {
  const match = errorMessage.match(/try from \d{4} to (\d{4})/i);
  if (match) {
    const year = parseInt(match[1], 10);
    if (!Number.isNaN(year)) {
      cachedMaxPlanSeason = year;
    }
  }
}

/**
 * Checks the account plan capability once.
 * - Free plan: API-Football restricts to historical seasons (<= 2024).
 * - Paid plans (Pro, Ultra, Mega): no plan restriction.
 */
export async function getMaxAllowedSeason(): Promise<number | undefined> {
  if (cachedMaxPlanSeason !== undefined) {
    return cachedMaxPlanSeason;
  }
  if (!planCheckPromise) {
    planCheckPromise = (async () => {
      try {
        const { response } = await fetchAccountStatus();
        const plan = response?.subscription?.plan;
        if (plan === 'Free') {
          // Free plan accounts in API-Football only have historical access (up to 2024).
          cachedMaxPlanSeason = 2024;
        } else if (plan) {
          // Paid subscriptions (Pro, Ultra, Mega) have access to current seasons.
          cachedMaxPlanSeason = undefined;
        } else {
          cachedMaxPlanSeason = 2024;
        }
      } catch {
        cachedMaxPlanSeason = 2024;
      }
      return cachedMaxPlanSeason;
    })();
  }
  return planCheckPromise;
}

export type LeagueCoverageType = 'standings' | 'players' | 'top_scorers' | 'fixtures';

/**
 * Resolves a usable season for a specific league without guessing or hardcoding.
 * 1. Fetches league season metadata from GET /leagues?id={leagueId}.
 * 2. Filters seasons suitable for the requested coverage (e.g. standings).
 * 3. Filters seasons allowed by the active API account subscription plan.
 * 4. Selects the most recent valid season.
 */
export async function resolveLeagueSeason(
  leagueId: number,
  coverage?: LeagueCoverageType
): Promise<number> {
  const maxAllowedSeason = await getMaxAllowedSeason();
  try {
    const { response } = await fetchLeague(leagueId);
    const leagueDetails = response[0];
    const seasons = (leagueDetails?.seasons ?? []).slice();

    const candidateSeasons = seasons.filter((s) => {
      if (maxAllowedSeason !== undefined && s.year > maxAllowedSeason) {
        return false;
      }
      if (!coverage) return true;
      if (coverage === 'standings') return s.coverage?.standings === true;
      if (coverage === 'top_scorers') return s.coverage?.top_scorers === true;
      if (coverage === 'players') return s.coverage?.players === true;
      if (coverage === 'fixtures') return Boolean(s.coverage?.fixtures);
      return true;
    });

    if (candidateSeasons.length > 0) {
      candidateSeasons.sort((a, b) => b.year - a.year);
      const currentSeason = candidateSeasons.find((s) => s.current);
      return currentSeason ? currentSeason.year : candidateSeasons[0].year;
    }

    const allowedSeasons = seasons.filter(
      (s) => maxAllowedSeason === undefined || s.year <= maxAllowedSeason
    );
    if (allowedSeasons.length > 0) {
      allowedSeasons.sort((a, b) => b.year - a.year);
      return allowedSeasons[0].year;
    }
  } catch (error) {
    if (error instanceof Error) {
      learnMaxAllowedSeasonFromError(error.message);
    }
  }

  return maxAllowedSeason ?? getCurrentSeason();
}

/**
 * Resolves a usable season for a player from GET /players/seasons?player={playerId}.
 * Filters by account subscription limits and selects the latest available season.
 */
export async function resolvePlayerSeason(playerId: string | number): Promise<number> {
  const maxAllowedSeason = await getMaxAllowedSeason();
  try {
    const { response } = await fetchPlayerSeasons(playerId);
    const seasons = (response ?? []).slice();
    const allowed = seasons.filter(
      (year) => maxAllowedSeason === undefined || year <= maxAllowedSeason
    );
    if (allowed.length > 0) {
      allowed.sort((a, b) => b - a);
      return allowed[0];
    }
  } catch (error) {
    if (error instanceof Error) {
      learnMaxAllowedSeasonFromError(error.message);
    }
  }

  return maxAllowedSeason ?? getCurrentSeason();
}

/**
 * Resolves a usable season for a team from GET /teams/seasons?team={teamId}.
 * Filters by account subscription limits and selects the latest available season.
 */
export async function resolveTeamSeason(teamId: string | number): Promise<number> {
  const maxAllowedSeason = await getMaxAllowedSeason();
  try {
    const { response } = await fetchTeamSeasons(teamId);
    const seasons = (response ?? []).slice();
    const allowed = seasons.filter(
      (year) => maxAllowedSeason === undefined || year <= maxAllowedSeason
    );
    if (allowed.length > 0) {
      allowed.sort((a, b) => b - a);
      return allowed[0];
    }
  } catch (error) {
    if (error instanceof Error) {
      learnMaxAllowedSeasonFromError(error.message);
    }
  }

  return maxAllowedSeason ?? getCurrentSeason();
}
