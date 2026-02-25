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
    <!-- Full short beard — hugs face ellipse (rx=52 ry=56 cx=100 cy=88) -->
    <path d="M48,100 Q46,112 48,124 Q52,136 62,144
             Q74,152 88,156 Q96,158 100,158
             Q104,158 112,156 Q126,152 138,144
             Q148,136 152,124 Q154,112 152,100
             Q150,114 144,126 Q132,138 100,142
             Q68,138 56,126 Q50,114 48,100 Z"
          fill="var(--hair-color)"/>`,

  long: `
    <!-- Full long beard — hugs face then flows below chin -->
    <path d="M48,98 Q44,112 44,126 Q46,142 54,154
             Q62,166 76,176 Q88,184 96,186
             Q100,188 100,188 Q100,188 104,186
             Q112,184 124,176 Q138,166 146,154
             Q154,142 156,126 Q156,112 152,98
             Q150,114 144,128 Q132,140 100,144
             Q68,140 56,128 Q50,114 48,98 Z"
          fill="var(--hair-color)"/>
    <!-- Rounded bottom of long beard -->
    <ellipse cx="100" cy="186" rx="16" ry="6" fill="var(--hair-color)"/>`,

  goatee: `
    <!-- Soul patch -->
    <ellipse cx="100" cy="126" rx="4" ry="2.5" fill="var(--hair-color)"/>
    <!-- Compact chin goatee -->
    <path d="M88,130 Q86,140 92,147 Q96,152 100,153 Q104,152 108,147 Q114,140 112,130
             Q108,138 100,142 Q92,138 88,130 Z"
          fill="var(--hair-color)"/>`,
};
