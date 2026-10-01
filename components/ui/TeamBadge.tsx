import { View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { spacing } from '@/theme';
import type { Team } from '@/types/football';

type TeamBadgeProps = {
  team: Team;
  /** 'left' puts the logo before the name, 'right' puts it after. */
  align?: 'left' | 'right';
  size?: number;
  /** Use the short name (e.g. "MCI") instead of the full name. */
  useShortName?: boolean;
};

/**
 * A team's logo paired with its name. `align="right"` flips the order so
 * an away team's badge can mirror a home team's badge in a row layout.
 */
export function TeamBadge({ team, align = 'left', size = 28, useShortName = false }: TeamBadgeProps) {
  const label = useShortName ? team.shortName : team.name;

  const logo = <TeamLogo team={team} size={size} />;
  const name = (
    <Typography variant="body" numberOfLines={1} style={{ flexShrink: 1 }}>
      {label}
    </Typography>
  );

  return (
    <View
      style={{
        flexDirection: align === 'right' ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flexShrink: 1,
      }}
    >
      {logo}
      {name}
    </View>
  );
}