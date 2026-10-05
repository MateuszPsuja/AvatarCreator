/**
 * Single public entry point of the avatar package.
 *
 * A consuming app only ever imports from here:
 *
 *   import { AvatarPlayerComponent } from '@avatar-workspace/avatar-player';
 *
 * The SVG geometry, palettes and viseme mapping live in `lib/shared` and are
 * re-exported below, so no second import path exists and there is no second
 * package to install or version.
 */

// ── Components ──────────────────────────────────────────────
export { AvatarPlayerComponent } from './lib/components/avatar-player/avatar-player.component';
export { SvgAvatarComponent } from './lib/components/svg-avatar/svg-avatar.component';

// ── NgModule (for NgModule-based apps) ──────────────────────
export { AvatarPlayerModule } from './lib/avatar-player.module';

// ── Services ────────────────────────────────────────────────
export { LipSyncService } from './lib/services/lip-sync.service';
export { AvatarAnimationService } from './lib/services/avatar-animation.service';

// ── Model & types ───────────────────────────────────────────
export type {
  AvatarConfig,
  Gender,
  SkinTone,
  HaircutStyle,
  HairColor,
  EyeColor,
  MustacheStyle,
  BeardStyle,
  EyeStyle,
  GlassesStyle,
  ProfessionType,
} from './lib/shared/avatar.model';

// ── Color palettes ──────────────────────────────────────────
export { SKIN_TONES } from './lib/shared/skin-tones';
export { HAIR_COLORS } from './lib/shared/hair-colors';
export { EYE_COLORS } from './lib/shared/eye-colors';

// ── Trait previews (small thumbnails for the creator pickers) ─
export { buildTraitPreview } from './lib/shared/trait-previews';
export type { PreviewKind } from './lib/shared/trait-previews';

// ── Visemes ─────────────────────────────────────────────────
export { textToVisemes, MS_PER_VISEME } from './lib/shared/visemes';
export {
  VISEME_SILENCE,
  VISEME_WIDE,
  VISEME_ROUND,
  VISEME_SPREAD,
  VISEME_PRESSED,
  VISEME_TEETH,
} from './lib/shared/visemes';

// ── SVG renderer (works in Node too, for the offline export) ─
export {
  buildAvatarSvg,
  buildAvatarSvgInner,
  avatarCssVars,
  hairClipUrl,
  helmetClipUrl,
  isAstronaut,
  hasHat,
  HAT_PROFESSIONS,
  HELMET_PROFESSIONS,
  CANVAS,
} from './lib/shared/avatar-renderer';
export type { BuildAvatarOptions } from './lib/shared/avatar-renderer';

// ── SVG part constants ──────────────────────────────────────
export { MOUTH_SHAPES } from './lib/shared/svg-parts/mouth-shapes';
export { EYE_SHAPES } from './lib/shared/svg-parts/eye-shapes';
export { HAIR_SHAPES } from './lib/shared/svg-parts/hair-shapes';
export { GLASSES_SHAPES } from './lib/shared/svg-parts/glasses-shapes';
export { MUSTACHE_SHAPES } from './lib/shared/svg-parts/mustache-shapes';
export { BEARD_SHAPES } from './lib/shared/svg-parts/beard-shapes';

// ── Face geometry + profession layers ───────────────────────
export {
  faceFor,
  faceHalfWidthAt,
  fitToFace,
  buildBeardSvg,
  MAN_FACE,
  WOMAN_FACE,
} from './lib/shared/svg-parts/beard-path';
export type { FaceGeometry } from './lib/shared/svg-parts/beard-path';
export { PROFESSION_LAYERS } from './lib/shared/svg-parts/profession-layers';
