import type { GNewsArticleRaw, NormalizedArticle } from './types';

/**
 * Validates that a URL is well-formed and restricted to http/https protocols.
 * Explicitly rejects javascript:, data:, file:, and other unsafe schemes.
 */
export function isValidHttpUrl(urlString: unknown): boolean {
  if (typeof urlString !== 'string' || !urlString.trim()) {
    return false;
  }
  try {
    const parsed = new URL(urlString.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates that a string is a parseable date.
 */
export function isValidIsoDate(dateString: unknown): boolean {
  if (typeof dateString !== 'string' || !dateString.trim()) {
    return false;
  }
  const timestamp = Date.parse(dateString.trim());
  return !isNaN(timestamp) && timestamp > 0;
}

/**
 * Generates a fast, deterministic 32-bit FNV-1a hex hash for stable fallback IDs.
 */
export function hashString(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Resolves a stable article identifier using either the provider's ID
 * or a deterministic hash of the normalized canonical URL.
 */
export function resolveStableId(rawId: unknown, canonicalUrl: string): string {
  if (typeof rawId === 'string' && rawId.trim().length > 0) {
    return rawId.trim();
  }
  if (typeof rawId === 'number' && Number.isFinite(rawId)) {
    return String(rawId);
  }
  return `gnews-${hashString(canonicalUrl.toLowerCase().trim())}`;
}

/**
 * Normalizes raw upstream GNews articles into the typed MatchPulse contract.
 * Rejects malformed items, invalid dates, and unsafe URLs.
 */
export function normalizeGNewsArticles(rawArticles: unknown): NormalizedArticle[] {
  if (!Array.isArray(rawArticles)) {
    return [];
  }

  const normalized: NormalizedArticle[] = [];

  for (const item of rawArticles) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const raw = item as GNewsArticleRaw;

    // 1. Validate required title
    if (typeof raw.title !== 'string' || !raw.title.trim()) {
      continue;
    }
    const title = raw.title.trim();

    // 2. Validate required, safe HTTP/HTTPS URL
    if (!isValidHttpUrl(raw.url)) {
      continue;
    }
    const url = (raw.url as string).trim();

    // 3. Validate required publication timestamp
    if (!isValidIsoDate(raw.publishedAt)) {
      continue;
    }
    const publishedAt = new Date((raw.publishedAt as string).trim()).toISOString();

    // 4. Source resolution
    let sourceName = 'Football News';
    if (typeof raw.source === 'object' && raw.source !== null && typeof raw.source.name === 'string' && raw.source.name.trim()) {
      sourceName = raw.source.name.trim();
    } else if (typeof raw.source === 'string' && raw.source.trim()) {
      sourceName = raw.source.trim();
    }

    // 5. Short summary / excerpt (bounded length, no full article scraping)
    let summary: string | undefined;
    if (typeof raw.description === 'string' && raw.description.trim()) {
      const trimmed = raw.description.trim();
      summary = trimmed.length > 500 ? trimmed.slice(0, 497) + '...' : trimmed;
    }

    // 6. Optional safe image URL
    let imageUrl: string | undefined;
    if (isValidHttpUrl(raw.image)) {
      imageUrl = (raw.image as string).trim();
    }

    // 7. Stable ID
    const id = resolveStableId(raw.id, url);

    normalized.push({
      id,
      title,
      source: sourceName,
      publishedAt,
      summary,
      url,
      imageUrl,
    });
  }

  return normalized;
}
