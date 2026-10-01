import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AppScreen } from '@/components/layout/AppScreen';
import { MatchCard } from '@/components/match/MatchCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SearchBar } from '@/components/ui/SearchBar';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { useFootballSearch } from '@/hooks/useFootballSearch';
import { useSearchHistoryStore } from '@/store/useSearchHistoryStore';
import { colors, radius, spacing } from '@/theme';

export default function SearchScreen() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const { results, isLoading, isError, query } = useFootballSearch(value);
  const recent = useSearchHistoryStore((state) => state.recent);
  const pushRecent = useSearchHistoryStore((state) => state.push);
  const clearRecent = useSearchHistoryStore((state) => state.clear);
  const empty =
    query.length >= 2 &&
    !results.teams.length &&
    !results.leagues.length &&
    !results.players.length &&
    !results.matches.length &&
    !isLoading;

  return (
    <AppScreen edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.base, gap: spacing.xl, paddingBottom: spacing['4xl'] }}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader title="Search" />
        <SearchBar
          value={value}
          onChangeText={setValue}
          onSubmitEditing={() => {
            if (value.trim().length >= 2) {
              pushRecent(value.trim());
            }
          }}
          autoFocus
        />

        {query.length < 2 ? (
          <View style={{ gap: spacing.md }}>
            <SectionTitle
              title="Recent searches"
              actionLabel={recent.length ? 'Clear' : undefined}
              onActionPress={recent.length ? clearRecent : undefined}
            />
            {recent.length === 0 ? (
              <EmptyState
                title="Search football"
                message="Find teams, leagues, players, and matches. API search starts after 3 characters."
              />
            ) : (
              recent.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setValue(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Search for ${item}`}
                >
                  {({ pressed }) => (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.md,
                        padding: spacing.md,
                        backgroundColor: colors.surface,
                        borderRadius: radius.md,
                        borderWidth: 1,
                        borderColor: colors.divider,
                        opacity: pressed ? 0.85 : 1,
                      }}
                    >
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                      <Typography style={{ flex: 1 }}>{item}</Typography>
                    </View>
                  )}
                </Pressable>
              ))
            )}
          </View>
        ) : null}

        {isLoading ? <Typography color="textSecondary">Searching…</Typography> : null}
        {isError ? <ErrorState message="Search is temporarily unavailable." /> : null}
        {empty ? <EmptyState title="No results" message="Try a club, competition, or player name." /> : null}

        {results.teams.length ? (
          <ResultGroup title="Teams">
            {results.teams.map((team) => {
              const secondaryContext = [team.country, team.venue].filter(Boolean).join(' • ');
              return (
                <Pressable
                  key={team.id}
                  onPress={() => {
                    pushRecent(query.trim() || team.name);
                    router.push(`/team/${team.id}`);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${team.name}`}
                >
                  {({ pressed }) => (
                    <View
                      style={{
                        ...rowStyle,
                        opacity: pressed ? 0.85 : 1,
                      }}
                    >
                      <TeamLogo team={team} size={36} />
                      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                        <Typography variant="body" style={{ fontWeight: '600' }} numberOfLines={1}>
                          {team.name}
                        </Typography>
                        {secondaryContext ? (
                          <Typography variant="caption" color="textSecondary" numberOfLines={1}>
                            {secondaryContext}
                          </Typography>
                        ) : null}
                      </View>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ResultGroup>
        ) : null}

        {results.leagues.length ? (
          <ResultGroup title="Leagues">
            {results.leagues.map((league) => (
              <Pressable
                key={league.id}
                onPress={() => {
                  pushRecent(query.trim() || league.name);
                  router.push(`/league/${league.id}`);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Open ${league.name}`}
              >
                {({ pressed }) => (
                  <View
                    style={{
                      ...rowStyle,
                      opacity: pressed ? 0.85 : 1,
                    }}
                  >
                    <Typography style={{ flex: 1 }} numberOfLines={1}>
                      {league.name}
                    </Typography>
                    {league.country ? (
                      <Typography variant="caption" color="textSecondary">
                        {league.country}
                      </Typography>
                    ) : null}
                  </View>
                )}
              </Pressable>
            ))}
          </ResultGroup>
        ) : null}

        {results.players.length ? (
          <ResultGroup title="Players">
            {results.players.map((player) => (
              <Pressable
                key={player.id}
                onPress={() => {
                  pushRecent(query.trim() || player.name);
                  router.push(`/player/${player.id}`);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Open ${player.name}`}
              >
                {({ pressed }) => (
                  <View
                    style={{
                      ...rowStyle,
                      opacity: pressed ? 0.85 : 1,
                    }}
                  >
                    <Typography style={{ flex: 1 }} numberOfLines={1}>
                      {player.name}
                    </Typography>
                    {player.position ? (
                      <Typography variant="caption" color="textSecondary">
                        {player.position}
                      </Typography>
                    ) : null}
                  </View>
                )}
              </Pressable>
            ))}
          </ResultGroup>
        ) : null}

        {results.matches.length ? (
          <ResultGroup title="Matches">
            {results.matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                fullWidth
                onPress={() => {
                  pushRecent(query.trim() || `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`);
                  router.push(`/match/${match.id}`);
                }}
              />
            ))}
          </ResultGroup>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

function ResultGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <SectionTitle title={title} />
      {children}
    </View>
  );
}

const rowStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: spacing.md,
  padding: spacing.md,
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.divider,
};
