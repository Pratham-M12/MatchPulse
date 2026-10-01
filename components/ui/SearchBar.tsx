import { Ionicons } from '@expo/vector-icons';
import { Pressable, TextInput, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onClear?: () => void;
  onSubmitEditing?: () => void;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search teams, leagues, players',
  autoFocus,
  onClear,
  onSubmitEditing,
}: SearchBarProps) {
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: 44,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.divider,
      }}
    >
      <Ionicons name="search" size={18} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
        accessibilityLabel="Search"
        style={{ flex: 1, color: colors.textPrimary, paddingVertical: spacing.sm, fontSize: 15 }}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={({ pressed }) => ({
            padding: 2,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}
