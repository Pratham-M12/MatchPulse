import type { MatchDetails } from '@/types/football';

/**
 * Timeline events and statistics for matches that have kicked off
 * (live or finished). Scheduled matches intentionally have no entry
 * here — there's nothing to show yet, and the Match Details screen
 * handles that case by hiding the Timeline/Statistics sections.
 *
 * Keyed by match id from data/matches.ts.
 */
export const matchDetails: Record<string, MatchDetails> = {
  // Liverpool 2-1 Arsenal, live 78'
  'm-1': {
    events: [
      { id: 'e1', minute: 12, type: 'goal', team: 'home', player: 'R. Costa' },
      { id: 'e2', minute: 34, type: 'yellow_card', team: 'away', player: 'D. Fischer' },
      { id: 'e3', minute: 58, type: 'goal', team: 'away', player: 'A. Moreno' },
      { id: 'e4', minute: 71, type: 'goal', team: 'home', player: 'T. Sinclair' },
      { id: 'e5', minute: 75, type: 'substitution', team: 'home', player: 'J. Reyes', detail: 'On for R. Costa' },
    ],
    stats: {
      possessionHome: 54,
      possessionAway: 46,
      shotsHome: 14,
      shotsAway: 9,
      shotsOnTargetHome: 6,
      shotsOnTargetAway: 4,
      cornersHome: 7,
      cornersAway: 3,
      foulsHome: 8,
      foulsAway: 11,
      yellowCardsHome: 1,
      yellowCardsAway: 2,
      redCardsHome: 0,
      redCardsAway: 0,
    },
  },

  // Manchester City 3-2 Chelsea, live 64'
  'm-2': {
    events: [
      { id: 'e1', minute: 9, type: 'goal', team: 'home', player: 'K. Osei' },
      { id: 'e2', minute: 22, type: 'goal', team: 'away', player: 'M. Novak' },
      { id: 'e3', minute: 35, type: 'yellow_card', team: 'home', player: 'B. Duarte' },
      { id: 'e4', minute: 47, type: 'goal', team: 'home', player: 'K. Osei', detail: 'Second of the match' },
      { id: 'e5', minute: 55, type: 'goal', team: 'away', player: 'S. Baptiste' },
      { id: 'e6', minute: 60, type: 'goal', team: 'home', player: 'L. Almeida' },
    ],
    stats: {
      possessionHome: 58,
      possessionAway: 42,
      shotsHome: 16,
      shotsAway: 10,
      shotsOnTargetHome: 8,
      shotsOnTargetAway: 5,
      cornersHome: 6,
      cornersAway: 4,
      foulsHome: 10,
      foulsAway: 9,
      yellowCardsHome: 2,
      yellowCardsAway: 1,
      redCardsHome: 0,
      redCardsAway: 0,
    },
  },

  // Bayern Munich 1-0 Dortmund, live 12'
  'm-3': {
    events: [{ id: 'e1', minute: 9, type: 'goal', team: 'home', player: 'F. Wagner' }],
    stats: {
      possessionHome: 61,
      possessionAway: 39,
      shotsHome: 3,
      shotsAway: 1,
      shotsOnTargetHome: 2,
      shotsOnTargetAway: 0,
      cornersHome: 2,
      cornersAway: 0,
      foulsHome: 1,
      foulsAway: 2,
      yellowCardsHome: 0,
      yellowCardsAway: 0,
      redCardsHome: 0,
      redCardsAway: 0,
    },
  },

  // Inter Milan 2-2 Napoli, finished
  'm-10': {
    events: [
      { id: 'e1', minute: 15, type: 'goal', team: 'home', player: 'G. Marchetti' },
      { id: 'e2', minute: 28, type: 'goal', team: 'away', player: 'E. Conti' },
      { id: 'e3', minute: 63, type: 'goal', team: 'home', player: 'P. Romano' },
      { id: 'e4', minute: 77, type: 'goal', team: 'away', player: 'E. Conti', detail: 'Second of the match' },
      { id: 'e5', minute: 84, type: 'yellow_card', team: 'home', player: 'N. Greco' },
    ],
    stats: {
      possessionHome: 49,
      possessionAway: 51,
      shotsHome: 12,
      shotsAway: 13,
      shotsOnTargetHome: 5,
      shotsOnTargetAway: 6,
      cornersHome: 5,
      cornersAway: 6,
      foulsHome: 12,
      foulsAway: 10,
      yellowCardsHome: 2,
      yellowCardsAway: 1,
      redCardsHome: 0,
      redCardsAway: 0,
    },
  },

  // RB Leipzig 0-1 Bayer Leverkusen, finished
  'm-11': {
    events: [
      { id: 'e1', minute: 39, type: 'goal', team: 'away', player: 'H. Brandt' },
      { id: 'e2', minute: 66, type: 'yellow_card', team: 'home', player: 'J. Keller' },
      { id: 'e3', minute: 90, type: 'yellow_card', team: 'away', player: 'S. Volkov' },
    ],
    stats: {
      possessionHome: 47,
      possessionAway: 53,
      shotsHome: 8,
      shotsAway: 11,
      shotsOnTargetHome: 3,
      shotsOnTargetAway: 5,
      cornersHome: 3,
      cornersAway: 6,
      foulsHome: 9,
      foulsAway: 8,
      yellowCardsHome: 1,
      yellowCardsAway: 1,
      redCardsHome: 0,
      redCardsAway: 0,
    },
  },

  // Monaco 3-1 Lyon, finished
  'm-12': {
    events: [
      { id: 'e1', minute: 8, type: 'goal', team: 'home', player: 'Y. Traore' },
      { id: 'e2', minute: 21, type: 'goal', team: 'away', player: 'P. Girard' },
      { id: 'e3', minute: 44, type: 'goal', team: 'home', player: 'Y. Traore', detail: 'Second of the match' },
      { id: 'e4', minute: 70, type: 'yellow_card', team: 'away', player: 'M. Lefevre' },
      { id: 'e5', minute: 85, type: 'goal', team: 'home', player: 'C. Bernard' },
    ],
    stats: {
      possessionHome: 55,
      possessionAway: 45,
      shotsHome: 15,
      shotsAway: 8,
      shotsOnTargetHome: 7,
      shotsOnTargetAway: 3,
      cornersHome: 8,
      cornersAway: 2,
      foulsHome: 7,
      foulsAway: 9,
      yellowCardsHome: 0,
      yellowCardsAway: 1,
      redCardsHome: 0,
      redCardsAway: 0,
    },
  },
};

export function getMatchDetailsById(matchId: string): MatchDetails | undefined {
  return matchDetails[matchId];
}