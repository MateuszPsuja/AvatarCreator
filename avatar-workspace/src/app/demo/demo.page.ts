// src/app/demo/demo.page.ts
//
// Gallery of the app's own exports, each one played by the real player.
//
// Every card loads the committed `<slug>.json` that `npm run demo:build`
// wrote through AvatarService — the same bytes the Export Bundle button puts in
// a .zip — and hands it to <app-avatar-player>. Nothing here re-renders an
// avatar or touches a mouth path: blinking, pupil movement, head motion and
// lip sync all come from the published player component, so this page is a
// working example of the integration a consuming app would write.
//
// The .svg files are still committed next to the JSON as the standalone-artwork
// check, but the gallery deliberately does not inline them — a player needs the
// config, and an <img>-loaded SVG is inert to the host page anyway.
import {
  Component,
  signal,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { AvatarConfig } from '@avatar-workspace/avatar-shared';
import { AvatarPlayerComponent } from '@avatar-workspace/avatar-player';
import { DEMO_AVATARS, DEMO_ASSET_DIR, DemoAvatar } from './demo-manifest';

/** Base edge length in px for a card avatar. It grows while speaking. */
const CARD_SIZE = 100;
/** Same, in the lightbox. */
const LIGHTBOX_SIZE = 170;

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [CommonModule, AvatarPlayerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './demo.page.html',
  styleUrl: './demo.page.scss',
})
export class DemoPageComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly avatars = DEMO_AVATARS;
  readonly assetDir = DEMO_ASSET_DIR;
  readonly cardSize = CARD_SIZE;
  readonly lightboxSize = LIGHTBOX_SIZE;

  /** slug -> the exported config, fetched once. */
  private readonly configs = new Map<string, AvatarConfig>();
  readonly loaded = signal<Set<string>>(new Set());

  /** slug of the one avatar currently speaking, if any. */
  readonly playing = signal<string | null>(null);

  readonly active = signal<DemoAvatar | null>(null);

  ngOnInit(): void {
    for (const avatar of this.avatars) {
      this.http.get<AvatarConfig>(this.src(avatar)).subscribe({
        next: (config) => {
          this.configs.set(avatar.slug, config);
          this.loaded.update((set) => new Set(set).add(avatar.slug));
        },
        error: () => console.warn(`Failed to load ${this.src(avatar)}`),
      });
    }
  }

  src(avatar: DemoAvatar): string {
    return `${this.assetDir}/${avatar.slug}.json`;
  }

  configFor(avatar: DemoAvatar): AvatarConfig | null {
    return this.configs.get(avatar.slug) ?? null;
  }

  isReady(avatar: DemoAvatar): boolean {
    return this.loaded().has(avatar.slug);
  }

  /**
   * Unique per avatar, and REQUIRED here.
   *
   * The renderer emits `url(#hat-clip)` for every avatar. Browsers resolve that
   * against the first matching element in the document, so without a distinct
   * prefix all 16 cards would clip against whichever one rendered first and
   * the hats and helmets would stop hiding hair.
   */
  idsPrefix(avatar: DemoAvatar): string {
    return `${avatar.slug}-`;
  }

  isPlaying(avatar: DemoAvatar): boolean {
    return this.playing() === avatar.slug;
  }

  toggle(avatar: DemoAvatar): void {
    this.playing.set(this.isPlaying(avatar) ? null : avatar.slug);
  }

  open(avatar: DemoAvatar): void {
    this.active.set(avatar);
  }

  close(): void {
    this.active.set(null);
  }

  /**
   * Trait chips, read from the *exported* config rather than the manifest.
   *
   * That is the point of loading the JSON: if the export ever stopped carrying
   * a field, the chips would fall back to the manifest's copy and quietly lie.
   * Reading the loaded config keeps the card honest about what was exported.
   */
  chips(avatar: DemoAvatar): string[] {
    const c = this.configFor(avatar);
    if (!c) return [];
    const out = [c.gender, c.profession === 'none' ? 'no profession' : c.profession];
    if (c.haircut !== 'bald') out.push(c.haircut + ' hair');
    if (c.beard !== 'none') out.push(c.beard + ' beard');
    if (c.glasses !== 'none') out.push(c.glasses);
    return out;
  }
}
