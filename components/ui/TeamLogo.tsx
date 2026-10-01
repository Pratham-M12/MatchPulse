import { useState } from 'react';
import { Image, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colorFromString, initialsFromName } from '@/lib/colorFromString';
import type { Team } from '@/types/football';

type TeamLogoProps = {
  team: Team;
  /** Diameter in pixels. Defaults to 32. */
  size?: number;
};

/**
 * Renders a team's crest. Uses `team.logoUrl` when available; otherwise
 * falls back to a colored circle with the team's initials, so this
 * component works identically once real API logos are wired in.
 */
export function TeamLogo({ team, size = 32 }: TeamLogoProps) {
  const [hasImageError, setHasImageError] = useState(false);

  if (team.logoUrl && !hasImageError) {
    return (
      <Image
        source={{ uri: team.logoUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="contain"
        accessibilityLabel={`${team.name} logo`}
        onError={() => setHasImageError(true)}
      />
    );
  }

  const backgroundColor = team.color ?? colorFromString(team.name);

  return (
    <View
      accessibilityLabel={`${team.name} logo`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        color="textPrimary"
        style={{
          fontSize: size * 0.38,
          lineHeight: size * 0.42,
          fontWeight: '700',
        }}
      >
        {initialsFromName(team.shortName || team.name)}
      </Typography>
    </View>
  );
}
