/** European club season year (the year the season starts). */
export function getCurrentSeason(now = new Date()): number {
  const month = now.getMonth();
  return month >= 6 ? now.getFullYear() : now.getFullYear() - 1;
}

export function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function localIsoDateOffset(offsetDays: number, now = new Date()): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays);
  return toLocalIsoDate(date);
}
