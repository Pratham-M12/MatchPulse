import { useQuery } from '@tanstack/react-query';

import { newsStaleTime } from '@/lib/api/queryConfig';
import { queryKeys } from '@/lib/api/queryKeys';
import { footballRepository } from '@/lib/api/repository';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import type { NewsItem } from '@/types/football';

export function useFootballNews(limit = 10) {
  const dataSaver = usePreferencesStore((state) => state.dataSaver);

  return useQuery({
    queryKey: queryKeys.news,
    queryFn: async (): Promise<NewsItem[]> => {
      const articles = await footballRepository.news();
      return articles.slice(0, limit);
    },
    staleTime: newsStaleTime(dataSaver),
  });
}
