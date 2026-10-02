import { Component, Input } from '@angular/core';

@Component({
  selector: 'hlm-separator',
  standalone: true,
  template: ``,
  host: {
    role: 'separator',
    // A solid ink rule — a real printed divider rather than a faint hairline.
    '[class]':
      "orientation === 'vertical'" +
      "? 'block h-full w-px bg-foreground/25'" +
      ": 'block h-px w-full bg-foreground/20'",
  },
})
export class HlmSeparatorComponent {
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
}
