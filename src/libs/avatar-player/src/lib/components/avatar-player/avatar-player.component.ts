// libs/avatar-player/src/lib/components/avatar-player/avatar-player.component.ts
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  signal,
  inject,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { AvatarConfig } from 'avatar-player-core';
import { LipSyncService } from '../../services/lip-sync.service';
import { SvgAvatarComponent } from '../svg-avatar/svg-avatar.component';

@Component({
  selector: 'app-avatar-player',
  standalone: true,
  imports: [CommonModule, SvgAvatarComponent],
  // Declared here so importing this standalone component is enough. Without it
  // a consumer that skips AvatarPlayerModule gets a NullInjectorError at
  // runtime rather than a compile error.
  providers: [LipSyncService],
  template: `
    <div class="avatar-player" [class.avatar-player--speaking]="speaking">
      <app-svg-avatar
        [config]="config"
        [animationsEnabled]="true"
        [viseme]="currentViseme()"
        [idsPrefix]="idsPrefix"
        [style.width.px]="displaySize()"
        [style.height.px]="displaySize()"
        class="player-avatar" />
    </div>
  `,
  styleUrl: './avatar-player.component.scss',
})
export class AvatarPlayerComponent implements OnChanges {
  @Input({ required: true }) config!: AvatarConfig;
  @Input() speaking = false;
  @Input() message = '';

  /**
   * Namespace for the generated `clipPath` ids.
   *
   * REQUIRED when more than one player is on a page. Every avatar emits
   * `url(#hat-clip)`, which resolves against the *first* matching element in
   * the document — so without a unique prefix per avatar they all clip against
   * whichever came first, and hats and helmets stop hiding hair.
   */
  @Input() idsPrefix = '';

  /** Base edge length in px. It grows while speaking. */
  @Input() size = 48;

  currentViseme = signal(0);

  private lipSync = inject(LipSyncService);
  private zone = inject(NgZone);
  private lipSyncCancelFn: (() => void) | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['speaking'] || changes['message']) {
      // Always cancel previous playback before starting new
      this.lipSyncCancelFn?.();

      if (this.speaking && this.message) {
        const visemes = this.lipSync.textToVisemes(this.message);
        this.lipSyncCancelFn = this.lipSync.play(visemes, (v) => {
          this.zone.run(() => this.currentViseme.set(v));
        });
      } else {
        this.currentViseme.set(0);
      }
    }
  }

  /** Speaking reads as a small "leaning in", so the avatar grows. */
  displaySize(): number {
    return this.speaking ? this.size * 1.5 : this.size;
  }
}
