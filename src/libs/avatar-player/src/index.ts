/**
 * Single public entry point of the Angular avatar package.
 *
 * A consuming app only ever imports from here:
 *
 *   import { AvatarPlayerComponent } from 'angular-avatar-player';
 *
 * The SVG geometry, palettes and viseme mapping live in the framework-free
 * `avatar-player-core` package and are re-exported below, so there is one
 * import path, and an Angular consumer never has to add a second package to
 * get the renderer. `react-avatar-player` re-exports the same surface, which is
 * what keeps the two UI packages from drifting apart.
 */

// ── Components ──────────────────────────────────────────────
export { AvatarPlayerComponent } from './lib/components/avatar-player/avatar-player.component';
export { SvgAvatarComponent } from './lib/components/svg-avatar/svg-avatar.component';

// ── NgModule (for NgModule-based apps) ──────────────────────
export { AvatarPlayerModule } from './lib/avatar-player.module';

// ── Services ────────────────────────────────────────────────
export { LipSyncService } from './lib/services/lip-sync.service';
export { AvatarAnimationService } from './lib/services/avatar-animation.service';

// Everything below comes from avatar-player-core and is re-exported verbatim.
export * from 'avatar-player-core';