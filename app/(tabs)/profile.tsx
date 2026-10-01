import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import {
  FanIdentityHero,
  FavoriteLeagueRow,
  FavoriteTeamCard,
  NextMatchCard,
  NotificationToggle,
  PreferenceRow,
  ProfileEmptyCard,
} from '@/components/profile/FanHub';
import { AppScreen } from '@/components/layout/AppScreen';
import { MatchCard } from '@/components/match/MatchCard';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useHomeFeed } from '@/hooks/useHomeFeed';
import { involvesTeam } from '@/lib/football/ranking';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { spacing } from '@/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const favoriteTeams = useFavoritesStore((state) => state.favoriteTeams);
  const favoriteLeagues = useFavoritesStore((state) => state.favoriteLeagues);
  const favoriteMatches = useFavoritesStore((state) => state.favoriteMatches);
  const toggleFavoriteTeam = useFavoritesStore((state) => state.toggleFavoriteTeam);
  const toggleFavoriteLeague = useFavoritesStore((state) => state.toggleFavoriteLeague);
  const notificationsEnabled = usePreferencesStore((state) => state.notificationsEnabled);
  const toggleNotifications = usePreferencesStore((state) => state.toggleNotifications);
  const feed = useHomeFeed();
  const teamIds = favoriteTeams.map((team) => team.id);
  const liveForYou = feed.live.filter((match) => involvesTeam(match, teamIds));
  const upcomingForYou = feed.upcoming.filter((match) => involvesTeam(match, teamIds));
  const recentForYou = feed.recent.filter((match) => involvesTeam(match, teamIds));
  const nextMatch = upcomingForYou[0];

  return (
    <AppScreen edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.base,
          paddingTop: spacing.lg,
          paddingBottom: spacing['4xl'] + 24,
          gap: spacing.xl,
        }}
      >
        <FanIdentityHero
          teamCount={favoriteTeams.length}
          leagueCount={favoriteLeagues.length}
          matchCount={favoriteMatches.length}
        />

        <View style={{ gap: spacing.md }}>
          <SectionTitle title="My Teams" actionLabel="Search" onActionPress={() => router.push('/search')} />
          {favoriteTeams.length === 0 ? (
            <ProfileEmptyCard
              icon="shield-outline"
              title="No teams followed yet"
              message="Follow a club to see fixtures, live scores, and reminders."
              actionLabel="Search clubs"
              onAction={() => router.push('/search')}
            />
          ) : (
            favoriteTeams.map((team) => (
              <FavoriteTeamCard
                key={team.id}
                team={team}
                nextMatch={upcomingForYou.find((match) => involvesTeam(match, [team.id]))}
                onPress={() => router.push(`/team/${team.id}`)}
                onToggleFavorite={() => toggleFavoriteTeam(team)}
              />
            ))
          )}
        </View>

        {nextMatch ? (
          <View style={{ gap: spacing.md }}>
            <SectionTitle title="Upcoming for you" />
            <NextMatchCard match={nextMatch} onPress={() => router.push(`/match/${nextMatch.id}`)} />
          </View>
        ) : null}

        {liveForYou.length ? (
          <View style={{ gap: spacing.md }}>
            <SectionTitle title="Live for you" />
            {liveForYou.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                fullWidth
                showNavigationAffordance
                onPress={() => router.push(`/match/${match.id}`)}
              />
            ))}
          </View>
        ) : null}

        {recentForYou.length ? (
          <View style={{ gap: spacing.md }}>
            <SectionTitle title="Recent results" />
            {recentForYou.slice(0, 4).map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                fullWidth
                showNavigationAffordance
                onPress={() => router.push(`/match/${match.id}`)}
              />
            ))}
          </View>
        ) : null}

        <View style={{ gap: spacing.md }}>
          <SectionTitle title="My Leagues" />
          {favoriteLeagues.length === 0 ? (
            <ProfileEmptyCard
              icon="trophy-outline"
              title="No leagues followed yet"
              message="Save a competition from the Leagues tab."
              actionLabel="Browse leagues"
              onAction={() => router.push('/leagues')}
            />
          ) : (
            favoriteLeagues.map((league) => (
              <FavoriteLeagueRow
                key={league.id}
                league={league}
                onPress={() => router.push(`/league/${league.id}`)}
                onToggleFavorite={() => toggleFavoriteLeague(league)}
              />
            ))
          )}
        </View>

        <View style={{ gap: spacing.md }}>
          <SectionTitle title="Favorite matches" />
          {favoriteMatches.length === 0 ? (
            <ProfileEmptyCard
              icon="star-outline"
              title="No favorite matches yet"
              message="Star a fixture from match centre to pin it here."
            />
          ) : (
            favoriteMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                fullWidth
                showNavigationAffordance
                onPress={() => router.push(`/match/${match.id}`)}
              />
            ))
          )}
        </View>

        <View style={{ gap: spacing.sm }}>
          <SectionTitle title="Preferences" />
          <PreferenceRow icon="notifications-outline" title="Notifications" detail="Match alerts and inbox">
            <NotificationToggle value={notificationsEnabled} onValueChange={toggleNotifications} />
          </PreferenceRow>
          <PreferenceRow
            icon="settings-outline"
            title="Settings"
            detail="Reminders, data saver, time format"
            onPress={() => router.push('/settings')}
          />
          <PreferenceRow
            icon="mail-outline"
            title="Inbox"
            detail="Local notification centre"
            onPress={() => router.push('/notifications')}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}