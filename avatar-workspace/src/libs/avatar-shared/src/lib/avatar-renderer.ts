// libs/avatar-shared/src/lib/avatar-renderer.ts
//
// SINGLE SOURCE OF TRUTH for avatar geometry.
//
// Both the live preview (SvgAvatarComponent) and the export bundle
// (AvatarService.buildSvg) call this. Previously each had its own copy
// of the render logic, and they drifted badly: the exporter ignored gender
// and omitted every clipPath, so head-wearing professions exported with
// hair punching through their hats.
//
// Nothing in here may read DOM state. Everything the renderer needs is
// derived from the config (plus an optional viseme), which is what makes
// the output reproducible and testable.

import type { AvatarConfig } from './avatar.model';
import { SKIN_TONES } from './skin-tones';
import { HAIR_COLORS } from './hair-colors';
import { EYE_COLORS } from './eye-colors';
import { MOUTH_SHAPES } from './svg-parts/mouth-shapes';
import { textToVisemes, MS_PER_VISEME } from './visemes';
import { EYE_SHAPES } from './svg-parts/eye-shapes';
import { HAIR_SHAPES } from './svg-parts/hair-shapes';
import { MUSTACHE_SHAPES } from './svg-parts/mustache-shapes';
import { faceFor, fitToFace, buildBeardSvg } from './svg-parts/beard-path';
import { GLASSES_SHAPES } from './svg-parts/glasses-shapes';
import { PROFESSION_LAYERS } from './svg-parts/profession-layers';

/**
 * Professions whose accessory covers the top of the head, so hair must clip.
 *
 * `chef` is here because the toque band sits across the forehead; without it
 * long hair renders straight through the hat.
 */
export const HAT_PROFESSIONS: ReadonlySet<string> = new Set([
  'engineer',
  'police',
  'artist',
  'chef',
]);

/** Professions with a full helmet, which clips hair AND facial hair. */
export const HELMET_PROFESSIONS: ReadonlySet<string> = new Set(['astronaut']);

/** Canonical canvas. */
export const CANVAS = { width: 200, height: 200, viewBox: '0 0 200 200' } as const;

/**
 * Hat brim clip. A flat cut at y=56 — see the plan: deriving this from the
 * actual hat geometry is Phase 3 work.
 */
const HAT_CLIP_RECT = { x: 0, y: 56, width: 200, height: 144 } as const;
/** Helmet aperture. */
const HELMET_CLIP_ELLIPSE = { cx: 100, cy: 78, rx: 57, ry: 62 } as const;

export interface BuildAvatarOptions {
  /** Lip-sync viseme id 0–5. Defaults to 0 (silence). */
  viseme?: number;
  /** Emit the `.animate-idle` hook so CSS head-idle motion runs. */
  animated?: boolean;
  /**
   * Bake a self-running SMIL mouth animation for this text into the output.
   *
   * Uses SMIL rather than CSS because the exported file is loaded through
   * `<img>`, where the consuming page's stylesheet is not available. SMIL is
   * declarative and travels inside the file, so the animation survives being
   * referenced from another document. (Scripts do not run in `<img>`; SMIL
   * does.)
   */
  speech?: string;
  /**
   * Namespace for generated element ids. Required when more than one avatar
   * is inlined into the same document, otherwise `url(#hat-clip)` resolves
   * against the first match and every avatar clips identically.
   */
  idsPrefix?: string;
}

/**
 * Build the `<animate>` child for the mouth, or '' when there is nothing to
 * animate. Consecutive duplicates are collapsed so the animation spends its
 * time on distinct mouth shapes rather than repeating the same one.
 */
function mouthAnimation(text: string): string {
  const visemes = textToVisemes(text);
  if (visemes.length === 0) return '';

  // Collapse runs of the same viseme, then always return to silence so the
  // loop does not snap between two open shapes.
  const seq: number[] = [];
  for (const v of visemes) {
    if (seq.length === 0 || seq[seq.length - 1] !== v) seq.push(v);
  }
  if (seq[seq.length - 1] !== 0) seq.push(0);

  const values = seq.map((v) => MOUTH_SHAPES[v] ?? MOUTH_SHAPES[0]);
  const totalMs = seq.length * MS_PER_VISEME;

  // calcMode="discrete" steps between the shapes with no interpolation —
  // which is what lip sync wants, and also avoids interpolating between
  // paths whose command counts differ (viseme 5 is a three-segment path).
  return (
    `<animate attributeName="d" calcMode="discrete" dur="${(totalMs / 1000).toFixed(3)}s"` +
    ` repeatCount="indefinite" values="${values.join(';')}"/>`
  );
}

