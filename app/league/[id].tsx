import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { EntityHero, EntityTabs, Metric, PlayerRow } from '@/components/entity/EntityPrimitives';
import { AppScreen } from '@/components/layout/AppScreen';
import { MatchCard } from '@/components/match/MatchCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useLeaguePage } from '@/hooks/useLeaguePage';
import { useFavoritesStore, useIsFavoriteLeague, useIsFavoriteTeam } from '@/store/useFavoritesStore';
import { colors, radius, spacing } from '@/theme';
import type { StandingRow, Team } from '@/types/football';

export default function LeagueDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const online = useIsOnline();
  const [tab, setTab] = useState('OVERVIEW');
  const page = useLeaguePage(id);
  const favorite = useIsFavoriteLeague(id);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavoriteLeague);
  const upcoming = page.matches.filter((match) => match.status === 'scheduled' || match.status === 'live');
  const finished = page.matches.filter((match) => match.status === 'finished');

  if (!page.competition && !page.isLoading) {
    return (
      <AppScreen edges={['top', 'bottom']}>
        <View style={{ padding: spacing.base }}>
          <ScreenHeader title="League" />
          <Typography color="textSecondary">This league couldn't be found.</Typography>
        </View>
      </AppScreen>
    );
  }

  if (!page.competition) {
    return (
      <AppScreen edges={['top', 'bottom']}>
        <View style={{ padding: spacing.base }}>
          <ScreenHeader title="League" />
          <Typography color="textSecondary">Loading competition…</Typography>
        </View>
      </AppScreen>
    );
  }

  const tabs = ['OVERVIEW', 'TABLE', 'FIXTURES', 'RESULTS', 'TEAMS', 'TOP SCORERS'];

  return (
    <AppScreen edges={['top', 'bottom']}>
      {!online ? <View style={{ paddingTop: spacing.sm }}><OfflineBanner /></View> : null}
      <ScrollView
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => page.refetch()} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing['4xl'], gap: spacing.xl }}
      >
        <ScreenHeader title="League" />
        <EntityHero
          title={page.competition.name}
          subtitle={page.competition.country}
          mark={page.competition}
          favorited={favorite}
          onToggleFavorite={() => toggleFavorite(page.competition!)}
        />
        <EntityTabs tabs={tabs} selected={tab} onSelect={setTab} />

        {tab === 'OVERVIEW' ? (
          <View style={{ gap: spacing.xl }}>
            <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: radius.lg, paddingVertical: spacing.md }}>
              <Metric value={page.teams.length || '—'} label="Teams" />
              <View style={{ width: 1, backgroundColor: colors.divider }} />
              <Metric value={upcoming.length || '—'} label="Upcoming" />
              <View style={{ width: 1, backgroundColor: colors.divider }} />
              <Metric value={finished.length || '—'} label="Results" />
            </View>
            {page.table?.rows[0] ? (
              <View style={{ gap: spacing.sm }}>
                <SectionTitle title="Current leader" />
                <TeamItem team={page.table.rows[0].team} meta={`${page.table.rows[0].points} pts`} onPress={() => router.push(`/team/${page.table!.rows[0].team.id}`)} />
              </View>
            ) : null}
            {page.topScorers[0] ? (
              <View style={{ gap: spacing.sm }}>
                <SectionTitle title="Top scorer" />
                <Typography variant="label">{page.topScorers[0].player.name} • {page.topScorers[0].goals} goals</Typography>
              </View>
            ) : null}
            {upcoming[0] ? <View style={{ gap: spacing.md }}><SectionTitle title="Upcoming" /><MatchCard match={upcoming[0]} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${upcoming[0].id}`)} /></View> : null}
            {finished[0] ? <View style={{ gap: spacing.md }}><SectionTitle title="Latest result" /><MatchCard match={finished[0]} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${finished[0].id}`)} /></View> : null}
          </View>
        ) : null}

        {tab === 'TABLE' ? (
          page.standingsUnavailable ? (
            <EmptyState title="Table unavailable" message="Standings are not included on the current API plan." />
          ) : page.table ? (
            <StandingsTable rows={page.table.rows} onTeam={(team) => router.push(`/team/${team.id}`)} />
          ) : (
            <EmptyState title="No standings yet" message="MatchPulse will not invent league positions." />
          )
        ) : null}

        {tab === 'FIXTURES' ? (
          <View style={{ gap: spacing.sm }}>
            {upcoming.length ? upcoming.map((match) => <MatchCard key={match.id} match={match} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${match.id}`)} />) : <EmptyState title="No upcoming fixtures" />}
          </View>
        ) : null}

        {tab === 'RESULTS' ? (
          <View style={{ gap: spacing.sm }}>
            {finished.length ? finished.map((match) => <MatchCard key={match.id} match={match} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${match.id}`)} />) : <EmptyState title="No results yet" />}
          </View>
        ) : null}

        {tab === 'TEAMS' ? (
          <View style={{ gap: spacing.sm }}>
            {page.teams.length ? page.teams.map((team) => <TeamItem key={team.id} team={team} onPress={() => router.push(`/team/${team.id}`)} />) : <EmptyState title="No teams listed" />}
          </View>
        ) : null}

        {tab === 'TOP SCORERS' ? (
          page.scorersUnavailable ? (
            <EmptyState title="Top scorers unavailable" message="This endpoint is not included on the current API plan." />
          ) : page.topScorers.length ? (
            <View style={{ gap: spacing.sm }}>
              {page.topScorers.slice(0, 20).map((item, index) => (
                <PlayerRow key={item.player.id} player={{ ...item.player, number: index + 1 }} onPress={() => router.push(`/player/${item.player.id}`)} />
              ))}
            </View>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {page.localPlayers.length ? page.localPlayers.map((player) => (
                <PlayerRow key={player.id} player={player} onPress={() => router.push(`/player/${player.id}`)} />
              )) : <EmptyState title="No scorer data" message="Local player samples appear here only when API data is missing." />}
            </View>
          )
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

function StandingsTable({ rows, onTeam }: { rows: StandingRow[]; onTeam: (team: Team) => void }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.sm, gap: spacing.sm }}>
        <Typography variant="overline" color="textDisabled" style={{ width: 24 }}>#</Typography>
        <Typography variant="overline" color="textDisabled" style={{ flex: 1 }}>TEAM</Typography>
        <Typography variant="overline" color="textDisabled" style={{ width: 28 }}>P</Typography>
        <Typography variant="overline" color="textDisabled" style={{ width: 28 }}>GD</Typography>
        <Typography variant="overline" color="textDisabled" style={{ width: 32 }}>PTS</Typography>
      </View>
      {rows.map((row) => (
        <StandingRowView key={row.team.id} row={row} onPress={() => onTeam(row.team)} />
      ))}
    </View>
  );
}

