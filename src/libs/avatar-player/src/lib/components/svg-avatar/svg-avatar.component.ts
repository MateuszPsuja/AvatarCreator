// libs/avatar-player/src/lib/components/svg-avatar/svg-avatar.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  input,
  signal,
  computed,
  effect,
  inject,
  ElementRef,
  NgZone,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle } from '@angular/platform-browser';
import type { AvatarConfig } from '../../geometry';
import {
  avatarCssVars,
  buildAvatarSvgInner,
  isAstronaut,
  hasHat,
  hairClipUrl,
  helmetClipUrl,
  CANVAS,
} from '../../geometry';
import { MOUTH_SHAPES } from '../../geometry';
import { AvatarAnimationService } from '../../services/avatar-animation.service';

@Component({
  selector: 'app-svg-avatar',
  standalone: true,
  // The markup is injected with [innerHTML], so Angular's emulated
  // encapsulation would not match it and the styles would silently do
  // nothing — the eyelids would render at full size and hide the eyes.
  // Every selector in the SCSS is namespaced under `.avatar-svg` instead.
  encapsulation: ViewEncapsulation.None,
  // Per-component, not app-wide. ngOnDestroy calls anim.stopAll(), so a shared
  // instance would mean one avatar leaving the DOM stops blinking and head
  // motion for every other avatar on the page. That is invisible with a single
  // avatar and breaks a gallery of them.
  providers: [AvatarAnimationService],
  template: `<svg xmlns="http://www.w3.org/2000/svg"
     [attr.viewBox]="viewBox"
     class="avatar-svg"
     [class.blink-blinking]="eyeBlinkClass() === 'blinking'"
     [class.blink-half]="eyeBlinkClass() === 'blink-half'"
     [style]="cssVarsStyle()"
     [innerHTML]="innerHtml()"></svg>`,
  styleUrl: './svg-avatar.component.scss',
})
export class SvgAvatarComponent implements OnInit, OnDestroy {
  // ── Signal inputs ────────────────────────────────────────────
  //
  // These were `@Input` fields mirrored into signals via ngOnChanges.
  // That indirection was the root cause of four separate bugs: a `computed`
  // or `effect` that reads a plain property registers no dependency, so it
  // evaluates once and never invalidates. The symptoms were a frozen avatar,
  // permanently disabled undo/redo, and a dead Test Speech button.
  //
  // Signal inputs make that mistake impossible: reading `config()` inside a
  // computed registers a real dependency, so the derived values below cannot
  // silently go stale.
  readonly config = input.required<AvatarConfig>();
  readonly animationsEnabled = input(true);
  /** 0–5, controlled externally for lip sync. */
  readonly viseme = input(0);
  /**
   * Namespace for generated element ids. Set this when inlining more than
   * one avatar into a document, otherwise every avatar's `url(#hat-clip)`
   * resolves to the first matching element on the page.
   */
  readonly idsPrefix = input('');

  private readonly sanitizer = inject(DomSanitizer);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly anim = inject(AvatarAnimationService);

  readonly viewBox = CANVAS.viewBox;

  // Animation state (driven by AvatarAnimationService)
  readonly eyeBlinkClass = signal<string>('');
  readonly pupilOffset = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  /**
   * Palette plus the two pupil-offset custom properties the SCSS reads.
   *
   * A computed, not a getter: a getter returns a new SafeStyle on every
   * change-detection pass, so Angular re-wrote the style attribute each
   * cycle. A getter also cannot track `config`, so it went stale too.
   */
  readonly cssVarsStyle = computed<SafeStyle>(() => {
    const p = this.pupilOffset();
    const decls =
      `--pupil-x: ${p.x}px; --pupil-y: ${p.y}px; ` +
      Object.entries(avatarCssVars(this.config()))
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
    return this.sanitizer.bypassSecurityTrustStyle(decls);
  });

  /**
   * The markup is regenerated only when the *config* changes — deliberately
   * NOT when the viseme does. Re-assigning innerHTML mid-utterance would
   * recreate `.layer-head` and restart the head-idle animation every 80ms.
   * Viseme changes are applied to the existing mouth path below instead.
   */
  readonly innerHtml = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      buildAvatarSvgInner(this.config(), {
        animated: this.animationsEnabled(),
        idsPrefix: this.idsPrefix(),
      }),
    ),
  );

  // Public shape helpers — the geometry itself lives in lib/shared.
  readonly isAstronaut = computed(() => isAstronaut(this.config()));
  readonly hasHat = computed(() => hasHat(this.config()));
  readonly hairClipUrl = computed(() => hairClipUrl(this.config(), this.idsPrefix()));
  readonly helmetClipUrl = computed(() => helmetClipUrl(this.config(), this.idsPrefix()));
  readonly mouthPath = computed(() => MOUTH_SHAPES[this.viseme()] ?? MOUTH_SHAPES[0]);

  constructor() {
    // Keep the mouth in sync without re-rendering the whole avatar.
    effect(() => {
      // Both reads are signal-tracked: mouthPath so the mouth follows lip
      // sync, innerHtml so the path is re-applied after each markup swap,
      // when the fresh .layer-mouth element is guaranteed to be in the DOM.
      const path = this.mouthPath();
      this.innerHtml();
      this.applyMouthPath(path);
    });
  }

  private applyMouthPath(path: string): void {
    const mouth = this.host.nativeElement.querySelector<SVGPathElement>('.layer-mouth');
    if (mouth) {
      mouth.setAttribute('d', path);
      return;
    }
    // Markup was swapped this tick and the element is not queryable yet.
    requestAnimationFrame(() => {
      this.host.nativeElement
        .querySelector<SVGPathElement>('.layer-mouth')
        ?.setAttribute('d', path);
    });
  }

  ngOnInit(): void {
    if (this.animationsEnabled()) {
      this.zone.runOutsideAngular(() => {
        this.anim.startBlink((v) => this.zone.run(() => this.eyeBlinkClass.set(v)));
        this.anim.startEyeMovement((v) => this.zone.run(() => this.pupilOffset.set(v)));
        // Head idle is a pure CSS animation — no JS needed
      });
    }
  }

  ngOnDestroy(): void {
    this.anim.stopAll();
  }
}
