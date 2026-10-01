import { useEffect } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

type LiveIndicatorProps = {
  /** Minute of play, e.g. 78. Omit to just show "LIVE". */
  minute?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Small red pill marking a match as live, optionally with the current
 * minute (e.g. "LIVE  78'"). Pulsing/animated variants can be layered on
 * top of this later without changing the API.
 */
export function LiveIndicator({ minute, style }: LiveIndicatorProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.35, { duration: 900 }), -1, true);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          backgroundColor: colors.liveMuted,
          borderWidth: 1,
          borderColor: 'rgba(255, 77, 77, 0.20)',
          paddingHorizontal: spacing.sm,
          paddingVertical: 3,
          borderRadius: radius.pill,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          ...pulseStyle,
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.live,
        }}
      />
      <Typography variant="overline" color="live">
        LIVE{minute !== undefined ? `  ${minute}'` : ''}
      </Typography>
    </View>
  );
}