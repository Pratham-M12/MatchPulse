import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { Typography } from '@/components/ui/Typography';
import { spacing } from '@/theme';
import type { MatchStatus } from '@/types/football';

type MatchScoreProps = {
  homeScore?: number;
  awayScore?: number;
  status: MatchStatus;
};

export function MatchScore({ homeScore, awayScore, status }: MatchScoreProps) {
  const hasScore = status === 'live' || status === 'finished';
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!hasScore) return;
    scale.value = withSequence(withTiming(1.12, { duration: 140 }), withTiming(1, { duration: 180 }));
  }, [homeScore, awayScore, hasScore, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (!hasScore) {
    return (
      <Typography variant="score" color="textSecondary">
        vs
      </Typography>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Typography variant="score">{homeScore ?? 0}</Typography>
        <Typography variant="score" color="textSecondary">
          -
        </Typography>
        <Typography variant="score">{awayScore ?? 0}</Typography>
      </View>
    </Animated.View>
  );
}
