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
  background: '#0B0D12',
  surface: '#151923',
  surfaceElevated: '#1C2230',
  surfaceHighlight: '#232A3A',

  // Brand / accent
  primary: '#00E676',
  primaryMuted: '#0F3D2A',
  primarySubtle: 'rgba(0, 230, 118, 0.10)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B3B8',
  textDisabled: '#5C6070',

  // Status
  live: '#FF4D4D',
  liveMuted: 'rgba(255, 77, 77, 0.12)',
  win: '#00E676',
  warning: '#F7B955',
  loss: '#FF4D4D',
  draw: '#B0B3B8',

  // Structure
  divider: '#252936',
  border: '#343A4A',
  overlay: 'rgba(11, 13, 18, 0.72)',

  transparent: 'transparent',
};
