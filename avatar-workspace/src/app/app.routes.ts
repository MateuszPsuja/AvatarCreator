import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/creator/creator.page').then((m) => m.CreatorPageComponent),
  },
  {
    // Read-only gallery of the app's own exported SVGs.
    path: 'demo',
    loadComponent: () =>
      import('./demo/demo.page').then((m) => m.DemoPageComponent),
  },
];
