import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SvgAvatarComponent } from './svg-avatar.component';
import { AvatarAnimationService } from '../../services/avatar-animation.service';
import type { AvatarConfig } from '../../geometry';
import { MOUTH_SHAPES } from '../../geometry';

describe('SvgAvatarComponent', () => {
  let component: SvgAvatarComponent;
  let fixture: ComponentFixture<SvgAvatarComponent>;

  const mockConfig: AvatarConfig = {
    id: 'test-1',
    name: 'Test',
    gender: 'man',
    skinTone: 'medium',
    haircut: 'short',
    hairColor: 'brown',
    eyeColor: 'brown',
    mustache: 'none',
    beard: 'none',
    eyeStyle: 'round',
    glasses: 'none',
    profession: 'none',
  };

  /**
   * Inputs are signals, so they are set through the component ref rather than
   * assigned to a field. This is the API the parent template actually uses.
   */
  const setInput = (name: string, value: unknown) =>
    fixture.componentRef.setInput(name, value);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgAvatarComponent],
      providers: [AvatarAnimationService],
    }).compileComponents();

    fixture = TestBed.createComponent(SvgAvatarComponent);
    component = fixture.componentInstance;
    setInput('config', mockConfig);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an SVG element', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('viewBox')).toBe('0 0 200 200');
  });

  it('should apply CSS variables as inline style', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    const style = svg.getAttribute('style') || '';
    expect(style).toContain('--skin-base');
    expect(style).toContain('--hair-color');
    expect(style).toContain('--eye-color');
  });

  it('should render all 14 layers', () => {
    const el = fixture.nativeElement;
    expect(el.querySelector('.layer-body')).toBeTruthy();
    expect(el.querySelector('.layer-neck')).toBeTruthy();
    expect(el.querySelector('.layer-ears')).toBeTruthy();
    expect(el.querySelector('.layer-hair-back')).toBeTruthy();
    expect(el.querySelector('.layer-head')).toBeTruthy();
    expect(el.querySelector('.layer-face')).toBeTruthy();
    expect(el.querySelector('.layer-eyes')).toBeTruthy();
    expect(el.querySelector('.layer-eyelids')).toBeTruthy();
    expect(el.querySelector('.layer-brows')).toBeTruthy();
    expect(el.querySelector('.layer-nose')).toBeTruthy();
    expect(el.querySelector('.layer-mouth')).toBeTruthy();
    expect(el.querySelector('.layer-mustache')).toBeTruthy();
    expect(el.querySelector('.layer-beard')).toBeTruthy();
    expect(el.querySelector('.layer-glasses')).toBeTruthy();
    expect(el.querySelector('.layer-hair-front')).toBeTruthy();
    expect(el.querySelector('.layer-accessory')).toBeTruthy();
  });

  it('should add animate-idle class when animations enabled', () => {
    setInput('animationsEnabled', true);
    fixture.detectChanges();
    const head = fixture.nativeElement.querySelector('.layer-head');
    expect(head.classList.contains('animate-idle')).toBeTrue();
  });

  it('should not add animate-idle class when animations disabled', () => {
    setInput('animationsEnabled', false);
    fixture.detectChanges();
    const head = fixture.nativeElement.querySelector('.layer-head');
    expect(head.classList.contains('animate-idle')).toBeFalse();
  });

  it('should update mouth when viseme changes', () => {
    const mouth1 = component.mouthPath();
    setInput('viseme', 1);
    fixture.detectChanges();
    expect(mouth1).not.toBe(component.mouthPath());
  });

  it('should have stroke-width 2.5 on mouth', () => {
    const mouth = fixture.nativeElement.querySelector('.layer-mouth');
    expect(mouth.getAttribute('stroke-width')).toBe('2.5');
  });

  it('re-renders when the config changes', () => {
    // These are signal inputs, so the derived computeds cannot go stale. The
    // bug this guards was a computed reading a plain @Input, which froze the
    // avatar on its first render and made every picker do nothing.
    const before = fixture.nativeElement.querySelector('.avatar-svg').innerHTML;
    expect(before).not.toContain('helmet-clip');

    setInput('config', { ...mockConfig, profession: 'astronaut' });
    fixture.detectChanges();

    const after = fixture.nativeElement.querySelector('.avatar-svg').innerHTML;
    expect(after).toContain('helmet-clip');
  });

  it('re-renders when only the profession changes', () => {
    setInput('config', { ...mockConfig, profession: 'engineer' });
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.avatar-svg');
    expect(el.innerHTML).toContain('url(#hat-clip)');
  });

  it('re-renders the palette when the skin tone changes', () => {
    const before = fixture.nativeElement
      .querySelector('svg')
      .getAttribute('style')!;
    setInput('config', { ...mockConfig, skinTone: 'deep' });
    fixture.detectChanges();
    const after = fixture.nativeElement.querySelector('svg').getAttribute('style')!;
    expect(after).not.toBe(before);
    expect(after).toContain('#4A2912');
  });

  it('moves the mouth when the viseme changes', () => {
    const mouth = () =>
      fixture.nativeElement.querySelector('.layer-mouth').getAttribute('d');

    const before = mouth();
    setInput('viseme', 1);
    fixture.detectChanges();

    expect(mouth()).not.toBe(before);
    expect(mouth()).toBe(MOUTH_SHAPES[1]);
  });

  it('keeps the mouth path in step with the viseme', () => {
    setInput('viseme', 4);
    fixture.detectChanges();
    expect(component.mouthPath()).toBe(MOUTH_SHAPES[4]);
  });

  it('applies the palette to the root svg, not a function object', () => {
    // Regression: cssVarsStyle was changed from a getter to a computed but the
    // template still bound `[style]="cssVarsStyle"`, which passes the function
    // itself. No style attribute was written, every var(--skin-base) was
    // invalid, and the whole avatar rendered black.
    const svg = fixture.nativeElement.querySelector('svg');
    const style = svg.getAttribute('style') || '';
    expect(style).toContain('--skin-base');
    expect(style).toContain('--hair-color');
    expect(style).toContain('--eye-color');
    expect(style).toContain('--skin-shadow');
    expect(style).not.toContain('=>');
    expect(style).not.toContain('function');
  });

  it('exposes the shape helpers as signals that follow the config', () => {
    expect(component.isAstronaut()).toBeFalse();
    setInput('config', { ...mockConfig, profession: 'astronaut' });
    expect(component.isAstronaut()).toBeTrue();
    expect(component.helmetClipUrl()).toBe('url(#helmet-clip)');
  });

  it('must pin facial hair to view-box coordinates', () => {
    // The stylesheet sets `transform-box: fill-box` on every child so the head
    // rotation has a sensible origin. That rule also caught the facial hair,
    // whose transform positions it against the face — under fill-box,
    // `translate(100,88)` resolved to 100 bounding-box-widths and threw the
    // beard up over the eyes. These layers must opt back into view-box.
    const styles = (SvgAvatarComponent as unknown as { ɵcmp: { styles: string[] } }).ɵcmp.styles.join('\n');
    expect(styles).toContain('transform-box: view-box');
    expect(styles).toMatch(/layer-mustache[\s\S]*?layer-beard[\s\S]*?transform-box: view-box/);
  });

  it('must not use emulated encapsulation', () => {
    // The avatar markup arrives via [innerHTML], so emulated encapsulation
    // would scope every selector to a content attribute those nodes do not
    // have. The styles would silently stop applying and the skin-coloured
    // eyelids would render at full size, covering the eyes.
    const definition = (SvgAvatarComponent as unknown as { ɵcmp: { encapsulation: number } }).ɵcmp;
    // 0 = None, 1 = Emulated, 2 = None, 3 = ShadowDom
    expect(definition.encapsulation).toBe(0);
  });

  it('hides the eyelids by default so the eyes stay visible', () => {
    // Guards the real symptom: with the eyelid rule not applied, the 22x22
    // skin-coloured rects paint over the eyes.
    const eyelid = fixture.nativeElement.querySelector('.eyelid-left');
    expect(eyelid).toBeTruthy();
    const styles = getComputedStyle(eyelid);
    expect(styles.transform).toContain('matrix(1, 0, 0, 0');
  });
});
