import { View } from 'react-native';

import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { Typography } from '@/components/ui/Typography';
import { formatKickoffTime } from '@/lib/format/datetime';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import type { Match } from '@/types/football';

export function MatchStatusBadge({ match }: { match: Match }) {
  const timeFormat = usePreferencesStore((state) => state.timeFormat);
  if (match.status === 'live') return <LiveIndicator minute={match.minute} />;
  if (match.status === 'finished') {
    return (
      <Typography variant="caption" color="textSecondary">
        FT
      </Typography>
    );
  }
  return (
    <Typography variant="caption" color="textSecondary">
      {formatKickoffTime(match.kickoff, timeFormat)}
    </Typography>
  );
}
