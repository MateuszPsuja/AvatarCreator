/**
 * Public entry point of the React avatar package.
 *
 *   import { AvatarPlayer } from 'react-avatar-player';
 *   import 'react-avatar-player/styles.css';
 *
 * The SVG geometry, palettes and viseme mapping are COMPILED INTO this package
 * from `../avatar-player/src/lib/geometry` — the same files ng-packagr compiles
 * into the Angular package. One copy of the geometry in the repository; each
 * published package ships its own, so installing this is a single
 * self-contained step with no second package to resolve.
 */

// ── Components ──────────────────────────────────────────────
export { AvatarPlayer } from './avatar-player';
export type { AvatarPlayerProps } from './avatar-player';
export { SvgAvatar } from './svg-avatar';
export type { SvgAvatarProps } from './svg-avatar';

// ── Hooks ───────────────────────────────────────────────────
export { useAvatarAnimation } from './use-avatar-animation';
export type { AvatarAnimationState, BlinkState } from './use-avatar-animation';
export { useLipSync } from './use-lip-sync';
export type { UseLipSyncOptions } from './use-lip-sync';

// ── Runtime drivers, for building your own component ────────
export { AvatarAnimator, LipSyncPlayer } from '../../avatar-player/src/lib/geometry';

// Everything else (model, palettes, renderer, visemes) comes from core.
export * from '../../avatar-player/src/lib/geometry';