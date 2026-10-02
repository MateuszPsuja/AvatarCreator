// Re-export brain directives for easy imports + styling directives
import { Directive, computed, Input } from '@angular/core';
import { BrnTabs, BrnTabsList, BrnTabsTrigger, BrnTabsContent } from '@spartan-ng/brain/tabs';

/**
 * All Spartan styling in this app lives in these wrappers, never in
 * `@spartan-ng/brain` directly — the library's internals change between
 * versions, ours do not. When Spartan is upgraded, only this folder moves.
 */

// ─── Helm Tabs container ─────────────────────────────────────
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

// ─── Helm Tabs List ──────────────────────────────────────────
@Directive({
  selector: '[hlmTabsList]',
  standalone: true,
  hostDirectives: [BrnTabsList],
  host: {
    // A row of inked type on paper, separated by hard rules — not a pill track.
    class:
      'inline-flex items-stretch justify-start border-b border-border text-muted-foreground gap-0',
  },
})
export class HlmTabsListDirective {}

// ─── Helm Tabs Trigger ───────────────────────────────────────
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
  computedClass = computed(() =>
    'relative inline-flex items-center justify-center whitespace-nowrap px-3 py-2 ' +
    'font-label text-muted-foreground cursor-pointer bg-transparent ' +
    'border-b-2 border-transparent -mb-px ' +
    'transition-colors duration-150 ' +
    'hover:text-foreground hover:border-foreground/30 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
    'disabled:pointer-events-none disabled:opacity-50 ' +
    'data-[state=active]:text-foreground data-[state=active]:border-primary'
  );
}

// ─── Helm Tabs Content ───────────────────────────────────────
@Directive({
  selector: '[hlmTabsContent]',
  standalone: true,
  hostDirectives: [
    { directive: BrnTabsContent, inputs: ['brnTabsContent: hlmTabsContent'] },
  ],
  host: {
    class: 'mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  },
})
export class HlmTabsContentDirective {}

// ─── Legacy alias kept for compatibility ─────────────────────
export { HlmTabsDirective as HlmTabsComponent };
