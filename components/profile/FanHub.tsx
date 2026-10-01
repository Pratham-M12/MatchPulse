import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Switch, View } from 'react-native';

import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';
import type { Competition, Match, Team } from '@/types/football';

type FanHeroProps = {
  teamCount: number;
  leagueCount: number;
  matchCount: number;
};

type TeamCardProps = {
  team: Team;
  nextMatch?: Match;
  onPress: () => void;
  onToggleFavorite: () => void;
};

type LeagueRowProps = {
  league: Competition;
  onPress: () => void;
  onToggleFavorite: () => void;
};

type NextMatchCardProps = {
  match: Match;
  onPress: () => void;
};

type PreferenceRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail?: string;
  children?: ReactNode;
  onPress?: () => void;
};

type ProfileEmptyCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
}

export function FanIdentityHero({ teamCount, leagueCount, matchCount }: FanHeroProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: radius.card,
        overflow: 'hidden',
        padding: spacing.xl,
        gap: spacing.lg,
      }}
    >
      <View pointerEvents="none" style={{ position: 'absolute', top: -42, right: -24, width: 172, height: 172, borderRadius: 86, borderWidth: 1, borderColor: colors.primarySubtle }} />
      <View pointerEvents="none" style={{ position: 'absolute', top: -18, right: 16, width: 124, height: 124, borderRadius: 62, borderWidth: 1, borderColor: colors.divider }} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: spacing.xl, right: spacing.xl, height: 2, backgroundColor: colors.primary }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primarySubtle, borderWidth: 1, borderColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="football-outline" size={30} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Typography variant="overline" color="primary">FAN ID</Typography>
          <Typography variant="heading">MatchPulse Fan</Typography>
          <Typography variant="body" color="textSecondary">Football, followed your way</Typography>
        </View>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.divider, paddingVertical: spacing.md }}>
        <FanStat value={teamCount} label="Teams" />
        <View style={{ width: 1, backgroundColor: colors.divider }} />
        <FanStat value={leagueCount} label="Leagues" />
        <View style={{ width: 1, backgroundColor: colors.divider }} />
        <FanStat value={matchCount} label="Matches" />
      </View>
    </View>
  );
}

function FanStat({ value, label }: { value: number; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Typography variant="title">{value}</Typography>
      <Typography variant="caption" color="textSecondary">{label}</Typography>
    </View>
  );
}

export function ProfileEmptyCard({ icon, title, message, actionLabel, onAction }: ProfileEmptyCardProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.divider,
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.surfaceHighlight,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 2,
        }}
      >
        <Ionicons name={icon} size={22} color={colors.textSecondary} />
      </View>
      <Typography variant="label" style={{ textAlign: 'center' }}>
        {title}
      </Typography>
      <Typography variant="body" color="textSecondary" style={{ textAlign: 'center', maxWidth: 280 }}>
        {message}
      </Typography>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
        >
          {({ pressed }) => (
            <View
              style={{
                marginTop: spacing.xs,
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.md,
                borderRadius: radius.pill,
                backgroundColor: colors.primarySubtle,
                opacity: pressed ? 0.8 : 1,
              }}
            >
              <Typography variant="label" color="primary">
                {actionLabel}
              </Typography>
            </View>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

export function FavoriteTeamCard({ team, nextMatch, onPress, onToggleFavorite }: TeamCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${team.name}`}
    >
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            padding: spacing.base,
            borderWidth: 1,
            borderColor: colors.divider,
            gap: spacing.md,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.985 : 1 }],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <TeamLogo team={team} size={44} />
            <View style={{ flex: 1, gap: 2 }}>
              <Typography variant="title" numberOfLines={1}>{team.name}</Typography>
              <Typography variant="caption" color="textSecondary">{team.country ?? 'Club'} • Following</Typography>
            </View>
            <FavoriteButton favorited onToggle={onToggleFavorite} />
          </View>
          {nextMatch ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceElevated, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm }}>
              <Typography variant="caption" color="textSecondary" numberOfLines={1} style={{ flex: 1 }}>Next • {nextMatch.awayTeam.id === team.id ? `at ${nextMatch.homeTeam.shortName}` : `vs ${nextMatch.awayTeam.shortName}`}</Typography>
              <Typography variant="label" color="primary">{formatKickoff(nextMatch.kickoff)}</Typography>
            </View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

export function FavoriteLeagueRow({ league, onPress, onToggleFavorite }: LeagueRowProps) {
  const initial = league.shortName?.slice(0, 1) ?? league.name.slice(0, 1);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${league.name}`}
    >
      {({ pressed }) => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.divider,
            padding: spacing.base,
            opacity: pressed ? 0.9 : 1,
          }}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="label" color="primary">{initial}</Typography>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Typography variant="title" numberOfLines={1}>{league.name}</Typography>
            <Typography variant="caption" color="textSecondary">{league.country ?? 'Competition'} • Following</Typography>
          </View>
          <FavoriteButton favorited onToggle={onToggleFavorite} size={18} />
          <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
        </View>
      )}
    </Pressable>
  );
}

export function NextMatchCard({ match, onPress }: NextMatchCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open next match, ${match.homeTeam.name} versus ${match.awayTeam.name}`}
    >
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: colors.divider,
            padding: spacing.lg,
            gap: spacing.lg,
            overflow: 'hidden',
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.985 : 1 }],
          }}
        >
          <View pointerEvents="none" style={{ position: 'absolute', right: -22, bottom: -52, width: 156, height: 156, borderRadius: 78, backgroundColor: colors.primarySubtle }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ gap: 2 }}>
              <Typography variant="overline" color="primary">NEXT MATCH</Typography>
              <Typography variant="caption" color="textSecondary">{match.competition.name}</Typography>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <Typography variant="caption" color="textSecondary">{formatKickoff(match.kickoff)}</Typography>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <MatchTeam team={match.homeTeam} />
            <Typography variant="label" color="textSecondary">VS</Typography>
            <MatchTeam team={match.awayTeam} align="right" />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="textSecondary" numberOfLines={1} style={{ flex: 1 }}>{match.venue ?? 'Match centre'}</Typography>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

function MatchTeam({ team, align = 'left' }: { team: Team; align?: 'left' | 'right' }) {
  return (
    <View style={{ flex: 1, alignItems: align === 'right' ? 'flex-end' : 'flex-start', gap: spacing.sm }}>
      <TeamLogo team={team} size={38} />
      <Typography variant="label" numberOfLines={1} style={{ maxWidth: 104, textAlign: align === 'right' ? 'right' : 'left' }}>{team.shortName}</Typography>
    </View>
  );
}

export function PreferenceRow({ icon, title, detail, children, onPress }: PreferenceRowProps) {
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.divider,
        padding: spacing.base,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.surfaceHighlight,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Typography variant="label">{title}</Typography>
        {detail ? (
          <Typography variant="caption" color="textSecondary" numberOfLines={1}>
            {detail}
          </Typography>
        ) : null}
      </View>
      {children ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} /> : null)}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={({ pressed }) => ({
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        })}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

export function NotificationToggle({ value, onValueChange }: { value: boolean; onValueChange: () => void }) {
  return <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.divider, true: colors.primary }} thumbColor={colors.textPrimary} accessibilityLabel="Push notifications" />;
}
