export interface Env {
  GNEWS_API_KEY?: string;
}

export interface GNewsSourceRaw {
  id?: string;
  name?: string;
  url?: string;
  country?: string;
}

export interface GNewsArticleRaw {
  id?: string | number;
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  lang?: string;
  source?: GNewsSourceRaw | string;
}

export interface GNewsResponseRaw {
  totalArticles?: number;
  articles?: GNewsArticleRaw[];
  errors?: unknown;
}

export interface NormalizedArticle {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  summary?: string;
  url: string;
  imageUrl?: string;
}

export interface NormalizedNewsResponse {
  articles: NormalizedArticle[];
}
