/**
 * DTO for external football news responses.
 *
 * Supported fields map cleanly into the NewsItem domain model.
 */
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
