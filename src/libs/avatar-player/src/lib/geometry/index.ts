/**
 * Public entry point of the avatar geometry.
 *
 * WHY THIS LIVES INSIDE THE ANGULAR LIBRARY
 *
 * The code below is plain TypeScript with no framework imports — it could sit in
 * a package of its own, and that is where it used to live. It lives here
 * because of a hard limit in ng-packagr:
 *
 *   - ng-packagr treats EVERY bare specifier as external
 *     (`isExternalDependency`, ng-packagr/lib/flatten/rollup.js), so a
 *     `from 'avatar-core'` import ships unresolved and breaks the tarball.
 *   - a relative import into another package does not work either: ng-packagr
 *     compiles src/ -> dist/avatar-player/esm2022/ first and only then bundles,
 *     so a path valid from src/ points at nothing from the intermediate dir.
 *
 * Living inside the library means ng-packagr compiles it as first-party source
 * and inlines it into the published bundle. The React package imports these
 * same files with a relative specifier at build time, so there is still exactly
 * ONE copy of the geometry in the repository and in CI.
 *
 * Consequence: consumers of angular-avatar-player and react-avatar-player get
 * their own copy of the renderer inside the tarball. That is deliberate — it
 * means `npm i angular-avatar-player` is a single, self-contained install.
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