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
  styles: [`
    .selected-swatch {
      border-color: hsl(var(--foreground)) !important;
      transform: scale(1.05);
      box-shadow: 0 0 10px var(--sw-color);
    }
  `],
  template: `
    <div class="flex flex-wrap gap-2">
      @for (swatch of swatches(); track swatch.value) {
        <button
          class="w-9 h-9 rounded-full border-2 border-transparent cursor-pointer
                 transition-all duration-150
                 hover:scale-110 hover:border-foreground/40
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          [class.selected-swatch]="value() === swatch.value"
          [style.background-color]="swatch.color"
          [style.--sw-color]="swatch.color"
          [title]="swatch.label"
          (click)="selected.emit(swatch.value)">
        </button>
      }
    </div>
  `,
})
export class SwatchPickerComponent<T = string> {
  swatches = input.required<Swatch<T>[]>();
  value = input.required<T>();
  selected = output<T>();
}
