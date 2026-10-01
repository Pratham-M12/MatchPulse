const colors = require('./theme/colors');
const spacing = require('./theme/spacing');
const radius = require('./theme/radius');
const typography = require('./theme/typography');

/**
 * Tailwind config for NativeWind.
 * Colors, spacing, radius and font sizes are pulled from `theme/*.js`
 * (the design system's single source of truth) so `className="bg-primary"`
 * and `theme.colors.primary` never drift apart.
 */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      spacing,
      borderRadius: radius,
      fontSize: Object.fromEntries(
        Object.entries(typography).map(([key, value]) => [
          key,
          [`${value.fontSize}px`, { lineHeight: `${value.lineHeight}px`, letterSpacing: `${value.letterSpacing}px` }],
        ])
      ),
    },
  },
  plugins: [],
};