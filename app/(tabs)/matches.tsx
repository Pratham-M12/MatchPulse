import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, SectionList, View } from 'react-native';

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
import { colors, radius, spacing } from '@/theme';
import type { Match } from '@/types/football';

type MatchTab = 'live' | 'upcoming' | 'recent';
type MatchSection = { title: string; data: Match[] };

const upcomingOffsets = [0, 1, 2, 3];
const recentOffsets = [-1, -2, -3];

function formatOffsetDay(offset: number, dateFormat: 'relative' | 'absolute') {
  return formatMatchDay(new Date(Date.now() + offset * 86400000).toISOString(), dateFormat);
}

function formatFixtureCount(count: number) {
  return `${count} ${count === 1 ? 'fixture' : 'fixtures'}`;
}

function FixtureLoadingState() {
  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Loading fixtures" style={{ gap: spacing.sm, paddingTop: spacing.md }}>
      {[0, 1].map((index) => (
        <View
          key={index}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            height: 164,
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.divider,
            padding: spacing.md,
            gap: spacing.md,
          }}
        >
          <View style={{ width: '44%', height: 12, borderRadius: 6, backgroundColor: colors.surfaceHighlight }} />
          <View style={{ height: 38, borderRadius: radius.sm, backgroundColor: colors.surfaceHighlight }} />
          <View style={{ height: 1, backgroundColor: colors.divider }} />
          <View style={{ height: 38, borderRadius: radius.sm, backgroundColor: colors.surfaceHighlight }} />
        </View>
      ))}
    </View>
  );
}

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
  const [manualRefreshTab, setManualRefreshTab] = useState<MatchTab | null>(null);

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
  const activeQuery = activeTab === 'live' ? liveQuery : dateQuery;
  const isLoading = activeQuery.isLoading;
  const hasQueryData = activeQuery.data !== undefined;
  const isInitialLoading = isLoading && !hasQueryData;
  const isRefreshing = activeQuery.isFetching && hasQueryData;
  const hasBackgroundRefreshError = activeQuery.isError && hasQueryData;
  const isOfflineWithoutCachedFixtures = !online && !hasQueryData;
  const isError = activeQuery.isError && !hasQueryData && !isOfflineWithoutCachedFixtures;
  const refetch = () => (activeTab === 'live' ? liveQuery.refetch() : dateQuery.refetch());
  const isManualRefreshing = manualRefreshTab === activeTab;
  const handleRefresh = async () => {
    const refreshTab = activeTab;
    setManualRefreshTab(refreshTab);
    try {
      await refetch();
    } finally {
      setManualRefreshTab((currentTab) => currentTab === refreshTab ? null : currentTab);
    }
  };
  const dateOffset = activeTab === 'upcoming' ? upcomingOffset : recentOffset;
  const selectedDateLabel = activeTab === 'live' ? 'Live scores' : formatOffsetDay(dateOffset, dateFormat);
  const hasActiveFilters = Boolean(selectedLeagueId) || myTeamsOnly;
  const hasFilteredOutFixtures = hasActiveFilters && sourceMatches.length > 0 && filteredMatches.length === 0;
  const emptyTitle = hasFilteredOutFixtures
    ? 'No matching fixtures'
    : activeTab === 'live'
      ? 'No live matches right now'
      : activeTab === 'upcoming'
        ? `No fixtures on ${selectedDateLabel}`
        : `No completed fixtures on ${selectedDateLabel}`;
  const emptyMessage = hasFilteredOutFixtures
    ? `Your active filters do not match fixtures for ${activeTab === 'live' ? 'this live view' : selectedDateLabel}.`
    : activeTab === 'live'
      ? 'Check back soon for live scores.'
      : 'Try another matchday or filter.';

  return (
    <AppScreen edges={['top']}>
      {!online && hasQueryData ? <View style={{ paddingTop: spacing.sm }}><OfflineBanner /></View> : null}
      <View style={{ paddingHorizontal: spacing.base, paddingTop: spacing.md, gap: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Typography variant="heading">Matches</Typography>
            <Typography variant="caption" color="textSecondary">{selectedDateLabel}</Typography>
          </View>
          <Pressable
            onPress={() => router.push('/search')}
            accessibilityRole="button"
            accessibilityLabel="Search matches"
            hitSlop={8}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 22,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.divider,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons name="search-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={{ backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.divider, borderRadius: 20, padding: spacing.md, gap: spacing.md }}>
          {activeTab !== 'live' ? (
            <View style={{ gap: spacing.xs }}>
              <Typography variant="overline" color="textSecondary">Matchday</Typography>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs, paddingRight: spacing.md }}>
                {(activeTab === 'upcoming' ? upcomingOffsets : recentOffsets).map((offset) => (
                  <FilterChip
                    key={offset}
                    label={formatOffsetDay(offset, dateFormat)}
                    selected={dateOffset === offset}
                    compact
                    minHeight={44}
                    onPress={() => activeTab === 'upcoming' ? setUpcomingOffset(offset) : setRecentOffset(offset)}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View style={{ gap: spacing.xs }}>
            <Typography variant="overline" color="textSecondary">Fixture status</Typography>
            <SegmentedControl
              value={activeTab}
              onChange={(id) => setActiveTab(id as MatchTab)}
              minHeight={44}
              options={[
                { id: 'live', label: 'LIVE', live: true },
                { id: 'upcoming', label: 'UPCOMING' },
                { id: 'recent', label: 'RECENT' },
              ]}
            />
          </View>

          <View style={{ gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="overline" color="textSecondary">Filters</Typography>
              {hasActiveFilters ? (
                <Pressable
                  onPress={() => { setSelectedLeagueId(undefined); setMyTeamsOnly(false); }}
                  accessibilityRole="button"
                  accessibilityLabel="Clear match filters"
                  hitSlop={8}
                  style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: spacing.xs, justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}
                >
                  <Typography variant="caption" color="primary">Clear</Typography>
                </Pressable>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
              <FilterChip
                label={selectedLeagueId ? allCompetitions.find((league) => league.id === selectedLeagueId)?.shortName ?? 'League' : 'League'}
                selected={Boolean(selectedLeagueId)}
                minHeight={44}
                onPress={() => setShowLeagueFilters((current) => !current)}
              />
              <FilterChip label="My teams" selected={myTeamsOnly} minHeight={44} onPress={() => setMyTeamsOnly((current) => !current)} />
            </View>
          </View>

          {showLeagueFilters ? (
            <View style={{ gap: spacing.xs }}>
              <Typography variant="overline" color="textSecondary">Competitions</Typography>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs, paddingRight: spacing.md }}>
                <FilterChip label="All leagues" selected={!selectedLeagueId} compact minHeight={44} onPress={() => setSelectedLeagueId(undefined)} />
                {allCompetitions.map((league) => (
                  <FilterChip
                    key={league.id}
                    label={league.shortName ?? league.name}
                    selected={selectedLeagueId === league.id}
                    compact
                    minHeight={44}
                    onPress={() => setSelectedLeagueId(league.id)}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </View>

      {isError ? (
        <View style={{ padding: spacing.base }}>
          <ErrorState message={activeTab === 'live' ? "Couldn't load live matches." : "Couldn't load fixtures for this date."} onRetry={() => refetch()} />
        </View>
      ) : isOfflineWithoutCachedFixtures ? (
        <View style={{ padding: spacing.base }}>
          <EmptyState title="You're offline" message="Connect to the internet to load fixtures." />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(match) => match.id}
          refreshControl={<RefreshControl refreshing={isManualRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
          contentContainerStyle={{
            paddingHorizontal: spacing.base,
            paddingTop: spacing.sm,
            paddingBottom: spacing['4xl'],
            flexGrow: sections.length === 0 ? 1 : undefined,
          }}
          ListHeaderComponent={
            sections.length > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingTop: spacing.xs }}>
                {activeTab === 'live' ? (
                  <View
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.live }}
                  />
                ) : null}
                <Typography variant="overline" color={activeTab === 'live' ? 'live' : 'textSecondary'}>
                  {activeTab === 'live' ? 'Live fixtures' : activeTab === 'upcoming' ? 'Scheduled fixtures' : 'Full-time results'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {formatFixtureCount(filteredMatches.length)}
                </Typography>
                {isRefreshing ? <ActivityIndicator accessibilityLabel="Refreshing fixtures" size="small" color={colors.primary} /> : null}
                {hasBackgroundRefreshError ? (
                  <Typography variant="caption" color="warning">Update unavailable</Typography>
                ) : null}
              </View>
            ) : null
          }
          renderSectionHeader={({ section }) => (
            <View
              accessible
              accessibilityRole="header"
              accessibilityLabel={`${activeTab === 'recent' ? 'Results' : activeTab === 'live' ? 'Live competition' : 'Competition'}: ${section.title}, ${formatFixtureCount(section.data.length)}`}
              style={{ paddingTop: spacing.lg, paddingBottom: spacing.sm, gap: spacing.xs }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                {activeTab === 'live' ? (
                  <View
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    style={{ width: 3, height: 18, borderRadius: 2, backgroundColor: colors.live, flexShrink: 0 }}
                  />
                ) : null}
                <Typography variant="title" numberOfLines={1} style={{ flex: 1, minWidth: 0 }}>
                  {section.title}
                </Typography>
                <Typography variant="caption" color="textSecondary" style={{ flexShrink: 0 }}>
                  {formatFixtureCount(section.data.length)}
                </Typography>
              </View>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={{ height: 1, backgroundColor: colors.divider, opacity: 0.7 }}
              />
            </View>
          )}
          renderItem={({ item }) => (
            <MatchCard match={item} fullWidth showNavigationAffordance onPress={() => router.push(`/match/${item.id}`)} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            isInitialLoading ? (
              <FixtureLoadingState />
            ) : (
              <EmptyState
                title={emptyTitle}
                message={emptyMessage}
                actionLabel={hasActiveFilters ? 'Clear filters' : undefined}
                onAction={hasActiveFilters ? () => { setMyTeamsOnly(false); setSelectedLeagueId(undefined); } : undefined}
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
