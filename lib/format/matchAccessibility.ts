import { formatKickoffTime, formatMatchDay, type TimeFormatPref } from '@/lib/format/datetime';
import type { Match } from '@/types/football';

export function describeMatchForAccessibility(match: Match, timeFormat: TimeFormatPref): string {
  const parts = [match.competition.name, `${match.homeTeam.name} versus ${match.awayTeam.name}`];
  const hasScore =
    (match.status === 'live' || match.status === 'finished') &&
    match.homeScore !== undefined &&
    match.awayScore !== undefined;

  if (hasScore) {
    parts.push(`Score ${match.homeScore} to ${match.awayScore}`);
  }

  if (match.status === 'live') {
    parts.push(match.minute !== undefined ? `Live, minute ${match.minute}` : 'Live');
  } else if (match.status === 'finished') {
    parts.push('Full time');
  } else if (match.status === 'postponed') {
    parts.push('Postponed');
  } else if (match.status === 'cancelled') {
    parts.push('Cancelled');
  } else {
    parts.push(`Kickoff ${formatMatchDay(match.kickoff)} at ${formatKickoffTime(match.kickoff, timeFormat)}`);
  }

  return parts.filter(Boolean).join('. ');
}
