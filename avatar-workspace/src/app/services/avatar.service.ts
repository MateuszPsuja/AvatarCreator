// services/avatar.service.ts — Config state + persistence + export
import { Injectable } from '@angular/core';
import type { AvatarConfig } from '@avatar-workspace/avatar-shared';
import { buildAvatarSvg } from '@avatar-workspace/avatar-shared';

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

  /**
   * Build a standalone SVG document for the given config.
   *
   * Delegates to the shared renderer so the exported file is pixel-identical
   * to the on-screen preview — same geometry, same palette, same clip paths.
   * Animation hooks are omitted by design: a static file has nothing to drive
   * them.
   */
  buildSvg(config: AvatarConfig): string {
    return buildAvatarSvg(config);
  }

  /** Export avatar as a standalone SVG file download */
  downloadSVG(config: AvatarConfig): void {
    const svg = this.buildSvg(config);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name || 'avatar'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private generateId(): string {
    return `avatar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
