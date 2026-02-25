import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface TraitOption<T = string> {
  value: T;
  label: string;
  svgPreview?: string;
  icon?: string;
}

@Component({
  selector: 'app-trait-picker',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .selected-trait {
      border-color: hsl(var(--primary)) !important;
      background: hsl(var(--primary) / 0.1) !important;
      box-shadow: 0 0 12px hsl(var(--primary) / 0.25);
    }
  `],
  template: `
    <div class="flex flex-wrap gap-2">
      @for (opt of options(); track opt.value) {
        <button
          class="group flex flex-col items-center justify-center gap-1 rounded-lg
                 border border-border bg-card px-2 py-2 min-w-[3.5rem]
                 transition-all duration-150 cursor-pointer
                 hover:border-primary/60 hover:bg-primary/5 hover:scale-105
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          [class.selected-trait]="value() === opt.value"
          [title]="opt.label"
          (click)="selected.emit(opt.value)">
          @if (opt.svgPreview) {
            <span class="flex items-center justify-center w-full h-8" [innerHTML]="trust(opt.svgPreview)"></span>
          } @else {
            <span class="text-xl leading-none">{{ opt.icon || opt.label.charAt(0) }}</span>
          }
          <span class="text-[0.625rem] font-medium text-muted-foreground capitalize leading-none
                        group-hover:text-foreground transition-colors"
                [class.text-foreground]="value() === opt.value">
            {{ opt.label }}
          </span>
        </button>
      }
    </div>
  `,
})
export class TraitPickerComponent<T = string> {
  options = input.required<TraitOption<T>[]>();
  value = input.required<T>();
  selected = output<T>();

  constructor(private sanitizer: DomSanitizer) {}

  trust(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
