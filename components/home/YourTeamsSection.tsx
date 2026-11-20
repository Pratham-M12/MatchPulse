import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, View } from 'react-native';

import { SectionTitle } from '@/components/ui/SectionTitle';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';
import type { Team } from '@/types/football';

type YourTeamsSectionProps = {
  teams: Team[];
  onTeamPress: (team: Team) => void;
  onSearchPress: () => void;
};

export function YourTeamsSection({
  teams,
  onTeamPress,
  onSearchPress,
}: YourTeamsSectionProps) {
  if (teams.length === 0) {
    return (
      <View style={{ gap: spacing.sm }}>
        <View style={{ paddingHorizontal: spacing.base }}>
          <SectionTitle
            title="Your Teams"
            actionLabel="Find clubs"
            onActionPress={onSearchPress}
            actionTouchTarget
          />
        </View>

        <View style={{ paddingHorizontal: spacing.base }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: spacing.base,
              paddingVertical: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.primarySubtle,
                borderWidth: 1,
                borderColor: colors.primaryMuted,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Ionicons name="shield-outline" size={22} color={colors.primary} />
            </View>

            <View style={{ flex: 1, gap: 2 }}>
              <Typography variant="title" style={{ fontWeight: '700' }}>
                Follow your clubs
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Favorite teams to personalize live scores, matchday fixtures, and alerts.
              </Typography>
            </View>

            <Pressable
              onPress={onSearchPress}
              accessibilityRole="button"
              accessibilityLabel="Search clubs to follow"
              hitSlop={8}
              style={({ pressed }) => ({
                backgroundColor: colors.primarySubtle,
                borderWidth: 1,
                borderColor: colors.primary,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.md,
                minWidth: 44,
                minHeight: 44,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.8 : 1,
                flexShrink: 0,
              })}
            >
              <Typography variant="caption" color="primary" style={{ fontWeight: '700' }}>
                Find clubs
              </Typography>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ paddingHorizontal: spacing.base }}>
        <SectionTitle
          title="Your Teams"
          actionLabel="Add team"
          onActionPress={onSearchPress}
            actionTouchTarget
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: spacing.base,
          paddingRight: spacing['3xl'],
          paddingVertical: spacing.xs,
          gap: spacing.md,
          alignItems: 'center',
        }}
      >
        {teams.map((team) => <FollowedTeamTile key={team.id} team={team} onPress={() => onTeamPress(team)} />)}

        <Pressable
          onPress={onSearchPress}
          accessibilityRole="button"
          accessibilityLabel="Find more teams to follow"
          style={({ pressed }) => ({
            alignItems: 'center',
            justifyContent: 'center',
            width: 96,
            height: 112,
            backgroundColor: colors.surfaceElevated,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: 'dashed',
            borderRadius: radius.card,
            gap: spacing.sm,
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.surfaceHighlight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="add" size={20} color={colors.textSecondary} />
          </View>
          <Typography variant="caption" color="textSecondary" style={{ fontWeight: '500' }}>
            Add
          </Typography>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function FollowedTeamTile({ team, onPress }: { team: Team; onPress: () => void }) {
  const accentColor = team.color ?? colors.primary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${team.name}, view club details`}
      accessibilityHint="Opens club details"
      style={({ pressed }) => ({
        width: 96,
        height: 112,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.card,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        gap: spacing.xs,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
        overflow: 'hidden',
      })}
    >
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: spacing.md, right: spacing.md, height: 2, borderRadius: radius.pill, backgroundColor: accentColor }}
      />
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: team.color ?? colors.primaryMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TeamLogo team={team} size={44} />
      </View>
      <Typography
        variant="caption"
        numberOfLines={2}
        style={{ minHeight: 32, fontWeight: '700', maxWidth: 82, textAlign: 'center' }}
      >
        {team.shortName || team.name}
      </Typography>
    </Pressable>
  );
}
