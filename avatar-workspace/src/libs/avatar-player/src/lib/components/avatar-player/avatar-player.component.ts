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
import type { AvatarConfig } from '@avatar-workspace/avatar-shared';
import { LipSyncService } from '../../services/lip-sync.service';
import { SvgAvatarComponent } from '../svg-avatar/svg-avatar.component';

@Component({
  selector: 'app-avatar-player',
  standalone: true,
  imports: [CommonModule, SvgAvatarComponent],
  template: `
    <div class="avatar-player" [class.avatar-player--speaking]="speaking">
      <app-svg-avatar
        [config]="config"
        [animationsEnabled]="true"
        [viseme]="currentViseme()"
        class="player-avatar" />
    </div>
  `,
  styleUrl: './avatar-player.component.scss',
})
export class AvatarPlayerComponent implements OnChanges {
  @Input({ required: true }) config!: AvatarConfig;
  @Input() speaking = false;
  @Input() message = '';

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
}
