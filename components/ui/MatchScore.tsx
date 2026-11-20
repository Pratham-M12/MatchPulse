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
  emphasis?: 'default' | 'hero' | 'heroCompact';
};

export function MatchScore({ homeScore, awayScore, status, emphasis = 'default' }: MatchScoreProps) {
  const hasScore = status === 'live' || status === 'finished';
  const scale = useSharedValue(1);
  const scoreStyle =
    emphasis === 'hero'
      ? { fontSize: 36, lineHeight: 42, letterSpacing: -1 }
      : emphasis === 'heroCompact'
        ? { fontSize: 30, lineHeight: 36, letterSpacing: -0.8 }
      : undefined;
  const scoreGap = emphasis === 'heroCompact' ? spacing.xs : spacing.sm;

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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: scoreGap }}>
        <Typography variant="score" style={scoreStyle}>{homeScore ?? 0}</Typography>
        <Typography variant="score" color="textSecondary" style={scoreStyle}>
          -
        </Typography>
        <Typography variant="score" style={scoreStyle}>{awayScore ?? 0}</Typography>
      </View>
    </Animated.View>
  );
}
