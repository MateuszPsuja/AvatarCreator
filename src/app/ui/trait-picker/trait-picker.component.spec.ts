// apps/creator/src/app/ui/trait-picker/trait-picker.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TraitPickerComponent, TraitOption } from './trait-picker.component';
import { DomSanitizer } from '@angular/platform-browser';

const OPTIONS: TraitOption[] = [
  { value: 'a', label: 'A', svgPreview: '<svg viewBox="0 0 1 1"></svg>' },
  { value: 'b', label: 'B', svgPreview: '<svg viewBox="0 0 1 1"></svg>' },
  { value: 'c', label: 'C' }, // no preview — falls back to the label only
];

describe('TraitPickerComponent', () => {
  let fixture: ComponentFixture<TraitPickerComponent<string>>;
  let component: TraitPickerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TraitPickerComponent] }).compileComponents();
    fixture = TestBed.createComponent<TraitPickerComponent<string>>(TraitPickerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentRef.setInput('value', 'a');
    fixture.detectChanges();
  });

  it('creates and renders one button per option', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(3);
  });

  it('exposes radiogroup semantics', () => {
    const group = fixture.nativeElement.querySelector('[role="radiogroup"]');
    expect(group).toBeTruthy();
    const radios = fixture.nativeElement.querySelectorAll('[role="radio"]');
    expect(radios.length).toBe(3);
    expect(radios[0].getAttribute('aria-checked')).toBe('true');
    expect(radios[1].getAttribute('aria-checked')).toBe('false');
  });

  it('emits the option value on click', () => {
    let picked: string | undefined;
    component.selected.subscribe((v) => (picked = v));
    fixture.nativeElement.querySelectorAll('button')[1].click();
    expect(picked).toBe('b');
  });

  it('returns a stable object identity for the same option', () => {
    // The bug this guards: preview() ran on every change-detection pass and
    // returned a new SafeHtml, so Angular re-assigned innerHTML every cycle
    // and rebuilt the button's DOM between a click's mousedown and mouseup.
    // Two clicks were then needed to register one.
    const first = component.preview(OPTIONS[0]);
    const second = component.preview(OPTIONS[0]);
    expect(first).toBe(second);
  });

  it('keeps previews stable across change-detection passes', () => {
    const art = () => fixture.nativeElement.querySelector('.trait-art');
    const before = art();
    fixture.detectChanges();
    fixture.detectChanges();
    // Same element instance => innerHTML was not rewritten.
    expect(art()).toBe(before);
  });

  it('returns null for options without a preview', () => {
    expect(component.preview(OPTIONS[2])).toBeNull();
  });

  it('trusts the sanitizer for preview markup', () => {
    const sanitizer = TestBed.inject(DomSanitizer);
    const preview = component.preview(OPTIONS[0]);
    expect(sanitizer.sanitize(1 /* SecurityContext.HTML */, String(preview))).toBeTruthy();
  });
});
