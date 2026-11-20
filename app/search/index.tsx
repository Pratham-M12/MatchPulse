import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { LeagueMark, PlayerRow } from '@/components/entity/EntityPrimitives';
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
  const { results, isLoading, isError, unavailable, query, refetch } = useFootballSearch(value);
  const recent = useSearchHistoryStore((state) => state.recent);
  const pushRecent = useSearchHistoryStore((state) => state.push);
  const clearRecent = useSearchHistoryStore((state) => state.clear);
  const normalizedValue = value.trim();
  const isQueryPending = normalizedValue.length >= 2 && normalizedValue !== query;
  const isSearchActive = normalizedValue.length >= 2 && !isQueryPending;
  const empty =
    isSearchActive &&
    !results.teams.length &&
    !results.leagues.length &&
    !results.players.length &&
    !results.matches.length &&
    !isLoading &&
    !unavailable;

  return (
    <AppScreen edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.base, paddingTop: spacing.lg, paddingBottom: spacing['4xl'] }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={searchHeaderStyle}>
          <View style={{ gap: spacing.xs }}>
            <ScreenHeader title="Search" />
            <Typography variant="caption" color="textSecondary" style={{ paddingLeft: 44 + spacing.sm }}>
              Find teams, leagues, players, and matches
            </Typography>
          </View>
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
        </View>

        {normalizedValue.length < 2 ? (
          <View style={contentSectionStyle}>
            <SectionTitle
              title="Recent searches"
              actionLabel={recent.length ? 'Clear' : undefined}
              onActionPress={recent.length ? clearRecent : undefined}
              actionTouchTarget
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
                        minHeight: 44,
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.md,
                        backgroundColor: colors.surfaceElevated,
                        borderRadius: radius.lg,
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

        {isQueryPending || (isSearchActive && isLoading) ? (
          <Typography color="textSecondary" style={stateStyle}>Searching…</Typography>
        ) : null}
        {isSearchActive && unavailable ? (
          <View style={stateStyle}>
            <ErrorState message="Team and league API results are unavailable. Available local results are still shown." />
          </View>
        ) : null}
        {isSearchActive && isError ? (
          <View style={stateStyle}>
            <ErrorState
              message="Search is temporarily unavailable."
              onRetry={() => {
                void refetch();
              }}
            />
          </View>
        ) : null}
        {empty ? (
          <View style={stateStyle}>
            <EmptyState title="No results" message="Try a club, competition, or player name." />
          </View>
        ) : null}

        {isSearchActive && results.teams.length ? (
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
                      <TeamLogo team={team} size={40} decorative />
                      <View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}>
                        <Typography variant="title" numberOfLines={1}>
                          {team.name}
                        </Typography>
                        {secondaryContext ? (
                          <Typography variant="caption" color="textSecondary" numberOfLines={1}>
                            {secondaryContext}
                          </Typography>
                        ) : null}
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ResultGroup>
        ) : null}

        {isSearchActive && results.leagues.length ? (
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
                    <LeagueMark competition={league} size={40} />
                    <View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}>
                      <Typography variant="title" numberOfLines={2}>
                        {league.name}
                      </Typography>
                      {league.country ? (
                        <Typography variant="caption" color="textSecondary" numberOfLines={1}>
                          {league.country}
                        </Typography>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
                  </View>
                )}
              </Pressable>
            ))}
          </ResultGroup>
        ) : null}

        {isSearchActive && results.players.length ? (
          <ResultGroup title="Players">
            {results.players.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                onPress={() => {
                  pushRecent(query.trim() || player.name);
                  router.push(`/player/${player.id}`);
                }}
              />
            ))}
          </ResultGroup>
        ) : null}

        {isSearchActive && results.matches.length ? (
          <ResultGroup title="Matches">
            {results.matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                fullWidth
                showNavigationAffordance
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
    <View style={contentSectionStyle}>
      <SectionTitle title={title} />
      {children}
    </View>
  );
}

const searchHeaderStyle = {
  gap: spacing.lg,
  paddingBottom: spacing.xl,
  borderBottomWidth: 1,
  borderBottomColor: colors.divider,
};

const contentSectionStyle = {
  gap: spacing.md,
  paddingTop: spacing.xl,
};

const stateStyle = {
  paddingTop: spacing.xl,
};

const rowStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: spacing.md,
  minHeight: 64,
  padding: spacing.md,
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.divider,
};
