import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SvgAvatarComponent } from './svg-avatar.component';
import { AvatarAnimationService } from '../../services/avatar-animation.service';
import type { AvatarConfig } from '@avatar-workspace/avatar-shared';

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgAvatarComponent],
      providers: [AvatarAnimationService],
    }).compileComponents();

    fixture = TestBed.createComponent(SvgAvatarComponent);
    component = fixture.componentInstance;
    component.config = mockConfig;
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
    component.animationsEnabled = true;
    fixture.detectChanges();
    const head = fixture.nativeElement.querySelector('.layer-head');
    expect(head.classList.contains('animate-idle')).toBeTrue();
  });

  it('should not add animate-idle class when animations disabled', () => {
    component.animationsEnabled = false;
    fixture.detectChanges();
    const head = fixture.nativeElement.querySelector('.layer-head');
    expect(head.classList.contains('animate-idle')).toBeFalse();
  });

  it('should update mouth when viseme changes', () => {
    const mouth1 = component.mouthPath;
    component.viseme = 1;
    const mouth2 = component.mouthPath;
    // Different visemes should produce different paths
    expect(mouth1).not.toBe(mouth2);
  });

  it('should have stroke-width 2.5 on mouth', () => {
    const mouth = fixture.nativeElement.querySelector('.layer-mouth');
    expect(mouth.getAttribute('stroke-width')).toBe('2.5');
  });
});
