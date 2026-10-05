// libs/avatar-core/src/svg-parts/glasses-shapes.ts
// 5 glasses styles: none, round, rectangular, sunglasses, monocle
// Positioned over eyes at cy=88, cx=74 (left), cx=126 (right)
// Stroke-only where possible, flat fills, no gradients
// stroke-width ≤ 2.5

import { GlassesStyle } from '../avatar.model';

export const GLASSES_SHAPES: Record<GlassesStyle, string> = {

  none: '',

  round: `
    <circle cx="74" cy="88" r="16" fill="none" stroke="#1A1A2E" stroke-width="2"/>
    <circle cx="126" cy="88" r="16" fill="none" stroke="#1A1A2E" stroke-width="2"/>
    <line x1="90" y1="88" x2="110" y2="88" stroke="#1A1A2E" stroke-width="2"/>
    <line x1="58" y1="88" x2="48" y2="86" stroke="#1A1A2E" stroke-width="1.5"/>
    <line x1="142" y1="88" x2="152" y2="86" stroke="#1A1A2E" stroke-width="1.5"/>`,

  rectangular: `
    <rect x="58" y="78" width="32" height="20" rx="4" fill="none"
          stroke="#1A1A2E" stroke-width="2"/>
    <rect x="110" y="78" width="32" height="20" rx="4" fill="none"
          stroke="#1A1A2E" stroke-width="2"/>
    <line x1="90" y1="88" x2="110" y2="88" stroke="#1A1A2E" stroke-width="2"/>
    <line x1="58" y1="86" x2="48" y2="84" stroke="#1A1A2E" stroke-width="1.5"/>
    <line x1="142" y1="86" x2="152" y2="84" stroke="#1A1A2E" stroke-width="1.5"/>`,

  sunglasses: `
    <path d="M58,82 Q58,76 66,76 L82,76 Q90,76 90,82 L90,94 Q90,100 82,100
            L66,100 Q58,100 58,94 Z" fill="#1A1A2E"/>
    <path d="M110,82 Q110,76 118,76 L134,76 Q142,76 142,82 L142,94 Q142,100 134,100
            L118,100 Q110,100 110,94 Z" fill="#1A1A2E"/>
    <line x1="90" y1="86" x2="110" y2="86" stroke="#1A1A2E" stroke-width="2.5"/>
    <line x1="58" y1="84" x2="48" y2="82" stroke="#1A1A2E" stroke-width="2"/>
    <line x1="142" y1="84" x2="152" y2="82" stroke="#1A1A2E" stroke-width="2"/>`,

  monocle: `
    <circle cx="126" cy="88" r="16" fill="none" stroke="#C9A84C" stroke-width="2"/>
    <line x1="126" y1="104" x2="120" y2="140" stroke="#C9A84C" stroke-width="1.5"/>`,
};
