import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, View } from 'react-native';

import { EntityTabs, Metric } from '@/components/entity/EntityPrimitives';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Typography } from '@/components/ui/Typography';
import { usePlayerDetails } from '@/hooks/usePlayerDetails';
import { colors, radius, spacing } from '@/theme';

const tabs = ['OVERVIEW', 'STATS', 'FORM'];

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState('OVERVIEW');
  const decoded = decodeURIComponent(id || '');

  const { player, team, isLoading, isError, error, refetch } = usePlayerDetails(id);

  if (isLoading) {
    return (
      <AppScreen edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={{ padding: spacing.base, gap: spacing.xl }}>
          <ScreenHeader title="Player" />
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['4xl'], gap: spacing.md }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Typography variant="body" color="textSecondary">
              Loading player profile…
            </Typography>
          </View>
        </ScrollView>
      </AppScreen>
    );
  }

  if (isError) {
    return (
      <AppScreen edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={{ padding: spacing.base, gap: spacing.xl }}>
          <ScreenHeader title="Player" />
          <Typography variant="heading">{decoded}</Typography>
          <ErrorState
            message={error instanceof Error ? error.message : "Couldn't load player profile."}
            onRetry={() => refetch()}
          />
        </ScrollView>
      </AppScreen>
    );
  }

  if (!player) {
    return (
      <AppScreen edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={{ padding: spacing.base, gap: spacing.xl }}>
          <ScreenHeader title="Player" />
          <Typography variant="heading">{decoded}</Typography>
          <EmptyState
            title="Detailed player stats unavailable"
            message="This came from a match event or an API id without a full player record. MatchPulse will not invent appearances, goals, or ratings."
            actionLabel="Back"
            onAction={() => router.back()}
          />
        </ScrollView>
      </AppScreen>
    );
  }

  const fromApi = Boolean(player.fromApi);

  return (
    <AppScreen edges={['top', 'bottom']}>
      <ScrollView
        refreshControl={fromApi ? <RefreshControl refreshing={false} onRefresh={() => refetch()} tintColor={colors.primary} /> : undefined}
        contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing['4xl'], gap: spacing.xl }}
      >
        <ScreenHeader title="Player" />
        <View style={{ backgroundColor: colors.surfaceElevated, borderRadius: radius.card, borderWidth: 1, borderColor: colors.divider, padding: spacing.xl, alignItems: 'center', gap: spacing.sm, overflow: 'hidden' }}>
          {player.photoUrl ? (
            <Image source={{ uri: player.photoUrl }} style={{ width: 74, height: 74, borderRadius: 37 }} />
          ) : (
            <View style={{ width: 74, height: 74, borderRadius: 37, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="display" color="primary">{player.number || '?'}</Typography>
            </View>
          )}
          <Typography variant="heading" style={{ textAlign: 'center' }}>{player.name}</Typography>
          <Typography variant="body" color="textSecondary">{team?.name ?? 'MatchPulse'} • {player.position}</Typography>
          <Typography variant="caption" color="primary">#{player.number || '—'} • {player.nationality}</Typography>
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.divider, paddingVertical: spacing.md }}>
          <Metric value={player.number ? String(player.number).padStart(2, '0') : '—'} label="Jersey" />
          <View style={{ width: 1, backgroundColor: colors.divider }} />
          <Metric value={player.position.slice(0, 3).toUpperCase()} label="Position" />
          <View style={{ width: 1, backgroundColor: colors.divider }} />
          <Metric value={team?.shortName ?? '—'} label="Club" />
        </View>
        <EntityTabs tabs={tabs} selected={tab} onSelect={setTab} />
        {tab === 'OVERVIEW' ? (
          <StatsGrid
            values={[
              ['Age', player.age || '—'],
              ['Appearances', player.appearances],
              ['Goals', player.goals],
              ['Assists', player.assists],
            ]}
          />
        ) : null}
        {tab === 'STATS' ? (
          <StatsGrid
            values={[
              ['Goals', player.goals],
              ['Assists', player.assists],
              ['Appearances', player.appearances],
              ['Minutes', player.minutes ?? '—'],
              ['Yellow cards', player.yellowCards ?? '—'],
              ['Red cards', player.redCards ?? '—'],
            ]}
          />
        ) : null}
        {tab === 'FORM' ? (
          <EmptyState
            title="Form unavailable"
            message={fromApi ? 'Player match-by-match form is not provided on this API plan.' : 'Local player profiles do not include match ratings. Those numbers will appear only from real API data.'}
          />
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

function StatsGrid({ values }: { values: [string, string | number][] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {values.map(([label, value]) => (
        <View key={label} style={{ width: '31%', minWidth: 92, flexGrow: 1, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.divider, padding: spacing.md, gap: 2 }}>
          <Typography variant="title">{value}</Typography>
          <Typography variant="caption" color="textSecondary">{label}</Typography>
        </View>
      ))}
    </View>
  );
}