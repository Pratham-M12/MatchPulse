/**
 * MatchPulse typography scale.
 * Single source of truth — consumed by tailwind.config.js (fontSize) and
 * by the <Typography> component (theme/index.ts) for full control over
 * fontWeight / letterSpacing, which Tailwind's fontSize scale can't express.
 *
 * Variants:
 *  - display   Hero numbers / rare, very large emphasis
 *  - heading   Screen and section headers
 *  - title     Card titles, team names, list item titles
 *  - body      Default reading text
 *  - caption   Secondary / meta text
 *  - overline  Small uppercase labels (competition names, tags)
 *  - score     Match scores — tabular figures, strong weight
 */
module.exports = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '700', letterSpacing: -0.7 },
  heading: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.3 },
  title: { fontSize: 16, lineHeight: 22, fontWeight: '600', letterSpacing: 0 },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400', letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400', letterSpacing: 0.1 },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0 },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 0.8 },
  score: { fontSize: 26, lineHeight: 30, fontWeight: '800', letterSpacing: -0.5 },
};
