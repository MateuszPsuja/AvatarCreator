import { Directive } from '@angular/core';

@Directive({
  selector: '[hlmLabel]',
  standalone: true,
  host: {
    class:
      'text-xs font-semibold uppercase tracking-wider text-muted-foreground',
  },
})
export class HlmLabelDirective {}
