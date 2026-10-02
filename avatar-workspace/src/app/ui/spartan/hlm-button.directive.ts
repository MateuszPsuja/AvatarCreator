import { Directive, Input, computed, signal, effect } from '@angular/core';

export type BtnVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
export type BtnSize = 'default' | 'sm' | 'lg' | 'icon';

// A button is a stamped plate of ink: hard edges, a hard offset shadow, and
// the whole thing shifts 1px on press. No rounded corners, no soft glow.
const variantClasses: Record<BtnVariant, string> = {
  default:
    'bg-primary text-primary-foreground shadow-plate-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
  outline:
    'border border-foreground/40 bg-card text-foreground shadow-plate-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
  secondary:
    'bg-secondary text-secondary-foreground border border-border hover:border-foreground/40',
  ghost:
    'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted',
  destructive:
    'bg-destructive text-destructive-foreground border border-destructive hover:opacity-90',
  link:
    'text-primary underline-offset-4 hover:underline p-0 h-auto',
};

const sizeClasses: Record<BtnSize, string> = {
  default: 'h-9 px-4 py-2 text-[0.8125rem]',
  sm: 'h-8 px-3 text-[0.6875rem]',
  lg: 'h-11 px-8 text-sm',
  icon: 'h-9 w-9',
};

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm ' +
  'font-label tracking-[0.1em] uppercase ' +
  'transition-all duration-100 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-40 cursor-pointer';

@Directive({
  selector: '[hlmBtn]',
  standalone: true,
  host: {
    '[class]': 'computedClass()',
  },
})
export class HlmButtonDirective {
  private _variant = signal<BtnVariant>('default');
  private _size = signal<BtnSize>('default');

  @Input() set variant(v: BtnVariant) { this._variant.set(v); }
  @Input() set size(s: BtnSize) { this._size.set(s); }

  computedClass = computed(() =>
    `${base} ${variantClasses[this._variant()]} ${sizeClasses[this._size()]}`
  );
}
