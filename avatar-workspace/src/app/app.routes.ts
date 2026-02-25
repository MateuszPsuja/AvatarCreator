import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/creator/creator.page').then((m) => m.CreatorPageComponent),
  },
];
