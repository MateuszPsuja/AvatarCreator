// services/avatar.service.ts — Config state + persistence + export
import { Injectable } from '@angular/core';
import type { AvatarConfig } from '@avatar-workspace/avatar-shared';
import { SKIN_TONES, HAIR_COLORS, EYE_COLORS } from '@avatar-workspace/avatar-shared';

const STORAGE_KEY = 'avatar-workspace:saved-avatar';

@Injectable({ providedIn: 'root' })
export class AvatarService {
  /** Generate a fresh default avatar config */
  defaultConfig(): AvatarConfig {
    return {
      id: this.generateId(),
      name: '',
      gender: 'man',
      skinTone: 'medium',
      haircut: 'short',
      hairColor: 'brown',
      eyeColor: 'brown',
      mustache: 'none',
      beard: 'none',
      eyeStyle: 'round',
      glasses: 'none',
      profession: 'none',
    };
  }

  /** Convert an AvatarConfig into CSS custom property key-values */
  toCssVars(config: AvatarConfig): Record<string, string> {
    const skin = SKIN_TONES[config.skinTone];
    return {
      '--skin-base': skin.base,
      '--skin-ear': skin.ear,
      '--lip-color': skin.lip,
      '--hair-color': HAIR_COLORS[config.hairColor],
      '--eye-color': EYE_COLORS[config.eyeColor],
    };
  }

  /** Save avatar to localStorage */
  saveAvatar(config: AvatarConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      console.warn('Failed to save avatar to localStorage');
    }
  }

  /** Load avatar from localStorage (or null) */
  loadAvatar(): AvatarConfig | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AvatarConfig) : null;
    } catch {
      return null;
    }
  }

  /** Export avatar as a standalone SVG file download */
  downloadSVG(config: AvatarConfig): void {
    import('@avatar-workspace/avatar-shared').then((shared) => {
      const svg = this.buildSvgString(config, shared);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.name || 'avatar'}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  /** Build a complete static SVG string from config (no animations) */
  private buildSvgString(config: AvatarConfig, shared: any): string {
    const skin = shared.SKIN_TONES[config.skinTone];
    const hairColor = shared.HAIR_COLORS[config.hairColor];
    const eyeColor = shared.EYE_COLORS[config.eyeColor];
    const hair = shared.HAIR_SHAPES[config.haircut] ?? { back: '', front: '' };
    const eyes = shared.EYE_SHAPES[config.eyeStyle] ?? { sclera: '', iris: '' };
    const mouth = shared.MOUTH_SHAPES[0];
    const mustache = shared.MUSTACHE_SHAPES[config.mustache] ?? '';
    const beard = shared.BEARD_SHAPES[config.beard] ?? '';
    const glasses = shared.GLASSES_SHAPES[config.glasses] ?? '';
    const prof = shared.PROFESSION_LAYERS[config.profession] ?? { body: '', accessory: '' };

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"
  style="--skin-base:${skin.base};--skin-ear:${skin.ear};--lip-color:${skin.lip};--hair-color:${hairColor};--eye-color:${eyeColor}">
  <!-- Body -->${prof.body}
  <!-- Neck --><rect x="88" y="135" width="24" height="22" rx="8" fill="${skin.base}"/>
  <!-- Ears --><ellipse cx="48" cy="90" rx="8" ry="10" fill="${skin.ear}"/>
  <ellipse cx="152" cy="90" rx="8" ry="10" fill="${skin.ear}"/>
  <!-- Hair back -->${hair.back}
  <!-- Face --><ellipse cx="100" cy="88" rx="52" ry="56" fill="${skin.base}"/>
  <!-- Eyes -->${eyes.sclera}${eyes.iris}
  <!-- Brows --><rect x="63" y="72" width="22" height="5" rx="3" fill="${hairColor}"/>
  <rect x="115" y="72" width="22" height="5" rx="3" fill="${hairColor}"/>
  <!-- Nose --><path d="M97,105 Q100,112 103,105" stroke="${skin.ear}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Mouth --><path d="${mouth}" stroke="${skin.lip}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- Mustache -->${mustache}
  <!-- Beard -->${beard}
  <!-- Glasses -->${glasses}
  <!-- Hair front -->${hair.front}
  <!-- Accessory -->${prof.accessory}
</svg>`;
  }

  private generateId(): string {
    return `avatar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
