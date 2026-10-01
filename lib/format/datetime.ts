export type TimeFormatPref = '12h' | '24h';

export function formatKickoffTime(iso: string, timeFormat: TimeFormatPref = '24h'): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: timeFormat === '12h',
  });
}

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatMatchDay(iso: string, style: 'relative' | 'absolute' = 'relative'): string {
  const date = startOfLocalDay(new Date(iso));
  if (style === 'absolute') {
    return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  }
  const today = startOfLocalDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
  if (date.getTime() === yesterday.getTime()) return 'Yesterday';

  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatKickoffShort(iso: string, timeFormat: TimeFormatPref = '24h', dateStyle: 'relative' | 'absolute' = 'relative'): string {
  return `${formatMatchDay(iso, dateStyle)} · ${formatKickoffTime(iso, timeFormat)}`;
}

export function formatCountdown(iso: string, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now;
  if (diff <= 0) return 'Kickoff';
  const minutes = Math.round(diff / 60_000);
  if (minutes < 90) return `In ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 36) return `In ${hours}h`;
  const days = Math.round(hours / 24);
  return `In ${days}d`;
}

export function formatLastUpdated(timestamp?: number, now = Date.now()): string | undefined {
  if (!timestamp) return undefined;
  const minutes = Math.max(0, Math.round((now - timestamp) / 60_000));
  if (minutes < 1) return 'Updated just now';
  if (minutes === 1) return 'Updated 1 min ago';
  if (minutes < 60) return `Updated ${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours === 1 ? 'Updated 1 hour ago' : `Updated ${hours} hours ago`;
}

export function formatMatchStatus(params: {
  status: string;
  minute?: number;
  kickoff: string;
  timeFormat?: TimeFormatPref;
}): string {
  if (params.status === 'live') return params.minute !== undefined ? `LIVE ${params.minute}'` : 'LIVE';
  if (params.status === 'finished') return 'FT';
  if (params.status === 'postponed') return 'Postponed';
  if (params.status === 'cancelled') return 'Cancelled';
  return formatKickoffTime(params.kickoff, params.timeFormat);
}

export function sameCalendarDay(iso: string, offset: number): boolean {
  const target = startOfLocalDay(new Date());
  target.setDate(target.getDate() + offset);
  return startOfLocalDay(new Date(iso)).getTime() === target.getTime();
}
