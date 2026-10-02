// libs/avatar-shared/src/lib/svg-parts/beard-shapes.ts
// 5 beard styles: none, stubble, short, long, goatee
// Positioned on lower face, below mouth (~y=120+)
// Flat fill only, no gradients, stroke-width ≤ 2.5
// Color: fill="var(--hair-color)"

import { BeardStyle } from '../avatar.model';

export const BEARD_SHAPES: Record<BeardStyle, string> = {

  none: '',

  stubble: `
    <!-- 5 o'clock shadow following jawline -->
    <path d="M72,114 Q68,128 76,140 Q88,150 100,152 Q112,150 124,140 Q132,128 128,114
             Q122,128 100,134 Q78,128 72,114 Z"
          fill="var(--hair-color)" opacity="0.2"/>`,

  short: `
    <!-- Full short beard — anchored on face ellipse at y=96 (rx=52 ry=56 cx=100 cy=88) -->
    <path d="M49,96 Q48,106 50,114 Q55,126 64,134
             Q76,144 90,150 Q96,152 100,152
             Q104,152 110,150 Q124,144 136,134
             Q145,126 150,114 Q152,106 151,96
             Q152,108 147,121 Q133,136 100,140
             Q67,136 53,121 Q48,108 49,96 Z"
          fill="var(--hair-color)"/>`,

  long: `
    <!-- Full long beard — anchored on face ellipse, flows below chin -->
    <path d="M49,96 Q47,108 50,118 Q54,132 62,142
             Q72,156 84,166 Q92,174 98,178
             Q100,180 100,180 Q100,180 102,178
             Q108,174 116,166 Q128,156 138,142
             Q146,132 150,118 Q153,108 151,96
             Q152,108 147,121 Q133,136 100,140
             Q67,136 53,121 Q48,108 49,96 Z"
          fill="var(--hair-color)"/>
    <!-- Rounded bottom of long beard -->
    <ellipse cx="100" cy="178" rx="14" ry="5" fill="var(--hair-color)"/>`,

  goatee: `
    <!-- Soul patch -->
    <ellipse cx="100" cy="126" rx="4" ry="2.5" fill="var(--hair-color)"/>
    <!-- Compact chin goatee -->
    <path d="M88,130 Q86,140 92,147 Q96,152 100,153 Q104,152 108,147 Q114,140 112,130
             Q108,138 100,142 Q92,138 88,130 Z"
          fill="var(--hair-color)"/>`,
};
