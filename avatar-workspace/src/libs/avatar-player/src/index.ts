// libs/avatar-player/src/index.ts — public API barrel

// Module entry point
export { AvatarPlayerModule } from './lib/avatar-player.module';

// Components (for standalone import)
export { SvgAvatarComponent } from './lib/components/svg-avatar/svg-avatar.component';
export { AvatarPlayerComponent } from './lib/components/avatar-player/avatar-player.component';

// Services (for manual DI)
export { LipSyncService } from './lib/services/lip-sync.service';
export { AvatarAnimationService } from './lib/services/avatar-animation.service';

// Model re-export convenience
export type { AvatarConfig } from '@avatar-workspace/avatar-shared';
