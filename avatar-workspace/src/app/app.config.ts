import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AvatarPlayerModule } from '@avatar-workspace/avatar-player';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // The demo page fetches the committed .svg files to inline them.
    provideHttpClient(withFetch()),
    importProvidersFrom(AvatarPlayerModule),
  ],
};
