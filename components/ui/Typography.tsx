import { Text, type TextProps } from 'react-native';
import { colors, typography, type TypographyVariant, type ColorToken } from '@/theme';

type TypographyProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
};

/**
 * Base text primitive for MatchPulse.
 * Applies a typography token (fontSize/lineHeight/fontWeight/letterSpacing)
 * and a color token, keeping raw style values out of screens/components.
 *
 * Usage:
 *   <Typography variant="heading">Live Matches</Typography>
 *   <Typography variant="caption" color="textSecondary">Anfield</Typography>
 */
export function Typography({
  variant = 'body',
  color = 'textPrimary',
  style,
  ...rest
}: TypographyProps) {
  const variantStyle = typography[variant];

  return (
    <Text
      style={[
        {
          fontSize: variantStyle.fontSize,
          lineHeight: variantStyle.lineHeight,
          fontWeight: variantStyle.fontWeight,
          letterSpacing: variantStyle.letterSpacing,
          color: colors[color],
        },
        style,
      ]}
      {...rest}
    />
  );
}