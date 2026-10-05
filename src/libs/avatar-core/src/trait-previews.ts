// libs/avatar-core/src/trait-previews.ts
//
// Small SVG thumbnails for the creator's pickers.
//
// The UI was showing an emoji per option while TraitOption already had an
// unused `svgPreview` field. Emoji neither match the artwork nor tell you what
// "handlebar" looks like. These build the real shape from the same part data
// the renderer uses, so a preview can never drift from the result.
//
// Everything is drawn with literal hex colours, not CSS custom properties:
// the thumbnails are injected with innerHTML and must stand on their own.
import { SKIN_TONES } from './skin-tones';
import { HAIR_COLORS } from './hair-colors';
import { EYE_COLORS } from './eye-colors';
import { HAIR_SHAPES } from './svg-parts/hair-shapes';
import { EYE_SHAPES } from './svg-parts/eye-shapes';
import { MUSTACHE_SHAPES } from './svg-parts/mustache-shapes';
import { BEARD_SHAPES } from './svg-parts/beard-shapes';
import { GLASSES_SHAPES } from './svg-parts/glasses-shapes';
import { PROFESSION_LAYERS } from './svg-parts/profession-layers';
import type {
  BeardStyle,
  EyeStyle,
  Gender,
  GlassesStyle,
  HaircutStyle,
  MustacheStyle,
  ProfessionType,
} from './avatar.model';

export type PreviewKind =
  | 'gender'
  | 'haircut'
  | 'eyeStyle'
  | 'mustache'
  | 'beard'
  | 'glasses'
  | 'profession';

const SKIN = SKIN_TONES.medium.base;
const SKIN_DARK = SKIN_TONES.medium.ear;
const HAIR = HAIR_COLORS.brown;
const EYE = EYE_COLORS.brown;

/**
 * Part data references `var(--hair-color)` and friends. Substitute literals so
 * a thumbnail renders correctly outside the avatar's own stylesheet.
 */
function inlineVars(svg: string): string {
  return svg
    .replace(/var\(--hair-color\)/g, HAIR)
    .replace(/var\(--eye-color\)/g, EYE)
    .replace(/var\(--skin-base\)/g, SKIN)
    .replace(/var\(--skin-ear\)/g, SKIN_DARK)
    .replace(/var\(--skin-shadow\)/g, SKIN_DARK)
    .replace(/var\(--lip-color\)/g, SKIN_TONES.medium.lip);
}

/** Crop window around the head. Parts live in 0–200 space centred on x=100. */
const VIEWBOX = '32 18 136 136';

function wrap(inner: string, viewBox = VIEWBOX): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ` +
    `preserveAspectRatio="xMidYMid meet">${inner}</svg>`
  );
}

const head = (rx = 52, ry = 56, cy = 88) =>
  `<ellipse cx="100" cy="${cy}" rx="${rx}" ry="${ry}" fill="${SKIN}"/>`;

const ears = () =>
  `<ellipse cx="48" cy="90" rx="8" ry="10" fill="${SKIN_DARK}"/>` +
  `<ellipse cx="152" cy="90" rx="8" ry="10" fill="${SKIN_DARK}"/>`;

const eyes = () => {
  const e = EYE_SHAPES.round;
  return `<g>${inlineVars(e.sclera)}</g><g>${inlineVars(e.iris)}</g>`;
};

const brows = () =>
  `<rect x="63" y="72" width="22" height="5" rx="3" fill="${HAIR}"/>` +
  `<rect x="115" y="72" width="22" height="5" rx="3" fill="${HAIR}"/>`;

const noseMouth = () =>
  `<path d="M97,105 Q100,112 103,105" stroke="${SKIN_DARK}" stroke-width="2" fill="none" stroke-linecap="round"/>` +
  `<path d="M84,120 Q100,132 116,120" stroke="${SKIN_TONES.medium.lip}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;

/** Neutral bust used behind profession thumbnails. */
const bust = () =>
  `<path d="M30,200 Q30,150 100,150 Q170,150 170,200 Z" fill="#8A93A5"/>`;

export function buildTraitPreview(kind: PreviewKind, value: string): string {
  switch (kind) {
    case 'gender': {
      const woman = value === 'woman';
      const face = woman
        ? `<ellipse cx="100" cy="86" rx="49" ry="55" fill="${SKIN}"/>` +
          `<g class="lashes">${[0, 1, 2, 3, 4, 5, 6, 7]
            .map((i) => {
              const xs = [65, 70, 76, 82, 117, 122, 128, 134][i];
              return `<path d="M${xs},78 l-3,-4" stroke="${HAIR}" stroke-width="1.5" stroke-linecap="round"/>`;
            })
            .join('')}</g>`
        : head();
      return wrap(ears() + face + eyes() + brows() + noseMouth());
    }

    case 'haircut': {
      const h = HAIR_SHAPES[value as HaircutStyle];
      if (!h) return wrap(head());
      return wrap(ears() + `<g>${inlineVars(h.back)}</g>` + head() + `<g>${inlineVars(h.front)}</g>`);
    }

    case 'eyeStyle': {
      const e = EYE_SHAPES[value as EyeStyle];
      if (!e) return wrap(head());
      return wrap(
        head() + `<g>${inlineVars(e.sclera)}</g><g>${inlineVars(e.iris)}</g>`,
      );
    }

    case 'mustache': {
      const m = MUSTACHE_SHAPES[value as MustacheStyle];
      return wrap(ears() + head() + eyes() + brows() + noseMouth() + (m ? `<g>${inlineVars(m)}</g>` : ''));
    }

    case 'beard': {
      const b = BEARD_SHAPES[value as BeardStyle];
      return wrap(ears() + head() + eyes() + brows() + noseMouth() + (b ? `<g>${inlineVars(b)}</g>` : ''));
    }

    case 'glasses': {
      const g = GLASSES_SHAPES[value as GlassesStyle];
      return wrap(ears() + head() + eyes() + brows() + noseMouth() + (g ? `<g>${inlineVars(g)}</g>` : ''));
    }

    case 'profession': {
      const p = PROFESSION_LAYERS[value as ProfessionType];
      const body = p?.body ? inlineVars(p.body) : bust();
      const acc = p?.accessory ? inlineVars(p.accessory) : '';
      // Profession art is drawn on the full 0–200 canvas, so use the whole
      // thing rather than the head crop the face previews use.
      return wrap(body + ears() + head() + eyes() + brows() + noseMouth() + acc, '0 0 200 200');
    }

    default:
      return wrap(head());
  }
}
