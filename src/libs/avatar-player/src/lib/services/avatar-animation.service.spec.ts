import { AvatarAnimationService } from './avatar-animation.service';

describe('AvatarAnimationService', () => {
  let service: AvatarAnimationService;

  beforeEach(() => {
    jasmine.clock().install();
    service = new AvatarAnimationService();
  });

  afterEach(() => {
    service.stopAll();
    jasmine.clock().uninstall();
  });

  describe('startBlink', () => {
    it('should call onState with blinking after initial delay', () => {
      const states: string[] = [];
      service.startBlink((s) => states.push(s));

      // Initial delay is 1000–2000ms — advance 2000ms to ensure it fires
      jasmine.clock().tick(2000);
      expect(states).toContain('blinking');
    });

    it('should transition through blink-half then empty', () => {
      const states: string[] = [];
      service.startBlink((s) => states.push(s));

      // Trigger initial blink
      jasmine.clock().tick(2000);

      // After 80ms → blink-half
      jasmine.clock().tick(80);
      expect(states).toContain('blink-half');

      // After 50ms more → empty (eyes open)
      jasmine.clock().tick(50);
      expect(states).toContain('');
    });
  });

  describe('startEyeMovement', () => {
    it('should call onOffset with x/y values', () => {
      const offsets: { x: number; y: number }[] = [];
      service.startEyeMovement((v) => offsets.push(v));

      // Initial delay is 500ms
      jasmine.clock().tick(500);
      expect(offsets.length).toBeGreaterThan(0);

      const offset = offsets[0];
      expect(offset.x).toBeDefined();
      expect(offset.y).toBeDefined();
      // x should be in range [-4, 4], y in [-2, 2]
      expect(Math.abs(offset.x)).toBeLessThanOrEqual(4);
      expect(Math.abs(offset.y)).toBeLessThanOrEqual(2);
    });
  });

  describe('stopAll', () => {
    it('should stop blink animation from firing further', () => {
      const states: string[] = [];
      service.startBlink((s) => states.push(s));

      service.stopAll();

      const countBefore = states.length;
      jasmine.clock().tick(10000);
      expect(states.length).toBe(countBefore);
    });

    it('should stop eye movement from firing further', () => {
      const offsets: { x: number; y: number }[] = [];
      service.startEyeMovement((v) => offsets.push(v));

      service.stopAll();

      const countBefore = offsets.length;
      jasmine.clock().tick(10000);
      expect(offsets.length).toBe(countBefore);
    });
  });
});
