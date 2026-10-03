// libs/avatar-shared/src/lib/svg-parts/beard-path.ts
//
// Facial hair is GENERATED from the face geometry, never hand-typed.
//
// The previous approach stored literal path strings authored against the
// man's face (cx=100 cy=88 rx=52 ry=56). Three attempts at nudging those
// coordinates by hand all failed: the woman face is a different ellipse,
// so a fixed path cannot hug both. Sampling the ellipse instead makes the
// fit structural — if the face changes, the beard follows.

import type { BeardStyle, MustacheStyle, Gender } from '../avatar.model';

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

type Pt = [number, number];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Emit a closed path through points using quadratic midpoints, which reads
 * as a smooth curve without needing hand-placed control points.
 */
function smoothClosedPath(pts: Pt[]): string {
  if (pts.length < 3) return '';
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M${r2(pts[0][0])},${r2(pts[0][1])}`;
  for (let i = 1; i <= pts.length; i++) {
    const cur = pts[i % pts.length];
    const next = pts[(i + 1) % pts.length];
    const m = mid(cur, next);
    d += ` Q${r2(cur[0])},${r2(cur[1])} ${r2(m[0])},${r2(m[1])}`;
  }
  return d + ' Z';
}

interface BandOptions {
  /** Where the hair starts, as a fraction of ry below the face centre. */
  startFrac: number;
  /** Where the jaw band ends, as a fraction of ry. 1.0 is the chin. */
  endFrac: number;
  /** How far inside the face outline the outer edge sits. */
  inset: number;
  /** Band thickness at the top and at the bottom. */
  thicknessTop: number;
  thicknessBottom: number;
  /**
   * Length of the drop below the chin, as a fraction of ry. 0 for a
   * jaw-hugging beard, positive for a long one.
   */
  drop?: number;
  /** Half-width of the drop at its widest, as a fraction of rx. */
  dropWidth?: number;
  steps?: number;
}

/**
 * A band hugging the jaw: the outer edge follows the face inset by a few
 * pixels, the inner edge sits above it, so the band thins at the cheeks
 * and thickens toward the chin. With `drop`, the outer edge continues past
 * the chin as a rounded tail.
 */
function jawBand(face: FaceGeometry, o: BandOptions): string {
  const steps = o.steps ?? 14;
  const yTop = face.cy + face.ry * o.startFrac;
  const yJaw = face.cy + face.ry * o.endFrac;
  const chinY = face.cy + face.ry;
  const dropLen = o.drop ? face.ry * o.drop : 0;
  const dropW = o.dropWidth ? face.rx * o.dropWidth : 0;

  /** Outer half-width, which continues past the chin as the drop. */
  const outerHalf = (y: number): number => {
    if (y <= chinY) return Math.max(0, faceHalfWidthAt(face, y) - o.inset);
    if (!dropLen) return 0;
    const t = (y - chinY) / dropLen;
    if (t >= 1) return 0;
    return dropW * Math.sqrt(1 - t * t);
  };

  const yBottom = chinY + dropLen;

  const innerRight: Pt[] = [];
  const innerLeft: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = lerp(yTop, yJaw, t);
    const thick = lerp(o.thicknessTop, o.thicknessBottom, t);
    const hw = Math.max(0, faceHalfWidthAt(face, y) - o.inset - thick);
    innerRight.push([face.cx + hw, y]);
    innerLeft.push([face.cx - hw, y]);
  }

  // Outer runs all the way down, including any drop below the chin.
  const outerRight: Pt[] = [];
  const outerLeft: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const y = lerp(yTop, yBottom, i / steps);
    const hw = outerHalf(y);
    outerRight.push([face.cx + hw, y]);
    outerLeft.push([face.cx - hw, y]);
  }

  // Ring: down the left inner, back up the right inner, down the right
  // outer, back up the left outer.
  const ring: Pt[] = [
    ...innerLeft,
    ...[...innerRight].reverse(),
    ...outerRight,
    ...[...outerLeft].reverse(),
  ];
  return smoothClosedPath(ring);
}

const BEARD_BANDS: Record<Exclude<BeardStyle, 'none'>, BandOptions> = {
  stubble: {
    startFrac: 0.34, endFrac: 0.96, inset: 4,
    thicknessTop: 4, thicknessBottom: 7,
  },
  short: {
    startFrac: 0.16, endFrac: 0.99, inset: 2.5,
    thicknessTop: 5, thicknessBottom: 13,
  },
  long: {
    startFrac: 0.16, endFrac: 0.99, inset: 2.5,
    thicknessTop: 5, thicknessBottom: 15,
    drop: 0.32, dropWidth: 0.42,
  },
  goatee: {
    // A chin patch: narrow, low, and much shorter than a full beard.
    startFrac: 0.58, endFrac: 0.99, inset: 12,
    thicknessTop: 5, thicknessBottom: 11,
  },
};

export function buildBeardSvg(style: BeardStyle, face: FaceGeometry, fill: string): string {
  if (style === 'none') return '';
  const band = BEARD_BANDS[style];
  const d = jawBand(face, band);
  if (!d) return '';
  // Stubble is the one treatment that relies on opacity rather than a
  // second tone; the style guide bans that, and it is logged for Phase 5.
  const opacity = style === 'stubble' ? ' opacity="0.22"' : '';
  return `<path d="${d}" fill="${fill}"${opacity}/>`;
}

interface MoustacheOptions {
  /** Half-width as a fraction of the face half-width at that row. */
  spread: number;
  height: number;
  /** 0 = plain lens, 1 = strong upturn at the ends. */
  upturn: number;
  /** Squared-off ends, for the chevron style. */
  squared?: boolean;
}

const MOUSTACHE_SHAPES: Record<Exclude<MustacheStyle, 'none'>, MoustacheOptions> = {
  thin: { spread: 0.42, height: 3.4, upturn: 0.15 },
  thick: { spread: 0.46, height: 7, upturn: 0.1 },
  handlebar: { spread: 0.5, height: 5.5, upturn: 0.85 },
  chevron: { spread: 0.48, height: 6, upturn: 0.05, squared: true },
};

export function buildMustacheSvg(
  style: MustacheStyle,
  face: FaceGeometry,
  fill: string,
): string {
  if (style === 'none') return '';
  const o = MOUSTACHE_SHAPES[style];
  const y = face.cy + face.ry * 0.42;
  const hw = faceHalfWidthAt(face, y) * o.spread;
  const h = o.height;
  const up = o.upturn * hw * 0.22;

  const left: Pt[] = [
    [face.cx - hw, y - up],
    [face.cx - hw * 0.55, y + h],
    [face.cx, y + h * 1.25],
    [face.cx + hw * 0.55, y + h],
    [face.cx + hw, y - up],
  ];
  const lower: Pt[] = [
    [face.cx + hw * 0.55, y + h * 0.55],
    [face.cx, y + h * 0.85],
    [face.cx - hw * 0.55, y + h * 0.55],
  ];
  const d = smoothClosedPath([...left, ...lower]);
  return d ? `<path d="${d}" fill="${fill}"/>` : '';
}
