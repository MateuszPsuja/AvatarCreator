// libs/avatar-player/src/lib/geometry/svg-parts/beard-path.ts/svg-parts/beard-path.ts
//
// Facial hair is authored as artwork, then FITTED to the head at render
// time.
//
// The shapes in beard-shapes.ts / mustache-shapes.ts were drawn against the
// man's face (cx=100 cy=88 rx=52 ry=56). A woman's head is a different
// ellipse, so the same path either juts past her jaw or leaves a gap.
//
// The first three attempts generated new geometry instead, which produced
// uniform bands that lost the hand-drawn character. This keeps the original
// silhouettes and rescales them by the ratio between the two faces, so:
//   - a man is unchanged, exactly, by construction (the ratios are 1)
//   - a woman gets the same shape at the same relative position on a
//     proportionally smaller head
//
// The rescale is applied to the NUMBERS in the path, never as a CSS
// transform. An SVG transform attribute would be resolved against the
// element's bounding box under `transform-box: fill-box` and fling the
// beard across the face.

import type { BeardStyle, Gender } from '../avatar.model';

export interface FaceGeometry {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

/** The two head shapes the renderer supports. */
export const MAN_FACE: FaceGeometry = { cx: 100, cy: 88, rx: 52, ry: 56 };
export const WOMAN_FACE: FaceGeometry = { cx: 100, cy: 86, rx: 49, ry: 55 };

export function faceFor(gender: Gender): FaceGeometry {
  return gender === 'woman' ? WOMAN_FACE : MAN_FACE;
}

/** Half-width of the head at a given y. Returns 0 at or past the chin. */
export function faceHalfWidthAt(face: FaceGeometry, y: number): number {
  const t = (y - face.cy) / face.ry;
  if (t <= -1 || t >= 1) return 0;
  return face.rx * Math.sqrt(1 - t * t);
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
type Pt = [number, number];

/** How far the beard's outer edge deliberately overshoots the face. */
const OVERHANG = 1;

/** Closed path through points, smoothed with quadratic midpoints. */
function smoothClosedPath(pts: Pt[]): string {
  if (pts.length < 3) return '';
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M${r2(pts[0][0])},${r2(pts[0][1])}`;
  for (let i = 1; i <= pts.length; i++) {
    const cur = pts[i % pts.length];
    const m = mid(cur, pts[(i + 1) % pts.length]);
    d += ` Q${r2(cur[0])},${r2(cur[1])} ${r2(m[0])},${r2(m[1])}`;
  }
  return d + ' Z';
}

/**
 * Rewrite every coordinate in a `d` attribute from the man's face into the
 * target face. Safe because these shapes use only absolute M/L/Q/C/Z — no
 * relative commands, no arcs, so all numbers come in x,y pairs.
 */
function fitPathData(d: string, face: FaceGeometry): string {
  const sx = face.rx / MAN_FACE.rx;
  const sy = face.ry / MAN_FACE.ry;
  if (sx === 1 && sy === 1 && face.cx === MAN_FACE.cx && face.cy === MAN_FACE.cy) {
    return d; // man's face — leave the artwork byte-for-byte alone
  }

  let i = 0;
  return d.replace(/-?\d+(\.\d+)?/g, (m) => {
    const v = parseFloat(m);
    const isX = i % 2 === 0;
    i++;
    const scaled = isX
      ? face.cx + (v - MAN_FACE.cx) * sx
      : face.cy + (v - MAN_FACE.cy) * sy;
    return String(r2(scaled));
  });
}

/** Fit every `d` and every ellipse in a piece of SVG markup to a head. */
export function fitToFace(markup: string, face: FaceGeometry): string {
  if (!markup) return '';
  const sx = face.rx / MAN_FACE.rx;
  const sy = face.ry / MAN_FACE.ry;

  return markup
    .replace(/d="([^"]*)"/g, (_, d: string) => `d="${fitPathData(d, face)}"`)
    .replace(/<ellipse([^>]*)\/>/g, (whole, attrs: string) => {
      const out = attrs
        .replace(/cx="(-?\d+(?:\.\d+)?)"/, (_, v) =>
          `cx="${r2(face.cx + (parseFloat(v) - MAN_FACE.cx) * sx)}"`)
        .replace(/cy="(-?\d+(?:\.\d+)?)"/, (_, v) =>
          `cy="${r2(face.cy + (parseFloat(v) - MAN_FACE.cy) * sy)}"`)
        .replace(/rx="(-?\d+(?:\.\d+)?)"/, (_, v) => `rx="${r2(parseFloat(v) * sx)}"`)
        .replace(/ry="(-?\d+(?:\.\d+)?)"/, (_, v) => `ry="${r2(parseFloat(v) * sy)}"`);
      return `<ellipse${out}/>`;
    });
}


// ── Beard generation ─────────────────────────────────────────────────
//
// A beard is a BAND along the jaw, so it must be built as one: an outer
// edge tracking the face and an inner edge just inside it. The hand-drawn
// shapes in beard-shapes.ts cannot be used here — their inner edge cuts
// deep across the lower face (x=70 where the jaw is at x=55), which is
// exactly the skin gap this is meant to eliminate. The gap is not an
// authoring slip, it is what that silhouette is.
//
// These parameters are tuned to read like the original artwork: thin at
// the cheekbones, thickening toward the chin, tapering to nothing at the
// sides by the ears.

interface BandOptions {
  /** Where the beard starts, as a fraction of ry below the face centre. */
  startFrac: number;
  endFrac: number;
  /** Gap between the face outline and the band's outer edge. */
  inset: number;
  thicknessTop: number;
  thicknessBottom: number;
  /** Drop below the chin: length and half-width, as fractions of ry / rx. */
  drop?: number;
  dropWidth?: number;
}

const BEARD_BANDS: Record<Exclude<BeardStyle, 'none'>, BandOptions> = {
  // 5 o'clock shadow: low and faint, hugging the jaw only.
  stubble: { startFrac: 0.36, endFrac: 0.97, inset: 3, thicknessTop: 4, thicknessBottom: 7 },
  // Jaw-hugging crescent, tapering to nothing by the ears.
  short: { startFrac: 0.17, endFrac: 0.99, inset: 2.5, thicknessTop: 4, thicknessBottom: 14 },
  // Same crescent, then a narrow drop. Kept narrow on purpose: a wide drop
  // reads as a bib rather than a beard.
  long: {
    startFrac: 0.17, endFrac: 0.99, inset: 2.5, thicknessTop: 4, thicknessBottom: 15,
    drop: 0.30, dropWidth: 0.26,
  },
  // Chin patch only.
  goatee: { startFrac: 0.60, endFrac: 0.99, inset: 13, thicknessTop: 5, thicknessBottom: 12 },
};

export function buildBeardSvg(
  style: BeardStyle,
  face: FaceGeometry,
  fill: string,
): string {
  if (style === 'none') return '';
  const o = BEARD_BANDS[style];
  const steps = 26;

  const yTop = face.cy + face.ry * o.startFrac;
  const yJaw = face.cy + face.ry * o.endFrac;
  const chinY = face.cy + face.ry;
  const dropLen = o.drop ? face.ry * o.drop : 0;
  const dropW = o.dropWidth ? face.rx * o.dropWidth : 0;

  /**
   * Outer half-width; past the chin it becomes the drop's taper.
   *
   * The band's outer edge is drawn slightly OUTSIDE the face outline, not
   * inset inside it. Two reasons: the smoothing below passes through the
   * MIDPOINTS between samples rather than through the samples themselves, so
   * an edge placed exactly on the face ends up a sliver inside it and shows
   * as a skin gap. Overhanging by a pixel and letting the face clip trim it
   * back gives contact by construction instead of by tuning.
   */
  const outerHalf = (y: number): number => {
    if (y <= chinY) return Math.max(0, faceHalfWidthAt(face, y) + OVERHANG);
    if (!dropLen) return 0;
    const t = (y - chinY) / dropLen;
    return t >= 1 ? 0 : dropW * Math.sqrt(1 - t * t);
  };

  const innerR: Pt[] = [];
  const innerL: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = lerp(yTop, yJaw, t);
    // The inner edge follows the same curve, a band-thickness inside it.
    // Deriving it from the face is what closes the gap.
    const hw = Math.max(0, faceHalfWidthAt(face, y) - o.inset - lerp(o.thicknessTop, o.thicknessBottom, t));
    innerR.push([face.cx + hw, y]);
    innerL.push([face.cx - hw, y]);
  }

  const outerR: Pt[] = [];
  const outerL: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const y = lerp(yTop, chinY + dropLen, i / steps);
    const hw = outerHalf(y);
    outerR.push([face.cx + hw, y]);
    outerL.push([face.cx - hw, y]);
  }

  const ring: Pt[] = [
    ...innerL,
    ...[...innerR].reverse(),
    ...outerR,
    ...[...outerL].reverse(),
  ];
  const d = smoothClosedPath(ring);
  if (!d) return '';
  // Stubble still relies on opacity rather than a second tone; logged for Phase 5.
  const opacity = style === 'stubble' ? ' opacity="0.22"' : '';
  return `<path d="${d}" fill="${fill}"${opacity}/>`;
}
