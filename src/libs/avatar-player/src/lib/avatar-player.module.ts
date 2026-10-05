// libs/avatar-player/src/lib/avatar-player.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgAvatarComponent } from './components/svg-avatar/svg-avatar.component';
import { AvatarPlayerComponent } from './components/avatar-player/avatar-player.component';
import { LipSyncService } from './services/lip-sync.service';
import { AvatarAnimationService } from './services/avatar-animation.service';

@NgModule({
  imports: [
    CommonModule,
    // Standalone components imported into the module
    SvgAvatarComponent,
    AvatarPlayerComponent,
  ],
  exports: [
    // Only these two need to be exported for consumers
    SvgAvatarComponent,
    AvatarPlayerComponent,
  ],
  providers: [
    LipSyncService,
    AvatarAnimationService,
  ],
})
export class AvatarPlayerModule {}
