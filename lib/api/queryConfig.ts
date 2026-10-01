/**
 * Central React Query timings. Tuned for API-Football's scarce free-plan quota.
 * Data Saver stretches these further and disables live auto-refresh.
 */

export const QUERY_GC_TIME = 24 * 60 * 60_000;

export const staleTimes = {
  live: 60_000,
  liveSaver: 5 * 60_000,
  fixtures: 10 * 60_000,
  fixturesSaver: 30 * 60_000,
  detail: 90_000,
  detailSaver: 5 * 60_000,
  standings: 30 * 60_000,
  standingsSaver: 2 * 60 * 60_000,
  entity: 12 * 60 * 60_000,
  search: 10 * 60_000,
  news: 30 * 60_000,
  newsSaver: 60 * 60_000,
} as const;

export const livePollMs = {
  normal: 120_000,
  matchDetail: 30_000,
  saver: false as const,
};

export function fixtureStaleTime(dataSaver: boolean) {
  return dataSaver ? staleTimes.fixturesSaver : staleTimes.fixtures;
}

export function liveStaleTime(dataSaver: boolean) {
  return dataSaver ? staleTimes.liveSaver : staleTimes.live;
}

export function detailStaleTime(dataSaver: boolean) {
  return dataSaver ? staleTimes.detailSaver : staleTimes.detail;
}

export function newsStaleTime(dataSaver: boolean) {
  return dataSaver ? staleTimes.newsSaver : staleTimes.news;
}

export function standingsStaleTime(dataSaver: boolean) {
  return dataSaver ? staleTimes.standingsSaver : staleTimes.standings;
}

export interface LiveListPollingParams {
  poll?: boolean;
  focused?: boolean;
  dataSaver?: boolean;
  liveAutoRefresh?: boolean;
}

/**
 * Determines whether the Home/Matches live fixture list should poll.
 * Crucially, an empty live fixture list does NOT disable the next polling cycle.
 */
export function shouldPollLiveList(params: LiveListPollingParams): boolean {
  const poll = params.poll === true;
  const focused = params.focused !== false;
  const dataSaver = params.dataSaver === true;
  const liveAutoRefresh = params.liveAutoRefresh !== false;

  return poll && focused && !dataSaver && liveAutoRefresh;
}

export interface LiveMatchPollingParams {
  isLive?: boolean;
  focused?: boolean;
  dataSaver?: boolean;
  liveAutoRefresh?: boolean;
}

/**
 * Determines whether a live match detail screen should poll.
 * Only polls if the match is currently live, the screen is focused,
 * Data Saver is off, and live auto-refresh is enabled.
 */
export function shouldPollLiveMatch(params: LiveMatchPollingParams): boolean {
  const isLive = params.isLive === true;
  const focused = params.focused !== false;
  const dataSaver = params.dataSaver === true;
  const liveAutoRefresh = params.liveAutoRefresh !== false;

  return isLive && focused && !dataSaver && liveAutoRefresh;
}
