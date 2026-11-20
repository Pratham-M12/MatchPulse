import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { EntityHero, EntityTabs, Metric, PlayerRow } from '@/components/entity/EntityPrimitives';
import { AppScreen } from '@/components/layout/AppScreen';
import { LeagueStandingsTable } from '@/components/league/LeagueStandingsTable';
import { LeagueTopScorers } from '@/components/league/LeagueTopScorers';
import { MatchCard } from '@/components/match/MatchCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useLeaguePage } from '@/hooks/useLeaguePage';
import { useFavoritesStore, useIsFavoriteLeague } from '@/store/useFavoritesStore';
import { colors, radius, spacing } from '@/theme';
import type { Team } from '@/types/football';

export default function LeagueDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const online = useIsOnline();
  const [tab, setTab] = useState('OVERVIEW');
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const isMounted = useRef(true);
  const page = useLeaguePage(id);
  const favorite = useIsFavoriteLeague(id);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavoriteLeague);
  const upcoming = page.matches.filter((match) => match.status === 'scheduled' || match.status === 'live');
  const finished = page.matches.filter((match) => match.status === 'finished');

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await page.refetch();
    } finally {
      if (isMounted.current) setIsManualRefreshing(false);
    }
  };

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
        refreshControl={<RefreshControl refreshing={isManualRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing['4xl'], gap: spacing.lg }}
      >
        <ScreenHeader title="League" size={44} />
        <EntityHero
          title={page.competition.name}
          subtitle={page.competition.country}
          mark={page.competition}
          favorited={favorite}
          onToggleFavorite={() => toggleFavorite(page.competition!)}
          metadata={`Season ${page.season}`}
          presentation="competition"
        />
        <EntityTabs tabs={tabs} selected={tab} onSelect={setTab} minHeight={44} />

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
          page.table ? (
            <LeagueStandingsTable table={page.table} onTeamPress={(team) => router.push(`/team/${team.id}`)} />
          ) : page.standings.isLoading ? (
            <EmptyState title="Loading standings" message="Retrieving the current competition table." />
          ) : page.standings.isUnavailable ? (
            <EmptyState title="Table unavailable" message="Standings are not included on the current API plan." />
          ) : page.standings.isError ? (
            <ErrorState message="Couldn't load standings." onRetry={() => page.refetch()} />
          ) : (
            <EmptyState title="No standings yet" message="MatchPulse will not invent league positions." />
          )
        ) : null}

        {tab === 'FIXTURES' ? (
          page.fixtures.isLoading && !page.fixtures.hasData ? (
            <EmptyState title="Loading fixtures" message="Retrieving upcoming competition fixtures." />
          ) : page.fixtures.isUnavailable && !page.fixtures.hasData ? (
            <EmptyState title="Fixtures unavailable" message="Fixtures are not included on the current API plan." />
          ) : page.fixtures.isError && !page.fixtures.hasData ? (
            <ErrorState message="Couldn't load fixtures." onRetry={() => page.refetch()} />
          ) : upcoming.length ? (
            <View style={{ gap: spacing.md }}>
              <SectionTitle title="Upcoming fixtures" />
              <View style={{ gap: spacing.sm }}>
                {upcoming.map((match) => <MatchCard key={match.id} match={match} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${match.id}`)} />)}
              </View>
            </View>
          ) : <EmptyState title="No upcoming fixtures" message="No scheduled competition matches are available." />
        ) : null}

        {tab === 'RESULTS' ? (
          page.fixtures.isLoading && !page.fixtures.hasData ? (
            <EmptyState title="Loading results" message="Retrieving recent competition results." />
          ) : page.fixtures.isUnavailable && !page.fixtures.hasData ? (
            <EmptyState title="Results unavailable" message="Fixtures are not included on the current API plan." />
          ) : page.fixtures.isError && !page.fixtures.hasData ? (
            <ErrorState message="Couldn't load results." onRetry={() => page.refetch()} />
          ) : finished.length ? (
            <View style={{ gap: spacing.md }}>
              <SectionTitle title="Recent results" />
              <View style={{ gap: spacing.sm }}>
                {finished.map((match) => <MatchCard key={match.id} match={match} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${match.id}`)} />)}
              </View>
            </View>
          ) : <EmptyState title="No results yet" message="No completed competition matches are available." />
        ) : null}

        {tab === 'TEAMS' ? (
          <View style={{ gap: spacing.sm }}>
            {page.teams.length ? page.teams.map((team) => <TeamItem key={team.id} team={team} onPress={() => router.push(`/team/${team.id}`)} />) : <EmptyState title="No teams listed" />}
          </View>
        ) : null}

        {tab === 'TOP SCORERS' ? (
          page.topScorers.length ? (
            <LeagueTopScorers scorers={page.topScorers.slice(0, 20)} onPlayerPress={(playerId) => router.push(`/player/${playerId}`)} />
          ) : page.scorers.isLoading && !page.scorers.hasData ? (
            <EmptyState title="Loading top scorers" message="Retrieving competition scorer data." />
          ) : page.scorers.isUnavailable ? (
            <EmptyState title="Top scorers unavailable" message="This endpoint is not included on the current API plan." />
          ) : page.scorers.isError ? (
            <ErrorState message="Couldn't load top scorers." onRetry={() => page.refetch()} />
          ) : !page.scorers.hasData && page.localPlayers.length ? (
            <View style={{ gap: spacing.sm }}>
              {page.localPlayers.map((player) => (
                <PlayerRow key={player.id} player={player} onPress={() => router.push(`/player/${player.id}`)} />
              ))}
            </View>
          ) : (
            <EmptyState title="No scorer data" message="No competition scorer data is available." />
          )
        ) : null}
      </ScrollView>
    </AppScreen>
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
