// libs/avatar-player/src/lib/components/svg-avatar/svg-avatar.component.ts
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,
  inject,
  ElementRef,
  NgZone,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle } from '@angular/platform-browser';
import type { AvatarConfig } from '@avatar-workspace/avatar-shared';
import {
  avatarCssVars,
  buildAvatarSvgInner,
  isAstronaut,
  hasHat,
  hairClipUrl,
  helmetClipUrl,
  CANVAS,
  MOUTH_SHAPES,
} from '@avatar-workspace/avatar-shared';
import { AvatarAnimationService } from '../../services/avatar-animation.service';

@Component({
  selector: 'app-svg-avatar',
  standalone: true,
  // The markup is injected with [innerHTML], so Angular's emulated
  // encapsulation would not match it and the styles would silently do
  // nothing — the eyelids would render at full size and hide the eyes.
  // Every selector in the SCSS is namespaced under `.avatar-svg` instead.
  encapsulation: ViewEncapsulation.None,
  template: `<svg xmlns="http://www.w3.org/2000/svg"
     [attr.viewBox]="viewBox"
     class="avatar-svg"
     [class.blink-blinking]="eyeBlinkClass() === 'blinking'"
     [class.blink-half]="eyeBlinkClass() === 'blink-half'"
     [style]="cssVarsStyle"
     [innerHTML]="innerHtml()"></svg>`,
  styleUrl: './svg-avatar.component.scss',
})
export class SvgAvatarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) config!: AvatarConfig;
  @Input() animationsEnabled = true;
  @Input() viseme = 0; // 0–5, controlled externally for lip sync

  /**
   * Namespace for generated element ids. Set this when inlining more than
   * one avatar into a document, otherwise every avatar's `url(#hat-clip)`
   * resolves to the first matching element on the page.
   */
  @Input() idsPrefix = '';

  private readonly sanitizer = inject(DomSanitizer);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly anim = inject(AvatarAnimationService);

  readonly viewBox = CANVAS.viewBox;

  // Animation state (driven by AvatarAnimationService)
  readonly eyeBlinkClass = signal<string>('');
  readonly pupilOffset = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  /** Palette plus the two pupil-offset custom properties the SCSS reads. */
  get cssVarsStyle(): SafeStyle {
    const vars = avatarCssVars(this.config);
    const p = this.pupilOffset();
    const decls =
      `--pupil-x: ${p.x}px; --pupil-y: ${p.y}px; ` +
      Object.entries(vars)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
    return this.sanitizer.bypassSecurityTrustStyle(decls);
  }

  /**
   * The markup is regenerated only when the *config* changes — deliberately
   * NOT when the viseme does. Re-assigning innerHTML mid-utterance would
   * recreate `.layer-head` and restart the head-idle animation every 80ms.
   * Viseme changes are applied to the existing mouth path below instead.
   */
  readonly innerHtml = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      buildAvatarSvgInner(this.config, {
        animated: this.animationsEnabled,
        idsPrefix: this.idsPrefix,
      }),
    ),
  );

  // Public shape helpers — the geometry itself now lives in avatar-shared.
  get isAstronaut(): boolean {
    return isAstronaut(this.config);
  }
  get hasHat(): boolean {
    return hasHat(this.config);
  }
  get hairClipUrl(): string | null {
    return hairClipUrl(this.config, this.idsPrefix);
  }
  get helmetClipUrl(): string | null {
    return helmetClipUrl(this.config, this.idsPrefix);
  }
  get mouthPath(): string {
    return MOUTH_SHAPES[this.viseme] ?? MOUTH_SHAPES[0];
  }

  constructor() {
    // Keep the mouth in sync without re-rendering the whole avatar.
    effect(() => {
      const path = this.mouthPath;
      // Reading innerHtml() makes this re-run after each markup swap, when
      // the fresh .layer-mouth element is guaranteed to be in the DOM.
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
    if (this.animationsEnabled) {
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
