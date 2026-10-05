// libs/avatar-player/src/lib/shared/svg-parts/hair-shapes.ts
// 7 haircut styles: short, long, curly, bald, bun, ponytail, mohawk
// Each provides back (rendered behind face) + front (rendered on top)
// All shapes: solid fill, no gradients, no strokes > 2.5, flat silhouettes
// Colors use CSS var: fill="var(--hair-color)"
// Face ellipse: cx=100 cy=88 rx=52 ry=56 → top of head ~y=32

import { HaircutStyle } from '../avatar.model';

interface HairShapeParts {
  back: string;
  front: string;
}

export const HAIR_SHAPES: Record<HaircutStyle, HairShapeParts> = {

  short: {
    back: `
      <ellipse cx="100" cy="62" rx="54" ry="34" fill="var(--hair-color)"/>`,
    front: `
      <path d="M48,75 Q48,32 100,28 Q152,32 152,75 Q140,58 100,54 Q60,58 48,75 Z"
            fill="var(--hair-color)"/>`,
  },

  long: {
    back: `
      <path d="M44,70 Q44,28 100,22 Q156,28 156,70 L156,140 Q156,150 148,150
              L52,150 Q44,150 44,140 Z"
            fill="var(--hair-color)"/>`,
    front: `
      <path d="M46,78 Q46,28 100,22 Q154,28 154,78 Q142,54 100,48 Q58,54 46,78 Z"
            fill="var(--hair-color)"/>
      <path d="M46,78 L46,110 Q48,95 52,85 Z" fill="var(--hair-color)"/>
      <path d="M154,78 L154,110 Q152,95 148,85 Z" fill="var(--hair-color)"/>`,
  },

  curly: {
    back: `
      <path d="M42,80 Q38,30 100,22 Q162,30 158,80 L160,135 Q155,145 148,140
              Q142,148 132,142 Q122,150 112,142 Q102,148 92,142 Q82,150 72,142
              Q62,148 52,140 Q45,145 40,135 Z"
            fill="var(--hair-color)"/>`,
    front: `
      <path d="M44,82 Q42,30 100,22 Q158,30 156,82
              Q148,60 130,50 Q100,42 70,50 Q52,60 44,82 Z"
            fill="var(--hair-color)"/>
      <circle cx="44" cy="88" r="8" fill="var(--hair-color)"/>
      <circle cx="156" cy="88" r="8" fill="var(--hair-color)"/>
      <circle cx="48" cy="100" r="7" fill="var(--hair-color)"/>
      <circle cx="152" cy="100" r="7" fill="var(--hair-color)"/>`,
  },

  bald: {
    back: '',
    front: '',
  },

  bun: {
    back: `
      <circle cx="100" cy="24" r="18" fill="var(--hair-color)"/>
      <ellipse cx="100" cy="60" rx="54" ry="32" fill="var(--hair-color)"/>`,
    front: `
      <path d="M48,75 Q48,32 100,28 Q152,32 152,75 Q140,56 100,52 Q60,56 48,75 Z"
            fill="var(--hair-color)"/>`,
  },

  ponytail: {
    back: `
      <ellipse cx="100" cy="62" rx="54" ry="34" fill="var(--hair-color)"/>
      <path d="M130,42 Q158,40 162,60 Q166,90 158,130 Q154,142 148,140
              Q152,120 150,80 Q148,50 130,42 Z"
            fill="var(--hair-color)"/>`,
    front: `
      <path d="M48,75 Q48,32 100,28 Q152,32 152,75 Q140,56 100,52 Q60,56 48,75 Z"
            fill="var(--hair-color)"/>`,
  },

  mohawk: {
    back: '',
    front: `
      <!-- Shaved sides – faint stubble -->
      <path d="M54,70 Q54,42 100,34 Q146,42 146,70 Q136,56 100,52 Q64,56 54,70 Z"
            fill="var(--hair-color)" opacity="0.12"/>
      <!-- Mohawk crest – 5 pointed spikes -->
      <path d="M84,64 Q84,48 86,40
               L80,20 L89,36
               L86,6  L95,30
               L100,2 L105,30
               L114,6 L111,36
               L120,20 L114,40
               Q116,48 116,64
               Q108,54 100,52 Q92,54 84,64 Z"
            fill="var(--hair-color)"/>`,
  },
};
