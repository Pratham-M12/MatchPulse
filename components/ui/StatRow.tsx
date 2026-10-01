import { View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

type StatRowProps = {
  label: string;
  homeValue: number;
  awayValue: number;
  /** Append to displayed values, e.g. "%" for possession. Defaults to none. */
  suffix?: string;
};

/**
 * A single match-statistics row (e.g. "Possession  54% | 46%") with a
 * proportional bar showing the home/away split. Used on the Match
 * Details screen for stats like shots, corners, fouls.
 */
export function StatRow({ label, homeValue, awayValue, suffix = '' }: StatRowProps) {
  const total = homeValue + awayValue;
  const isZero = total === 0;
  const homeRatio = isZero ? 0 : homeValue / total;
  const awayRatio = isZero ? 0 : awayValue / total;

  return (
    <View style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="label">
          {homeValue}
          {suffix}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {label}
        </Typography>
        <Typography variant="label">
          {awayValue}
          {suffix}
        </Typography>
      </View>
      <View
        style={{
          flexDirection: 'row',
          height: 4,
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: colors.divider,
        }}
      >
        {isZero ? null : (
          <>
            <View style={{ flex: homeRatio, backgroundColor: colors.primary }} />
            <View style={{ flex: awayRatio, backgroundColor: colors.textSecondary }} />
          </>
        )}
      </View>
    </View>
  );
}