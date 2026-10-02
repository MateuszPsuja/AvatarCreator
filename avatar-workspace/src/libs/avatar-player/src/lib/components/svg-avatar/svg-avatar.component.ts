// libs/avatar-player/src/lib/components/svg-avatar/svg-avatar.component.ts
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
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
export class SvgAvatarComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) config!: AvatarConfig;
  @Input() animationsEnabled = true;
  @Input() viseme = 0; // 0–5, controlled externally for lip sync

  /**
   * Namespace for generated element ids. Set this when inlining more than
   * one avatar into a document, otherwise every avatar's `url(#hat-clip)`
   * resolves to the first matching element on the page.
   */
  @Input() idsPrefix = '';

  /**
   * Signal mirrors of the inputs.
   *
   * A `computed` only tracks *signals*. Reading a plain `@Input` property
   * inside one registers no dependency, so the computed evaluates once and
   * never invalidates — the avatar would silently freeze on its first render
   * and every picker in the creator page would do nothing. ngOnChanges copies
   * each input into a signal so the computed actually reacts.
   */
  private readonly configSig = signal<AvatarConfig | null>(null);
  private readonly animatedSig = signal(true);
  private readonly idsPrefixSig = signal('');
  /**
   * Viseme, mirrored like the others. Lip sync drives this at ~12fps, and
   * reading the plain @Input here left the mouth effect with no tracked
   * dependency — so "Test speech" did nothing at all.
   */
  private readonly visemeSig = signal(0);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) this.configSig.set(this.config ?? null);
    if (changes['animationsEnabled']) this.animatedSig.set(this.animationsEnabled);
    if (changes['idsPrefix']) this.idsPrefixSig.set(this.idsPrefix);
    if (changes['viseme']) this.visemeSig.set(this.viseme);
  }

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
   * cycle. Derived from the signal mirrors so it actually invalidates when
   * the inputs or the pupils move, and not otherwise.
   */
  readonly cssVarsStyle = computed<SafeStyle>(() => {
    const config = this.configSig();
    const p = this.pupilOffset();
    if (!config) {
      return this.sanitizer.bypassSecurityTrustStyle('--pupil-x: 0px; --pupil-y: 0px');
    }
    const vars = avatarCssVars(config);
    const decls =
      `--pupil-x: ${p.x}px; --pupil-y: ${p.y}px; ` +
      Object.entries(vars)
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
  readonly innerHtml = computed<SafeHtml>(() => {
    // Guarding keeps a missing input from throwing a TypeError that would
    // take the surrounding template down with it — a blank preview is a far
    // better failure than a broken page.
    const config = this.configSig();
    if (!config) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }
    return this.sanitizer.bypassSecurityTrustHtml(
      buildAvatarSvgInner(config, {
        animated: this.animatedSig(),
        idsPrefix: this.idsPrefixSig(),
      }),
    );
  });

  // Public shape helpers — the geometry itself now lives in avatar-shared.
  get isAstronaut(): boolean {
    return this.config ? isAstronaut(this.config) : false;
  }
  get hasHat(): boolean {
    return this.config ? hasHat(this.config) : false;
  }
  get hairClipUrl(): string | null {
    return this.config ? hairClipUrl(this.config, this.idsPrefix) : null;
  }
  get helmetClipUrl(): string | null {
    return this.config ? helmetClipUrl(this.config, this.idsPrefix) : null;
  }
  get mouthPath(): string {
    return MOUTH_SHAPES[this.visemeSig()] ?? MOUTH_SHAPES[0];
  }

  constructor() {
    // Keep the mouth in sync without re-rendering the whole avatar.
    effect(() => {
      // Both reads are signal-tracked: visemeSig so the mouth follows lip
      // sync, innerHtml so the path is re-applied after each markup swap,
      // when the fresh .layer-mouth element is guaranteed to be in the DOM.
      const path = this.mouthPath;
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
