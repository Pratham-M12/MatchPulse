export type ApiStandingTeam = {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  group?: string;
  form?: string | null;
  description?: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
};

export type ApiStandingsResponse = {
  response: Array<{
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      season: number;
      standings: ApiStandingTeam[][];
    };
  }>;
};

export type ApiTeamInfo = {
  team: { id: number; name: string; logo: string; country?: string; founded?: number | null };
  venue?: { name?: string | null };
};

export type ApiTeamsResponse = { response: ApiTeamInfo[] };

export type ApiSquadPlayer = {
  id: number;
  name: string;
  age?: number | null;
  number?: number | null;
  position?: string | null;
  photo?: string | null;
};

export type ApiSquadResponse = {
  response: Array<{
    team: { id: number; name: string; logo: string };
    players: ApiSquadPlayer[];
  }>;
};

export type ApiTopScorer = {
  player: {
    id: number;
    name: string;
    nationality?: string;
    age?: number;
    photo?: string;
  };
  statistics: Array<{
    team: { id: number; name: string; logo: string };
    games: { appearences?: number | null; minutes?: number | null; position?: string | null; rating?: string | null };
    goals: { total?: number | null; assists?: number | null };
    cards?: { yellow?: number | null; red?: number | null };
  }>;
};

export type ApiTopScorersResponse = { response: ApiTopScorer[] };

export type ApiLineupPlayer = {
  player: { id: number; name: string; number?: number | null; pos?: string | null; grid?: string | null };
};

export type ApiLineup = {
  team: { id: number; name: string; logo: string };
  formation?: string | null;
  startXI: ApiLineupPlayer[];
  substitutes: ApiLineupPlayer[];
  coach?: { name?: string | null };
};

export type ApiLineupsResponse = { response: ApiLineup[] };

export type ApiPrediction = {
  predictions?: {
    winner?: { name?: string | null };
    advice?: string | null;
    percent?: { home?: string; draw?: string; away?: string };
  };
};

export type ApiPredictionsResponse = { response: ApiPrediction[] };

export type ApiLeagueSearch = {
  league: { id: number; name: string; logo: string };
  country?: { name?: string };
};

export type ApiLeaguesSearchResponse = { response: ApiLeagueSearch[] };

export type ApiPlayerStatistic = {
  team: { id: number; name: string; logo: string };
  league?: { id: number; name: string; country?: string; logo?: string; season?: number };
  games: {
    appearences?: number | null;
    lineups?: number | null;
    minutes?: number | null;
    number?: number | null;
    position?: string | null;
    rating?: string | null;
    captain?: boolean | null;
  };
  goals: {
    total?: number | null;
    conceded?: number | null;
    assists?: number | null;
    saves?: number | null;
  };
  cards?: {
    yellow?: number | null;
    yellowred?: number | null;
    red?: number | null;
  };
  shots?: { total?: number | null; on?: number | null };
  passes?: { total?: number | null; key?: number | null; accuracy?: number | null };
  tackles?: { total?: number | null; blocks?: number | null; interceptions?: number | null };
  duels?: { total?: number | null; won?: number | null };
  dribbles?: { attempts?: number | null; success?: number | null; past?: number | null };
  fouls?: { drawn?: number | null; committed?: number | null };
};

export type ApiPlayerProfile = {
  id: number;
  name: string;
  firstname?: string;
  lastname?: string;
  age?: number | null;
  nationality?: string | null;
  height?: string | null;
  weight?: string | null;
  injured?: boolean | null;
  photo?: string | null;
};

export type ApiPlayerItem = {
  player: ApiPlayerProfile;
  statistics: ApiPlayerStatistic[];
};

export type ApiPlayersResponse = {
  response: ApiPlayerItem[];
};

export type ApiLeagueSeason = {
  year: number;
  start: string;
  end: string;
  current: boolean;
  coverage: {
    fixtures?: {
      events?: boolean;
      lineups?: boolean;
      statistics_fixtures?: boolean;
      statistics_players?: boolean;
    };
    standings?: boolean;
    players?: boolean;
    top_scorers?: boolean;
    top_assists?: boolean;
    top_cards?: boolean;
    injuries?: boolean;
    predictions?: boolean;
    odds?: boolean;
  };
};

export type ApiLeagueDetails = {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  country: {
    name: string;
    code?: string;
    flag?: string;
  };
  seasons: ApiLeagueSeason[];
};

export type ApiLeagueDetailsResponse = {
  response: ApiLeagueDetails[];
};

export type ApiSeasonsResponse = {
  response: number[];
};

export type ApiAccountStatusResponse = {
  response: {
    account?: { firstname?: string; lastname?: string; email?: string };
    subscription?: { plan?: string; end?: string; active?: boolean };
    requests?: { current?: number; limit_day?: number };
  };
};
