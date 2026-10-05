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
   *
   * `onEnd` fires exactly once when the sequence finishes or is cancelled, so
   * callers can clear a "speaking" flag reliably. Do NOT infer the end from
   * onViseme(0): viseme 0 is silence and occurs at every space, so it would
   * end the utterance at the first word gap.
   *
   * Returns a cancel function. Always resets to 0 (silence) on end or cancel.
   */
  play(
    visemes: number[],
    onViseme: (v: number) => void,
    onEnd?: () => void,
  ): () => void {
    let i = 0;
    let cancelled = false;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      onViseme(0); // reset to silence
      onEnd?.();
    };

    const tick = () => {
      if (cancelled || i >= visemes.length) {
        finish();
        return;
      }
      onViseme(visemes[i++]);
      setTimeout(tick, this.MS_PER_VISEME);
    };

    tick();
    return () => {
      cancelled = true;
      finish();
    };
  }
}
