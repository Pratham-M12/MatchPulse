import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, SectionList, View } from 'react-native';

import { MatchCard } from '@/components/match/MatchCard';
import { AppScreen } from '@/components/layout/AppScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterChip } from '@/components/ui/FilterChip';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Typography } from '@/components/ui/Typography';
import { allCompetitions } from '@/data';
import { useFixturesByDate } from '@/hooks/useFixturesByDate';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useLiveFixtures } from '@/hooks/useLiveFixtures';
import { localIsoDateOffset } from '@/lib/api/currentSeason';
import { formatMatchDay } from '@/lib/format/datetime';
import { involvesTeam } from '@/lib/football/ranking';
import { useFavoriteTeamIds } from '@/store/useFavoritesStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { colors, spacing } from '@/theme';
import type { Match } from '@/types/football';

type MatchTab = 'live' | 'upcoming' | 'recent';
type MatchSection = { title: string; data: Match[] };

const upcomingOffsets = [0, 1, 2, 3];
const recentOffsets = [-1, -2, -3];

function createSections(matches: Match[], tab: MatchTab): MatchSection[] {
  const grouped = new Map<string, Match[]>();
  matches.forEach((match) => {
    const title = tab === 'recent' ? formatMatchDay(match.kickoff).toUpperCase() : match.competition.name.toUpperCase();
    grouped.set(title, [...(grouped.get(title) ?? []), match]);
  });
  return Array.from(grouped, ([title, data]) => ({ title, data }));
}

