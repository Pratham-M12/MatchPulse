import type { ProxyNormalizedArticle } from '@/lib/api/dto/newsDto';
import type { NewsItem } from '@/types/football';

/**
 * Map a single normalized proxy article to the app's NewsItem domain model.
 *
 * The proxy already validates and normalizes the GNews response, so the
 * mapping here is straightforward.
 */
export function mapProxyArticle(article: ProxyNormalizedArticle): NewsItem {
  return {
    id: article.id,
    title: article.title,
    source: article.source,
    publishedAt: article.publishedAt,
    summary: article.summary,
    url: article.url,
    imageUrl: article.imageUrl,
  };
}

export function mapProxyArticles(articles: ProxyNormalizedArticle[] | undefined): NewsItem[] {
  if (!articles || !Array.isArray(articles)) return [];
  return articles.filter((a) => Boolean(a && a.title)).map(mapProxyArticle);
}

// ---------------------------------------------------------------------------
// Legacy API-Football mappers — kept for reference but no longer called at
// runtime.  Safe to remove in a future cleanup phase.
// ---------------------------------------------------------------------------
import type { ApiNewsArticle } from '@/lib/api/dto/newsDto';

export function mapNewsArticle(article: ApiNewsArticle, index: number): NewsItem {
  return {
    id: article.id != null ? String(article.id) : `news-${index}-${article.title.slice(0, 20)}`,
    title: article.title,
    source: article.source || 'Football News',
    publishedAt: article.publishedAt || article.date || new Date().toISOString(),
    summary: article.summary || article.description || undefined,
    url: article.url || undefined,
    imageUrl: article.imageUrl || article.image || undefined,
  };
}

export function mapNewsArticles(articles: ApiNewsArticle[] | undefined): NewsItem[] {
  if (!articles || !Array.isArray(articles)) return [];
  return articles
    .filter((a) => Boolean(a && a.title))
    .map(mapNewsArticle);
}
