import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { usePreferencesStore } from '@/store/usePreferencesStore';

export async function hapticImpact(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (Platform.OS === 'web') return;
  if (!usePreferencesStore.getState().hapticsEnabled) return;
  try {
    await Haptics.impactAsync(style);
  } catch {
    // Haptics are optional.
  }
}

export async function hapticSelection() {
  if (Platform.OS === 'web') return;
  if (!usePreferencesStore.getState().hapticsEnabled) return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // ignore
  }
}

export async function hapticSuccess() {
  if (Platform.OS === 'web') return;
  if (!usePreferencesStore.getState().hapticsEnabled) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // ignore
  }
}
