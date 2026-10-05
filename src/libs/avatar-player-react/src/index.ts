/**
 * Public entry point of the React avatar package.
 *
 *   import { AvatarPlayer } from 'react-avatar-player';
 *   import 'react-avatar-player/styles.css';
 *
 * The SVG geometry, palettes and viseme mapping come from
 * `avatar-player-core` and are re-exported below, so a React consumer never has
 * to add a second package to reach the renderer — and `angular-avatar-player`
 * re-exports the identical surface, which is what keeps the two from drifting.
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
export { AvatarAnimator, LipSyncPlayer } from 'avatar-player-core';

// Everything else (model, palettes, renderer, visemes) comes from core.
export * from 'avatar-player-core';