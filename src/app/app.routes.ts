import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/creator/creator.page').then((m) => m.CreatorPageComponent),
  },
  {
    // TEMPORARY beard diagnostic.
    path: 'diag',
    loadComponent: () => import('./diag/diag.page').then((m) => m.DiagPageComponent),
  },
  {
    // Read-only gallery of the app's own exported SVGs.
    path: 'demo',
    loadComponent: () =>
      import('./demo/demo.page').then((m) => m.DemoPageComponent),
  },
];
