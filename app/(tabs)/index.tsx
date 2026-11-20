import { useRouter } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { FeaturedMatchCard } from '@/components/match/FeaturedMatchCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HomeNewsSection } from '@/components/home/HomeNewsSection';
import { MatchdayBanner } from '@/components/home/MatchdayBanner';
import { MatchList } from '@/components/home/MatchList';
import { PopularLeagues } from '@/components/home/PopularLeagues';
import { YourMatchdaySection } from '@/components/home/YourMatchdaySection';
import { YourTeamsSection } from '@/components/home/YourTeamsSection';
import { AppScreen } from '@/components/layout/AppScreen';
import { DataMeta, OfflineBanner } from '@/components/ui/OfflineBanner';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { popularCompetitions } from '@/data';
import { useHomeFeed } from '@/hooks/useHomeFeed';
import { useIsOnline } from '@/hooks/useIsOnline';
import { formatLastUpdated } from '@/lib/format/datetime';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useInboxStore } from '@/store/useInboxStore';
import { colors, spacing } from '@/theme';
import type { Competition, Match } from '@/types/football';

export default function HomeScreen() {
  const router = useRouter();
  const online = useIsOnline();
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | undefined>();
  const unreadCount = useInboxStore((state) => state.items.filter((item) => !item.read).length);
  const favoriteTeams = useFavoritesStore((state) => state.favoriteTeams);
  const feed = useHomeFeed({ pollLive: true });

  const goToMatch = (match: Match) => router.push(`/match/${match.id}`);

  const filterByLeague = (matches: Match[]) =>
    selectedLeagueId ? matches.filter((match) => match.competition.id === selectedLeagueId) : matches;

  const featured = feed.featured;
  const nextForYou = feed.nextForYou;
  const showNextForYou = Boolean(nextForYou && nextForYou.id !== featured?.id);
  const updatedLabel = formatLastUpdated(feed.updatedAt);

  return (
    <AppScreen edges={['top']}>
      {!online ? <View style={{ paddingTop: spacing.sm }}><OfflineBanner /></View> : null}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => feed.refetch()} tintColor={colors.primary} />
        }
        contentContainerStyle={{ paddingTop: spacing.base, paddingBottom: spacing['4xl'], gap: spacing['2xl'] }}
      >
        <View style={{ gap: spacing.lg }}>
          <View style={{ paddingHorizontal: spacing.base, gap: spacing.sm }}>
            <HomeHeader unreadCount={unreadCount} />
            {updatedLabel ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary }} />
                <DataMeta label={updatedLabel} />
              </View>
            ) : null}
          </View>

          {feed.matchday || featured ? (
            <View style={{ gap: spacing.md }}>
              {feed.matchday ? <MatchdayBanner match={feed.matchday} compact={feed.matchday.id === featured?.id} /> : null}
              {featured ? (
                <View style={{ paddingHorizontal: spacing.base }}>
                  <FeaturedMatchCard match={featured} onPress={() => goToMatch(featured)} />
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={{ gap: spacing.xl }}>
          <YourTeamsSection
            teams={favoriteTeams}
            onTeamPress={(team) => router.push(`/team/${team.id}`)}
            onSearchPress={() => router.push('/search')}
          />

          <YourMatchdaySection
            favoriteTeamCount={favoriteTeams.length}
            matches={filterByLeague(feed.yourMatchdayMatches)}
            isLoading={feed.isLoading}
            selectedLeagueId={selectedLeagueId}
            onMatchPress={goToMatch}
            onSearchPress={() => router.push('/search')}
            onBrowseMatchesPress={() => router.push('/matches')}
          />

          {showNextForYou && nextForYou ? (
            <View style={{ paddingHorizontal: spacing.base, gap: spacing.md }}>
              <SectionTitle title="Your next match" />
              <FeaturedMatchCard
                match={nextForYou}
                variant="secondary"
                onPress={() => goToMatch(nextForYou)}
              />
            </View>
          ) : null}
        </View>

        <View style={{ gap: spacing.xl }}>
          <MatchList
            title="Live Matches"
            matches={filterByLeague(feed.live)}
            isLoading={feed.isLiveLoading}
            isError={feed.isLiveError && feed.live.length === 0}
            errorMessage="Couldn't load live matches."
            onRetry={() => feed.refetchLive()}
            emptyMessage="No live matches right now."
            actionLabel="See all"
            onActionPress={() => router.push('/matches')}
            onMatchPress={goToMatch}
          />

          <View style={{ gap: spacing.md }}>
            <View style={{ paddingHorizontal: spacing.base }}>
              <SectionTitle title="Popular Leagues" />
            </View>

            <PopularLeagues
              leagues={popularCompetitions}
              selectedLeagueId={selectedLeagueId}
              onSelectLeague={(league: Competition) =>
                setSelectedLeagueId((current) =>
                  current === league.id ? undefined : league.id
                )
              }
            />
          </View>

          <MatchList
            title="Upcoming"
            matches={filterByLeague(feed.upcoming)}
            isLoading={feed.isLoading && feed.upcoming.length === 0}
            isError={feed.isError && feed.upcoming.length === 0}
            errorMessage="Couldn't load today's matches."
            onRetry={() => feed.refetch()}
            emptyMessage="No upcoming fixtures in the next two days."
            actionLabel="See all"
            onActionPress={() => router.push('/matches')}
            onMatchPress={goToMatch}
          />

          <MatchList
            title="Trending"
            matches={filterByLeague(feed.trending)}
            onMatchPress={goToMatch}
            emptyMessage="Nothing trending yet."
          />

          <MatchList
            title="Recent results"
            matches={filterByLeague(feed.recent)}
            onMatchPress={goToMatch}
            emptyMessage="No recent results yet."
          />
        </View>

        <HomeNewsSection />
      </ScrollView>
    </AppScreen>
  );
}