export function isAstronaut(config: AvatarConfig): boolean {
  return HELMET_PROFESSIONS.has(config.profession);
}

export function hasHat(config: AvatarConfig): boolean {
  return HAT_PROFESSIONS.has(config.profession);
}

/** Clip reference for the hair-back / hair-front layers, or null. */
export function hairClipUrl(config: AvatarConfig, idsPrefix = ''): string | null {
  if (isAstronaut(config)) return `url(#${idsPrefix}helmet-clip)`;
  if (hasHat(config)) return `url(#${idsPrefix}hat-clip)`;
  return null;
}

/** Clip reference for ears / mustache / beard, or null. */
export function helmetClipUrl(config: AvatarConfig, idsPrefix = ''): string | null {
  return isAstronaut(config) ? `url(#${idsPrefix}helmet-clip)` : null;
}

/** CSS custom properties that drive every colour in the artwork. */
export function avatarCssVars(config: AvatarConfig): Record<string, string> {
  const skin = SKIN_TONES[config.skinTone];
  return {
    '--skin-base': skin.base,
    '--skin-ear': skin.ear,
    '--skin-shadow': skin.shadow,
    '--lip-color': skin.lip,
    '--hair-color': HAIR_COLORS[config.hairColor],
    '--eye-color': EYE_COLORS[config.eyeColor],
  };
}

function cssVarDecls(config: AvatarConfig): string {
  return Object.entries(avatarCssVars(config))
    .map(([k, v]) => `${k}: ${v}`)
    .join(';');
}

/** `clip-path="url(#x)"` only when the value exists — avoids empty attrs. */
function clipAttr(url: string | null): string {
  return url ? ` clip-path="${url}"` : '';
}

const LASH_PATHS: readonly string[] = [
  'M65,78 L62,74', 'M70,76 L68,72', 'M76,76 L78,72', 'M82,78 L85,74',
  'M117,78 L114,74', 'M122,76 L120,72', 'M128,76 L130,72', 'M134,78 L137,74',
];

/**
 * The avatar markup WITHOUT the outer `<svg>` element.
 * The preview component supplies its own root so it can keep Angular
 * bindings on it; the exporter wraps this in a standalone document.
 */
