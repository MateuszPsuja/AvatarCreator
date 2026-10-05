// libs/avatar-player/src/lib/services/avatar-animation.service.ts
import { Injectable } from '@angular/core';
import { AvatarAnimator } from 'avatar-player-core';

/**
 * Angular-facing wrapper around the framework-free {@link AvatarAnimator}.
 *
 * The timers live in avatar-player-core so the React player can drive the same
 * blink and pupil logic. This class exists only so Angular apps can inject it
 * and so DI scopes one animator per component — a shared instance would mean
 * one avatar leaving the DOM stops blinking for every other avatar on the page.
 */
@Injectable()
export class AvatarAnimationService extends AvatarAnimator {}