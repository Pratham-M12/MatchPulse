import { Share } from 'react-native';

import { formatKickoffShort, formatMatchStatus } from '@/lib/format/datetime';
import type { Match } from '@/types/football';
import type { TimeFormatPref } from '@/lib/format/datetime';

export async function shareMatch(match: Match, timeFormat: TimeFormatPref = '24h') {
  const status = formatMatchStatus({
    status: match.status,
    minute: match.minute,
    kickoff: match.kickoff,
    timeFormat,
  });
  const score =
    match.status === 'scheduled'
      ? 'vs'
      : `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`;

  const message = [
    'MatchPulse',
    `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    `${score} · ${status}`,
    match.competition.name,
    formatKickoffShort(match.kickoff, timeFormat),
    `matchpulse://match/${match.id}`,
  ].join('\n');

  await Share.share({ message, title: 'MatchPulse' });
}
