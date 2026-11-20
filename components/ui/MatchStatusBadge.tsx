import { View } from 'react-native';

import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { Typography } from '@/components/ui/Typography';
import { formatKickoffTime, formatMatchDay } from '@/lib/format/datetime';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { spacing } from '@/theme';
import type { Match } from '@/types/football';

export function MatchStatusBadge({ match }: { match: Match }) {
  const timeFormat = usePreferencesStore((state) => state.timeFormat);
  if (match.status === 'live') return <LiveIndicator minute={match.minute} />;
  if (match.status === 'finished') {
    return (
      <Typography variant="overline" color="textSecondary">
        FT
      </Typography>
    );
  }
  if (match.status === 'postponed') {
    return <Typography variant="overline" color="warning">POSTPONED</Typography>;
  }
  if (match.status === 'cancelled') {
    return <Typography variant="overline" color="loss">CANCELLED</Typography>;
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 }}>
      <Typography variant="caption" color="textSecondary" numberOfLines={1}>
        {formatMatchDay(match.kickoff)}
      </Typography>
      <Typography variant="caption" color="textPrimary" numberOfLines={1}>
        {formatKickoffTime(match.kickoff, timeFormat)}
      </Typography>
    </View>
  );
}
