// libs/avatar-player/src/lib/geometry/svg-parts/mustache-shapes.ts/svg-parts/mustache-shapes.ts
// 5 mustache styles: none, thin, thick, handlebar, chevron
// Positioned below nose (~y=112) and above mouth (~y=119)
// Flat fill only, no gradients, stroke-width ≤ 3
// Color: fill="var(--hair-color)"

import { MustacheStyle } from '../avatar.model';

export const MUSTACHE_SHAPES: Record<MustacheStyle, string> = {

  none: '',

  thin: `
    <!-- Thin pencil mustache -->
    <path d="M82,114 Q91,118 100,115 Q109,118 118,114"
          stroke="var(--hair-color)" stroke-width="3" fill="none"
          stroke-linecap="round"/>`,

  thick: `
    <!-- Thick walrus mustache -->
    <path d="M78,111 Q82,112 88,114 Q94,117 100,115
            Q106,117 112,114 Q118,112 122,111
            L124,113 Q120,120 112,122 Q106,123 100,122
            Q94,123 88,122 Q80,120 76,113 Z"
          fill="var(--hair-color)"/>`,

  handlebar: `
    <!-- Handlebar mustache with curled tips -->
    <path d="M80,112 Q90,118 100,115 Q110,118 120,112
            L122,114 Q112,121 100,119 Q88,121 78,114 Z"
          fill="var(--hair-color)"/>
    <!-- Left curl -->
    <path d="M80,113 Q74,110 72,114 Q70,118 73,122"
          stroke="var(--hair-color)" stroke-width="3.5" fill="none"
          stroke-linecap="round"/>
    <!-- Right curl -->
    <path d="M120,113 Q126,110 128,114 Q130,118 127,122"
          stroke="var(--hair-color)" stroke-width="3.5" fill="none"
          stroke-linecap="round"/>`,

  chevron: `
    <!-- Chevron mustache — wide inverted V shape -->
    <path d="M76,111 L88,112 Q94,118 100,116 Q106,118 112,112
            L124,111 L126,113 Q116,122 100,120
            Q84,122 74,113 Z"
          fill="var(--hair-color)"/>`,
};
