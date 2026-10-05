import { useEffect, useRef, useState } from 'react';
import { LipSyncPlayer } from 'avatar-player-core';

export interface UseLipSyncOptions {
  /** Play the sequence. When false the mouth returns to silence. */
  speaking: boolean;
  /** Text to mouth. Changes restart playback from the beginning. */
  message: string;
}

/**
 * Drives the mouth through a viseme sequence while `speaking` is true.
 *
 * Backed by the framework-free {@link LipSyncPlayer}, so the Angular player and
 * this hook use one text → viseme mapping. Restarting on every `message` change
 * matches the Angular component: a new utterance cancels the old one instead of
 * queueing.
 */
export function useLipSync({ speaking, message }: UseLipSyncOptions): number {
  const [viseme, setViseme] = useState(0);
  const playerRef = useRef<LipSyncPlayer | null>(null);
  if (playerRef.current === null) playerRef.current = new LipSyncPlayer();

  useEffect(() => {
    if (!speaking || !message) {
      setViseme(0);
      return;
    }
    const player = playerRef.current!;
    const cancel = player.play(player.textToVisemes(message), setViseme);
    // Cancel on unmount and whenever the message changes, so a stale utterance
    // cannot keep driving the mouth after the text has been replaced.
    return cancel;
  }, [speaking, message]);

  return viseme;
}