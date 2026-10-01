/**
 * API-Football's fixtures endpoint gives a team's full name but no
 * short code. Derives a 3-letter abbreviation as a reasonable stand-in
 * (e.g. "Manchester City" -> "MAN") — not as precise as a real official
 * team code, but good enough for compact UI labels like MatchScore.
 */
export function deriveShortName(fullName: string): string {
  const firstWord = fullName.trim().split(/\s+/)[0] ?? fullName;
  return firstWord.slice(0, 3).toUpperCase();
}