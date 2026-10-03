// libs/avatar-shared/src/lib/svg-parts/beard-path.ts
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

import type { Gender } from '../avatar.model';

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
