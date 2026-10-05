// libs/avatar-shared/src/lib/visemes.ts
//
// Pure text -> viseme mapping, shared by the runtime lip-sync service and the
// offline generator that bakes an animated mouth into an exported SVG.
//
// Deliberately not a real phoneme model: every unmapped consonant falls back
// to the "spread" viseme, so the result reads as "mouth is moving" rather
// than accurate speech. Do not present it as phonetics.

/** Silence. */
export const VISEME_SILENCE = 0;
/** A / I — wide open */
export const VISEME_WIDE = 1;
/** O / U — rounded */
export const VISEME_ROUND = 2;
/** E — spread */
export const VISEME_SPREAD = 3;
/** M / B / P — pressed */
export const VISEME_PRESSED = 4;
/** F / V — teeth on lip */
export const VISEME_TEETH = 5;

/** How long each viseme is held, in ms. */
export const MS_PER_VISEME = 80;

/**
 * Map text characters to viseme ids 0–5.
 * 0=silence, 1=A/I wide, 2=O/U round, 3=E spread, 4=M/B/P pressed, 5=F/V teeth
 */
export function textToVisemes(text: string): number[] {
  return text
    .toLowerCase()
    .split('')
    .map((char) => {
      if ('ai'.includes(char)) return VISEME_WIDE;
      if ('ou'.includes(char)) return VISEME_ROUND;
      if ('e'.includes(char)) return VISEME_SPREAD;
      if ('mbp'.includes(char)) return VISEME_PRESSED;
      if ('fv'.includes(char)) return VISEME_TEETH;
      if (char === ' ') return VISEME_SILENCE;
      return VISEME_SPREAD; // default consonant
    });
}
