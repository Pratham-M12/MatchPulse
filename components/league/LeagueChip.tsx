import { Pressable, View } from 'react-native';

import { useState } from 'react';
import { Image } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colorFromString, initialsFromName } from '@/lib/colorFromString';
import { colors, radius, spacing } from '@/theme';
import type { Competition } from '@/types/football';

type LeagueChipProps = {
  competition: Competition;
  selected?: boolean;
  onPress?: () => void;
};

/**
 * Compact pill used in the "Popular Leagues" horizontal list on the Home
 * Screen. Shows a small colored initial mark plus the league's full name.
 */
export function LeagueChip({ competition, selected = false, onPress }: LeagueChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${competition.name}${selected ? ', selected' : ''}`}
      accessibilityState={{ selected }}
    >
      {({ pressed }) => (
        <View
          style={{
            minHeight: 44,
            backgroundColor: selected ? colors.primarySubtle : colors.surfaceElevated,
            borderWidth: 1,
            borderColor: selected ? colors.primaryMuted : colors.border,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            opacity: pressed ? 0.82 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          }}
        >
          <CompetitionMark competition={competition} selected={selected} />
          <Typography
            variant="caption"
            color={selected ? 'primary' : 'textPrimary'}
            style={{ fontWeight: selected ? '700' : '600', maxWidth: 152 }}
            numberOfLines={1}
          >
            {competition.name}
          </Typography>
        </View>
      )}
    </Pressable>
  );
}

function CompetitionMark({ competition, selected }: { competition: Competition; selected: boolean }) {
  const [hasImageError, setHasImageError] = useState(false);
  const mark = competition.shortName?.[0] ?? initialsFromName(competition.name)[0];

  if (competition.logoUrl && !hasImageError) {
    return (
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: radius.sm,
          backgroundColor: selected ? colors.primaryMuted : colors.surfaceHighlight,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: competition.logoUrl }}
          style={{ width: 22, height: 22 }}
          resizeMode="contain"
          accessibilityLabel={`${competition.name} logo`}
          onError={() => setHasImageError(true)}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        width: 26,
        height: 26,
        borderRadius: radius.sm,
        backgroundColor: colorFromString(competition.name),
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Typography style={{ fontSize: 11, lineHeight: 13, fontWeight: '700' }}>
        {mark}
      </Typography>
    </View>
  );
}
