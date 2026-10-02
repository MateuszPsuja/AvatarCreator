// libs/avatar-shared/src/lib/avatar-renderer.spec.ts
//
// Guards export/preview parity. Before this renderer existed, the exporter
// was a hand-written copy of the component template that silently dropped
// gender and every clipPath — so head-wearing professions exported with hair
// punching through their hats and nobody noticed. These tests fail the
// moment that class of drift comes back.

import {
  buildAvatarSvg,
  buildAvatarSvgInner,
  avatarCssVars,
  hairClipUrl,
  helmetClipUrl,
} from './avatar-renderer';
import { SKIN_TONES } from './skin-tones';
import { MOUTH_SHAPES } from './svg-parts/mouth-shapes';
import { textToVisemes } from './visemes';
import { PROFESSION_LAYERS } from './svg-parts/profession-layers';
import { HAIR_SHAPES } from './svg-parts/hair-shapes';
import { BEARD_SHAPES } from './svg-parts/beard-shapes';
import { MUSTACHE_SHAPES } from './svg-parts/mustache-shapes';
import { GLASSES_SHAPES } from './svg-parts/glasses-shapes';
import type { AvatarConfig, Gender, ProfessionType } from './avatar.model';

const PROFESSIONS: ProfessionType[] = [
  'none', 'doctor', 'engineer', 'teacher', 'chef',
  'police', 'astronaut', 'artist', 'business',
];
const GENDERS: Gender[] = ['man', 'woman'];
const HAT_PROFESSIONS: ProfessionType[] = ['engineer', 'police', 'artist'];

function makeConfig(over: Partial<AvatarConfig> = {}): AvatarConfig {
  return {
    id: 't', name: 'T', gender: 'man', skinTone: 'medium',
    haircut: 'long', hairColor: 'brown', eyeColor: 'brown',
    mustache: 'thick', beard: 'long', eyeStyle: 'round',
    glasses: 'none', profession: 'none',
    ...over,
  };
}

describe('avatarCssVars', () => {
  it('exposes the palette every part depends on', () => {
    const vars = avatarCssVars(makeConfig());
    expect(vars['--skin-base']).toBe(SKIN_TONES.medium.base);
    expect(vars['--hair-color']).toBeDefined();
    expect(vars['--eye-color']).toBeDefined();
    expect(vars['--lip-color']).toBeDefined();
  });

  it('exposes a dedicated shadow tone so the nose stays visible', () => {
    for (const tone of Object.keys(SKIN_TONES) as (keyof typeof SKIN_TONES)[]) {
      const vars = avatarCssVars(makeConfig({ skinTone: tone }));
      expect(vars['--skin-shadow']).toBeDefined();
      // The nose stroke must contrast against the face fill.
      expect(vars['--skin-shadow']).not.toBe(vars['--skin-base']);
    }
  });
});

