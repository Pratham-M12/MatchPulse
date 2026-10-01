import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';

type SectionTitleProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

/**
 * Heading used above each Home Screen section (e.g. "Live Matches").
 * Pass `actionLabel` + `onActionPress` for an optional "See all" link.
 */
export function SectionTitle({ title, actionLabel, onActionPress }: SectionTitleProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="overline" color="textSecondary">{title}</Typography>
      {actionLabel ? (
        <Pressable onPress={onActionPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${actionLabel} ${title}`}>
          <Typography variant="label" color="primary">
            {actionLabel}
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
}
