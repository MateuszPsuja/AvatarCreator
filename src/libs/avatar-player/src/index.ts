/**
 * Single public entry point of the Angular avatar package.
 *
 * A consuming app only ever imports from here:
 *
 *   import { AvatarPlayerComponent } from 'angular-avatar-player';
 *
 * The SVG geometry, palettes and viseme mapping live in ./lib/geometry — plain
 * TypeScript with no Angular imports, but shipped inside this package. They are
 * re-exported below, so there is one import path and a consumer never needs a
 * second package to reach the renderer. `react-avatar-player` compiles the same
 * geometry files into its own bundle, which is what keeps the two players from
 * drifting apart.
 */

// ── Components ──────────────────────────────────────────────
export { AvatarPlayerComponent } from './lib/components/avatar-player/avatar-player.component';
export { SvgAvatarComponent } from './lib/components/svg-avatar/svg-avatar.component';

// ── NgModule (for NgModule-based apps) ──────────────────────
export { AvatarPlayerModule } from './lib/avatar-player.module';

// ── Services ────────────────────────────────────────────────
export { LipSyncService } from './lib/services/lip-sync.service';
export { AvatarAnimationService } from './lib/services/avatar-animation.service';

// The geometry, shipped in this package and re-exported verbatim.
export * from './lib/geometry';