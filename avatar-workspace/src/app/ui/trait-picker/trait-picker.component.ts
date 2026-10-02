import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface TraitOption<T = string> {
  value: T;
  label: string;
  /** Standalone SVG thumbnail. Preferred over `icon`. */
  svgPreview?: string;
  icon?: string;
}

@Component({
  selector: 'app-trait-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap gap-1.5" role="radiogroup" [attr.aria-label]="label()">
      @for (opt of options(); track opt.value) {
        <button
          type="button"
          role="radio"
          class="trait group"
          [class.trait--on]="value() === opt.value"
          [attr.aria-checked]="value() === opt.value"
          [attr.aria-label]="opt.label"
          [title]="opt.label"
          (click)="selected.emit(opt.value)">
          <span class="trait-art" [innerHTML]="preview(opt)"></span>
          <span class="trait-label">{{ opt.label }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    .trait {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      width: 4.25rem;
      padding: 0.375rem 0.25rem 0.3rem;
      cursor: pointer;
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      border-radius: 0.25rem;
      transition: transform 0.12s ease, border-color 0.12s ease,
                  box-shadow 0.12s ease;
    }

    .trait:hover {
      transform: translate(-1px, -1px);
      border-color: hsl(var(--foreground) / 0.5);
      box-shadow: 2px 2px 0 0 hsl(var(--foreground) / 0.9);
    }

    .trait:focus-visible {
      outline: 2px solid hsl(var(--ring));
      outline-offset: 2px;
    }

    /* Selected reads as a second plate printed in spot blue, not a glow. */
    .trait--on {
      border-color: hsl(var(--primary));
      box-shadow: 3px 3px 0 0 hsl(var(--primary));
    }

    .trait-art {
      display: block;
      width: 100%;
      aspect-ratio: 1;
      overflow: hidden;
      background: hsl(var(--muted) / 0.6);
      border-radius: 0.125rem;
    }

    .trait-art ::ng-deep svg {
      display: block;
      width: 100%;
      height: 100%;
    }

    .trait-label {
      font-family: 'Martian Mono', ui-monospace, monospace;
      font-size: 0.5rem;
      line-height: 1.2;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      text-align: center;
      color: hsl(var(--muted-foreground));
    }

    .trait--on .trait-label {
      color: hsl(var(--foreground));
    }
  `],
})
export class TraitPickerComponent<T = string> {
  options = input.required<TraitOption<T>[]>();
  value = input.required<T>();
  selected = output<T>();
  /** Group label for the radiogroup; also used as an accessible name. */
  label = input<string>('options');

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Trust-cache for previews, keyed by option value.
   *
   * Without this, `preview()` ran on every change-detection pass and returned
   * a fresh SafeHtml each time, so Angular saw a changed binding and
   * re-assigned innerHTML — re-parsing the SVG for every option on every
   * cycle. That destroyed the button's contents between a click's mousedown
   * and mouseup, so the click event never fired and options needed two
   * clicks. Caching makes the identity stable and the write disappear.
   */
  private readonly previewCache = new Map<string, SafeHtml>();

  preview(opt: TraitOption<T>): SafeHtml | null {
    if (!opt.svgPreview) return null;
    const key = `${opt.value}`;
    let cached = this.previewCache.get(key);
    if (!cached) {
      cached = this.sanitizer.bypassSecurityTrustHtml(opt.svgPreview);
      this.previewCache.set(key, cached);
    }
    return cached;
  }
}
