import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeaturedMatchCard } from '@/components/match/FeaturedMatchCard';
import { MatchCard } from '@/components/match/MatchCard';
import { LeagueCard } from '@/components/league/LeagueCard';
import { LeagueChip } from '@/components/league/LeagueChip';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { MatchScore } from '@/components/ui/MatchScore';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { StatRow } from '@/components/ui/StatRow';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';
import type { Match, Team } from '@/types/football';

/**
 * /dev — component showcase.
 *
 * Sample data below exists ONLY to preview components in isolation and is
 * intentionally separate from the app's real mock dataset (a later
 * milestone). Not linked from any tab — visit by typing /dev in the URL
 * bar (web) or navigating there manually during development.
 */

const liverpool: Team = { id: 't1', name: 'Liverpool', shortName: 'LIV' };
const arsenal: Team = { id: 't2', name: 'Arsenal', shortName: 'ARS' };
const barcelona: Team = { id: 't3', name: 'Barcelona', shortName: 'BAR' };
const realMadrid: Team = { id: 't4', name: 'Real Madrid', shortName: 'RMA' };

const featuredMatch: Match = {
  id: 'm1',
  competition: { id: 'c1', name: 'UEFA Champions League', shortName: 'UCL' },
  homeTeam: liverpool,
  awayTeam: arsenal,
  homeScore: 2,
  awayScore: 1,
  status: 'live',
  minute: 78,
  kickoff: new Date().toISOString(),
  venue: 'Anfield',
};

const upcomingMatch: Match = {
  id: 'm2',
  competition: { id: 'c2', name: 'La Liga', shortName: 'LALIGA' },
  homeTeam: barcelona,
  awayTeam: realMadrid,
  status: 'scheduled',
  kickoff: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
};

function ShowcaseSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.md }}>
      <Typography variant="overline" color="primary">
        {title}
      </Typography>
      {children}
    </View>
  );
}

export default function ComponentShowcaseScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: spacing.base, gap: spacing.xl }}>
        <Typography variant="heading">Component Showcase</Typography>

        <ShowcaseSection title="SectionTitle">
          <SectionTitle title="Live Matches" actionLabel="See all" onActionPress={() => {}} />
        </ShowcaseSection>

        <ShowcaseSection title="FeaturedMatchCard">
          <FeaturedMatchCard match={featuredMatch} onPress={() => {}} />
        </ShowcaseSection>

        <ShowcaseSection title="MatchCard">
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <MatchCard match={featuredMatch} onPress={() => {}} />
            <MatchCard match={upcomingMatch} onPress={() => {}} />
          </View>
        </ShowcaseSection>

        <ShowcaseSection title="TeamLogo">
          <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
            <TeamLogo team={liverpool} size={24} />
            <TeamLogo team={arsenal} size={40} />
            <TeamLogo team={barcelona} size={56} />
          </View>
        </ShowcaseSection>

        <ShowcaseSection title="TeamBadge">
          <TeamBadge team={liverpool} />
          <TeamBadge team={arsenal} align="right" />
        </ShowcaseSection>

        <ShowcaseSection title="MatchScore">
          <View style={{ flexDirection: 'row', gap: spacing.xl }}>
            <MatchScore homeScore={2} awayScore={1} status="live" />
            <MatchScore status="scheduled" />
          </View>
        </ShowcaseSection>

        <ShowcaseSection title="LiveIndicator">
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <LiveIndicator />
            <LiveIndicator minute={45} />
          </View>
        </ShowcaseSection>

        <ShowcaseSection title="LeagueChip">
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <LeagueChip competition={featuredMatch.competition} selected onPress={() => {}} />
            <LeagueChip competition={upcomingMatch.competition} onPress={() => {}} />
          </View>
        </ShowcaseSection>

        <ShowcaseSection title="LeagueCard">
          <LeagueCard
            league={{ ...featuredMatch.competition, country: 'Europe', matchCount: 8 }}
            onPress={() => {}}
          />
        </ShowcaseSection>

        <ShowcaseSection title="StatRow">
          <StatRow label="Possession" homeValue={54} awayValue={46} suffix="%" />
          <StatRow label="Shots on target" homeValue={6} awayValue={3} />
        </ShowcaseSection>
      </ScrollView>
    </SafeAreaView>
  );
}