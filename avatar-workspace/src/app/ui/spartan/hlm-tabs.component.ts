// Re-export brain tab directives for easy imports + styling directives
import { Directive, computed, signal, Input } from '@angular/core';
import { BrnTabs, BrnTabsList, BrnTabsTrigger, BrnTabsContent } from '@spartan-ng/brain/tabs';

// ─── Helm Tabs container ──────────────────────────────
@Directive({
  selector: '[hlmTabs]',
  standalone: true,
  hostDirectives: [
    { directive: BrnTabs, inputs: ['brnTabs: hlmTabs'], outputs: ['tabActivated'] },
  ],
  host: {
    class: 'flex flex-col gap-4',
  },
})
export class HlmTabsDirective {}

// ─── Helm Tabs List ───────────────────────────────────
@Directive({
  selector: '[hlmTabsList]',
  standalone: true,
  hostDirectives: [BrnTabsList],
  host: {
    class:
      'inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground gap-0.5',
  },
})
export class HlmTabsListDirective {}

// ─── Helm Tabs Trigger ────────────────────────────────
@Directive({
  selector: '[hlmTabsTrigger]',
  standalone: true,
  hostDirectives: [
    { directive: BrnTabsTrigger, inputs: ['brnTabsTrigger: hlmTabsTrigger', 'disabled'] },
  ],
  host: {
    '[class]': 'computedClass()',
  },
})
export class HlmTabsTriggerDirective {
  private readonly _brn = /* injected via hostDirective */ null;

  computedClass = computed(() =>
    'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 ' +
    'text-sm font-medium ring-offset-background transition-all cursor-pointer ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
    'disabled:pointer-events-none disabled:opacity-50 ' +
    'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
  );
}

// ─── Helm Tabs Content ────────────────────────────────
@Directive({
  selector: '[hlmTabsContent]',
  standalone: true,
  hostDirectives: [
    { directive: BrnTabsContent, inputs: ['brnTabsContent: hlmTabsContent'] },
  ],
  host: {
    class: 'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  },
})
export class HlmTabsContentDirective {}

// ─── Legacy component kept as re-export for compat ────
// The old HlmTabsComponent is no longer used.
// Import the directives above instead.
export { HlmTabsDirective as HlmTabsComponent };
