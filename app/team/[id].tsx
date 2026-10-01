import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { EntityHero, EntityTabs, Metric, PlayerRow } from '@/components/entity/EntityPrimitives';
import { AppScreen } from '@/components/layout/AppScreen';
import { MatchCard } from '@/components/match/MatchCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
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
const tabs = ['OVERVIEW', 'FIXTURES', 'RESULTS', 'TABLE', 'SQUAD', 'STATS'];

export default function TeamDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const online = useIsOnline();
  const [tab, setTab] = useState('OVERVIEW');
  const page = useTeamPage(id);
  const favorite = useIsFavoriteTeam(id);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavoriteTeam);
  const leagueId = page.matches[0]?.competition.id;
  const standings = useStandings(leagueId);
  const row = standings.data?.rows.find((item) => item.team.id === id);

  if (!page.team && !page.isLoading) {
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
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => page.refetch()} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing['4xl'], gap: spacing.xl }}
      >
        <ScreenHeader title="Team" />
        <EntityHero title={page.team.name} subtitle={page.team.country} mark={page.team} favorited={favorite} onToggleFavorite={() => toggleFavorite(page.team!)} />
        <EntityTabs tabs={tabs} selected={tab} onSelect={setTab} />

        {tab === 'OVERVIEW' ? (
          <View style={{ gap: spacing.xl }}>
            <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: radius.lg, paddingVertical: spacing.md }}>
              <Metric value={row?.rank ?? '—'} label="Position" />
              <View style={{ width: 1, backgroundColor: colors.divider }} />
              <Metric value={row?.points ?? '—'} label="Points" />
              <View style={{ width: 1, backgroundColor: colors.divider }} />
              <Metric value={page.form.length ? page.form.join('') : '—'} label="Form" />
            </View>
            <View style={{ gap: spacing.md }}>
              <SectionTitle title="Recent form" />
              {page.form.length ? (
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {page.form.map((result, index) => (
                    <View key={`${result}-${index}`} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors[resultColors[result]], alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="overline">{result}</Typography>
                    </View>
                  ))}
                </View>
              ) : <Typography color="textSecondary">No recent results yet.</Typography>}
            </View>
            {insights.map((item) => <Typography key={item} color="textSecondary">{item}</Typography>)}
            {page.fixtures[0] ? <View style={{ gap: spacing.md }}><SectionTitle title="Next match" /><MatchCard match={page.fixtures[0]} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${page.fixtures[0].id}`)} /></View> : null}
            {page.results[0] ? <View style={{ gap: spacing.md }}><SectionTitle title="Latest result" /><MatchCard match={page.results[0]} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${page.results[0].id}`)} /></View> : null}
          </View>
        ) : null}

        {tab === 'FIXTURES' ? (
          page.fixtures.length ? page.fixtures.map((match) => <MatchCard key={match.id} match={match} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${match.id}`)} />) : <EmptyState title="No upcoming fixtures" />
        ) : null}

        {tab === 'RESULTS' ? (
          page.results.length ? page.results.map((match) => <MatchCard key={match.id} match={match} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${match.id}`)} />) : <EmptyState title="No results yet" />
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
            <EmptyState title="Table unavailable" message="Position is shown only when standings data is available." />
          )
        ) : null}

        {tab === 'SQUAD' ? (
          page.squadUnavailable ? (
            <EmptyState title="Squad unavailable" message="Not included on the current API plan." />
          ) : page.squad.length ? (
            ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].map((position) => {
              const group = page.squad.filter((player) => player.position === position);
              return group.length ? (
                <View key={position} style={{ gap: spacing.sm }}>
                  <SectionTitle title={`${position}s`} />
                  {group.map((player) => <PlayerRow key={player.id} player={player} onPress={() => router.push(`/player/${player.id}`)} />)}
                </View>
              ) : null;
            })
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
          ) : <EmptyState title="Stats unavailable" message="Team statistics are derived from standings when the API provides them." />
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}
