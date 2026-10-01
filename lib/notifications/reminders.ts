import { Platform } from 'react-native';

import type { Match } from '@/types/football';
import { useInboxStore } from '@/store/useInboxStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { useRemindersStore } from '@/store/useRemindersStore';

const LEAD_MS = 15 * 60_000;

type NotificationsModule = typeof import('expo-notifications');

let notifications: NotificationsModule | null = null;

async function nativeNotifications(): Promise<NotificationsModule | null> {
  if (Platform.OS === 'web') return null;
  if (notifications) return notifications;
  notifications = await import('expo-notifications');
  return notifications;
}

export async function configureNotifications() {
  const Notifications = await nativeNotifications();
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('matchpulse', {
      name: 'MatchPulse',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = await nativeNotifications();
  if (!Notifications) return false;

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleMatchReminder(match: Match): Promise<{ ok: boolean; reason?: string }> {
  const prefs = usePreferencesStore.getState();
  if (!prefs.notificationsEnabled || !prefs.matchRemindersEnabled) {
    return { ok: false, reason: 'Reminders are disabled in Settings.' };
  }

  const fireAt = new Date(match.kickoff).getTime() - LEAD_MS;
  if (fireAt <= Date.now()) {
    return { ok: false, reason: 'This match is too close to kickoff to remind.' };
  }

  const Notifications = await nativeNotifications();
  if (!Notifications) {
    useRemindersStore.getState().setReminder(match.id, 'local-web', match.kickoff);
    useInboxStore.getState().addItem({
      title: 'Reminder saved',
      body: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName} — local reminder (notifications unavailable on web).`,
      kind: 'match_reminder',
      href: `/match/${match.id}`,
    });
    return { ok: true };
  }

  const granted = await requestNotificationPermission();
  if (!granted) {
    useRemindersStore.getState().setReminder(match.id, 'permission-denied', match.kickoff);
    useInboxStore.getState().addItem({
      title: 'Reminder saved on device',
      body: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName} is saved. Enable notifications to get an alert.`,
      kind: 'match_reminder',
      href: `/match/${match.id}`,
    });
    return { ok: true, reason: 'saved-without-permission' };
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'MatchPulse — kickoff soon',
      body: `${match.homeTeam.name} vs ${match.awayTeam.name} · ${match.competition.shortName ?? match.competition.name}`,
      data: { href: `/match/${match.id}` },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(fireAt),
    },
  });

  useRemindersStore.getState().setReminder(match.id, identifier, match.kickoff);
  useInboxStore.getState().addItem({
    title: 'Reminder set',
    body: `We'll ping you 15 minutes before ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}.`,
    kind: 'match_reminder',
    href: `/match/${match.id}`,
  });
  return { ok: true };
}

export async function cancelMatchReminder(matchId: string) {
  const existing = useRemindersStore.getState().reminders[matchId];
  const Notifications = await nativeNotifications();
  if (existing && Notifications && existing.notificationId !== 'local-web' && existing.notificationId !== 'permission-denied') {
    await Notifications.cancelScheduledNotificationAsync(existing.notificationId);
  }
  useRemindersStore.getState().clearReminder(matchId);
}

export function subscribeNotificationResponses(onOpen: (href?: string) => void) {
  if (Platform.OS === 'web') return () => undefined;
  let subscription: { remove: () => void } | undefined;
  nativeNotifications().then((Notifications) => {
    if (!Notifications) return;
    subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const href = response.notification.request.content.data?.href;
      onOpen(typeof href === 'string' ? href : undefined);
    });
  });
  return () => subscription?.remove();
}