describe('buildAvatarSvg — standalone document', () => {
  it('is self-contained: carries its own palette and no external refs', () => {
    const svg = buildAvatarSvg(makeConfig());
    expect(svg.startsWith('<svg')).toBeTrue();
    expect(svg.endsWith('</svg>')).toBeTrue();
    expect(svg).toContain('--skin-base');
    expect(svg).toContain('--skin-shadow');
    expect(svg).toContain('viewBox="0 0 200 200"');
  });

  it('renders every profession without throwing', () => {
    for (const profession of PROFESSIONS) {
      for (const gender of GENDERS) {
        const svg = buildAvatarSvg(makeConfig({ profession, gender }));
        expect(svg).toContain('layer-head');
        expect(svg.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('buildAvatarSvg — gender', () => {
  it('uses distinct face geometry per gender', () => {
    const man = buildAvatarSvgInner(makeConfig({ gender: 'man' }));
    const woman = buildAvatarSvgInner(makeConfig({ gender: 'woman' }));
    expect(man).toContain('rx="52" ry="56"');
    expect(woman).toContain('rx="49" ry="55"');
  });

  it('gives women lashes and men none', () => {
    expect(buildAvatarSvgInner(makeConfig({ gender: 'woman' }))).toContain('layer-lashes');
    expect(buildAvatarSvgInner(makeConfig({ gender: 'man' }))).not.toContain('layer-lashes');
  });

  it('gives women arched brows and men block brows', () => {
    const man = buildAvatarSvgInner(makeConfig({ gender: 'man' }));
    const woman = buildAvatarSvgInner(makeConfig({ gender: 'woman' }));
    expect(man).toContain('<rect x="63" y="72" width="22" height="5"');
    expect(woman).toContain('M64,74 Q74,69 84,73');
  });
});

describe('buildAvatarSvg — clip paths (the export-drift regression)', () => {
  it('always emits both clipPath definitions', () => {
    for (const profession of PROFESSIONS) {
      const inner = buildAvatarSvgInner(makeConfig({ profession }));
      expect(inner).toContain('clipPath id="hat-clip"');
      expect(inner).toContain('clipPath id="helmet-clip"');
    }
  });

  it('clips hair when a hat is worn', () => {
    for (const profession of HAT_PROFESSIONS) {
      const config = makeConfig({ profession });
      const inner = buildAvatarSvgInner(config);
      expect(inner).toContain('class="layer-hair-back" clip-path="url(#hat-clip)"');
      expect(inner).toContain('class="layer-hair-front" clip-path="url(#hat-clip)"');
    }
  });

  it('clips hair, ears and facial hair inside the astronaut helmet', () => {
    const config = makeConfig({ profession: 'astronaut' });
    const inner = buildAvatarSvgInner(config);
    expect(inner).toContain('class="layer-hair-back" clip-path="url(#helmet-clip)"');
    expect(inner).toContain('class="layer-ears" clip-path="url(#helmet-clip)"');
    expect(inner).toContain('class="layer-mustache" clip-path="url(#helmet-clip)"');
    expect(inner).toContain('class="layer-beard" clip-path="url(#helmet-clip)"');
  });

  it('leaves hair unclipped when no headgear is worn', () => {
    const inner = buildAvatarSvgInner(makeConfig({ profession: 'none' }));
    expect(inner).toContain('class="layer-hair-back">');
    expect(inner).not.toContain('clip-path="url(#hat-clip)"');
    expect(inner).not.toContain('clip-path="url(#helmet-clip)"');
  });

  it('suppresses the astronaut neck, which the collar covers', () => {
    const inner = buildAvatarSvgInner(makeConfig({ profession: 'astronaut' }));
    expect(inner).not.toContain('class="layer-neck"');
    expect(buildAvatarSvgInner(makeConfig({ profession: 'doctor' }))).toContain('class="layer-neck"');
  });
});

describe('clip path helpers', () => {
  it('resolve to null without headgear', () => {
    const config = makeConfig({ profession: 'teacher' });
    expect(hairClipUrl(config)).toBeNull();
    expect(helmetClipUrl(config)).toBeNull();
  });

  it('namespace ids when a prefix is supplied', () => {
    const config = makeConfig({ profession: 'engineer' });
    expect(hairClipUrl(config, 'a1')).toBe('url(#a1hat-clip)');
    const inner = buildAvatarSvgInner(config, { idsPrefix: 'a1' });
    expect(inner).toContain('clipPath id="a1hat-clip"');
    expect(inner).toContain('url(#a1hat-clip)');
  });
});

describe('buildAvatarSvg — eyelids', () => {
  // The eyelids are opaque skin-coloured rects painted over the eyes, and
  // the only thing that hides them is CSS. A standalone SVG has no CSS, so
  // emitting them in a static export ships an avatar with no eyes at all —
  // which is exactly what the first demo gallery rendered.
  it('omits the eyelid layer from static output', () => {
    const staticSvg = buildAvatarSvg(makeConfig());
    expect(staticSvg).not.toContain('eyelid-left');
    expect(staticSvg).not.toContain('eyelid-right');
  });

  it('emits eyelids for animated output, with an inline hide', () => {
    const animated = buildAvatarSvgInner(makeConfig(), { animated: true });
    expect(animated).toContain('class="eyelid-left"');
    // Presentation attribute, so the eye is hidden even if the stylesheet
    // is missing. CSS overrides it when it arrives.
    expect(animated).toContain('transform="scale(1,0)"');
  });

  it('keeps the eyes painted after the sclera in animated output', () => {
    const animated = buildAvatarSvgInner(makeConfig(), { animated: true });
    const eyesAt = animated.indexOf('class="layer-eyes"');
    const lidsAt = animated.indexOf('class="layer-eyelids"');
    expect(eyesAt).toBeGreaterThan(-1);
    expect(lidsAt).toBeGreaterThan(eyesAt);
  });
});

describe('buildAvatarSvg — baked speech', () => {
  it('embeds a self-running mouth animation when speech is given', () => {
    const svg = buildAvatarSvg(makeConfig(), { speech: 'hello' });
    expect(svg).toContain('<animate attributeName="d"');
    expect(svg).toContain('repeatCount="indefinite"');
    expect(svg).toContain('calcMode="discrete"');
  });

  it('omits the animation when no speech is given', () => {
    expect(buildAvatarSvg(makeConfig())).not.toContain('<animate');
  });

  it('omits the animation for empty text', () => {
    expect(buildAvatarSvg(makeConfig(), { speech: '' })).not.toContain('<animate');
  });

  it('holds each viseme for 80ms', () => {
    // "hi" maps to [spread, wide] (2), then a silence viseme is appended so
    // the loop does not end on an open shape — 3 frames x 80ms = 0.240s.
    expect(textToVisemes('hi').length).toBe(2);
    const svg = buildAvatarSvg(makeConfig(), { speech: 'hi' });
    expect(svg).toContain('dur="0.240s"');
  });

  it('ends the loop on the silence viseme so it does not snap between open shapes', () => {
    const svg = buildAvatarSvg(makeConfig(), { speech: 'boom' });
    const values = svg.match(/values="([^"]+)"/)![1].split(';');
    expect(values[values.length - 1]).toBe(MOUTH_SHAPES[0]);
  });

  it('collapses consecutive duplicates', () => {
    // "oooo" is four identical round visemes; collapsed, it should not spend
    // the whole loop holding the same shape.
    const svg = buildAvatarSvg(makeConfig(), { speech: 'oooo' });
    const values = svg.match(/values="([^"]+)"/)![1].split(';');
    expect(values.length).toBeLessThanOrEqual(3);
  });

  it('uses only known mouth paths', () => {
    const svg = buildAvatarSvg(makeConfig(), { speech: 'the quick brown fox' });
    const values = svg.match(/values="([^"]+)"/)![1].split(';');
    for (const v of values) {
      expect(Object.values(MOUTH_SHAPES)).toContain(v);
    }
  });
});

describe('facial hair fits the face', () => {
  // Beards are drawn to the man's face (rx=52, cy=88). The woman face is
  // narrower and sits 2px higher, so unscaled facial hair juts past her jaw.
  it('scales and lifts facial hair on a woman', () => {
    const woman = buildAvatarSvgInner(makeConfig({ gender: 'woman', beard: 'long' }));
    expect(woman).toMatch(/class="layer-beard"[^>]*transform="translate\(0,-2\)/);
    expect(woman).toMatch(/class="layer-mustache"[^>]*transform="translate\(0,-2\)/);
  });

  it('leaves facial hair untouched on a man', () => {
    const man = buildAvatarSvgInner(makeConfig({ gender: 'man', beard: 'long' }));
    expect(man).toContain('class="layer-beard"');
    expect(man).not.toMatch(/class="layer-beard"[^>]*transform=/);
  });

  it('narrows by the face ratio, not an arbitrary factor', () => {
    // 49/52 — the ratio of the two face radii.
    const woman = buildAvatarSvgInner(makeConfig({ gender: 'woman', beard: 'long' }));
    expect(woman).toContain(`scale(${(49 / 52).toFixed(4)},1)`);
  });
});

describe('buildAvatarSvg — viseme', () => {
  it('defaults to silence and honours an explicit viseme', () => {
    const quiet = buildAvatarSvgInner(makeConfig());
    const talking = buildAvatarSvgInner(makeConfig(), { viseme: 1 });
    expect(quiet).toContain('M84,120 Q100,132 116,120');
    expect(talking).toContain('M84,118 Q100,136 116,118');
  });

  it('falls back to silence for an out-of-range viseme', () => {
    const inner = buildAvatarSvgInner(makeConfig(), { viseme: 99 });
    expect(inner).toContain('M84,120 Q100,132 116,120');
  });

  it('keeps the mouth stroke within the style guide limit', () => {
    const inner = buildAvatarSvgInner(makeConfig());
    expect(inner).toContain('class="layer-mouth"');
    expect(inner).toContain('stroke-width="2.5"');
  });
});

describe('buildAvatarSvg — animation hook', () => {
  it('emits animate-idle only when asked', () => {
    expect(buildAvatarSvgInner(makeConfig(), { animated: true })).toContain('animate-idle');
    expect(buildAvatarSvgInner(makeConfig())).not.toContain('animate-idle');
  });

  it('omits the animation hook from standalone exports', () => {
    // A static file has no runtime to drive the animation.
    expect(buildAvatarSvg(makeConfig(), { animated: true })).not.toContain('animate-idle');
  });
});

describe('part geometry stays on the canvas', () => {
  // The chef toque used to be drawn up to y=-48, so a third of it sat outside
  // the 0..200 viewBox and rendered as a shapeless blob. Coordinates outside
  // the canvas are always a bug, so assert none of them exist.
  const SOURCES: [string, Record<string, string>][] = [
    ['profession', PROFESSION_LAYERS as never],
    ['hair', HAIR_SHAPES as never],
    ['beard', BEARD_SHAPES as never],
    ['mustache', MUSTACHE_SHAPES as never],
    ['glasses', GLASSES_SHAPES as never],
  ];

  for (const [group, map] of SOURCES) {
    for (const [name, raw] of Object.entries(map)) {
      it(`${group}.${name} has no off-canvas coordinates`, () => {
        const nums = String(raw)
          .replace(/\s+/g, ' ')
          .match(/-?\d+(\.\d+)?/g)!
          .map((n) => parseFloat(n));
        const off = nums.filter((n) => n < 0 || n > 200);
        expect(off).withContext(`${group}.${name} → ${off.join(', ')}`).toEqual([]);
      });
    }
  }
});
