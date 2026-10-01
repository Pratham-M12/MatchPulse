import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { hapticSelection } from '@/lib/haptics';
import { colors, radius } from '@/theme';

type SegmentedControlProps = {
  options: Array<{ id: string; label: string; live?: boolean }>;
  value: string;
  onChange: (id: string) => void;
};

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: radius.lg,
        padding: 4,
      }}
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <View
            key={option.id}
            style={{
              flex: 1,
              flexGrow: 1,
              flexBasis: 0,
              minWidth: 0,
            }}
          >
            <Pressable
              onPress={() => {
                void hapticSelection();
                onChange(option.id);
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={option.label}
              style={({ pressed }) => ({
                width: '100%',
                minHeight: 42,
                paddingHorizontal: 4,
                borderRadius: radius.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? colors.surfaceHighlight : colors.transparent,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                {option.live ? (
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.live }} />
                ) : null}
                <Typography
                  variant="overline"
                  color={active ? 'textPrimary' : 'textSecondary'}
                  style={{ fontSize: 12, letterSpacing: 0.3 }}
                >
                  {option.label}
                </Typography>
              </View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
