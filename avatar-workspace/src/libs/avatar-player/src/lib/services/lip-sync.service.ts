// libs/avatar-player/src/lib/services/lip-sync.service.ts
import { Injectable } from '@angular/core';

@Injectable()
export class LipSyncService {
  private readonly MS_PER_VISEME = 80;

  /**
   * Map text characters to viseme IDs 0–5.
   * 0=silence, 1=A/I wide, 2=O/U round, 3=E spread, 4=M/B/P pressed, 5=F/V teeth
   */
  textToVisemes(text: string): number[] {
    return text
      .toLowerCase()
      .split('')
      .map((char) => {
        if ('ai'.includes(char)) return 1; // wide
        if ('ou'.includes(char)) return 2; // rounded
        if ('e'.includes(char)) return 3; // spread
        if ('mbp'.includes(char)) return 4; // pressed
        if ('fv'.includes(char)) return 5; // teeth-lip
        if (char === ' ') return 0; // silence
        return 3; // default consonant
      });
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
