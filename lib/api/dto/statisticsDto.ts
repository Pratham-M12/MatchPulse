export type ApiStatisticItem = {
  type: string; // e.g. 'Ball Possession', 'Total Shots', 'Shots on Goal', 'Corner Kicks', 'Fouls', 'Yellow Cards', 'Red Cards'
  value: string | number | null;
};

export type ApiTeamStatistics = {
  team: { id: number; name: string };
  statistics: ApiStatisticItem[];
};

export type ApiFixtureStatisticsResponse = {
  response: ApiTeamStatistics[];
};