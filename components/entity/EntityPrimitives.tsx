import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, View } from 'react-native';

import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { colorFromString, initialsFromName } from '@/lib/colorFromString';
import { colors, radius, spacing } from '@/theme';
import type { Competition, Player, Team } from '@/types/football';

export function EntityHero({ title, subtitle, mark, favorited, onToggleFavorite }: { title: string; subtitle?: string; mark: Team | Competition; favorited: boolean; onToggleFavorite: () => void }) {
  const isTeam = 'shortName' in mark;
  return (
    <View style={{ backgroundColor: colors.surfaceElevated, borderRadius: radius.card, borderWidth: 1, borderColor: colors.divider, padding: spacing.xl, gap: spacing.md, overflow: 'hidden' }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: -50, right: -34, width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: colors.primaryMuted }} />
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
        {isTeam ? <TeamLogo team={mark as Team} size={64} /> : <LeagueMark competition={mark as Competition} size={64} />}
        <View style={{ flex: 1, gap: 2 }}>
          <Typography variant="overline" color="primary">{isTeam ? 'CLUB' : 'COMPETITION'}</Typography>
          <Typography variant="heading" numberOfLines={2}>{title}</Typography>
          {subtitle ? <Typography variant="body" color="textSecondary">{subtitle}</Typography> : null}
        </View>
        <FavoriteButton favorited={favorited} onToggle={onToggleFavorite} />
      </View>
      <Typography variant="caption" color={favorited ? 'primary' : 'textSecondary'}>{favorited ? '• FOLLOWING' : 'Follow for fixtures and results'}</Typography>
    </View>
  );
}

export function EntityTabs({ tabs, selected, onSelect }: { tabs: string[]; selected: string; onSelect: (tab: string) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: radius.lg,
        padding: 4,
        gap: 4,
      }}
    >
      {tabs.map((tab) => {
        const isSelected = tab === selected;
        return (
          <Pressable
            key={tab}
            onPress={() => onSelect(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={tab}
          >
            {({ pressed }) => (
              <View
                style={{
                  minHeight: 38,
                  paddingHorizontal: spacing.md,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? colors.surfaceHighlight : colors.transparent,
                  opacity: pressed ? 0.8 : 1,
                }}
              >
                <Typography
                  variant="overline"
                  color={isSelected ? 'textPrimary' : 'textSecondary'}
                  style={{
                    fontSize: 11,
                    letterSpacing: 0.3,
                    fontWeight: isSelected ? '700' : '500',
                  }}
                  numberOfLines={1}
                >
                  {tab}
                </Typography>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function LeagueMark({ competition, size = 40 }: { competition: Competition; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colorFromString(competition.name), alignItems: 'center', justifyContent: 'center' }}>
      <Typography style={{ fontSize: size * 0.34, lineHeight: size * 0.4, fontWeight: '700' }}>{initialsFromName(competition.shortName ?? competition.name)}</Typography>
    </View>
  );
}

export function PlayerRow({ player, team, onPress }: { player: Player; team?: Team; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open ${player.name}`}>
      {({ pressed }) => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            padding: spacing.md,
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.divider,
            opacity: pressed ? 0.88 : 1,
          }}
        >
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="label" color="primary">{player.number}</Typography>
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Typography variant="label" numberOfLines={1}>{player.name}</Typography>
            <Typography variant="caption" color="textSecondary">{player.position}{team ? ` • ${team.shortName}` : ''}</Typography>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
        </View>
      )}
    </Pressable>
  );
}

export function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Typography variant="title">{value}</Typography>
      <Typography variant="caption" color="textSecondary">{label}</Typography>
    </View>
  );
}
