// libs/avatar-player/src/lib/components/svg-avatar/svg-avatar.component.ts
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  signal,
  NgZone,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml, SafeStyle } from '@angular/platform-browser';
import type { AvatarConfig } from '@avatar-workspace/avatar-shared';
import {
  SKIN_TONES,
  HAIR_COLORS,
  EYE_COLORS,
  HAIR_SHAPES,
  EYE_SHAPES,
  MOUTH_SHAPES,
  MUSTACHE_SHAPES,
  BEARD_SHAPES,
  GLASSES_SHAPES,
  PROFESSION_LAYERS,
} from '@avatar-workspace/avatar-shared';
import { AvatarAnimationService } from '../../services/avatar-animation.service';

@Component({
  selector: 'app-svg-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './svg-avatar.component.html',
  styleUrl: './svg-avatar.component.scss',
})
export class SvgAvatarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) config!: AvatarConfig;
  @Input() animationsEnabled = true;
  @Input() viseme = 0; // 0–5, controlled externally for lip sync

  private sanitizer = inject(DomSanitizer);
  private zone = inject(NgZone);
  private anim = inject(AvatarAnimationService);

  // Animation state (driven by AvatarAnimationService)
  eyeBlinkClass = signal<string>('');
  pupilOffset = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  /** CSS custom properties for dynamic colors — recalculated each CD cycle via getter */
  get cssVarsStyle(): SafeStyle {
    const skin = SKIN_TONES[this.config.skinTone];
    const style = [
      `--skin-base: ${skin.base}`,
      `--skin-ear: ${skin.ear}`,
      `--lip-color: ${skin.lip}`,
      `--hair-color: ${HAIR_COLORS[this.config.hairColor]}`,
      `--eye-color: ${EYE_COLORS[this.config.eyeColor]}`,
    ].join('; ');
    return this.sanitizer.bypassSecurityTrustStyle(style);
  }

  // SVG part accessors
  get isWoman(): boolean {
    return this.config.gender === 'woman';
  }
  get hairBack(): string {
    return HAIR_SHAPES[this.config.haircut]?.back ?? '';
  }
  get hairFront(): string {
    return HAIR_SHAPES[this.config.haircut]?.front ?? '';
  }
  get eyeSclera(): string {
    return EYE_SHAPES[this.config.eyeStyle]?.sclera ?? '';
  }
  get eyeIris(): string {
    return EYE_SHAPES[this.config.eyeStyle]?.iris ?? '';
  }
  get mouthPath(): string {
    return MOUTH_SHAPES[this.viseme] ?? MOUTH_SHAPES[0];
  }
  get mustacheSvg(): string {
    return MUSTACHE_SHAPES[this.config.mustache] ?? '';
  }
  get beardSvg(): string {
    return BEARD_SHAPES[this.config.beard] ?? '';
  }
  get glassesSvg(): string {
    return GLASSES_SHAPES[this.config.glasses] ?? '';
  }
  get professionBody(): string {
    return PROFESSION_LAYERS[this.config.profession]?.body ?? '';
  }
  get professionAcc(): string {
    return PROFESSION_LAYERS[this.config.profession]?.accessory ?? '';
  }

  /** Professions that wear a hat / head covering (clips hair) */
  private static readonly HAT_PROFESSIONS: ReadonlySet<string> =
    new Set(['engineer', 'police', 'artist']);

  get hasHat(): boolean {
    return SvgAvatarComponent.HAT_PROFESSIONS.has(this.config.profession);
  }

  get isAstronaut(): boolean {
    return this.config.profession === 'astronaut';
  }

  /** Returns the clip-path url for hair layers based on profession */
  get hairClipUrl(): string | null {
    if (this.config.profession === 'astronaut') return 'url(#helmet-clip)';
    if (this.hasHat) return 'url(#hat-clip)';
    return null;
  }

  /** Clip beard/mustache/ears inside the helmet for astronaut only */
  get helmetClipUrl(): string | null {
    return this.config.profession === 'astronaut' ? 'url(#helmet-clip)' : null;
  }

  /** Bypass security for controlled internal SVG strings only — never user input */
  safe(s: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(s);
  }

  ngOnInit(): void {
    if (this.animationsEnabled) {
      this.zone.runOutsideAngular(() => {
        this.anim.startBlink((v) =>
          this.zone.run(() => this.eyeBlinkClass.set(v))
        );
        this.anim.startEyeMovement((v) =>
          this.zone.run(() => this.pupilOffset.set(v))
        );
        // Head idle is now a pure CSS animation — no JS needed
      });
    }
  }

  ngOnDestroy(): void {
    this.anim.stopAll();
  }
}
