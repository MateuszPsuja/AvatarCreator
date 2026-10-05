// libs/avatar-core/src/svg-parts/eye-shapes.ts
// 4 eye styles: round, almond, wide, narrow
// Each style provides sclera + iris SVG strings
// Eyes are positioned at cx=74 (left) and cx=126 (right), cy=88
// Sclera r≈11, iris r≈9, pupil r≈5 — large eyes per style guide
// Colors use CSS vars: fill="var(--eye-color)"

import { EyeStyle } from '../avatar.model';

interface EyeShapeParts {
  sclera: string;
  iris: string;
}

export const EYE_SHAPES: Record<EyeStyle, EyeShapeParts> = {
  round: {
    sclera: `
      <circle cx="74" cy="88" r="11" fill="#FFF"/>
      <circle cx="126" cy="88" r="11" fill="#FFF"/>`,
    iris: `
      <circle cx="74" cy="88" r="9" fill="var(--eye-color)"/>
      <circle cx="74" cy="88" r="5" fill="#1A1A2E"/>
      <circle cx="77" cy="85" r="2" fill="#FFF"/>
      <circle cx="126" cy="88" r="9" fill="var(--eye-color)"/>
      <circle cx="126" cy="88" r="5" fill="#1A1A2E"/>
      <circle cx="129" cy="85" r="2" fill="#FFF"/>`,
  },

  almond: {
    sclera: `
      <ellipse cx="74" cy="88" rx="12" ry="9" fill="#FFF"/>
      <ellipse cx="126" cy="88" rx="12" ry="9" fill="#FFF"/>`,
    iris: `
      <circle cx="74" cy="88" r="8" fill="var(--eye-color)"/>
      <circle cx="74" cy="88" r="5" fill="#1A1A2E"/>
      <circle cx="77" cy="85" r="2" fill="#FFF"/>
      <circle cx="126" cy="88" r="8" fill="var(--eye-color)"/>
      <circle cx="126" cy="88" r="5" fill="#1A1A2E"/>
      <circle cx="129" cy="85" r="2" fill="#FFF"/>`,
  },

  wide: {
    sclera: `
      <ellipse cx="74" cy="88" rx="13" ry="11" fill="#FFF"/>
      <ellipse cx="126" cy="88" rx="13" ry="11" fill="#FFF"/>`,
    iris: `
      <circle cx="74" cy="88" r="9" fill="var(--eye-color)"/>
      <circle cx="74" cy="88" r="5" fill="#1A1A2E"/>
      <circle cx="77" cy="85" r="2.5" fill="#FFF"/>
      <circle cx="126" cy="88" r="9" fill="var(--eye-color)"/>
      <circle cx="126" cy="88" r="5" fill="#1A1A2E"/>
      <circle cx="129" cy="85" r="2.5" fill="#FFF"/>`,
  },

  narrow: {
    sclera: `
      <ellipse cx="74" cy="88" rx="12" ry="7" fill="#FFF"/>
      <ellipse cx="126" cy="88" rx="12" ry="7" fill="#FFF"/>`,
    iris: `
      <circle cx="74" cy="88" r="7" fill="var(--eye-color)"/>
      <circle cx="74" cy="88" r="4" fill="#1A1A2E"/>
      <circle cx="77" cy="86" r="1.5" fill="#FFF"/>
      <circle cx="126" cy="88" r="7" fill="var(--eye-color)"/>
      <circle cx="126" cy="88" r="4" fill="#1A1A2E"/>
      <circle cx="129" cy="86" r="1.5" fill="#FFF"/>`,
  },
};
