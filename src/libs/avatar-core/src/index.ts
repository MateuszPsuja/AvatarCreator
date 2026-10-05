/**
 * Public entry point of the framework-free avatar engine.
 *
 * Everything here is plain TypeScript with no DOM reads and no framework
 * imports, which is what lets the same geometry power the Angular player, the
 * React player and a Node-side SVG export. If you only need to render an
 * avatar to a string — for a build step, an email, a PDF — this package is
 * enough and pulls in no UI framework.
 *
 * For UI components use `angular-avatar-player` or `react-avatar-player`,
 * which are thin wrappers over this.
 */

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
} from './avatar.model';

// ── Color palettes ──────────────────────────────────────────
export { SKIN_TONES } from './skin-tones';
export { HAIR_COLORS } from './hair-colors';
export { EYE_COLORS } from './eye-colors';

// ── Trait previews (small thumbnails for creator pickers) ─────
export { buildTraitPreview } from './trait-previews';
export type { PreviewKind } from './trait-previews';

// ── Visemes ─────────────────────────────────────────────────
export { textToVisemes, MS_PER_VISEME } from './visemes';
export {
  VISEME_SILENCE,
  VISEME_WIDE,
  VISEME_ROUND,
  VISEME_SPREAD,
  VISEME_PRESSED,
  VISEME_TEETH,
} from './visemes';

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
} from './avatar-renderer';
export type { BuildAvatarOptions } from './avatar-renderer';

// ── SVG part constants ──────────────────────────────────────
export { MOUTH_SHAPES } from './svg-parts/mouth-shapes';
export { EYE_SHAPES } from './svg-parts/eye-shapes';
export { HAIR_SHAPES } from './svg-parts/hair-shapes';
export { GLASSES_SHAPES } from './svg-parts/glasses-shapes';
export { MUSTACHE_SHAPES } from './svg-parts/mustache-shapes';
export { BEARD_SHAPES } from './svg-parts/beard-shapes';

// ── Face geometry + profession layers ───────────────────────
export {
  faceFor,
  faceHalfWidthAt,
  fitToFace,
  buildBeardSvg,
  MAN_FACE,
  WOMAN_FACE,
} from './svg-parts/beard-path';
export type { FaceGeometry } from './svg-parts/beard-path';
export { PROFESSION_LAYERS } from './svg-parts/profession-layers';

// ── Runtime drivers (used by the UI wrappers, useful on their own) ──
export { AvatarAnimator } from './avatar-animator';
export { LipSyncPlayer } from './lip-sync-player';