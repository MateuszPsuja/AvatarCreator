import { useEffect, useMemo, useRef } from 'react';
import {
  avatarCssVars,
  buildAvatarSvgInner,
  CANVAS,
  MOUTH_SHAPES,
  type AvatarConfig,
} from '../../avatar-player/src/lib/geometry';
import { useAvatarAnimation } from './use-avatar-animation';

export interface SvgAvatarProps {
  config: AvatarConfig;
  /** Blinking and pupil drift. Head idle is CSS and is controlled by `animated`. */
  animationsEnabled?: boolean;
  /** 0–5, controlled externally for lip sync. */
  viseme?: number;
  /**
   * Namespace for generated element ids.
   *
   * REQUIRED when more than one avatar is on a page. Every avatar emits
   * `url(#hat-clip)`, which resolves against the *first* matching element in
   * the document — so without a unique prefix per avatar they all clip against
   * whichever came first, and hats and helmets stop hiding hair.
   */
  idsPrefix?: string;
  /** Adds the CSS head-idle animation. */
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
}

/**
 * Static SVG avatar with optional blinking and pupil drift.
 *
 * The markup is injected with `dangerouslySetInnerHTML`, so React cannot own
 * those nodes. That is the same trade the Angular component makes with
 * `[innerHTML]`, and it is what lets one renderer serve React, Angular and the
 * offline exporter. The markup contains no user input — only the config's
 * enumerated trait values — so there is no untrusted HTML in it.
 */
export function SvgAvatar({
  config,
  animationsEnabled = true,
  viseme = 0,
  idsPrefix = '',
  animated = false,
  className,
  style,
  width,
  height,
}: SvgAvatarProps) {
  const { blinkClass, pupilOffset } = useAvatarAnimation(animationsEnabled);

  // Regenerated only when the *config* changes — deliberately NOT when the
  // viseme does. Re-assigning innerHTML mid-utterance would recreate
  // `.layer-head` and restart the head-idle animation every 80ms. Viseme
  // changes are applied to the existing mouth path below instead.
  const markup = useMemo(
    () => buildAvatarSvgInner(config, { animated, idsPrefix }),
    [config, animated, idsPrefix],
  );

  const svgRef = useRef<SVGSVGElement | null>(null);
  const mouthPath = MOUTH_SHAPES[viseme] ?? MOUTH_SHAPES[0];

  // Keep the mouth in sync without re-rendering the whole avatar: swap the `d`
  // attribute on the existing path rather than replacing the markup.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const mouth = svg.querySelector<SVGPathElement>('.layer-mouth');
    if (mouth) {
      mouth.setAttribute('d', mouthPath);
      return;
    }
    // Markup was swapped this tick and the element is not queryable yet.
    const raf = requestAnimationFrame(() => {
      svgRef.current
        ?.querySelector<SVGPathElement>('.layer-mouth')
        ?.setAttribute('d', mouthPath);
    });
    return () => cancelAnimationFrame(raf);
  }, [mouthPath, markup]);

  // Palette plus the two pupil-offset custom properties the stylesheet reads,
  // so moving the eyes never re-renders the markup.
  //
  // React accepts custom properties directly on the style object, so these
  // pass through untouched — no inline `style` string is parsed here.
  const cssVars = useMemo(
    () =>
      ({
        '--pupil-x': `${pupilOffset.x}px`,
        '--pupil-y': `${pupilOffset.y}px`,
        ...avatarCssVars(config),
      }) as React.CSSProperties,
    [config, pupilOffset],
  );

  const classes = ['avatar-svg'];
  if (blinkClass) classes.push(`blink-${blinkClass}`);
  if (className) classes.push(className);

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={CANVAS.viewBox}
      className={classes.join(' ')}
      style={{ ...style, ...cssVars }}
      width={width}
      height={height}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
