// libs/avatar-shared/src/lib/svg-parts/mouth-shapes.ts
// 6 viseme paths for lip-sync animation
// All paths fit within the face area (x: 82–118, y: 118–136)
// stroke="var(--lip-color)" stroke-width="3" fill="none" stroke-linecap="round"

export const MOUTH_SHAPES: Record<number, string> = {
  0: 'M84,120 Q100,132 116,120',                              // silence — gentle smile
  1: 'M84,118 Q100,136 116,118',                              // A/I — wide open
  2: 'M90,118 Q100,130 110,118',                              // O/U — round
  3: 'M82,122 Q100,128 118,122',                              // E — spread
  4: 'M86,122 Q100,124 114,122',                              // M/B/P — pressed
  5: 'M84,120 Q92,126 100,122 Q108,126 116,120',              // F/V — teeth-lip
};
