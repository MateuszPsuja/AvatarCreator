// src/app/demo/demo.page.ts
//
// READ-ONLY gallery of the app's own SVG exports.
//
// Everything here is deliberately dumb: the page renders committed files
// with <img> and does not touch the renderer. That is the point. If an
// exported file ever depends on ambient CSS, a parent custom property, or
// anything else it cannot carry with it, the image visibly breaks. Using the
// component instead would hide exactly the class of bug this demo is for.
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DEMO_AVATARS, DEMO_ASSET_DIR, DemoAvatar } from './demo-manifest';

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './demo.page.html',
  styleUrl: './demo.page.scss',
})
export class DemoPageComponent {
  readonly avatars = DEMO_AVATARS;
  readonly assetDir = DEMO_ASSET_DIR;

  readonly query = signal('');
  readonly active = signal<DemoAvatar | null>(null);

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.avatars;
    return this.avatars.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.slug.includes(q) ||
        a.notes.toLowerCase().includes(q) ||
        a.config.profession.includes(q),
    );
  });

  src(avatar: DemoAvatar): string {
    return `${this.assetDir}/${avatar.slug}.svg`;
  }

  open(avatar: DemoAvatar): void {
    this.active.set(avatar);
  }

  close(): void {
    this.active.set(null);
  }

  /** Trait chips shown under each avatar in the grid. */
  chips(avatar: DemoAvatar): string[] {
    const c = avatar.config;
    const out = [c.gender, c.profession === 'none' ? 'no profession' : c.profession];
    if (c.haircut !== 'bald') out.push(c.haircut + ' hair');
    if (c.beard !== 'none') out.push(c.beard + ' beard');
    if (c.glasses !== 'none') out.push(c.glasses);
    return out;
  }
}
