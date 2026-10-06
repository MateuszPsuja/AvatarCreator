import { SvgAvatar } from './svg-avatar';
import { useLipSync } from './use-lip-sync';
import type { AvatarConfig } from '../../avatar-player/src/lib/geometry';

export interface AvatarPlayerProps {
  config: AvatarConfig;
  /** Mouth the `message` while true. */
  speaking?: boolean;
  /** Text to mouth. Ignored unless `speaking` is true. */
  message?: string;
  /**
   * Namespace for generated element ids.
   *
   * REQUIRED when more than one player is on a page — see `SvgAvatar`. In React
   * this matters more than in Angular, because React reuses DOM nodes when a
   * list re-renders: without a stable prefix, a recycled node can keep the
   * previous avatar's `url(#hat-clip)` target.
   */
  idsPrefix?: string;
  /** Base edge length in px. It grows while speaking. */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Drop-in animated avatar: blinking, eye movement, head idle motion and lip
 * sync.
 *
 * Mirrors the Angular `AvatarPlayerComponent` prop for prop, and shares its
 * renderer and animation logic from the shared geometry — the only
 * difference is the framework syntax.
 *
 * Sizes itself inline from `size`, so a consumer can drop a player at any scale
 * without fighting a stylesheet.
 */
export function AvatarPlayer({
  config,
  speaking = false,
  message = '',
  idsPrefix = '',
  size = 48,
  className,
  style,
}: AvatarPlayerProps) {
  const viseme = useLipSync({ speaking, message });

  /** Speaking reads as a small "leaning in", so the avatar grows. */
  const displaySize = speaking ? size * 1.5 : size;

  const classes = ['avatar-player'];
  if (speaking) classes.push('avatar-player--speaking');
  if (className) classes.push(className);

  return (
    <div className={classes.join(' ')} style={style}>
      <SvgAvatar
        config={config}
        animationsEnabled
        animated
        viseme={viseme}
        idsPrefix={idsPrefix}
        className="player-avatar"
        width={displaySize}
        height={displaySize}
      />
    </div>
  );
}