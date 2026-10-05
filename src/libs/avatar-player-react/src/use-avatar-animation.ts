import { useEffect, useRef, useState } from 'react';
import { AvatarAnimator } from 'avatar-player-core';

/** Blink state, matching the CSS classes in the stylesheet. */
export type BlinkState = '' | 'blinking' | 'blink-half';

export interface AvatarAnimationState {
  /** CSS class for the current eyelid position: '', 'blinking' or 'blink-half'. */
  blinkClass: BlinkState;
  /** Pupil offset in px, applied through the --pupil-x / --pupil-y custom properties. */
  pupilOffset: { x: number; y: number };
}

/**
 * Random blinking and pupil drift, backed by the framework-free
 * {@link AvatarAnimator} from avatar-player-core — the exact same logic the
 * Angular player runs, so the two cannot drift apart.
 *
 * Head idle is deliberately not here: it is a pure CSS animation, so it costs
 * no JavaScript and no re-render. See the stylesheet.
 *
 * Headless and safe to call conditionally only in the sense that React's rules
 * apply as always — call it unconditionally at the top level.
 */
export function useAvatarAnimation(enabled = true): AvatarAnimationState {
  const [state, setState] = useState<AvatarAnimationState>({
    blinkClass: '',
    pupilOffset: { x: 0, y: 0 },
  });

  // One animator per component instance. A shared instance would mean one
  // avatar unmounting stops blinking for every other avatar on the page —
  // invisible with one avatar, broken in a gallery of them.
  const animRef = useRef<AvatarAnimator | null>(null);
  if (animRef.current === null) animRef.current = new AvatarAnimator();

  useEffect(() => {
    if (!enabled) return;
    const anim = animRef.current!;

    // AvatarAnimator types its callback as `string` because it is
    // framework-agnostic and knows nothing about the CSS classes here; the cast
    // is where the two meet, and the values it can emit are exactly the three
    // BlinkState members.
    anim.startBlink((value) =>
      setState((s) => ({ ...s, blinkClass: value as BlinkState })),
    );
    anim.startEyeMovement((pupilOffset) => setState((s) => ({ ...s, pupilOffset })));

    return () => anim.stopAll();
  }, [enabled]);

  return state;
}