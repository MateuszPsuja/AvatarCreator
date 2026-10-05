/**
 * Blink, pupil drift and head-idle driving — framework-free.
 *
 * This was the body of an Angular `@Injectable()` service. Nothing in it ever
 * touched Angular, only `setTimeout` and `requestAnimationFrame`, so it lives
 * here and the Angular wrapper just delegates. The React player uses it
 * directly.
 *
 * Head idle is deliberately *not* here: it is a pure CSS animation, so it costs
 * no JavaScript and no framework re-render. See the stylesheet.
 */
export class AvatarAnimator {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private rafs: number[] = [];

  /**
   * Start random blink animation.
   * Calls onState with CSS class names: 'blinking' → 'blink-half' → ''
   * Interval: 2.5–5s random for natural feel.
   */
  startBlink(onState: (cssClass: string) => void): void {
    const doBlink = () => {
      onState('blinking');
      const t1 = setTimeout(() => {
        onState('blink-half');
        const t2 = setTimeout(() => {
          onState('');
          // Schedule next blink: 2.5s–5s random interval
          const t3 = setTimeout(doBlink, 2500 + Math.random() * 2500);
          this.timers.push(t3);
        }, 50);
        this.timers.push(t2);
      }, 80);
      this.timers.push(t1);
    };
    const init = setTimeout(doBlink, 1000 + Math.random() * 1000);
    this.timers.push(init);
  }

  /**
   * Start random eye movement (pupil tracking).
   * Calls onOffset with {x, y} pixel offsets for the pupil group.
   */
  startEyeMovement(onOffset: (v: { x: number; y: number }) => void): void {
    const move = () => {
      const dx = (Math.random() - 0.5) * 8;
      const dy = (Math.random() - 0.5) * 4;
      onOffset({ x: dx, y: dy });
      const t = setTimeout(move, 1800 + Math.random() * 2200);
      this.timers.push(t);
    };
    const init = setTimeout(move, 500);
    this.timers.push(init);
  }

  /**
   * Start subtle head idle motion via requestAnimationFrame.
   * Produces a gentle sine-wave rotation + vertical bob.
   */
  startHeadIdle(onTransform: (t: string) => void): void {
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const rotZ = Math.sin(t * 0.6) * 1.5;
      const transY = Math.sin(t * 0.4) * 1.5;
      onTransform(`rotate(${rotZ}, 100, 150) translate(0, ${transY})`);
      this.rafs.push(requestAnimationFrame(tick));
    };
    this.rafs.push(requestAnimationFrame(tick));
  }

  /** Stop all running animations and clear timers/rafs. */
  stopAll(): void {
    this.timers.forEach(clearTimeout);
    this.rafs.forEach(cancelAnimationFrame);
    this.timers = [];
    this.rafs = [];
  }
}