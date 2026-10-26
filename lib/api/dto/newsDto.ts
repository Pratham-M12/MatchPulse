/**
 * DTOs for football news responses.
 *
 * ApiNewsArticle / ApiNewsResponse — legacy API-Football shape (kept for
 * reference and potential mapper reuse).
 *
 * ProxyNormalizedArticle / ProxyNewsResponse — shape returned by the
 * MatchPulse GNews proxy (services/news-proxy/).  This is the shape that
 * newsService.ts and mapNews.ts now consume.
 */

// ---------------------------------------------------------------------------
// Legacy API-Football shape (no longer used at runtime; kept for reference)
// ---------------------------------------------------------------------------
export type ApiNewsArticle = {
  id?: string | number;
  title: string;
  url?: string;
  date?: string;
  publishedAt?: string;
  source?: string;
  image?: string;
  imageUrl?: string;
  summary?: string;
  description?: string;
};

export type ApiNewsResponse = {
  get?: string;
  parameters?: Record<string, unknown>;
  errors?: Record<string, string> | unknown[];
  results?: number;
  response?: ApiNewsArticle[];
};

// ---------------------------------------------------------------------------
// GNews proxy shape (active)
// ---------------------------------------------------------------------------

/** Normalized article returned by the MatchPulse GNews proxy. */
export type ProxyNormalizedArticle = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  summary?: string;
  url: string;
  imageUrl?: string;
};

/** Top-level response envelope from the GNews proxy /api/news endpoint. */
export type ProxyNewsResponse = {
  articles: ProxyNormalizedArticle[];
};
