import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Typography } from '@/components/ui/Typography';
import { formatKickoffShort } from '@/lib/format/datetime';
import { useInboxStore } from '@/store/useInboxStore';
import { colors, radius, spacing } from '@/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const items = useInboxStore((state) => state.items);
  const markRead = useInboxStore((state) => state.markRead);
  const markAllRead = useInboxStore((state) => state.markAllRead);

  return (
    <AppScreen edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: spacing.base, gap: spacing.lg, paddingBottom: spacing['4xl'] }}>
        <ScreenHeader title="Inbox" right={items.length ? <Pressable onPress={markAllRead}><Typography color="primary">Read all</Typography></Pressable> : undefined} />
        <Typography variant="body" color="textSecondary">
          Local alerts only — MatchPulse does not send server push until a backend exists.
        </Typography>
        {items.length === 0 ? (
          <EmptyState title="You're up to date" message="Match reminders and matchday notes will land here." />
        ) : (
          items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                markRead(item.id);
                if (item.href) router.push(item.href as never);
              }}
              style={{
                padding: spacing.md,
                backgroundColor: item.read ? colors.surface : colors.surfaceElevated,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: item.read ? colors.divider : colors.primaryMuted,
                gap: 4,
              }}
            >
              <Typography variant="label">{item.title}</Typography>
              <Typography variant="body" color="textSecondary">{item.body}</Typography>
              <Typography variant="caption" color="textDisabled">{formatKickoffShort(item.createdAt)}</Typography>
            </Pressable>
          ))
        )}
      </ScrollView>
    </AppScreen>
  );
}
