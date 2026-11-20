import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';

import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { colorFromString, initialsFromName } from '@/lib/colorFromString';
import { colors, radius, spacing } from '@/theme';
import type { Competition, Player, Team } from '@/types/football';

export function EntityHero({
  title,
  subtitle,
  mark,
  favorited,
  onToggleFavorite,
  metadata,
  details,
  presentation = 'default',
}: {
  title: string;
  subtitle?: string;
  mark: Team | Competition;
  favorited: boolean;
  onToggleFavorite: () => void;
  /** A single factual context label, such as the dynamically resolved season. */
  metadata?: string;
  /** Additional factual identity context, such as a club's stadium. */
  details?: string[];
  presentation?: 'default' | 'competition' | 'team';
}) {
  const isTeam = 'shortName' in mark;
  const isCompetitionHero = presentation === 'competition' && !isTeam;
  const isTeamHero = presentation === 'team' && isTeam;
  const teamAccent = isTeamHero ? (mark as Team).color ?? colors.primary : colors.primary;
  const heroMark = isTeam ? (
    isTeamHero ? (
      <View style={{ width: 80, height: 80, borderRadius: radius.lg, backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: teamAccent, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <TeamLogo team={mark as Team} size={64} decorative />
      </View>
    ) : <TeamLogo team={mark as Team} size={64} />
  ) : <LeagueMark competition={mark as Competition} size={isCompetitionHero ? 72 : 64} />;
  return (
    <View style={{ backgroundColor: colors.surfaceElevated, borderRadius: radius.card, borderWidth: 1, borderColor: favorited ? (isTeamHero ? teamAccent : colors.primaryMuted) : colors.divider, padding: isCompetitionHero || isTeamHero ? spacing.lg : spacing.xl, gap: spacing.md, overflow: 'hidden' }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: -58, right: -40, width: isCompetitionHero || isTeamHero ? 184 : 160, height: isCompetitionHero || isTeamHero ? 184 : 160, borderRadius: 100, borderWidth: 1, borderColor: isTeamHero ? teamAccent : colors.primaryMuted }} />
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
        {heroMark}
        <View style={{ flex: 1, gap: 2 }}>
          <Typography variant="overline" color="primary">{isTeam ? 'CLUB' : 'COMPETITION'}</Typography>
          <Typography variant="heading" numberOfLines={2}>{title}</Typography>
          {subtitle ? <Typography variant="body" color="textSecondary">{subtitle}</Typography> : null}
          {metadata ? (
            <View
              accessible
              accessibilityLabel={metadata}
              style={{ alignSelf: 'flex-start', marginTop: spacing.xs, paddingHorizontal: spacing.sm, minHeight: 28, borderRadius: radius.pill, backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: colors.divider, justifyContent: 'center' }}
            >
              <Typography variant="caption" color="textSecondary">{metadata}</Typography>
            </View>
          ) : null}
        </View>
        <FavoriteButton favorited={favorited} onToggle={onToggleFavorite} size={isCompetitionHero || isTeamHero ? 30 : 22} />
      </View>
      {details?.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
          {details.map((detail) => (
            <View key={detail} accessible accessibilityLabel={detail} style={{ minHeight: 28, maxWidth: '100%', paddingHorizontal: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: colors.divider, justifyContent: 'center' }}>
              <Typography variant="caption" color="textSecondary" numberOfLines={1}>{detail}</Typography>
            </View>
          ))}
        </View>
      ) : null}
      <Typography variant="caption" color={favorited ? 'primary' : 'textSecondary'}>{favorited ? '• FOLLOWING' : 'Follow for fixtures and results'}</Typography>
    </View>
  );
}

export function EntityTabs({
  tabs,
  selected,
  onSelect,
  minHeight = 38,
}: {
  tabs: string[];
  selected: string;
  onSelect: (tab: string) => void;
  /** Detail screens can opt into larger visible tab targets. */
  minHeight?: number;
}) {
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
                  minHeight,
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
  const [hasImageError, setHasImageError] = useState(false);
  const hasLogo = Boolean(competition.logoUrl) && !hasImageError;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: hasLogo ? colors.surfaceHighlight : colorFromString(competition.name), alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
    >
      {hasLogo ? (
        <Image source={{ uri: competition.logoUrl }} style={{ width: size * 0.76, height: size * 0.76 }} resizeMode="contain" onError={() => setHasImageError(true)} />
      ) : (
        <Typography style={{ fontSize: size * 0.34, lineHeight: size * 0.4, fontWeight: '700' }}>{initialsFromName(competition.shortName ?? competition.name)}</Typography>
      )}
    </View>
  );
}

export function PlayerRow({ player, team, onPress, presentation = 'default' }: { player: Player; team?: Team; onPress: () => void; presentation?: 'default' | 'squad' }) {
  const [hasImageError, setHasImageError] = useState(false);
  const isSquadRow = presentation === 'squad';
  const hasPhoto = isSquadRow && Boolean(player.photoUrl) && !hasImageError;
  const playerDetails = [
    player.position || undefined,
    player.nationality && player.nationality !== '—' ? player.nationality : undefined,
    player.age > 0 ? `Age ${player.age}` : undefined,
  ].filter(Boolean).join(' · ');
  const defaultPlayerDetails = [player.position, team?.shortName].filter(Boolean).join(' • ');

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={isSquadRow ? `Open ${player.name}${player.number > 0 ? `, shirt number ${player.number}` : ''}${player.position ? `, ${player.position}` : ''}${team ? `, ${team.name}` : ''}` : `Open ${player.name}`}>
      {({ pressed }) => (
        <View
          style={{
            minHeight: isSquadRow ? 64 : undefined,
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
          {isSquadRow ? (
            <View style={{ width: 30, alignItems: 'center' }}>
              <Typography variant="label" color="primary">{player.number > 0 ? player.number : '—'}</Typography>
            </View>
          ) : null}
          {isSquadRow ? (
            hasPhoto ? (
              <Image
                source={{ uri: player.photoUrl }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
                accessible={false}
                onError={() => setHasImageError(true)}
              />
            ) : (
              <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colorFromString(player.name), alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" style={{ fontWeight: '700' }}>{initialsFromName(player.name)}</Typography>
              </View>
            )
          ) : (
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="label" color="primary">{player.number}</Typography>
            </View>
          )}
          <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
            <Typography variant="label" numberOfLines={1}>{player.name}</Typography>
            {isSquadRow ? (
              playerDetails ? <Typography variant="caption" color="textSecondary" numberOfLines={1}>{playerDetails}</Typography> : null
            ) : defaultPlayerDetails ? (
              <Typography variant="caption" color="textSecondary" numberOfLines={1}>{defaultPlayerDetails}</Typography>
            ) : null}
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
