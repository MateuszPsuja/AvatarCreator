import { Component, Input } from '@angular/core';

@Component({
  selector: 'hlm-separator',
  standalone: true,
  template: ``,
  host: {
    role: 'separator',
    '[class]':
      "orientation === 'vertical'" +
      "? 'block h-full w-px bg-border'" +
      ": 'block h-px w-full bg-border'",
  },
})
export class HlmSeparatorComponent {
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
}
