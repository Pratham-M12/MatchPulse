/**
 * Deterministically maps a string (e.g. a team name) to a color from a
 * curated palette. Used for placeholder logos so the same team always
 * gets the same color, and different teams are visually distinguishable,
 * without needing real crest images yet.
 */
const PALETTE = [
  '#E63946',
  '#F4A261',
  '#2A9D8F',
  '#457B9D',
  '#8338EC',
  '#FF6B6B',
  '#4CC9F0',
  '#F72585',
  '#4361EE',
  '#06D6A0',
] as const;

export function colorFromString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

/** Up to 2 uppercase initials derived from a name, e.g. "Manchester City" -> "MC". */
export function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}