import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Pressable, View } from 'react-native';

import { MatchStatusBadge } from '@/components/ui/MatchStatusBadge';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';
import type { Match } from '@/types/football';

type MatchCardProps = {
  match: Match;
  onPress?: () => void;
  fullWidth?: boolean;
  showNavigationAffordance?: boolean;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = Math.min(280, Math.max(235, SCREEN_WIDTH - 72));

export function MatchCard({
  match,
  onPress,
  fullWidth = false,
  showNavigationAffordance = false,
}: MatchCardProps) {
  const { competition, homeTeam, awayTeam, homeScore, awayScore, status } = match;
  const isLive = status === 'live';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${homeTeam.name} versus ${awayTeam.name}`}
      style={{ width: fullWidth ? '100%' : CARD_WIDTH }}
    >
      {({ pressed }) => (
        <View
          style={{
            width: '100%',
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: isLive ? colors.live : colors.border,
            padding: spacing.base,
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.985 : 1 }],
          }}
        >
          {/* HEADER */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing.md,
            }}
          >
            <Typography
              variant="overline"
              color="textSecondary"
              numberOfLines={1}
              style={{
                flex: 1,
                marginRight: spacing.sm,
              }}
            >
              {competition.shortName ?? competition.name}
            </Typography>

            <MatchStatusBadge match={match} />
          </View>

          {/* HOME TEAM */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              minHeight: 40,
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
                size={30}
                useShortName={false}
              />
            </View>

            <Typography
              variant="score"
              style={{
                minWidth: 28,
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
              marginVertical: spacing.sm,
            }}
          />

          {/* AWAY TEAM */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              minHeight: 40,
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
                size={30}
                useShortName={false}
              />
            </View>

            <Typography
              variant="score"
              color={isLive ? 'textPrimary' : 'textSecondary'}
              style={{
                minWidth: 28,
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
                marginTop: spacing.md,
              }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: isLive
                    ? colors.primarySubtle
                    : colors.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={isLive ? colors.primary : colors.textSecondary}
                />
              </View>
            </View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
