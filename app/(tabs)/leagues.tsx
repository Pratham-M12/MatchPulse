import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { LeagueCard } from '@/components/league/LeagueCard';
import { AppScreen } from '@/components/layout/AppScreen';
import { Typography } from '@/components/ui/Typography';
import { allCompetitions } from '@/data';
import { useHomeFeed } from '@/hooks/useHomeFeed';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { colors, radius, spacing } from '@/theme';

export default function LeaguesScreen() {
  const router = useRouter();
  const favoriteLeagues = useFavoritesStore((state) => state.favoriteLeagues);
  const toggleFavoriteLeague = useFavoritesStore((state) => state.toggleFavoriteLeague);
  const feed = useHomeFeed();

  return (
    <AppScreen edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing['4xl'], gap: spacing.xl }}>
        <View style={{ gap: spacing.sm }}>
          <Typography variant="overline" color="primary">Competition catalogue</Typography>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md }}>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Typography variant="heading">Leagues</Typography>
              <Typography variant="body" color="textSecondary">Follow competitions to keep their fixtures close to your matchday.</Typography>
            </View>
            <View
              accessible
              accessibilityLabel={`${favoriteLeagues.length} leagues followed`}
              style={{ minHeight: 36, paddingHorizontal: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.primarySubtle, borderWidth: 1, borderColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' }}
            >
              <Typography variant="caption" color="primary">{favoriteLeagues.length} following</Typography>
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: colors.surfaceElevated, borderRadius: radius.card, borderWidth: 1, borderColor: colors.divider, padding: spacing.md, gap: 3 }}>
          <Typography variant="overline" color="textSecondary">All competitions</Typography>
          <Typography variant="caption" color="textSecondary">{allCompetitions.length} competitions available</Typography>
        </View>

        <View style={{ gap: spacing.md }}>
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
