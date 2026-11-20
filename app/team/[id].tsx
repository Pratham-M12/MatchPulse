import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { EntityHero, EntityTabs, Metric, PlayerRow } from '@/components/entity/EntityPrimitives';
import { AppScreen } from '@/components/layout/AppScreen';
import { MatchCard } from '@/components/match/MatchCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Typography } from '@/components/ui/Typography';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useStandings } from '@/hooks/useStandings';
import { useTeamPage } from '@/hooks/useTeamPage';
import { insightsForTeam } from '@/lib/football/insights';
import { useFavoritesStore, useIsFavoriteTeam } from '@/store/useFavoritesStore';
import { colors, radius, spacing } from '@/theme';
import type { MatchResult } from '@/lib/matchResult';

const resultColors: Record<MatchResult, keyof typeof colors> = { W: 'win', D: 'draw', L: 'loss' };
const resultLabels: Record<MatchResult, string> = { W: 'Win', D: 'Draw', L: 'Loss' };
const tabs = ['OVERVIEW', 'FIXTURES', 'RESULTS', 'TABLE', 'SQUAD', 'STATS'];

export default function TeamDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const online = useIsOnline();
  const [tab, setTab] = useState('OVERVIEW');
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const isMounted = useRef(true);
  const page = useTeamPage(id);
  const favorite = useIsFavoriteTeam(id);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavoriteTeam);
  const competitions = Array.from(new Map(page.matches.map((match) => [match.competition.id, match.competition])).values());
  // Team and fixture responses do not expose a primary competition. Only use
  // standings when the current collection gives one unambiguous context.
  const standingsCompetition = competitions.length === 1 ? competitions[0] : undefined;
  const hasAmbiguousCompetition = competitions.length > 1;
  const standings = useStandings(standingsCompetition?.id);
  const row = standings.data?.rows.find((item) => item.team.id === id);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await Promise.allSettled([page.refetch(), standings.refetch()]);
    } finally {
      if (isMounted.current) setIsManualRefreshing(false);
    }
  };

  if (!page.team && page.teamState.isError) {
    return (
      <AppScreen edges={['top', 'bottom']}>
        <View style={{ padding: spacing.base }}><ScreenHeader title="Team" /><ErrorState message="Couldn't load this team." onRetry={page.refetchTeam} /></View>
      </AppScreen>
    );
  }

  if (!page.team && page.teamState.isNotFound) {
    return (
      <AppScreen edges={['top', 'bottom']}>
        <View style={{ padding: spacing.base }}><ScreenHeader title="Team" /><Typography color="textSecondary">This team couldn&apos;t be found.</Typography></View>
      </AppScreen>
    );
  }

  if (!page.team) {
    return (
      <AppScreen edges={['top', 'bottom']}>
        <View style={{ padding: spacing.base }}><ScreenHeader title="Team" /><Typography color="textSecondary">Loading club…</Typography></View>
      </AppScreen>
    );
  }

  const insights = insightsForTeam(page.team.name, page.team.id, page.results);

  return (
    <AppScreen edges={['top', 'bottom']}>
      {!online ? <View style={{ paddingTop: spacing.sm }}><OfflineBanner /></View> : null}
      <ScrollView
        refreshControl={<RefreshControl refreshing={isManualRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing['4xl'], gap: spacing.lg }}
      >
        <ScreenHeader title="Team" size={44} />
        <EntityHero
          title={page.team.name}
          subtitle={page.team.country}
          mark={page.team}
          favorited={favorite}
          onToggleFavorite={() => toggleFavorite(page.team!)}
          metadata={page.team.founded ? `Founded ${page.team.founded}` : undefined}
          details={page.team.venue ? [page.team.venue] : undefined}
          presentation="team"
        />
        <EntityTabs tabs={tabs} selected={tab} onSelect={setTab} minHeight={44} />

        {tab === 'OVERVIEW' ? (
          <View style={{ gap: spacing.xl }}>
            {page.form.length ? (
              <View style={{ gap: spacing.md }}>
                <View style={{ gap: 2 }}>
                  <SectionTitle title="Recent form" />
                  <Typography variant="caption" color="textSecondary">Last {page.form.length} completed {page.form.length === 1 ? 'match' : 'matches'}</Typography>
                </View>
                <View accessibilityRole="text" accessibilityLabel={`Recent form: ${page.form.map((result) => resultLabels[result]).join(', ')}`} style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {page.form.map((result, index) => (
                    <View key={`${result}-${index}`} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors[resultColors[result]], alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="overline">{result}</Typography>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={{ gap: spacing.sm }}>
                <SectionTitle title="Recent form" />
                <Typography color="textSecondary">No recent results yet.</Typography>
              </View>
            )}

            {row && standings.data ? (
              <View style={{ backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.divider, borderRadius: radius.card, padding: spacing.lg, gap: spacing.lg }}>
                <View style={{ gap: 2 }}>
                  <Typography variant="overline" color="primary">Competition standing</Typography>
                  <Typography variant="title" numberOfLines={1}>{standings.data.competition.name}</Typography>
                  <Typography variant="caption" color="textSecondary">Season {standings.data.season}</Typography>
                </View>
                <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.divider, paddingVertical: spacing.md }}>
                  <OverviewMetric label="Position" value={row.rank} />
                  <View style={{ width: 1, backgroundColor: colors.divider }} />
                  <OverviewMetric label="Points" value={row.points} />
                  <View style={{ width: 1, backgroundColor: colors.divider }} />
                  <OverviewMetric label="GD" value={formatGoalDifference(row.goalDifference)} accessibilityName="Goal difference" />
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  <OverviewMetric label="Played" value={row.played} compact />
                  <OverviewMetric label="W-D-L" value={`${row.wins}-${row.draws}-${row.losses}`} accessibilityName="Record: wins, draws, losses" compact />
                  <OverviewMetric label="Goals for" value={row.goalsFor} compact />
                  <OverviewMetric label="Goals against" value={row.goalsAgainst} compact />
                </View>
              </View>
            ) : hasAmbiguousCompetition ? <CompetitionContextUnavailable /> : null}

            {insights.length ? (
              <View style={{ gap: spacing.sm }}>
                <SectionTitle title="Performance notes" />
                <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.divider, padding: spacing.md, gap: spacing.xs }}>
                  {insights.map((item) => <Typography key={item} color="textSecondary">{item}</Typography>)}
                </View>
              </View>
            ) : null}
            {page.fixtures[0] ? <View style={{ gap: spacing.md }}><SectionTitle title="Next match" /><MatchCard match={page.fixtures[0]} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${page.fixtures[0].id}`)} /></View> : null}
            {page.results[0] ? <View style={{ gap: spacing.md }}><SectionTitle title="Latest result" /><MatchCard match={page.results[0]} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${page.results[0].id}`)} /></View> : null}
          </View>
        ) : null}

        {tab === 'FIXTURES' ? (
          page.fixtureState.isLoading && !page.fixtureState.hasData ? (
            <EmptyState title="Loading fixtures" message="Retrieving upcoming team fixtures." />
          ) : page.fixtureState.isUnavailable && !page.fixtureState.hasData ? (
            <EmptyState title="Fixtures unavailable" message="Fixtures are not included on the current API plan." />
          ) : page.fixtureState.isError && !page.fixtureState.hasData ? (
            <ErrorState message="Couldn't load fixtures." onRetry={() => page.refetch()} />
          ) : page.fixtures.length ? (
            <View style={{ gap: spacing.md }}>
              <View style={{ gap: 2 }}>
                <SectionTitle title="Upcoming schedule" />
                <Typography variant="caption" color="textSecondary">Scheduled competition fixtures</Typography>
              </View>
              <View style={{ gap: spacing.sm }}>
                {page.fixtures.map((match) => <MatchCard key={match.id} match={match} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${match.id}`)} />)}
              </View>
            </View>
          ) : <EmptyState title="No upcoming fixtures" />
        ) : null}

        {tab === 'RESULTS' ? (
          page.resultState.isLoading && !page.resultState.hasData ? (
            <EmptyState title="Loading results" message="Retrieving completed team matches." />
          ) : page.resultState.isUnavailable && !page.resultState.hasData ? (
            <EmptyState title="Results unavailable" message="Fixtures are not included on the current API plan." />
          ) : page.resultState.isError && !page.resultState.hasData ? (
            <ErrorState message="Couldn't load results." onRetry={() => page.refetch()} />
          ) : page.results.length ? (
            <View style={{ gap: spacing.md }}>
              <View style={{ gap: 2 }}>
                <SectionTitle title="Recent results" />
                <Typography variant="caption" color="textSecondary">Completed competition matches</Typography>
              </View>
              <View style={{ gap: spacing.sm }}>
                {page.results.map((match) => <MatchCard key={match.id} match={match} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${match.id}`)} />)}
              </View>
            </View>
          ) : <EmptyState title="No results yet" />
        ) : null}

        {tab === 'TABLE' ? (
          row ? (
            <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.divider, padding: spacing.lg, gap: spacing.sm }}>
              <Typography variant="overline" color="textSecondary">LEAGUE POSITION</Typography>
              <Typography variant="display">{row.rank}</Typography>
              <Typography color="textSecondary">{row.played} played · {row.wins}W {row.draws}D {row.losses}L · {row.points} pts</Typography>
              <Typography color="textSecondary">GF {row.goalsFor} · GA {row.goalsAgainst} · GD {row.goalDifference}</Typography>
            </View>
          ) : (
            <EmptyState title={hasAmbiguousCompetition ? "Competition context unavailable" : "Table unavailable"} message={hasAmbiguousCompetition ? "This team has fixtures in more than one competition, so a single table cannot be shown." : "Position is shown only when standings data is available."} />
          )
        ) : null}

        {tab === 'SQUAD' ? (
          page.squadState.isLoading && !page.squadState.hasData ? (
            <EmptyState title="Loading squad" message="Retrieving the current club roster." />
          ) : page.squadState.isUnavailable && !page.squadState.hasData ? (
            <EmptyState title="Squad unavailable" message="Not included on the current API plan." />
          ) : page.squadState.isError && !page.squadState.hasData ? (
            <ErrorState message="Couldn't load squad." onRetry={() => page.refetch()} />
          ) : page.squad.length ? (
            <View style={{ gap: spacing.lg }}>
              <View style={{ gap: 2 }}>
                <SectionTitle title="Squad" />
                <Typography variant="caption" color="textSecondary">{page.squad.length} players</Typography>
              </View>
              {[
                ['Goalkeeper', 'Goalkeepers'],
                ['Defender', 'Defenders'],
                ['Midfielder', 'Midfielders'],
                ['Forward', 'Forwards'],
              ].map(([position, title]) => {
                const group = page.squad.filter((player) => player.position === position);
                return group.length ? (
                  <View key={position} style={{ gap: spacing.sm }}>
                    <SectionTitle title={title} />
                    <View style={{ gap: spacing.xs }}>
                      {group.map((player) => <PlayerRow key={player.id} player={player} team={page.team} onPress={() => router.push(`/player/${player.id}`)} presentation="squad" />)}
                    </View>
                  </View>
                ) : null;
              })}
              {(() => {
                const knownPositions = new Set(['Goalkeeper', 'Defender', 'Midfielder', 'Forward']);
                const otherPlayers = page.squad.filter((player) => !player.position || !knownPositions.has(player.position));
                return otherPlayers.length ? (
                  <View style={{ gap: spacing.sm }}>
                    <SectionTitle title="Other players" />
                    <View style={{ gap: spacing.xs }}>
                      {otherPlayers.map((player) => <PlayerRow key={player.id} player={player} team={page.team} onPress={() => router.push(`/player/${player.id}`)} presentation="squad" />)}
                    </View>
                  </View>
                ) : null;
              })()}
            </View>
          ) : <EmptyState title="No squad data" />
        ) : null}

        {tab === 'STATS' ? (
          row ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {[
                ['Played', row.played],
                ['Wins', row.wins],
                ['Draws', row.draws],
                ['Losses', row.losses],
                ['Goals for', row.goalsFor],
                ['Goals against', row.goalsAgainst],
              ].map(([label, value]) => (
                <View key={String(label)} style={{ width: '31%', minWidth: 92, flexGrow: 1, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.divider, padding: spacing.md, gap: 2 }}>
                  <Typography variant="title">{value}</Typography>
                  <Typography variant="caption" color="textSecondary">{label}</Typography>
                </View>
              ))}
            </View>
          ) : <EmptyState title={hasAmbiguousCompetition ? "Competition context unavailable" : "Stats unavailable"} message={hasAmbiguousCompetition ? "This team has fixtures in more than one competition, so standings-derived statistics are not shown." : "Team statistics are derived from standings when the API provides them."} />
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

function CompetitionContextUnavailable() {
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.divider, padding: spacing.md, gap: spacing.xs }}>
      <Typography variant="overline" color="textSecondary">Competition standing</Typography>
      <Typography color="textSecondary">A single competition table is unavailable because this team has fixtures in more than one competition.</Typography>
    </View>
  );
}

function OverviewMetric({ label, value, accessibilityName = label, compact = false }: { label: string; value: string | number; accessibilityName?: string; compact?: boolean }) {
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${accessibilityName}: ${value}`}
      style={compact ? { flexBasis: '46%', flexGrow: 1, minWidth: 112, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.divider, padding: spacing.sm } : { flex: 1 }}
    >
      <Metric value={value} label={label} />
    </View>
  );
}

function formatGoalDifference(value: number) {
  return value > 0 ? `+${value}` : String(value);
}
