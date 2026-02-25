import { LipSyncService } from './lip-sync.service';

describe('LipSyncService', () => {
  let service: LipSyncService;

  beforeEach(() => {
    service = new LipSyncService();
  });

  describe('textToVisemes', () => {
    it('should return empty array for empty string', () => {
      expect(service.textToVisemes('')).toEqual([]);
    });

    it('should map "a" and "i" to viseme 1 (wide)', () => {
      const result = service.textToVisemes('ai');
      expect(result).toEqual([1, 1]);
    });

    it('should map "o" and "u" to viseme 2 (rounded)', () => {
      const result = service.textToVisemes('ou');
      expect(result).toEqual([2, 2]);
    });

    it('should map "e" to viseme 3 (spread)', () => {
      const result = service.textToVisemes('e');
      expect(result).toEqual([3]);
    });

    it('should map "m", "b", "p" to viseme 4 (pressed)', () => {
      const result = service.textToVisemes('mbp');
      expect(result).toEqual([4, 4, 4]);
    });

    it('should map "f" and "v" to viseme 5 (teeth-lip)', () => {
      const result = service.textToVisemes('fv');
      expect(result).toEqual([5, 5]);
    });

    it('should map space to viseme 0 (silence)', () => {
      const result = service.textToVisemes(' ');
      expect(result).toEqual([0]);
    });

    it('should map other consonants to default viseme 3', () => {
      const result = service.textToVisemes('tds');
      expect(result).toEqual([3, 3, 3]);
    });

    it('should handle a full word correctly', () => {
      const result = service.textToVisemes('Hello');
      // h→3(default), e→3(spread), l→3(default), l→3(default), o→2(round)
      expect(result).toEqual([3, 3, 3, 3, 2]);
    });

    it('should be case-insensitive', () => {
      expect(service.textToVisemes('A')).toEqual([1]);
      expect(service.textToVisemes('a')).toEqual([1]);
    });
  });

  describe('play', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should call onViseme with each viseme in sequence', () => {
      const calls: number[] = [];
      service.play([1, 2, 3], (v) => calls.push(v));

      // First viseme is called immediately
      expect(calls).toEqual([1]);

      // Advance to second
      jasmine.clock().tick(80);
      expect(calls).toEqual([1, 2]);

      // Advance to third
      jasmine.clock().tick(80);
      expect(calls).toEqual([1, 2, 3]);

      // Advance past end — should reset to 0
      jasmine.clock().tick(80);
      expect(calls).toEqual([1, 2, 3, 0]);
    });

    it('should reset to 0 when cancelled', () => {
      const calls: number[] = [];
      const cancel = service.play([1, 2, 3, 4, 5], (v) => calls.push(v));

      // First viseme plays immediately
      expect(calls).toEqual([1]);

      // Cancel after first
      cancel();

      // Advance — should get reset to 0, not viseme 2
      jasmine.clock().tick(80);
      expect(calls[calls.length - 1]).toBe(0);
    });

    it('should return a cancel function', () => {
      const cancel = service.play([1], () => {});
      expect(typeof cancel).toBe('function');
    });

    it('should handle empty viseme array', () => {
      const calls: number[] = [];
      service.play([], (v) => calls.push(v));
      // Should immediately reset to silence
      expect(calls).toEqual([0]);
    });
  });
});
