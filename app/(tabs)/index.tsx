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

  return (
    <AppScreen edges={['top']}>
      {!online ? <View style={{ paddingTop: spacing.sm }}><OfflineBanner /></View> : null}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => feed.refetch()} tintColor={colors.primary} />
        }
        contentContainerStyle={{ paddingTop: spacing.base, paddingBottom: spacing['3xl'], gap: spacing.xl }}
      >
        <View style={{ paddingHorizontal: spacing.base, gap: spacing.xs }}>
          <HomeHeader unreadCount={unreadCount} />
          <DataMeta label={formatLastUpdated(feed.updatedAt)} />
        </View>

        {feed.matchday ? <MatchdayBanner match={feed.matchday} /> : null}

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

        {featured ? (
          <View style={{ paddingHorizontal: spacing.base }}>
            <FeaturedMatchCard match={featured} onPress={() => goToMatch(featured)} />
          </View>
        ) : null}

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

        {feed.nextForYou ? (
          <View style={{ paddingHorizontal: spacing.base, gap: spacing.md }}>
            <SectionTitle title="Your next match" />
            <FeaturedMatchCard match={feed.nextForYou} onPress={() => goToMatch(feed.nextForYou!)} />
          </View>
        ) : null}

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

        <HomeNewsSection />
      </ScrollView>
    </AppScreen>
  );
}
