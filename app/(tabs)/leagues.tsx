import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { LeagueCard } from '@/components/league/LeagueCard';
import { AppScreen } from '@/components/layout/AppScreen';
import { Typography } from '@/components/ui/Typography';
import { allCompetitions } from '@/data';
import { useHomeFeed } from '@/hooks/useHomeFeed';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { spacing } from '@/theme';

export default function LeaguesScreen() {
  const router = useRouter();
  const favoriteLeagues = useFavoritesStore((state) => state.favoriteLeagues);
  const toggleFavoriteLeague = useFavoritesStore((state) => state.toggleFavoriteLeague);
  const feed = useHomeFeed();

  return (
    <AppScreen edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing['4xl'], gap: spacing.xl }}>
        <View style={{ gap: spacing.xs }}>
          <Typography variant="heading">Leagues</Typography>
          <Typography variant="body" color="textSecondary">The competitions MatchPulse follows every matchday</Typography>
        </View>
        <View style={{ gap: spacing.sm }}>
          {allCompetitions.map((competition) => (
            <LeagueCard
              key={competition.id}
              league={{
                ...competition,
                matchCount: [...feed.live, ...feed.upcoming, ...feed.recent].filter((match) => match.competition.id === competition.id).length,
              }}
              favorited={favoriteLeagues.some((league) => league.id === competition.id)}
              onToggleFavorite={() => toggleFavoriteLeague(competition)}
              onPress={() => router.push(`/league/${competition.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}
