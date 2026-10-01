import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';
import type { TimeFormatPref } from '@/lib/format/datetime';

type AppearancePref = 'dark';

type PreferencesState = {
  notificationsEnabled: boolean;
  matchRemindersEnabled: boolean;
  timeFormat: TimeFormatPref;
  dateFormat: 'relative' | 'absolute';
  liveAutoRefresh: boolean;
  dataSaver: boolean;
  hapticsEnabled: boolean;
  appearance: AppearancePref;
  toggleNotifications: () => void;
  toggleMatchReminders: () => void;
  setTimeFormat: (value: TimeFormatPref) => void;
  setDateFormat: (value: 'relative' | 'absolute') => void;
  toggleLiveAutoRefresh: () => void;
  toggleDataSaver: () => void;
  toggleHaptics: () => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      matchRemindersEnabled: true,
      timeFormat: '24h',
      dateFormat: 'relative',
      liveAutoRefresh: true,
      dataSaver: false,
      hapticsEnabled: true,
      appearance: 'dark',
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      toggleMatchReminders: () => set((state) => ({ matchRemindersEnabled: !state.matchRemindersEnabled })),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      toggleLiveAutoRefresh: () => set((state) => ({ liveAutoRefresh: !state.liveAutoRefresh })),
      toggleDataSaver: () => set((state) => ({ dataSaver: !state.dataSaver })),
      toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
    }),
    {
      name: 'matchpulse-preferences',
      storage: persistStorage,
    }
  )
);
