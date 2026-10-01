/**
 * Core domain models for MatchPulse.
 *
 * UI components must depend on these types only — never on API-Football DTOs.
 */

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

export type Team = {
  id: string;
  name: string;
  shortName: string;
  /** Optional real crest URL. Falls back to initials when absent. */
  logoUrl?: string;
  /** Optional accent color for the placeholder logo/badge. */
  color?: string;
  country?: string;
  venue?: string;
  founded?: number;
};

export type Competition = {
  id: string;
  name: string;
  shortName?: string;
  country?: string;
  logoUrl?: string;
};

export type Match = {
  id: string;
  competition: Competition;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  status: MatchStatus;
  /** Minute of play, only meaningful when status === 'live'. */
  minute?: number;
  /** ISO 8601 kickoff date/time. */
  kickoff: string;
  venue?: string;
  referee?: string;
  statusLabel?: string;
};

export type LeagueSummary = Competition & {
  season?: string;
  matchCount?: number;
};

export type MatchEventType = 'goal' | 'yellow_card' | 'red_card' | 'substitution';

export type MatchEvent = {
  id: string;
  minute: number;
  type: MatchEventType;
  team: 'home' | 'away';
  player: string;
  playerId?: string;
  detail?: string;
};

export type MatchStats = {
  possessionHome: number;
  possessionAway: number;
  shotsHome: number;
  shotsAway: number;
  shotsOnTargetHome: number;
  shotsOnTargetAway: number;
  cornersHome: number;
  cornersAway: number;
  foulsHome: number;
  foulsAway: number;
  yellowCardsHome: number;
  yellowCardsAway: number;
  redCardsHome: number;
  redCardsAway: number;
};

export type LineupPlayer = {
  id: string;
  name: string;
  number?: number;
  position?: string;
  grid?: string;
};

export type MatchLineup = {
  team: Team;
  formation?: string;
  coach?: string;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
};

export type MatchPrediction = {
  winnerName?: string;
  advice?: string;
  percentHome?: string;
  percentDraw?: string;
  percentAway?: string;
};

export type MatchOdds = {
  home?: string;
  draw?: string;
  away?: string;
  bookmaker?: string;
};

export type MatchDetails = {
  events: MatchEvent[];
  stats?: MatchStats;
  lineups?: MatchLineup[];
  prediction?: MatchPrediction;
};

export type StandingRow = {
  rank: number;
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string;
  description?: string;
  group?: string;
};

export type LeagueTable = {
  competition: Competition;
  season: number;
  rows: StandingRow[];
};

export type TeamStats = {
  played?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  points?: number;
  rank?: number;
  form?: string;
};

export type PlayerStats = {
  appearances?: number;
  goals?: number;
  assists?: number;
  minutes?: number;
  yellowCards?: number;
  redCards?: number;
  rating?: string;
};

export type Player = {
  id: string;
  name: string;
  teamId: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward' | string;
  number: number;
  nationality: string;
  age: number;
  appearances: number;
  goals: number;
  assists: number;
  minutes?: number;
  yellowCards?: number;
  redCards?: number;
  photoUrl?: string;
  /** Present only when values came from API-Football. */
  fromApi?: boolean;
};

export type TopScorer = {
  player: Player;
  team: Team;
  goals: number;
  assists?: number;
};

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  summary?: string;
  url?: string;
  imageUrl?: string;
};

export type SearchResults = {
  teams: Team[];
  leagues: Competition[];
  players: Player[];
  matches: Match[];
};

export type NotificationInboxItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
  kind:
    | 'match_reminder'
    | 'kickoff'
    | 'result'
    | 'goal'
    | 'red_card'
    | 'full_time'
    | 'system';
};
