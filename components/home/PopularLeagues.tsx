import { ScrollView } from 'react-native';

import { LeagueChip } from '@/components/league/LeagueChip';
import { spacing } from '@/theme';
import type { Competition } from '@/types/football';

type PopularLeaguesProps = {
  leagues: Competition[];
  selectedLeagueId?: string;
  onSelectLeague?: (league: Competition) => void;
};

/**
 * Horizontal, scrollable row of league chips for the Home Screen's
 * "Popular Leagues" section.
 */
export function PopularLeagues({ leagues, selectedLeagueId, onSelectLeague }: PopularLeaguesProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.xs,
        paddingLeft: spacing.base,
        paddingRight: spacing['3xl'],
      }}
    >
      {leagues.map((league) => (
        <LeagueChip
          key={league.id}
          competition={league}
          selected={league.id === selectedLeagueId}
          onPress={() => onSelectLeague?.(league)}
        />
      ))}
    </ScrollView>
  );
}
