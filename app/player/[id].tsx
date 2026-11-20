import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { EntityTabs } from '@/components/entity/EntityPrimitives';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { usePlayerDetails } from '@/hooks/usePlayerDetails';
import { isUnsupportedEndpoint } from '@/lib/api/errors';
import { colorFromString, initialsFromName } from '@/lib/colorFromString';
import { colors, radius, spacing } from '@/theme';
import type { Player, Team } from '@/types/football';

const tabs = ['OVERVIEW', 'STATS', 'FORM'];

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState('OVERVIEW');
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const isMounted = useRef(true);
  const decoded = decodeURIComponent(id || '');

  const { player, team, isLoading, isError, error, refetch, season } = usePlayerDetails(id);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      if (isMounted.current) setIsManualRefreshing(false);
    }
  };

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

  if (isError && !player) {
    return (
      <AppScreen edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={{ padding: spacing.base, gap: spacing.xl }}>
          <ScreenHeader title="Player" />
          <Typography variant="heading">{decoded}</Typography>
          {isUnsupportedEndpoint(error) ? (
            <EmptyState title="Player profile unavailable" message="This player profile is not included with the current API access." />
          ) : <ErrorState message="Couldn't load player profile." onRetry={() => refetch()} />}
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
        refreshControl={fromApi ? <RefreshControl refreshing={isManualRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} /> : undefined}
        contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing['4xl'], gap: spacing.xl }}
      >
        <ScreenHeader title="Player" />
        <PlayerHero player={player} team={team} season={season} onTeamPress={team ? () => router.push(`/team/${team.id}`) : undefined} />
        <EntityTabs tabs={tabs} selected={tab} onSelect={setTab} minHeight={44} />
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
          <PlayerStatistics player={player} season={season} />
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

function PlayerHero({ player, team, season, onTeamPress }: { player: Player; team?: Team; season: number; onTeamPress?: () => void }) {
  const [hasPhotoError, setHasPhotoError] = useState(false);
  const hasPhoto = Boolean(player.photoUrl) && !hasPhotoError;
  const accent = team?.color ?? colors.primary;
  const metadata = [
    player.number > 0 ? `#${player.number}` : undefined,
    player.nationality && player.nationality !== '—' ? player.nationality : undefined,
  ].filter((item): item is string => Boolean(item));

  return (
    <View style={{ backgroundColor: colors.surfaceElevated, borderRadius: radius.card, borderWidth: 1, borderColor: accent, padding: spacing.lg, gap: spacing.md, overflow: 'hidden' }}>
      <View pointerEvents="none" style={{ position: 'absolute', width: 190, height: 190, borderRadius: 95, borderWidth: 1, borderColor: accent, right: -72, top: -82, opacity: 0.55 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 104, height: 104, borderRadius: radius.lg, backgroundColor: hasPhoto ? colors.surfaceHighlight : colorFromString(player.name), borderWidth: 1, borderColor: accent, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {hasPhoto ? (
            <Image source={{ uri: player.photoUrl }} resizeMode="cover" style={{ width: '100%', height: '100%' }} onError={() => setHasPhotoError(true)} />
          ) : (
            <Typography variant="display" style={{ fontSize: 32, lineHeight: 38, fontWeight: '700' }}>{initialsFromName(player.name)}</Typography>
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Typography variant="overline" color="primary">PLAYER PROFILE</Typography>
          <Typography variant="heading" numberOfLines={2}>{player.name}</Typography>
          {player.position ? <Typography variant="body" color="textSecondary" numberOfLines={1}>{player.position}</Typography> : null}
          {metadata.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs }}>
              {metadata.map((item) => <ProfileChip key={item} label={item} />)}
            </View>
          ) : null}
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <ProfileChip label={`Season ${season}`} />
        {team ? (
          <Pressable onPress={onTeamPress} accessibilityRole="button" accessibilityLabel={`Open ${team.name}`} style={{ minHeight: 44, maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: colors.divider }}>
            <TeamLogo team={team} size={24} decorative />
            <Typography variant="caption" numberOfLines={1}>{team.name}</Typography>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function ProfileChip({ label }: { label: string }) {
  return (
    <View accessible accessibilityLabel={label} style={{ minHeight: 28, paddingHorizontal: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: colors.divider, justifyContent: 'center' }}>
      <Typography variant="caption" color="textSecondary">{label}</Typography>
    </View>
  );
}

function PlayerStatistics({ player, season }: { player: Player; season: number }) {
  const performance = [
    { label: 'Appearances', value: player.appearances, prominent: true },
    ...(player.minutes !== undefined ? [{ label: 'Minutes played', value: player.minutes, prominent: true }] : []),
  ];
  const attacking = [
    { label: 'Goals', value: player.goals, prominent: true },
    { label: 'Assists', value: player.assists, prominent: true },
  ];
  const discipline = [
    ...(player.yellowCards !== undefined ? [{ label: 'Yellow cards', value: player.yellowCards }] : []),
    ...(player.redCards !== undefined ? [{ label: 'Red cards', value: player.redCards }] : []),
  ];

  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ gap: 2 }}>
        <SectionTitle title="Season statistics" />
        <Typography variant="caption" color="textSecondary">Selected season {season}</Typography>
      </View>
      <StatGroup title="Performance" metrics={performance} />
      <StatGroup title="Attacking" metrics={attacking} />
      {discipline.length ? <StatGroup title="Discipline" metrics={discipline} /> : null}
    </View>
  );
}

type PlayerMetric = { label: string; value: number; prominent?: boolean };

function StatGroup({ title, metrics }: { title: string; metrics: PlayerMetric[] }) {
  const summary = metrics.map((metric) => `${metric.label}: ${metric.value}`).join(', ');
  return (
    <View accessible accessibilityRole="summary" accessibilityLabel={`${title}. ${summary}`} style={{ gap: spacing.sm }}>
      <SectionTitle title={title} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {metrics.map((metric) => (
          <View key={metric.label} style={{ flexBasis: '46%', flexGrow: 1, minWidth: 120, backgroundColor: metric.prominent ? colors.surfaceElevated : colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: metric.prominent ? colors.primaryMuted : colors.divider, padding: spacing.md, gap: 2 }}>
            <Typography variant={metric.prominent ? 'display' : 'title'} color={metric.prominent ? 'primary' : 'textPrimary'}>{metric.value}</Typography>
            <Typography variant="caption" color="textSecondary" numberOfLines={2}>{metric.label}</Typography>
          </View>
        ))}
      </View>
    </View>
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
