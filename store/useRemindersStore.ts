import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';

type Reminder = {
  notificationId: string;
  kickoff: string;
};

type RemindersState = {
  reminders: Record<string, Reminder>;
  setReminder: (matchId: string, notificationId: string, kickoff: string) => void;
  clearReminder: (matchId: string) => void;
};

export const useRemindersStore = create<RemindersState>()(
  persist(
    (set) => ({
      reminders: {},
      setReminder: (matchId, notificationId, kickoff) =>
        set((state) => ({ reminders: { ...state.reminders, [matchId]: { notificationId, kickoff } } })),
      clearReminder: (matchId) =>
        set((state) => {
          const next = { ...state.reminders };
          delete next[matchId];
          return { reminders: next };
        }),
    }),
    { name: 'matchpulse-reminders', storage: persistStorage }
  )
);

export const useHasReminder = (matchId: string) =>
  useRemindersStore((state) => Boolean(state.reminders[matchId]));
