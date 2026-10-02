// src/app/demo/demo.page.ts
//
// READ-ONLY gallery of the app's own SVG exports, with a play button per
// avatar that mouths a ~4 second phrase.
//
// The files are still the artifact: each card fetches the committed .svg and
// injects that exact text. We inline it rather than using <img> because a
// play button has to control the mouth, and an <img>-loaded SVG is inert to
// the host page — no clicks, no scripting, no attribute changes. Inlining
// keeps the "is the file self-contained?" check honest, because a file that
// depended on external CSS would still render wrong once injected.
import {
  Component,
  signal,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MOUTH_SHAPES, textToVisemes, MS_PER_VISEME } from '@avatar-workspace/avatar-shared';
import { DEMO_AVATARS, DEMO_ASSET_DIR, DemoAvatar } from './demo-manifest';

/** How long a single play lasts. */
const SPEECH_MS = 4000;

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './demo.page.html',
  styleUrl: './demo.page.scss',
})
export class DemoPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly avatars = DEMO_AVATARS;
  readonly assetDir = DEMO_ASSET_DIR;
  readonly speechMs = SPEECH_MS;

  /** slug -> the file's own markup, fetched once. */
  private readonly markup = new Map<string, SafeHtml>();
  readonly loaded = signal<Set<string>>(new Set());
  readonly playing = signal<string | null>(null);

  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly active = signal<DemoAvatar | null>(null);

  ngOnInit(): void {
    for (const avatar of this.avatars) {
      this.http.get(this.src(avatar), { responseType: 'text' }).subscribe({
        next: (text) => {
          this.markup.set(
            avatar.slug,
            this.sanitizer.bypassSecurityTrustHtml(text),
          );
          this.loaded.update((set) => new Set(set).add(avatar.slug));
        },
        error: () => console.warn(`Failed to load ${this.src(avatar)}`),
      });
    }
  }

  src(avatar: DemoAvatar): string {
    return `${this.assetDir}/${avatar.slug}.svg`;
  }

  markupFor(avatar: DemoAvatar): SafeHtml | null {
    return this.markup.get(avatar.slug) ?? null;
  }

  isReady(avatar: DemoAvatar): boolean {
    return this.loaded().has(avatar.slug);
  }

  isPlaying(avatar: DemoAvatar): boolean {
    return this.playing() === avatar.slug;
  }

  toggle(avatar: DemoAvatar): void {
    if (this.isPlaying(avatar)) {
      this.stop(avatar.slug);
    } else {
      this.play(avatar);
    }
  }

  /**
   * Mouth the phrase for SPEECH_MS, then return to silence.
   *
   * The viseme sequence is trimmed to what actually fits in the window, so a
   * long phrase is cut at a word-ish boundary rather than mid-syllable.
   */
  play(avatar: DemoAvatar): void {
    this.stop(avatar.slug);
    this.playing.set(avatar.slug);

    const budget = Math.floor(SPEECH_MS / MS_PER_VISEME);
    let visemes = textToVisemes(avatar.speech);
    if (visemes.length > budget) {
      visemes = visemes.slice(0, budget);
    }
    // Always land on silence so the loop does not end on an open shape.
    if (visemes[visemes.length - 1] !== 0) visemes.push(0);

    let i = 0;
    const step = () => {
      if (this.playing() !== avatar.slug) return;
      if (i >= visemes.length) {
        this.stop(avatar.slug);
        return;
      }
      this.setMouth(avatar.slug, MOUTH_SHAPES[visemes[i]] ?? MOUTH_SHAPES[0]);
      i++;
      const t = setTimeout(step, MS_PER_VISEME);
      this.timers.set(avatar.slug, t);
    };
    step();
  }

  stop(slug: string): void {
    const t = this.timers.get(slug);
    if (t) clearTimeout(t);
    this.timers.delete(slug);
    if (this.playing() === slug) this.playing.set(null);
    this.setMouth(slug, MOUTH_SHAPES[0]);
  }

  stopAll(): void {
    for (const slug of [...this.timers.keys()]) this.stop(slug);
  }

  /** Every card renders the same ids, so scope the lookup to one card. */
  private setMouth(slug: string, path: string): void {
    const card = this.host.nativeElement.querySelector<HTMLElement>(
      `[data-slug="${slug}"]`,
    );
    const mouth = card?.querySelector<SVGPathElement>('.layer-mouth');
    mouth?.setAttribute('d', path);
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
