import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

type HomeHeaderProps = {
  onNotificationsPress?: () => void;
  unreadCount?: number;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomeHeader({ onNotificationsPress, unreadCount = 0 }: HomeHeaderProps) {
  const router = useRouter();

  return (
    <View style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Typography variant="heading">
            Match<Typography variant="heading" color="primary">Pulse</Typography>
          </Typography>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary }} />
            <Typography variant="overline" color="textSecondary">MATCH CENTRE</Typography>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <IconButton
            icon="search-outline"
            label="Search"
            onPress={() => router.push('/search')}
          />
          <View>
            <IconButton
              icon="notifications-outline"
              label="Notifications"
              onPress={onNotificationsPress ?? (() => router.push('/notifications'))}
            />
            {unreadCount > 0 ? (
              <View
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.live,
                }}
              />
            ) : null}
          </View>
        </View>
      </View>

      <Typography variant="title">{getGreeting()}</Typography>
      <Typography variant="body" color="textSecondary">
        Here&apos;s what&apos;s happening in football
      </Typography>
    </View>
  );
}

function IconButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: pressed ? colors.surfaceHighlight : colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <Ionicons name={icon} size={18} color={colors.textPrimary} />
    </Pressable>
  );
}
