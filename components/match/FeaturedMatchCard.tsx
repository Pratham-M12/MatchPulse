import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { MatchScore } from '@/components/ui/MatchScore';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { formatKickoffTime, formatMatchDay } from '@/lib/format/datetime';
import { describeMatchForAccessibility } from '@/lib/format/matchAccessibility';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { colors, radius, spacing } from '@/theme';
import type { Match } from '@/types/football';

type FeaturedMatchCardProps = {
  match: Match;
  onPress?: () => void;
  /** Keeps secondary placements prominent without competing with the primary hero. */
  variant?: 'hero' | 'secondary';
};

function translucentHex(hex: string, opacity: number): string | undefined {
  const normalized = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return undefined;

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

export function FeaturedMatchCard({ match, onPress, variant = 'hero' }: FeaturedMatchCardProps) {
  const timeFormat = usePreferencesStore((state) => state.timeFormat);
  const [cardWidth, setCardWidth] = useState<number>();
  const { competition, homeTeam, awayTeam, homeScore, awayScore, status, minute, venue } = match;
  const isHero = variant === 'hero';
  const isCompactHero = isHero && cardWidth !== undefined && cardWidth < 336;
  const isExtraCompactHero = isHero && cardWidth !== undefined && cardWidth < 304;
  const isCompactSecondary = !isHero && cardWidth !== undefined && cardWidth < 280;
  const isCompact = isCompactHero || isCompactSecondary;
  const hasStarted = status === 'live' || status === 'finished';
  const teamAccent = homeTeam.color ?? awayTeam.color;
  const accentColor = teamAccent ?? colors.primary;
  const accentTint = teamAccent ? translucentHex(teamAccent, 0.14) ?? colors.primarySubtle : colors.primarySubtle;
  const accentWash = teamAccent ? translucentHex(teamAccent, 0.08) ?? colors.primarySubtle : colors.primarySubtle;
  const statusLabel =
    status === 'scheduled'
      ? 'UPCOMING'
      : status === 'finished'
        ? 'FULL TIME'
        : status === 'postponed'
          ? 'POSTPONED'
          : status === 'cancelled'
            ? 'CANCELLED'
            : undefined;
  const detailLabel = venue;
  const cardPadding = isHero
    ? isCompact ? spacing.lg : spacing.xl
    : isCompact ? spacing.md : spacing.lg;
  const cardGap = isCompact ? spacing.lg : isHero ? spacing.xl : spacing.lg;
  const teamGap = isExtraCompactHero ? spacing.sm : spacing.md;
  const teamContentGap = isCompact ? spacing.xs : spacing.sm;
  const crestSize = isHero
    ? isExtraCompactHero ? 52 : isCompact ? 60 : 72
    : isCompact ? 52 : 56;
  const crestWellPadding = isExtraCompactHero ? 10 : 12;
  const crestWellSize = crestSize + crestWellPadding;
  const scoreColumnWidth = isHero
    ? isExtraCompactHero ? 76 : isCompact ? 88 : 108
    : isCompact ? 76 : 84;
  const scoreEmphasis = isHero ? isCompact ? 'heroCompact' : 'hero' : 'default';
  const kickoffDateVariant = isHero && !isCompact ? 'heading' : 'title';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={describeMatchForAccessibility(match, timeFormat)}
      accessibilityHint="Opens Match Centre"
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;
        setCardWidth((currentWidth) => currentWidth === nextWidth ? currentWidth : nextWidth);
      }}
      style={({ pressed }) => ({
        backgroundColor: colors.surfaceElevated,
        borderRadius: radius.card,
        padding: cardPadding,
        gap: cardGap,
        borderWidth: 1,
        borderColor: status === 'live' ? colors.liveMuted : colors.divider,
        overflow: 'hidden',
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -76,
          right: -54,
          width: isHero ? 220 : 164,
          height: isHero ? 220 : 164,
          borderRadius: 999,
          backgroundColor: accentWash,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: cardPadding,
          right: cardPadding,
          height: 2,
          borderRadius: radius.pill,
          backgroundColor: status === 'live' ? colors.live : accentColor,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -76,
          left: -54,
          width: isHero ? 180 : 132,
          height: isHero ? 180 : 132,
          borderRadius: 999,
          backgroundColor: colors.surfaceHighlight,
          opacity: 0.48,
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
        <Typography variant="overline" color="textSecondary" numberOfLines={1} style={{ flex: 1 }}>
          {competition.shortName ?? competition.name}
        </Typography>
        {status === 'live' ? (
          <LiveIndicator minute={minute} />
        ) : (
          <View style={{ backgroundColor: accentTint, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 }}>
            <Typography variant="overline" color={status === 'scheduled' ? 'primary' : 'textSecondary'}>
              {statusLabel}
            </Typography>
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: teamGap }}>
        <View style={{ flex: 1, minWidth: 0, alignItems: 'center', gap: teamContentGap }}>
          <View
            style={{
              width: crestWellSize,
              height: crestWellSize,
              borderRadius: crestWellSize / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: accentTint,
              borderWidth: 1,
              borderColor: teamAccent ? accentTint : colors.primaryMuted,
            }}
          >
            <TeamLogo team={homeTeam} size={crestSize} decorative />
          </View>
          <Typography variant={isHero ? 'title' : 'label'} numberOfLines={2} style={{ textAlign: 'center', width: '100%' }}>
            {homeTeam.shortName || homeTeam.name}
          </Typography>
        </View>

        <View style={{ width: scoreColumnWidth, flexShrink: 0, alignItems: 'center', gap: spacing.xs }}>
          {hasStarted ? (
            <MatchScore homeScore={homeScore} awayScore={awayScore} status={status} emphasis={scoreEmphasis} />
          ) : status === 'scheduled' ? (
            <>
              <Typography variant={isHero ? 'title' : 'label'} color="textSecondary">KICKOFF</Typography>
              <Typography variant={kickoffDateVariant} numberOfLines={1} style={{ textAlign: 'center' }}>
                {formatMatchDay(match.kickoff)}
              </Typography>
              <Typography variant={isHero ? 'title' : 'label'} color="primary" numberOfLines={1}>
                {formatKickoffTime(match.kickoff, timeFormat)}
              </Typography>
            </>
          ) : (
            <Typography variant={isHero ? 'title' : 'label'} color="textSecondary" style={{ textAlign: 'center' }}>
              {statusLabel}
            </Typography>
          )}
        </View>

        <View style={{ flex: 1, minWidth: 0, alignItems: 'center', gap: teamContentGap }}>
          <View
            style={{
              width: crestWellSize,
              height: crestWellSize,
              borderRadius: crestWellSize / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.divider,
            }}
          >
            <TeamLogo team={awayTeam} size={crestSize} decorative />
          </View>
          <Typography variant={isHero ? 'title' : 'label'} numberOfLines={2} style={{ textAlign: 'center', width: '100%' }}>
            {awayTeam.shortName || awayTeam.name}
          </Typography>
        </View>
      </View>

      {detailLabel ? (
        <Typography variant="caption" color="textSecondary" style={{ textAlign: 'center' }} numberOfLines={1}>
          {detailLabel}
        </Typography>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs }}>
        <Typography variant="label" color="primary">Match Centre</Typography>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </View>
    </Pressable>
  );
}
