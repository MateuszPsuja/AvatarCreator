import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Swatch<T = string> {
  value: T;
  color: string;
  label: string;
}

@Component({
  selector: 'app-swatch-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap gap-1.5" role="radiogroup" [attr.aria-label]="label()">
      @for (swatch of swatches(); track swatch.value) {
        <button
          type="button"
          role="radio"
          class="swatch"
          [class.swatch--on]="value() === swatch.value"
          [attr.aria-checked]="value() === swatch.value"
          [attr.aria-label]="swatch.label"
          [title]="swatch.label"
          [style.background-color]="swatch.color"
          [style.--sw-color]="swatch.color"
          (click)="selected.emit(swatch.value)">
          <span class="sr-only">{{ swatch.label }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    /* A printed ink chip, not a glossy circle. */
    .swatch {
      width: 2.125rem;
      height: 2.125rem;
      cursor: pointer;
      border: 1px solid hsl(var(--foreground) / 0.25);
      border-radius: 0.125rem;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
    }

    .swatch:hover {
      transform: translate(-1px, -1px);
      box-shadow: 2px 2px 0 0 hsl(var(--foreground) / 0.9);
    }

    .swatch:focus-visible {
      outline: 2px solid hsl(var(--ring));
      outline-offset: 2px;
    }

    .swatch--on {
      box-shadow: 3px 3px 0 0 hsl(var(--foreground));
      transform: translate(-1px, -1px);
    }
  `],
})
export class SwatchPickerComponent<T = string> {
  swatches = input.required<Swatch<T>[]>();
  value = input.required<T>();
  selected = output<T>();
  label = input<string>('colour');
}
