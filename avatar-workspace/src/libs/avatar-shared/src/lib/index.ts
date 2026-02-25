// libs/avatar-shared/src/lib/index.ts — barrel export

// Model & types
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

// Color palettes
export { SKIN_TONES } from './skin-tones';
export { HAIR_COLORS } from './hair-colors';
export { EYE_COLORS } from './eye-colors';

// SVG part constants
export { MOUTH_SHAPES } from './svg-parts/mouth-shapes';
export { EYE_SHAPES } from './svg-parts/eye-shapes';
export { HAIR_SHAPES } from './svg-parts/hair-shapes';
export { MUSTACHE_SHAPES } from './svg-parts/mustache-shapes';
export { BEARD_SHAPES } from './svg-parts/beard-shapes';
export { GLASSES_SHAPES } from './svg-parts/glasses-shapes';
export { PROFESSION_LAYERS } from './svg-parts/profession-layers';