export function buildAvatarSvgInner(config: AvatarConfig, opts: BuildAvatarOptions = {}): string {
  const { viseme = 0, animated = false, idsPrefix = '' } = opts;

  const isWoman = config.gender === 'woman';
  const astronaut = isAstronaut(config);
  const hair = HAIR_SHAPES[config.haircut] ?? { back: '', front: '' };
  const eyes = EYE_SHAPES[config.eyeStyle] ?? { sclera: '', iris: '' };
  // Facial hair is authored once and rescaled to whichever head is in use.
  // A man is untouched (the ratios are exactly 1); a woman gets the same
  // silhouette at the same relative position on a proportionally smaller
  // head, which is what the hand-drawn shapes were missing.
  const facialHead = faceFor(config.gender);
  const mustache = fitToFace(MUSTACHE_SHAPES[config.mustache] ?? '', facialHead);
  const beard = buildBeardSvg(config.beard, facialHead, HAIR_COLORS[config.hairColor]);
  const glasses = GLASSES_SHAPES[config.glasses] ?? '';
  const profession = PROFESSION_LAYERS[config.profession] ?? { body: '', accessory: '' };
  const mouthPath = MOUTH_SHAPES[viseme] ?? MOUTH_SHAPES[0];

  const hairClip = hairClipUrl(config, idsPrefix);
  const helmetClip = helmetClipUrl(config, idsPrefix);

  // ── defs ────────────────────────────────────────────────────────────
  // Face containment for facial hair. The hand-drawn beard and moustache
  // artwork is not perfectly authored to the jawline — `stubble` overhangs
  // even on a man — so rescaling alone cannot guarantee they stay on the
  // head. This clip is derived from the face in use and is the backstop.
  // The ellipse arcs over the top, then runs straight down past the chin so
  // a long beard may still fall onto the chest.
  const faceClipPath =
    `M${facialHead.cx - facialHead.rx},${facialHead.cy} ` +
    `A${facialHead.rx},${facialHead.ry} 0 0 1 ${facialHead.cx + facialHead.rx},${facialHead.cy} ` +
    `L${facialHead.cx + facialHead.rx},192 L${facialHead.cx - facialHead.rx},192 Z`;

  const defs =
    `<defs>` +
    `<clipPath id="${idsPrefix}face-clip"><path d="${faceClipPath}"/></clipPath>` +
    `<clipPath id="${idsPrefix}hat-clip">` +
    `<rect x="${HAT_CLIP_RECT.x}" y="${HAT_CLIP_RECT.y}" width="${HAT_CLIP_RECT.width}" height="${HAT_CLIP_RECT.height}"/>` +
    `</clipPath>` +
    `<clipPath id="${idsPrefix}helmet-clip">` +
    `<ellipse cx="${HELMET_CLIP_ELLIPSE.cx}" cy="${HELMET_CLIP_ELLIPSE.cy}" rx="${HELMET_CLIP_ELLIPSE.rx}" ry="${HELMET_CLIP_ELLIPSE.ry}"/>` +
    `</clipPath>` +
    `</defs>`;

  // ── 1. body ──────────────────────────────────────────────────────────
  const body = `<g class="layer-body">${profession.body}</g>`;

  // ── 2. neck (hidden for astronaut — the collar covers it) ───────────
  const neck = astronaut
    ? ''
    : isWoman
      ? `<rect class="layer-neck" x="90" y="135" width="20" height="22" rx="8" fill="var(--skin-base)"/>`
      : `<rect class="layer-neck" x="88" y="135" width="24" height="22" rx="8" fill="var(--skin-base)"/>`;

  // ── 3. ears ─────────────────────────────────────────────────────────
  const earRx = isWoman ? 7 : 8;
  const earRy = isWoman ? 9 : 10;
  const ears =
    `<g class="layer-ears"${clipAttr(helmetClip)}>` +
    `<ellipse cx="48" cy="90" rx="${earRx}" ry="${earRy}" fill="var(--skin-ear)"/>` +
    `<ellipse cx="152" cy="90" rx="${earRx}" ry="${earRy}" fill="var(--skin-ear)"/>` +
    `</g>`;

  // ── 4. hair back ────────────────────────────────────────────────────
  const hairBack = `<g class="layer-hair-back"${clipAttr(hairClip)}>${hair.back}</g>`;

  // ── 5. face ─────────────────────────────────────────────────────────
  const face = isWoman
    ? `<ellipse class="layer-face" cx="100" cy="86" rx="49" ry="55" fill="var(--skin-base)"/>`
    : `<ellipse class="layer-face" cx="100" cy="88" rx="52" ry="56" fill="var(--skin-base)"/>`;

  // ── 6. eyes ─────────────────────────────────────────────────────────
  // `.pupils` is driven by --pupil-x/--pupil-y so no post-render DOM
  // patching is needed; see svg-avatar.component.scss.
  const eyeGroup =
    `<g class="layer-eyes">` +
    `<g>${eyes.sclera}</g>` +
    `<g class="pupils"><g>${eyes.iris}</g></g>` +
    `</g>`;

  // ── 6b. lashes (woman only) ─────────────────────────────────────────
  const lashes = isWoman
    ? `<g class="layer-lashes">${LASH_PATHS.map(
        (d) =>
          `<path d="${d}" stroke="var(--hair-color)" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,
      ).join('')}</g>`
    : '';

  // ── 7. eyelids (blink) ──────────────────────────────────────────────
  // The eyelids are OPAQUE skin-coloured rects painted over the eyes. The
  // only thing that hides them is `transform: scaleY(0)` from the consuming
  // stylesheet — so a standalone SVG with no stylesheet ships with its eyes
  // completely covered. Two defences:
  //   1. static output omits the layer outright, because a still image has
  //      nothing to blink
  //   2. animated output carries transform="scale(1,0)" as an inline
  //      presentation attribute, so the eyes are hidden even if the CSS
  //      never arrives. CSS still wins over the attribute, so blinking works.
  const eyelids = animated
    ? `<g class="layer-eyelids">` +
      `<rect class="eyelid-left" x="63" y="77" width="22" height="22" rx="11" fill="var(--skin-base)" transform="scale(1,0)"/>` +
      `<rect class="eyelid-right" x="115" y="77" width="22" height="22" rx="11" fill="var(--skin-base)" transform="scale(1,0)"/>` +
      `</g>`
    : '';

  // ── 8. brows ────────────────────────────────────────────────────────
  const brows = isWoman
    ? `<g class="layer-brows">` +
      `<path d="M64,74 Q74,69 84,73" stroke="var(--hair-color)" stroke-width="2" fill="none" stroke-linecap="round"/>` +
      `<path d="M116,73 Q126,69 136,74" stroke="var(--hair-color)" stroke-width="2" fill="none" stroke-linecap="round"/>` +
      `</g>`
    : `<g class="layer-brows">` +
      `<rect x="63" y="72" width="22" height="5" rx="3" fill="var(--hair-color)"/>` +
      `<rect x="115" y="72" width="22" height="5" rx="3" fill="var(--hair-color)"/>` +
      `</g>`;

  // ── 9. nose — uses --skin-shadow so it stays visible on deep skin ───
  const nose = isWoman
    ? `<path class="layer-nose" d="M98,104 Q100,110 102,104" stroke="var(--skin-shadow)" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
    : `<path class="layer-nose" d="M97,105 Q100,112 103,105" stroke="var(--skin-shadow)" stroke-width="2" fill="none" stroke-linecap="round"/>`;

  // ── 10. mouth ───────────────────────────────────────────────────────
  // When `speech` is set the mouth carries a self-running SMIL animation,
  // so the file speaks on its own with no host page involved.
  const speech = opts.speech;
  const mouthAnim = speech ? mouthAnimation(speech) : '';
  const mouthInner = isWoman
    ? `stroke="var(--lip-color)" stroke-width="2.5" fill="var(--lip-color)" fill-opacity="0.35" stroke-linecap="round"`
    : `stroke="var(--lip-color)" stroke-width="2.5" fill="none" stroke-linecap="round"`;
  const mouth =
    `<path class="layer-mouth" d="${mouthPath}" ${mouthInner}>` +
    mouthAnim +
    `</path>`;

  // ── 11-14 ───────────────────────────────────────────────────────────
  // No CSS transform: the shape is rescaled in the path data itself. The
  // inner groups carry the face clip and the outer the helmet clip, because
  // an element can only take one clip-path.
  const facialHair =
    `<g class="layer-mustache"${clipAttr(helmetClip)}>` +
    `<g clip-path="url(#${idsPrefix}face-clip)">${mustache}</g></g>` +
    `<g class="layer-beard"${clipAttr(helmetClip)}>` +
    `<g clip-path="url(#${idsPrefix}face-clip)">${beard}</g></g>`;
  const glassesGroup = `<g class="layer-glasses">${glasses}</g>`;
  const hairFront = `<g class="layer-hair-front"${clipAttr(hairClip)}>${hair.front}</g>`;
  const accessory = `<g class="layer-accessory">${profession.accessory}</g>`;

  const head = `<g class="layer-head"${animated ? ' animate-idle' : ''}>` + [ears, hairBack, face, eyeGroup, lashes, eyelids, brows, nose, mouth, facialHair, glassesGroup, hairFront, accessory].join('') + `</g>`;

  return defs + body + neck + head;
}

/**
 * A complete, standalone SVG document. This is what gets written to disk
 * and what the demo viewer renders — it must depend on nothing outside
 * itself, so the palette is inlined as a `style` attribute on the root.
 *
 * `animated` is forced off regardless of what the caller passed. That flag
 * emits the `.animate-idle` class, which is driven by the consuming
 * component's stylesheet; a standalone file has no stylesheet, so the class
 * would be a promise the document cannot keep. `speech` still applies,
 * because SMIL travels inside the file.
 */
export function buildAvatarSvg(config: AvatarConfig, opts: BuildAvatarOptions = {}): string {
  const inner = buildAvatarSvgInner(config, { ...opts, animated: false });
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CANVAS.viewBox}"` +
    ` style="${cssVarDecls(config)}">` +
    inner +
    `</svg>`
  );
}
