// libs/avatar-player/src/lib/services/lip-sync.service.ts
import { Injectable } from '@angular/core';
import { LipSyncPlayer } from '../geometry';

/**
 * Angular-facing wrapper around the framework-free {@link LipSyncPlayer}.
 *
 * The logic lives in ../geometry so the React player and any non-Angular
 * renderer use the exact same mapping. This class exists only so Angular apps
 * can inject it and so DI gives each player component its own instance.
 */
@Injectable()
export class LipSyncService extends LipSyncPlayer {}