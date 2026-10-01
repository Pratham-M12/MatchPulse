import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';
import type { NotificationInboxItem } from '@/types/football';

type InboxState = {
  items: NotificationInboxItem[];
  addItem: (item: Omit<NotificationInboxItem, 'id' | 'createdAt' | 'read'> & { id?: string }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
};

export const useInboxStore = create<InboxState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [
            {
              id: item.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              createdAt: new Date().toISOString(),
              read: false,
              ...item,
            },
            ...state.items,
          ].slice(0, 50),
        })),
      markRead: (id) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
        })),
      markAllRead: () => set((state) => ({ items: state.items.map((item) => ({ ...item, read: true })) })),
    }),
    { name: 'matchpulse-inbox', storage: persistStorage }
  )
);
