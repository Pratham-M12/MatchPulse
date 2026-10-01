import type { Team } from '@/types/football';

/**
 * Mock team roster. Grouped by league purely for readability here — the
 * flat `allTeams` export and `teams` lookup object are what other files
 * actually use, so no component ever needs to know which league a team
 * belongs to just to render it.
 */
export const teams = {
  // Premier League
  liverpool: { id: 't-liv', name: 'Liverpool', shortName: 'LIV', country: 'England' },
  arsenal: { id: 't-ars', name: 'Arsenal', shortName: 'ARS', country: 'England' },
  manCity: { id: 't-mci', name: 'Manchester City', shortName: 'MCI', country: 'England' },
  chelsea: { id: 't-che', name: 'Chelsea', shortName: 'CHE', country: 'England' },
  manUnited: { id: 't-mun', name: 'Manchester United', shortName: 'MUN', country: 'England' },
  tottenham: { id: 't-tot', name: 'Tottenham Hotspur', shortName: 'TOT', country: 'England' },

  // La Liga
  barcelona: { id: 't-bar', name: 'Barcelona', shortName: 'BAR', country: 'Spain' },
  realMadrid: { id: 't-rma', name: 'Real Madrid', shortName: 'RMA', country: 'Spain' },
  atleticoMadrid: { id: 't-atm', name: 'Atletico Madrid', shortName: 'ATM', country: 'Spain' },
  sevilla: { id: 't-sev', name: 'Sevilla', shortName: 'SEV', country: 'Spain' },

  // Bundesliga
  bayern: { id: 't-bay', name: 'Bayern Munich', shortName: 'BAY', country: 'Germany' },
  dortmund: { id: 't-bvb', name: 'Borussia Dortmund', shortName: 'BVB', country: 'Germany' },
  leipzig: { id: 't-rbl', name: 'RB Leipzig', shortName: 'RBL', country: 'Germany' },
  leverkusen: { id: 't-b04', name: 'Bayer Leverkusen', shortName: 'B04', country: 'Germany' },

  // Serie A
  juventus: { id: 't-juv', name: 'Juventus', shortName: 'JUV', country: 'Italy' },
  acMilan: { id: 't-mil', name: 'AC Milan', shortName: 'MIL', country: 'Italy' },
  interMilan: { id: 't-int', name: 'Inter Milan', shortName: 'INT', country: 'Italy' },
  napoli: { id: 't-nap', name: 'Napoli', shortName: 'NAP', country: 'Italy' },

  // Ligue 1
  psg: { id: 't-psg', name: 'Paris Saint-Germain', shortName: 'PSG', country: 'France' },
  marseille: { id: 't-om', name: 'Marseille', shortName: 'OM', country: 'France' },
  monaco: { id: 't-asm', name: 'Monaco', shortName: 'ASM', country: 'France' },
  lyon: { id: 't-ol', name: 'Lyon', shortName: 'OL', country: 'France' },

  // International (for World Cup mock fixtures)
  brazil: { id: 't-bra', name: 'Brazil', shortName: 'BRA', country: 'Brazil' },
  argentina: { id: 't-arg', name: 'Argentina', shortName: 'ARG', country: 'Argentina' },
} as const satisfies Record<string, Team>;

export const allTeams: Team[] = Object.values(teams);

export function getTeamById(id: string): Team | undefined {
  return allTeams.find((team) => team.id === id);
}