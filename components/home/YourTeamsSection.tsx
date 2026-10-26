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
      <View style={{ gap: spacing.md }}>
        <View style={{ paddingHorizontal: spacing.base }}>
          <SectionTitle
            title="Your Teams"
            actionLabel="Find clubs"
            onActionPress={onSearchPress}
          />
        </View>

        <View style={{ paddingHorizontal: spacing.base }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.base,
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
                paddingVertical: spacing.xs + 2,
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
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.base,
          gap: spacing.sm,
          alignItems: 'center',
        }}
      >
        {teams.map((team) => (
          <Pressable
            key={team.id}
            onPress={() => onTeamPress(team)}
            accessibilityRole="button"
            accessibilityLabel={`${team.name}, view club details`}
            style={({ pressed }) => ({
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.card,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              minWidth: 80,
              gap: spacing.xs,
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <TeamLogo team={team} size={40} />
            <Typography
              variant="caption"
              numberOfLines={1}
              style={{ fontWeight: '600', maxWidth: 72, textAlign: 'center' }}
            >
              {team.shortName || team.name}
            </Typography>
          </Pressable>
        ))}

        <Pressable
          onPress={onSearchPress}
          accessibilityRole="button"
          accessibilityLabel="Find more teams to follow"
          style={({ pressed }) => ({
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: 'dashed',
            borderRadius: radius.card,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            minWidth: 72,
            height: 78,
            gap: 4,
            opacity: pressed ? 0.8 : 1,
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