export default function MatchesScreen() {
  const router = useRouter();
  const online = useIsOnline();
  const favoriteTeamIds = useFavoriteTeamIds();
  const dateFormat = usePreferencesStore((state) => state.dateFormat);
  const [activeTab, setActiveTab] = useState<MatchTab>('live');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | undefined>();
  const [myTeamsOnly, setMyTeamsOnly] = useState(false);
  const [upcomingOffset, setUpcomingOffset] = useState(0);
  const [recentOffset, setRecentOffset] = useState(-1);
  const [showLeagueFilters, setShowLeagueFilters] = useState(false);

  const liveQuery = useLiveFixtures({ poll: true });
  const date = activeTab === 'upcoming' ? localIsoDateOffset(upcomingOffset) : localIsoDateOffset(recentOffset);
  const dateQuery = useFixturesByDate(date, activeTab !== 'live');

  const sourceMatches = useMemo(() => {
    if (activeTab === 'live') return liveQuery.data ?? [];
    const list = dateQuery.data ?? [];
    return activeTab === 'upcoming'
      ? list.filter((match) => match.status === 'scheduled' || match.status === 'live')
      : list.filter((match) => match.status === 'finished');
  }, [activeTab, dateQuery.data, liveQuery.data]);

  const filteredMatches = useMemo(
    () =>
      sourceMatches.filter((match) => {
        const hasLeague = !selectedLeagueId || match.competition.id === selectedLeagueId;
        const hasTeam = !myTeamsOnly || involvesTeam(match, favoriteTeamIds);
        return hasLeague && hasTeam;
      }),
    [favoriteTeamIds, myTeamsOnly, selectedLeagueId, sourceMatches]
  );

  const sections = useMemo(() => createSections(filteredMatches, activeTab), [activeTab, filteredMatches]);
  const isLoading = activeTab === 'live' ? liveQuery.isLoading : dateQuery.isLoading;
  const isError = activeTab === 'live' ? liveQuery.isError && !liveQuery.data : dateQuery.isError && !dateQuery.data;
  const refetch = () => (activeTab === 'live' ? liveQuery.refetch() : dateQuery.refetch());

  return (
    <AppScreen edges={['top']}>
      {!online ? <View style={{ paddingTop: spacing.sm }}><OfflineBanner /></View> : null}
      <View style={{ paddingHorizontal: spacing.base, paddingTop: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
          <Typography variant="heading">Matches</Typography>
          <Pressable onPress={() => router.push('/search')} accessibilityRole="button" accessibilityLabel="Search" hitSlop={8}>
            <Ionicons name="search-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <SegmentedControl
            value={activeTab}
            onChange={(id) => setActiveTab(id as MatchTab)}
            options={[
              { id: 'live', label: 'LIVE', live: true },
              { id: 'upcoming', label: 'UPCOMING' },
              { id: 'recent', label: 'RECENT' },
            ]}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, flexWrap: 'wrap' }}>
          <FilterChip
            label={selectedLeagueId ? allCompetitions.find((league) => league.id === selectedLeagueId)?.shortName ?? 'League' : 'All leagues'}
            selected={showLeagueFilters || Boolean(selectedLeagueId)}
            onPress={() => setShowLeagueFilters((current) => !current)}
          />
          <FilterChip label="My teams" selected={myTeamsOnly} onPress={() => setMyTeamsOnly((current) => !current)} />
        </View>

        {showLeagueFilters ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm }}>
            <FilterChip label="All" selected={!selectedLeagueId} compact onPress={() => setSelectedLeagueId(undefined)} />
            {allCompetitions.map((league) => (
              <FilterChip
                key={league.id}
                label={league.shortName ?? league.name}
                selected={selectedLeagueId === league.id}
                compact
                onPress={() => setSelectedLeagueId(league.id)}
              />
            ))}
          </View>
        ) : null}

        {activeTab === 'upcoming' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm }}>
            {upcomingOffsets.map((offset) => (
              <FilterChip
                key={offset}
                label={formatMatchDay(new Date(Date.now() + offset * 86400000).toISOString(), dateFormat)}
                selected={upcomingOffset === offset}
                compact
                onPress={() => setUpcomingOffset(offset)}
              />
            ))}
          </View>
        ) : null}

        {activeTab === 'recent' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm }}>
            {recentOffsets.map((offset) => (
              <FilterChip
                key={offset}
                label={formatMatchDay(new Date(Date.now() + offset * 86400000).toISOString())}
                selected={recentOffset === offset}
                compact
                onPress={() => setRecentOffset(offset)}
              />
            ))}
          </View>
        ) : null}
      </View>

      {isError ? (
        <View style={{ padding: spacing.base }}>
          <ErrorState message={activeTab === 'live' ? "Couldn't load live matches." : "Couldn't load fixtures for this date."} onRetry={() => refetch()} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(match) => match.id}
          refreshControl={<RefreshControl refreshing={Boolean(isLoading && sections.length > 0)} onRefresh={() => refetch()} tintColor={colors.primary} />}
          contentContainerStyle={{
            paddingHorizontal: spacing.base,
            paddingTop: spacing.xs,
            paddingBottom: spacing['4xl'],
            flexGrow: sections.length === 0 ? 1 : undefined,
          }}
          renderSectionHeader={({ section }) => (
            <Typography variant="overline" color="textSecondary" style={{ paddingTop: spacing.md, paddingBottom: spacing.sm }}>
              {section.title}
            </Typography>
          )}
          renderItem={({ item }) => (
            <MatchCard match={item} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${item.id}`)} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            isLoading ? (
              <Typography color="textSecondary" style={{ padding: spacing.xl, textAlign: 'center' }}>
                Loading fixtures…
              </Typography>
            ) : (
              <EmptyState
                title={activeTab === 'live' ? 'No live matches right now' : activeTab === 'upcoming' ? 'No upcoming matches' : 'No recent matches'}
                message={myTeamsOnly ? 'None of your followed teams have a match in this view.' : 'Try another date or filter.'}
                actionLabel={myTeamsOnly ? 'Clear filters' : undefined}
                onAction={myTeamsOnly ? () => { setMyTeamsOnly(false); setSelectedLeagueId(undefined); } : undefined}
              />
            )
          }
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </AppScreen>
  );
}
