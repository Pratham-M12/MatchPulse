import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

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
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, minWidth: 0 }}>
          <View style={{ width: 4, height: 34, borderRadius: radius.pill, backgroundColor: colors.primary }} />
          <View style={{ gap: 2, minWidth: 0 }}>
            <Typography variant="overline" color="primary">MATCH CENTRE</Typography>
            <Typography variant="heading" numberOfLines={1}>
              Match<Typography variant="heading" color="primary">Pulse</Typography>
            </Typography>
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

      <View style={{ gap: 2 }}>
        <Typography variant="title">{getGreeting()}</Typography>
        <Typography variant="caption" color="textSecondary">Here&apos;s what&apos;s happening in football</Typography>
      </View>
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
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: pressed ? colors.surfaceHighlight : colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <Ionicons name={icon} size={20} color={colors.textPrimary} />
    </Pressable>
  );
}
