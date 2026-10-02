// libs/avatar-player/src/lib/services/lip-sync.service.ts
import { Injectable } from '@angular/core';
import { textToVisemes, MS_PER_VISEME } from '@avatar-workspace/avatar-shared';

/**
 * Drives visemes in real time for the live preview.
 *
 * The text -> viseme mapping itself lives in avatar-shared because the
 * offline SVG generator needs the exact same mapping to bake an animated
 * mouth into an exported file. Keeping one copy is the whole point — if this
 * drifted from the generator, exported avatars would mouth different words
 * than the preview does.
 */
@Injectable()
export class LipSyncService {
  private readonly MS_PER_VISEME = MS_PER_VISEME;

  /** @see textToVisemes */
  textToVisemes(text: string): number[] {
    return textToVisemes(text);
  }

  /**
   * Play a viseme sequence, calling onViseme(id) each frame.
   * Returns a cancel function. Always resets to 0 (silence) on end or cancel.
   */
  play(visemes: number[], onViseme: (v: number) => void): () => void {
    let i = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled || i >= visemes.length) {
        onViseme(0); // reset to silence
        return;
      }
      onViseme(visemes[i++]);
      setTimeout(tick, this.MS_PER_VISEME);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }
}