function StandingRowView({ row, onPress }: { row: StandingRow; onPress: () => void }) {
  const isFavorite = useIsFavoriteTeam(row.team.id);
  const zone = row.description?.toLowerCase() ?? '';
  const zoneColor = zone.includes('relegation') ? colors.loss : zone.includes('champions') || zone.includes('promotion') ? colors.primary : colors.divider;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${row.rank}. ${row.team.name}, ${row.points} points`}
    >
      {({ pressed }) => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            padding: spacing.sm,
            backgroundColor: isFavorite ? colors.primarySubtle : colors.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: isFavorite ? colors.primaryMuted : colors.divider,
            borderLeftWidth: 3,
            borderLeftColor: zoneColor,
            opacity: pressed ? 0.85 : 1,
          }}
        >
          <Typography variant="label" color="textSecondary" style={{ width: 24 }}>{row.rank}</Typography>
          <TeamLogo team={row.team} size={24} />
          <Typography variant="label" numberOfLines={1} style={{ flex: 1 }}>{row.team.name}</Typography>
          <Typography variant="caption" color="textSecondary" style={{ width: 28 }}>{row.played}</Typography>
          <Typography variant="caption" color="textSecondary" style={{ width: 28 }}>{row.goalDifference}</Typography>
          <Typography variant="label" style={{ width: 32, textAlign: 'right' }}>{row.points}</Typography>
        </View>
      )}
    </Pressable>
  );
}

function TeamItem({ team, meta, onPress }: { team: Team; meta?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={team.name}>
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
            padding: spacing.md,
            opacity: pressed ? 0.85 : 1,
          }}
        >
          <TeamLogo team={team} size={40} />
          <View style={{ flex: 1 }}>
            <Typography variant="label">{team.name}</Typography>
            <Typography variant="caption" color="textSecondary">{meta ?? team.country ?? 'Club'}</Typography>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
        </View>
      )}
    </Pressable>
  );
}
