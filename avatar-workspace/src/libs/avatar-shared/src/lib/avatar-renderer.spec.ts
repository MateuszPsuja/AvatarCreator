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
