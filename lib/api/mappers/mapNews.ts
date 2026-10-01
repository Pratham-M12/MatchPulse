import type { ApiNewsArticle } from '@/lib/api/dto/newsDto';
import type { NewsItem } from '@/types/football';

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
