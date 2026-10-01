/**
 * MatchPulse design system entry point.
 *
 * Import tokens from here throughout the app, e.g.:
 *   import { colors, spacing, radius, typography } from '@/theme';
 *
 * The underlying values live in colors.js / spacing.js / radius.js /
 * typography.js (plain JS) so they can also be required directly by
 * tailwind.config.js without extra build tooling. This file is the
 * typed TypeScript surface the rest of the app should use.
 */
import colorsJs from './colors';
import spacingJs from './spacing';
import radiusJs from './radius';
import typographyJs from './typography';

export type ColorToken = keyof typeof colorsJs;
export type SpacingToken = keyof typeof spacingJs;
export type RadiusToken = keyof typeof radiusJs;
export type TypographyVariant = keyof typeof typographyJs;

export const colors = colorsJs as Record<ColorToken, string>;
export const spacing = spacingJs as Record<SpacingToken, number>;
export const radius = radiusJs as Record<RadiusToken, number>;

export type TypographyStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '600' | '700' | '800';
  letterSpacing: number;
};

export const typography = typographyJs as Record<TypographyVariant, TypographyStyle>;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
} as const;

export default theme;