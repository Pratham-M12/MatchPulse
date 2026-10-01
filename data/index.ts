/**
 * Mock data layer entry point. Import from '@/data' throughout the app.
 *
 * When the real football API is integrated (a later milestone), this is
 * the layer that gets swapped for TanStack Query hooks calling mapped API
 * responses — components consuming `Match`/`Team`/`Competition` types
 * won't need to change.
 */
export * from './competitions';
export * from './teams';
export * from './matches';
export * from './matchDetails';
export * from './players';
