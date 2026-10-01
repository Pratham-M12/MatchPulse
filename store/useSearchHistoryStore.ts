import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';

type SearchHistoryState = {
  recent: string[];
  push: (query: string) => void;
  clear: () => void;
};

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      recent: [],
      push: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set((state) => ({ recent: [trimmed, ...state.recent.filter((item) => item !== trimmed)].slice(0, 8) }));
      },
      clear: () => set({ recent: [] }),
    }),
    { name: 'matchpulse-search-history', storage: persistStorage }
  )
);
