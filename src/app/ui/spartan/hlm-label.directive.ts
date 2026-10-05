import { Directive } from '@angular/core';

/**
 * Specimen-sheet caption: mono, wide-tracked, uppercase. Every control group
 * in the creator is labelled with one of these, so it does the work of a
 * printed form field rather than a web form label.
 */
@Directive({
  selector: '[hlmLabel]',
  standalone: true,
  host: {
    class: 'font-label text-muted-foreground',
  },
})
export class HlmLabelDirective {}
