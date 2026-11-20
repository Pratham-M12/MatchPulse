/**
 * MatchPulse color tokens.
 *
 * This is the SINGLE SOURCE OF TRUTH for color values in the app.
 * - Consumed directly by `tailwind.config.js` so NativeWind className
 *   utilities (e.g. `bg-background`, `text-primary`) stay in sync.
 * - Also imported directly in TypeScript via `theme/index.ts` for cases
 *   where a raw value is needed (icons, SVGs, StatusBar, chart libs, etc).
 *
 * Written as plain JS (not .ts) so it can be `require()`-d by
 * tailwind.config.js without extra build tooling.
 */
module.exports = {
  // Base surfaces
  background: '#090B10',
  surface: '#121720',
  surfaceElevated: '#1A2130',
  surfaceHighlight: '#252E3D',

  // Brand / accent
  primary: '#B9F227',
  primaryMuted: '#2C4210',
  primarySubtle: 'rgba(185, 242, 39, 0.12)',

  // Text
  textPrimary: '#F7F8FA',
  textSecondary: '#AAB3C2',
  textDisabled: '#6E788A',

  // Status
  live: '#FF5B61',
  liveMuted: 'rgba(255, 91, 97, 0.14)',
  win: '#8DDB69',
  warning: '#F4BC62',
  loss: '#FF5B61',
  draw: '#AAB3C2',

  // Structure
  divider: '#2A3342',
  border: '#3A4658',
  overlay: 'rgba(9, 11, 16, 0.78)',

  transparent: 'transparent',
};
