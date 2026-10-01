import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { MatchStatsList } from '@/components/match/MatchStatsList';
import { MatchTimeline } from '@/components/match/MatchTimeline';
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
import { formatCountdown, formatKickoffShort, formatLastUpdated } from '@/lib/format/datetime';
import { cancelMatchReminder, scheduleMatchReminder } from '@/lib/notifications/reminders';
import { shareMatch } from '@/lib/shareMatch';
import { useFavoritesStore, useIsFavoriteMatch } from '@/store/useFavoritesStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { useHasReminder } from '@/store/useRemindersStore';
import { colors, radius, spacing } from '@/theme';
import type { Match, Team } from '@/types/football';

function TeamColumn({ team, onPress }: { team: Team; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${team.name}`}
      style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}
    >
      <TeamLogo team={team} size={56} />
      <Typography
        variant="title"
        numberOfLines={2}
        style={{ textAlign: 'center', marginTop: spacing.xs }}
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
  const { match, details, isLoading, isError, refetch, lineups, prediction, lineupsUnavailable, predictionUnavailable } = detailsState;
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
    if (details?.stats) next.push('STATS');
    if (lineups.length) next.push('LINEUPS');
    if (standings.data?.rows.length) next.push('TABLE');
    return next;
  }, [details?.events?.length, details?.stats, lineups.length, match, standings.data?.rows.length]);

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
          title={match.competition.name}
          right={
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <HeaderIcon icon="share-outline" label="Share match" onPress={() => shareMatch(match, timeFormat)} />
              <FavoriteButton favorited={favorite} onToggle={() => toggleFavoriteMatch(match)} />
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

        {tabs.length > 1 ? <EntityTabs tabs={tabs} selected={tab} onSelect={setTab} /> : null}

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
                value={
                  match.status === 'live'
                    ? `Live (${match.minute}')`
                    : match.status === 'finished'
                    ? 'Full Time'
                    : 'Upcoming'
                }
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
                <Typography color="textSecondary">No timeline events yet.</Typography>
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
          details?.stats ? (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: colors.divider,
                padding: spacing.base,
              }}
            >
              <MatchStatsList stats={details.stats} />
            </View>
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
                <View
                  key={lineup.team.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: radius.card,
                    borderWidth: 1,
                    borderColor: colors.divider,
                    padding: spacing.base,
                    gap: spacing.sm,
                  }}
                >
                  <Typography variant="title">
                    {lineup.team.name} {lineup.formation ? `• ${lineup.formation}` : ''}
                  </Typography>
                  {lineup.startXI.map((player) => (
                    <Pressable
                      key={player.id}
                      onPress={() => router.push(`/player/${player.id}`)}
                      style={{ flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs }}
                    >
                      <Typography color="textSecondary" style={{ width: 28 }}>
                        {player.number ?? '—'}
                      </Typography>
                      <Typography style={{ flex: 1 }}>{player.name}</Typography>
                      <Typography color="textDisabled">{player.position ?? ''}</Typography>
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
          )
        ) : null}

        {tab === 'TABLE' ? (
          standings.data ? (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: colors.divider,
                padding: spacing.base,
                gap: spacing.xs,
              }}
            >
              {standings.data.rows.slice(0, 20).map((row) => (
                <Pressable
                  key={row.team.id}
                  onPress={() => router.push(`/team/${row.team.id}`)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm }}
                >
                  <Typography style={{ width: 24 }} color="textSecondary">{row.rank}</Typography>
                  <TeamLogo team={row.team} size={22} />
                  <Typography style={{ flex: 1 }} numberOfLines={1}>{row.team.name}</Typography>
                  <Typography variant="label">{row.points}</Typography>
                </Pressable>
              ))}
            </View>
          ) : (
            <EmptyState title="Table unavailable" message="Standings could not be loaded for this competition." />
          )
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

function MatchHero({ match, timeFormat, onTeam }: { match: Match; timeFormat: '12h' | '24h'; onTeam: (team: Team) => void }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.divider,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.base,
        alignItems: 'center',
        gap: spacing.md,
      }}
    >
      <Typography variant="overline" color="textSecondary" numberOfLines={1}>
        {match.competition.name.toUpperCase()}
      </Typography>

      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {match.status === 'live' ? (
          <LiveIndicator minute={match.minute} style={{ alignSelf: 'center' }} />
        ) : (
          <View
            style={{
              paddingHorizontal: spacing.sm,
              paddingVertical: 3,
              borderRadius: radius.pill,
              backgroundColor: colors.surfaceHighlight,
            }}
          >
            <Typography variant="caption" color="textSecondary">
              {match.status === 'finished' ? 'Full time' : formatKickoffShort(match.kickoff, timeFormat)}
            </Typography>
          </View>
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingVertical: spacing.xs,
        }}
      >
        <TeamColumn team={match.homeTeam} onPress={() => onTeam(match.homeTeam)} />
        <View style={{ paddingHorizontal: spacing.sm, alignItems: 'center' }}>
          <MatchScore homeScore={match.homeScore} awayScore={match.awayScore} status={match.status} />
        </View>
        <TeamColumn team={match.awayTeam} onPress={() => onTeam(match.awayTeam)} />
      </View>

      <View style={{ alignItems: 'center', gap: 2, marginTop: spacing.xs }}>
        {match.venue ? (
          <Typography variant="caption" color="textSecondary" numberOfLines={1}>
            {match.venue}
          </Typography>
        ) : null}
        <Typography variant="caption" color="textDisabled">
          {formatKickoffShort(match.kickoff, timeFormat)}
        </Typography>
      </View>
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

function HeaderIcon({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center' }}>
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
