import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { MatchStatsList } from '@/components/match/MatchStatsList';
import { MatchTimeline } from '@/components/match/MatchTimeline';
import { MatchLineupCard } from '@/components/match/MatchLineupCard';
import { MatchStandingsTable } from '@/components/match/MatchStandingsTable';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { EntityTabs } from '@/components/entity/EntityPrimitives';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { MatchScore } from '@/components/ui/MatchScore';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { useFixtureDetails } from '@/hooks/useFixtureDetails';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useStandings } from '@/hooks/useStandings';
import { insightsForMatch } from '@/lib/football/insights';
import { formatCountdown, formatKickoffShort, formatKickoffTime, formatLastUpdated, formatMatchDay, formatMatchStatus } from '@/lib/format/datetime';
import { cancelMatchReminder, scheduleMatchReminder } from '@/lib/notifications/reminders';
import { shareMatch } from '@/lib/shareMatch';
import { useFavoritesStore, useIsFavoriteMatch } from '@/store/useFavoritesStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { useHasReminder } from '@/store/useRemindersStore';
import { colors, radius, spacing } from '@/theme';
import type { Match, Team } from '@/types/football';

function TeamColumn({ team, onPress, compact }: { team: Team; onPress: () => void; compact: boolean }) {
  const crestSize = compact ? 52 : 64;
  const crestWellSize = crestSize + (compact ? 12 : 16);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${team.name}`}
      style={({ pressed }) => ({ flex: 1, minWidth: 0, alignItems: 'center', gap: spacing.sm, opacity: pressed ? 0.82 : 1 })}
    >
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
        <TeamLogo team={team} size={crestSize} decorative />
      </View>
      <Typography
        variant="title"
        numberOfLines={2}
        style={{ width: '100%', textAlign: 'center' }}
      >
        {team.name || team.shortName}
      </Typography>
    </Pressable>
  );
}

export default function MatchDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const online = useIsOnline();
  const timeFormat = usePreferencesStore((state) => state.timeFormat);
  const detailsState = useFixtureDetails(id);
  const { match, details, isLoading, isError, refetch, lineups, prediction, lineupsUnavailable, statsUnavailable, predictionUnavailable } = detailsState;
  const favorite = useIsFavoriteMatch(id);
  const toggleFavoriteMatch = useFavoritesStore((state) => state.toggleFavoriteMatch);
  const reminded = useHasReminder(id);
  const standings = useStandings(match?.competition.id);
  const [tab, setTab] = useState('OVERVIEW');
  const [highlightEvent, setHighlightEvent] = useState<string | undefined>();

  useEffect(() => {
    const last = details?.events[details.events.length - 1];
    if (last?.type === 'goal') {
      setHighlightEvent(last.id);
      const timeout = setTimeout(() => setHighlightEvent(undefined), 1800);
      return () => clearTimeout(timeout);
    }
  }, [details?.events.length]);

  const tabs = useMemo(() => {
    if (!match) return [];
    const next = ['OVERVIEW'];
    if (details?.events?.length) next.push('TIMELINE');
    if (details?.stats || statsUnavailable) next.push('STATS');
    if (lineups.length || lineupsUnavailable) next.push('LINEUPS');
    if (standings.data?.rows.length || standings.unavailable) next.push('TABLE');
    return next;
  }, [details?.events?.length, details?.stats, lineups.length, lineupsUnavailable, match, standings.data?.rows.length, standings.unavailable, statsUnavailable]);

  if (isLoading) {
    return (
      <AppScreen edges={['top', 'bottom']}>
        <View style={{ padding: spacing.base, gap: spacing.lg }}>
          <ScreenHeader title="Match" />
          <ActivityIndicator color={colors.primary} />
        </View>
      </AppScreen>
    );
  }

  if (isError && !match) {
    return (
      <AppScreen edges={['top', 'bottom']}>
        <View style={{ padding: spacing.base, gap: spacing.lg }}>
          <ScreenHeader title="Match" />
          <ErrorState message="Couldn't load this match." onRetry={() => refetch()} />
        </View>
      </AppScreen>
    );
  }

  if (!match) {
    return (
      <AppScreen edges={['top', 'bottom']}>
        <View style={{ padding: spacing.base, gap: spacing.lg }}>
          <ScreenHeader title="Match" />
          <Typography color="textSecondary">This match couldn&apos;t be found.</Typography>
        </View>
      </AppScreen>
    );
  }

  const insights = insightsForMatch(match, {});

  return (
    <AppScreen edges={['top', 'bottom']}>
      {!online ? <View style={{ paddingTop: spacing.sm }}><OfflineBanner /></View> : null}
      <ScrollView
        refreshControl={<RefreshControl refreshing={detailsState.isFetching} onRefresh={() => refetch()} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: spacing.base, gap: spacing.lg, paddingBottom: spacing['4xl'] }}
      >
        <ScreenHeader
          title="Match Centre"
          size={44}
          right={
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <HeaderIcon icon="share-outline" label="Share match" size={44} onPress={() => shareMatch(match, timeFormat)} />
              <FavoriteButton favorited={favorite} onToggle={() => toggleFavoriteMatch(match)} size={30} />
            </View>
          }
        />

        <MatchHero match={match} timeFormat={timeFormat} onTeam={(team) => router.push(`/team/${team.id}`)} />

        {match.status === 'scheduled' ? (
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <ActionButton
              label={reminded ? 'Reminder on' : 'Remind me'}
              icon={reminded ? 'notifications' : 'notifications-outline'}
              onPress={() => (reminded ? cancelMatchReminder(match.id) : scheduleMatchReminder(match))}
            />
          </View>
        ) : null}

        {tabs.length > 1 ? <EntityTabs tabs={tabs} selected={tab} onSelect={setTab} minHeight={44} /> : null}

        {tab === 'OVERVIEW' ? (
          <View style={{ gap: spacing.lg }}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: colors.divider,
                padding: spacing.base,
                gap: spacing.md,
              }}
            >
              {match.venue ? <MetaRow label="Venue" value={match.venue} /> : null}
              <MetaRow label="Kickoff" value={formatKickoffShort(match.kickoff, timeFormat)} />
              {match.status === 'scheduled' ? <MetaRow label="Starts" value={formatCountdown(match.kickoff)} /> : null}
              <MetaRow
                label="Status"
                value={formatOverviewStatus(match, timeFormat)}
              />
            </View>

            {prediction && !predictionUnavailable ? (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius.card,
                  padding: spacing.base,
                  gap: spacing.xs,
                  borderWidth: 1,
                  borderColor: colors.divider,
                }}
              >
                <Typography variant="overline" color="textSecondary">PREDICTION</Typography>
                <Typography variant="label">{prediction.winnerName ?? 'No clear favourite'}</Typography>
                {prediction.advice ? <Typography variant="body" color="textSecondary">{prediction.advice}</Typography> : null}
              </View>
            ) : null}

            {insights.length ? (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius.card,
                  padding: spacing.base,
                  gap: spacing.sm,
                  borderWidth: 1,
                  borderColor: colors.divider,
                }}
              >
                <Typography variant="overline" color="textSecondary">MATCH INSIGHTS</Typography>
                {insights.map((item) => (
                  <Typography key={item} color="textSecondary" variant="body">
                    {item}
                  </Typography>
                ))}
              </View>
            ) : null}

            {details?.events?.length ? (
              <View style={{ gap: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="title">Recent Events</Typography>
                  {tabs.includes('TIMELINE') ? (
                    <Pressable
                      onPress={() => setTab('TIMELINE')}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel="View full timeline"
                    >
                      <Typography variant="label" color="primary">See all &gt;</Typography>
                    </Pressable>
                  ) : null}
                </View>
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: radius.card,
                    borderWidth: 1,
                    borderColor: colors.divider,
                    padding: spacing.base,
                  }}
                >
                  <MatchTimeline
                    events={details.events.slice(-3)}
                    match={match}
                    onPlayerPress={(player) => router.push(`/player/${encodeURIComponent(player)}`)}
                  />
                </View>
              </View>
            ) : match.status === 'scheduled' ? (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: colors.divider,
                  padding: spacing.base,
                  alignItems: 'center',
                }}
              >
                <Typography color="textSecondary">This match hasn&apos;t started yet. Timeline and stats appear after kickoff.</Typography>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: colors.divider,
                  padding: spacing.base,
                  alignItems: 'center',
                }}
              >
                <Typography color="textSecondary" style={{ textAlign: 'center' }}>
                  {match.status === 'finished'
                    ? 'No timeline events are available for this finished match.'
                    : match.status === 'postponed' || match.status === 'cancelled'
                      ? 'This match has no timeline events.'
                      : 'No timeline events yet.'}
                </Typography>
              </View>
            )}

            <Typography variant="caption" color="textDisabled" style={{ textAlign: 'center' }}>
              {formatLastUpdated(detailsState.dataUpdatedAt)}
            </Typography>
          </View>
        ) : null}

        {tab === 'TIMELINE' ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.divider,
              padding: spacing.base,
            }}
          >
            <MatchTimeline
              events={details?.events ?? []}
              match={match}
              highlightedId={highlightEvent}
              onPlayerPress={(player) => router.push(`/player/${encodeURIComponent(player)}`)}
            />
          </View>
        ) : null}

        {tab === 'STATS' ? (
          statsUnavailable ? (
            <EmptyState title="Statistics unavailable" message="Not included on the current API plan." />
          ) : details?.stats ? (
            <MatchStatsList stats={details.stats} match={match} />
          ) : (
            <EmptyState title="Statistics unavailable" message="This endpoint did not return stats for the fixture." />
          )
        ) : null}

        {tab === 'LINEUPS' ? (
          lineupsUnavailable ? (
            <EmptyState title="Lineups unavailable" message="Not included on the current API plan." />
          ) : (
            <View style={{ gap: spacing.xl }}>
              {lineups.map((lineup) => (
                <MatchLineupCard
                  key={lineup.team.id}
                  lineup={lineup}
                  accentColor={lineup.team.id === match.homeTeam.id ? match.homeTeam.color ?? colors.primary : match.awayTeam.color ?? colors.textSecondary}
                  onPlayerPress={(playerId) => router.push(`/player/${playerId}`)}
                />
              ))}
            </View>
          )
        ) : null}

        {tab === 'TABLE' ? (
          standings.unavailable ? (
            <EmptyState title="Table unavailable" message="Standings are not included on the current API plan." />
          ) : standings.data ? (
            <MatchStandingsTable
              table={standings.data}
              match={match}
              onTeamPress={(team) => router.push(`/team/${team.id}`)}
            />
          ) : (
            <EmptyState title="Table unavailable" message="Standings could not be loaded for this competition." />
          )
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

function MatchHero({ match, timeFormat, onTeam }: { match: Match; timeFormat: '12h' | '24h'; onTeam: (team: Team) => void }) {
  const [heroWidth, setHeroWidth] = useState<number>();
  const compact = heroWidth !== undefined && heroWidth < 350;
  const cardPadding = compact ? spacing.base : spacing.xl;
  const scoreColumnWidth = compact ? 76 : 100;
  const isHalfTime = match.status === 'live' && match.statusLabel === 'HT';
  const isScored = match.status === 'live' || match.status === 'finished';
  const statusLabel =
    match.status === 'scheduled'
      ? 'UPCOMING'
      : match.status === 'finished'
        ? 'FULL TIME'
        : match.status === 'postponed'
          ? 'POSTPONED'
          : match.status === 'cancelled'
            ? 'CANCELLED'
            : undefined;

  return (
    <View
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;
        setHeroWidth((currentWidth) => currentWidth === nextWidth ? currentWidth : nextWidth);
      }}
      style={{
        backgroundColor: colors.surfaceElevated,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.divider,
        padding: cardPadding,
        alignItems: 'center',
        gap: compact ? spacing.lg : spacing.xl,
        overflow: 'hidden',
      }}
    >
      <View pointerEvents="none" style={{ position: 'absolute', top: -76, right: -52, width: 196, height: 196, borderRadius: 98, backgroundColor: colors.primarySubtle }} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: cardPadding, right: cardPadding, height: 2, borderRadius: radius.pill, backgroundColor: match.status === 'live' ? colors.live : colors.primary }} />

      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, flexShrink: 0 }} />
          <Typography variant="overline" color="textSecondary" numberOfLines={1} style={{ flex: 1 }}>
            {match.competition.name.toUpperCase()}
          </Typography>
        </View>
        {match.status === 'live' ? (
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <LiveIndicator minute={match.minute} />
            {isHalfTime ? <Typography variant="caption" color="textSecondary">Half-time</Typography> : null}
          </View>
        ) : (
          <View
            style={{
              paddingHorizontal: spacing.sm,
              paddingVertical: 4,
              borderRadius: radius.pill,
              backgroundColor: match.status === 'scheduled' ? colors.primarySubtle : colors.surfaceHighlight,
            }}
          >
            <Typography variant="overline" color={match.status === 'scheduled' ? 'primary' : match.status === 'cancelled' ? 'loss' : match.status === 'postponed' ? 'warning' : 'textSecondary'}>
              {statusLabel}
            </Typography>
          </View>
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: compact ? spacing.sm : spacing.md,
          width: '100%',
          paddingVertical: spacing.xs,
        }}
      >
        <TeamColumn team={match.homeTeam} compact={compact} onPress={() => onTeam(match.homeTeam)} />
        <View style={{ width: scoreColumnWidth, flexShrink: 0, alignItems: 'center', gap: spacing.xs }}>
          {isScored ? (
            <MatchScore homeScore={match.homeScore} awayScore={match.awayScore} status={match.status} emphasis={compact ? 'heroCompact' : 'hero'} />
          ) : match.status === 'scheduled' ? (
            <>
              <Typography variant="overline" color="textSecondary">KICKOFF</Typography>
              <Typography variant={compact ? 'title' : 'heading'} numberOfLines={1} style={{ textAlign: 'center' }}>
                {formatMatchDay(match.kickoff)}
              </Typography>
              <Typography variant="title" color="primary" numberOfLines={1}>
                {formatKickoffTime(match.kickoff, timeFormat)}
              </Typography>
            </>
          ) : (
            <Typography variant="title" color="textSecondary" style={{ textAlign: 'center' }}>
              {statusLabel}
            </Typography>
          )}
        </View>
        <TeamColumn team={match.awayTeam} compact={compact} onPress={() => onTeam(match.awayTeam)} />
      </View>

      {match.venue ? (
        <Typography variant="caption" color="textSecondary" numberOfLines={1} style={{ marginTop: -spacing.sm }}>
          {match.venue}
        </Typography>
      ) : null}
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
      <Typography color="textSecondary">{label}</Typography>
      <Typography variant="label" style={{ flexShrink: 1, textAlign: 'right' }}>{value}</Typography>
    </View>
  );
}

function formatOverviewStatus(match: Match, timeFormat: '12h' | '24h'): string {
  if (match.status === 'scheduled') return 'Upcoming';
  if (match.status === 'finished') return 'Full Time';

  const minute = Number.isFinite(match.minute) && (match.minute ?? 0) >= 0 ? match.minute : undefined;
  const status = formatMatchStatus({ status: match.status, minute, kickoff: match.kickoff, timeFormat });
  return match.status === 'live' && match.statusLabel === 'HT' ? `${status} · Half-time` : status.toUpperCase();
}

function HeaderIcon({ icon, label, onPress, size = 36 }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; size?: number }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={18} color={colors.textPrimary} />
    </Pressable>
  );
}

function ActionButton({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => ({ flex: 1, minHeight: 44, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, opacity: pressed ? 0.85 : 1 })}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Typography variant="label">{label}</Typography>
    </Pressable>
  );
}
