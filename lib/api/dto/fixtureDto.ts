/**
 * Raw response shapes from API-Football v3. These intentionally mirror
 * the API's actual JSON structure (including its naming), so mapping
 * bugs are easy to spot by comparing against the API docs. Nothing
 * outside lib/api should ever import these directly — always go through
 * a mapper into our own domain types (types/football.ts).
 */

export type ApiFixtureStatus = {
  long: string;
  short: string;
  elapsed: number | null;
};

export type ApiFixture = {
  fixture: {
    id: number;
    date: string;
    referee?: string | null;
    status: ApiFixtureStatus;
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    season?: number;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

export type ApiFixturesResponse = {
  response: ApiFixture[];
};