import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { hapticSuccess } from '@/lib/haptics';
import { colors } from '@/theme';

type FavoriteButtonProps = {
  favorited: boolean;
  onToggle: () => void;
  size?: number;
};

export function FavoriteButton({ favorited, onToggle, size = 22 }: FavoriteButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={() => {
        scale.value = withSpring(1.12, { damping: 12 });
        void hapticSuccess();
        onToggle();
      }}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={favorited ? 'Remove from favorites' : 'Add to favorites'}
      accessibilityState={{ selected: favorited }}
      style={{
        width: size + 14,
        height: size + 14,
        borderRadius: (size + 14) / 2,
        backgroundColor: favorited ? colors.primarySubtle : colors.surface,
        borderWidth: 1,
        borderColor: favorited ? colors.primaryMuted : colors.divider,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={favorited ? 'star' : 'star-outline'}
          size={size}
          color={favorited ? colors.primary : colors.textSecondary}
        />
      </Animated.View>
    </Pressable>
  );
}
