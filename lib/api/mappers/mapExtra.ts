import type {
  ApiLineup,
  ApiStandingTeam,
  ApiStandingsResponse,
  ApiSquadPlayer,
  ApiTeamInfo,
  ApiTopScorer,
  ApiPlayersResponse,
} from '@/lib/api/dto/extraDto';
import { resolveCompetition } from '@/lib/api/leagueIds';
import { mapApiTeam } from '@/lib/api/mappers/mapFixture';
import { deriveShortName } from '@/lib/deriveShortName';
import type {
  LeagueTable,
  MatchLineup,
  Player,
  StandingRow,
  Team,
  TopScorer,
} from '@/types/football';

export function mapPosition(value?: string | null): Player['position'] {
  if (value === 'Goalkeeper' || value === 'G') return 'Goalkeeper';
  if (value === 'Defender' || value === 'D') return 'Defender';
  if (value === 'Midfielder' || value === 'M') return 'Midfielder';
  if (value === 'Attacker' || value === 'Forward' || value === 'F') return 'Forward';
  return value ?? 'Midfielder';
}

export function mapStandings(response: ApiStandingsResponse): LeagueTable | null {
  const league = response.response[0]?.league;
  const group = league?.standings?.[0];
  if (!league || !group) return null;

  return {
    competition: resolveCompetition(league),
    season: league.season,
    rows: group.map(mapStandingRow),
  };
}

export function mapStandingRow(row: ApiStandingTeam): StandingRow {
  return {
    rank: row.rank,
    team: mapApiTeam(row.team),
    played: row.all.played,
    wins: row.all.win,
    draws: row.all.draw,
    losses: row.all.lose,
    goalsFor: row.all.goals.for,
    goalsAgainst: row.all.goals.against,
    goalDifference: row.goalsDiff,
    points: row.points,
    form: row.form ?? undefined,
    description: row.description ?? undefined,
    group: row.group,
  };
}

export function mapTeamInfo(info: ApiTeamInfo): Team {
  return {
    ...mapApiTeam({ ...info.team, country: info.team.country }),
    venue: info.venue?.name ?? undefined,
    founded: info.team.founded ?? undefined,
  };
}

export function mapSquadPlayer(player: ApiSquadPlayer, teamId: string): Player {
  return {
    id: String(player.id),
    name: player.name,
    teamId,
    position: mapPosition(player.position),
    number: player.number ?? 0,
    nationality: '—',
    age: player.age ?? 0,
    appearances: 0,
    goals: 0,
    assists: 0,
    photoUrl: player.photo ?? undefined,
    fromApi: true,
  };
}

export function mapTopScorer(entry: ApiTopScorer): TopScorer | undefined {
  const stats = entry.statistics[0];
  if (!stats) return undefined;
  const player: Player = {
    id: String(entry.player.id),
    name: entry.player.name,
    teamId: String(stats.team.id),
    position: mapPosition(stats.games.position),
    number: 0,
    nationality: entry.player.nationality ?? '—',
    age: entry.player.age ?? 0,
    appearances: stats.games.appearences ?? 0,
    goals: stats.goals.total ?? 0,
    assists: stats.goals.assists ?? 0,
    minutes: stats.games.minutes ?? undefined,
    yellowCards: stats.cards?.yellow ?? undefined,
    redCards: stats.cards?.red ?? undefined,
    photoUrl: entry.player.photo,
    fromApi: true,
  };
  return {
    player,
    team: mapApiTeam(stats.team),
    goals: stats.goals.total ?? 0,
    assists: stats.goals.assists ?? undefined,
  };
}

export function mapLineup(lineup: ApiLineup): MatchLineup {
  const mapPlayer = (item: ApiLineup['startXI'][number]) => ({
    id: String(item.player.id),
    name: item.player.name,
    number: item.player.number ?? undefined,
    position: item.player.pos ?? undefined,
    grid: item.player.grid ?? undefined,
  });

  return {
    team: mapApiTeam(lineup.team),
    formation: lineup.formation ?? undefined,
    coach: lineup.coach?.name ?? undefined,
    startXI: lineup.startXI.map(mapPlayer),
    substitutes: lineup.substitutes.map(mapPlayer),
  };
}

export function mapSearchLeague(entry: { league: { id: number; name: string; logo: string }; country?: { name?: string } }) {
  return resolveCompetition({
    id: entry.league.id,
    name: entry.league.name,
    country: entry.country?.name,
    logo: entry.league.logo,
  });
}

export { deriveShortName };

export function mapPlayerProfile(response: ApiPlayersResponse): { player: Player; team?: Team } | undefined {
  const item = response.response?.[0];
  if (!item) return undefined;

  const { player: apiPlayer, statistics = [] } = item;

  // Select primary statistics entry deterministically:
  // Sort by appearances, then minutes to prioritize the player's primary competition entry for the season.
  const sortedStats = [...statistics].sort((a, b) => {
    const appA = a.games?.appearences ?? 0;
    const appB = b.games?.appearences ?? 0;
    if (appB !== appA) return appB - appA;
    const minA = a.games?.minutes ?? 0;
    const minB = b.games?.minutes ?? 0;
    return minB - minA;
  });

  const primaryStat = sortedStats[0];
  const primaryTeam = primaryStat?.team;

  // Filter stats to the primary team to ensure we do NOT merge unrelated teams
  const teamStats = primaryTeam
    ? statistics.filter((stat) => stat.team.id === primaryTeam.id)
    : [];

  const appearances = teamStats.reduce((sum, s) => sum + (s.games?.appearences ?? 0), 0);
  const goals = teamStats.reduce((sum, s) => sum + (s.goals?.total ?? 0), 0);
  const assists = teamStats.reduce((sum, s) => sum + (s.goals?.assists ?? 0), 0);
  const minutes = teamStats.reduce((sum, s) => sum + (s.games?.minutes ?? 0), 0);
  const yellowCards = teamStats.reduce((sum, s) => sum + (s.cards?.yellow ?? 0), 0);
  const redCards = teamStats.reduce((sum, s) => sum + (s.cards?.red ?? 0), 0);

  // Extract jersey number from the first entry that provides one
  const jerseyNumber = teamStats.find((s) => s.games?.number != null)?.games.number ?? primaryStat?.games?.number ?? 0;

  const player: Player = {
    id: String(apiPlayer.id),
    name: apiPlayer.name,
    teamId: primaryTeam ? String(primaryTeam.id) : '',
    position: mapPosition(primaryStat?.games?.position),
    number: jerseyNumber,
    nationality: apiPlayer.nationality ?? '—',
    age: apiPlayer.age ?? 0,
    appearances,
    goals,
    assists,
    minutes: minutes > 0 ? minutes : undefined,
    yellowCards: yellowCards > 0 ? yellowCards : undefined,
    redCards: redCards > 0 ? redCards : undefined,
    photoUrl: apiPlayer.photo ?? undefined,
    fromApi: true,
  };

  const team: Team | undefined = primaryTeam ? mapApiTeam(primaryTeam) : undefined;

  return { player, team };
}
