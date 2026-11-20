import { View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

type StatRowProps = {
  label: string;
  homeValue?: number;
  awayValue?: number;
  /** Append to displayed values, e.g. "%" for possession. Defaults to none. */
  suffix?: string;
  /** Percentages are shown against a fixed 100% scale instead of count ratios. */
  variant?: 'count' | 'percentage';
  homeColor?: string;
  awayColor?: string;
};

/**
 * A single match-statistics row (e.g. "Possession  54% | 46%") with a
 * proportional bar showing the home/away split. Used on the Match
 * Details screen for stats like shots, corners, fouls.
 */
export function StatRow({
  label,
  homeValue,
  awayValue,
  suffix = '',
  variant = 'count',
  homeColor = colors.primary,
  awayColor = colors.textSecondary,
}: StatRowProps) {
  const hasBothValues = homeValue !== undefined && awayValue !== undefined;
  const total = hasBothValues ? homeValue + awayValue : 0;
  const isZero = hasBothValues && total === 0;
  const homeRatio = isZero ? 0 : hasBothValues && variant === 'count' ? homeValue / total : 0;
  const awayRatio = isZero ? 0 : hasBothValues && variant === 'count' ? awayValue / total : 0;
  const homePercent = hasBothValues ? Math.max(0, Math.min(homeValue, 100)) : 0;
  const awayPercent = hasBothValues ? Math.max(0, Math.min(awayValue, 100)) : 0;
  const formatValue = (value: number | undefined) => (value === undefined ? '—' : `${value}${suffix}`);
  const accessibilityLabel = `${label}. Home ${formatValue(homeValue)}. Away ${formatValue(awayValue)}.`;

  return (
    <View accessible accessibilityRole="text" accessibilityLabel={accessibilityLabel} style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="label" style={{ width: 48 }}>
          {formatValue(homeValue)}
        </Typography>
        <Typography variant="caption" color="textSecondary" style={{ flex: 1, textAlign: 'center', paddingHorizontal: spacing.xs }} numberOfLines={2}>
          {label}
        </Typography>
        <Typography variant="label" style={{ width: 48, textAlign: 'right' }}>
          {formatValue(awayValue)}
        </Typography>
      </View>
      <View accessible={false} style={{ flexDirection: 'row', height: 5, gap: 2 }}>
        <View style={{ flex: 1, backgroundColor: colors.divider, borderRadius: radius.pill, overflow: 'hidden', flexDirection: 'row', justifyContent: 'flex-end' }}>
          {hasBothValues && !isZero ? (
            <View
              style={{
                width: variant === 'percentage' ? `${homePercent}%` : `${homeRatio * 100}%`,
                backgroundColor: homeColor,
              }}
            />
          ) : null}
        </View>
        <View style={{ flex: 1, backgroundColor: colors.divider, borderRadius: radius.pill, overflow: 'hidden' }}>
          {hasBothValues && !isZero ? (
            <View
              style={{
                width: variant === 'percentage' ? `${awayPercent}%` : `${awayRatio * 100}%`,
                backgroundColor: awayColor,
              }}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}
