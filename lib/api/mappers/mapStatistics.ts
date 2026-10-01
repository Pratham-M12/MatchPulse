import type { ApiStatisticItem, ApiTeamStatistics } from '@/lib/api/dto/statisticsDto';
import type { MatchStats } from '@/types/football';

function getStatValue(statistics: ApiStatisticItem[], type: string): number {
  const item = statistics.find((stat) => stat.type === type);
  if (item === undefined || item.value === null) return 0;
  if (typeof item.value === 'number') return item.value;
  return parseInt(item.value.replace('%', ''), 10) || 0;
}

/**
 * Maps API-Football's per-team statistics arrays (one entry per team)
 * into our single flat MatchStats shape. Returns undefined if either
 * team's statistics are missing — API-Football only populates this
 * endpoint once a match has kicked off.
 */
export function mapStatisticsToMatchStats(
  teamStats: ApiTeamStatistics[],
  homeTeamId: string
): MatchStats | undefined {
  const home = teamStats.find((entry) => String(entry.team.id) === homeTeamId);
  const away = teamStats.find((entry) => String(entry.team.id) !== homeTeamId);
  if (!home || !away) return undefined;

  return {
    possessionHome: getStatValue(home.statistics, 'Ball Possession'),
    possessionAway: getStatValue(away.statistics, 'Ball Possession'),
    shotsHome: getStatValue(home.statistics, 'Total Shots'),
    shotsAway: getStatValue(away.statistics, 'Total Shots'),
    shotsOnTargetHome: getStatValue(home.statistics, 'Shots on Goal'),
    shotsOnTargetAway: getStatValue(away.statistics, 'Shots on Goal'),
    cornersHome: getStatValue(home.statistics, 'Corner Kicks'),
    cornersAway: getStatValue(away.statistics, 'Corner Kicks'),
    foulsHome: getStatValue(home.statistics, 'Fouls'),
    foulsAway: getStatValue(away.statistics, 'Fouls'),
    yellowCardsHome: getStatValue(home.statistics, 'Yellow Cards'),
    yellowCardsAway: getStatValue(away.statistics, 'Yellow Cards'),
    redCardsHome: getStatValue(home.statistics, 'Red Cards'),
    redCardsAway: getStatValue(away.statistics, 'Red Cards'),
  };
}