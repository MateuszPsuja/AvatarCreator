// libs/avatar-shared/src/lib/svg-parts/beard-shapes.ts
// 5 beard styles: none, stubble, short, long, goatee
//
// The outer edge of both full beards follows the face ellipse
// (cx=100 cy=88 rx=52 ry=56) rather than a hand-typed curve. An earlier
// version kept its outer edge near x=49 down to y=118, but the face has
// already narrowed to x=55 by then, so the beard projected past the jaw
// as a dark wedge on each side.
//
// Face half-width by row, which is what the outer curves are matched to:
//   y=96  -> 51.5   y=110 -> 47.9   y=120 -> 45.0
//   y=130 -> 37.2   y=140 -> 26.0   chin -> 0 (y=144)
//
// Flat fill only, no gradients, stroke-width ≤ 2.5
// Color: fill="var(--hair-color)"

import { BeardStyle } from '../avatar.model';

export const BEARD_SHAPES: Record<BeardStyle, string> = {

  none: '',

  stubble: `
    <!-- 5 o'clock shadow following the jawline. The previous version ran to
         x=76/124 at y=140, where the face half-width is only ~19 (x 81..119),
         so it overhung the jaw by ~5px on each side and had to be cut back by
         the face clip. It now ends at the chin instead of hanging below it. -->
    <path d="M72,114 Q70,126 80,136 Q90,143 100,144 Q110,143 120,136 Q130,126 128,114
             Q122,126 100,132 Q78,126 72,114 Z"
          fill="var(--hair-color)" opacity="0.2"/>`,

  short: `
    <!-- Jaw-hugging beard. Outer edge is inset 3px inside the face ellipse so
         it never projects past the jaw; inner edge sits above it, leaving a
         band that thins at the cheeks and thickens at the chin. -->
    <path d="M52,96
             C52,108 56,120 64,128
             C72,136 86,143 100,143
             C114,143 128,136 136,128
             C144,120 148,108 148,96
             C146,104 140,114 130,121
             C120,128 110,131 100,131
             C90,131 80,128 70,121
             C60,114 54,104 52,96 Z"
          fill="var(--hair-color)"/>`,

  long: `
    <!-- Same jaw-hugging top, then flowing below the chin to a rounded point. -->
    <path d="M52,96
             C52,110 58,126 70,138
             C80,148 90,160 95,172
             C96,176 104,176 105,172
             C110,160 120,148 130,138
             C142,126 148,110 148,96
             C146,104 140,114 130,121
             C120,128 110,131 100,131
             C90,131 80,128 70,121
             C60,114 54,104 52,96 Z"
          fill="var(--hair-color)"/>`,

  goatee: `
    <!-- Soul patch -->
    <ellipse cx="100" cy="126" rx="4" ry="2.5" fill="var(--hair-color)"/>
    <!-- Compact chin goatee -->
    <path d="M88,130 Q86,140 92,147 Q96,152 100,153 Q104,152 108,147 Q114,140 112,130
             Q108,138 100,142 Q92,138 88,130 Z"
          fill="var(--hair-color)"/>`,
};
