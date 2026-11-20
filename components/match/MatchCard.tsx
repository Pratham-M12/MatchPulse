import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { MatchStatusBadge } from '@/components/ui/MatchStatusBadge';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { Typography } from '@/components/ui/Typography';
import { describeMatchForAccessibility } from '@/lib/format/matchAccessibility';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { colors, radius, spacing } from '@/theme';
import type { Match } from '@/types/football';

type MatchCardProps = {
  match: Match;
  onPress?: () => void;
  fullWidth?: boolean;
  showNavigationAffordance?: boolean;
};

const COMPACT_CARD_WIDTH = 280;

export function MatchCard({
  match,
  onPress,
  fullWidth = false,
  showNavigationAffordance = false,
}: MatchCardProps) {
  const timeFormat = usePreferencesStore((state) => state.timeFormat);
  const { competition, homeTeam, awayTeam, homeScore, awayScore, status } = match;
  const isLive = status === 'live';
  const accentColor = homeTeam.color ?? awayTeam.color ?? colors.primary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={describeMatchForAccessibility(match, timeFormat)}
      style={{ width: fullWidth ? '100%' : COMPACT_CARD_WIDTH, maxWidth: '100%', flexShrink: 1 }}
    >
      {({ pressed }) => (
        <View
          style={{
            width: '100%',
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: isLive ? colors.liveMuted : colors.divider,
            padding: spacing.md,
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.985 : 1 }],
            overflow: 'hidden',
          }}
        >
          {isLive ? (
            <View
              pointerEvents="none"
              style={{ position: 'absolute', top: spacing.md, bottom: spacing.md, left: 0, width: 3, backgroundColor: colors.live }}
            />
          ) : null}
          {/* HEADER */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.sm,
              marginBottom: spacing.sm,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1, minWidth: 0 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accentColor, flexShrink: 0 }} />
              <Typography variant="overline" color="textSecondary" numberOfLines={1} style={{ flex: 1 }}>
                {competition.shortName ?? competition.name}
              </Typography>
            </View>

            <MatchStatusBadge match={match} />
          </View>

          {/* HOME TEAM */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              minHeight: 38,
            }}
          >
            <View
              style={{
                flex: 1,
                minWidth: 0,
                marginRight: spacing.md,
              }}
            >
              <TeamBadge
                team={homeTeam}
                size={32}
                useShortName={false}
                decorativeLogo
              />
            </View>

            <Typography
              variant="score"
              color={isLive || homeScore !== undefined ? 'textPrimary' : 'textSecondary'}
              style={{
                minWidth: 32,
                textAlign: 'right',
              }}
            >
              {homeScore ?? '-'}
            </Typography>
          </View>

          {/* DIVIDER */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.divider,
              opacity: 0.6,
              marginVertical: spacing.xs + 2,
            }}
          />

          {/* AWAY TEAM */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              minHeight: 38,
            }}
          >
            <View
              style={{
                flex: 1,
                minWidth: 0,
                marginRight: spacing.md,
              }}
            >
              <TeamBadge
                team={awayTeam}
                size={32}
                useShortName={false}
                decorativeLogo
              />
            </View>

            <Typography
              variant="score"
              color={isLive || awayScore !== undefined ? 'textPrimary' : 'textSecondary'}
              style={{
                minWidth: 32,
                textAlign: 'right',
              }}
            >
              {awayScore ?? '-'}
            </Typography>
          </View>

          {/* NAVIGATION AFFORDANCE */}
          {showNavigationAffordance ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: spacing.sm,
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: colors.surfaceHighlight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={isLive ? colors.live : colors.textSecondary}
                />
              </View>
            </View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
