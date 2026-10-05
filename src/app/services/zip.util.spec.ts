import { createZip, crc32, type ZipEntry } from './zip.util';

describe('zip.util', () => {
  describe('crc32', () => {
    // The standard CRC-32/ISO-HDLC check value. If this drifts, every
    // extractor will reject the archive, so it is the one vector worth pinning.
    it('should match the published check value for "123456789"', () => {
      expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
    });

    it('should be 0 for empty input', () => {
      expect(crc32(new Uint8Array(0))).toBe(0);
    });
  });

  describe('createZip', () => {
    const entries: ZipEntry[] = [
      { name: 'avatar.json', data: '{"name":"Ada"}' },
      { name: 'avatar.svg', data: '<svg viewBox="0 0 200 200"/>' },
    ];

    const view = (zip: Uint8Array) =>
      new DataView(zip.buffer, zip.byteOffset, zip.byteLength);

    it('should start with a local file header signature', () => {
      expect(view(createZip(entries)).getUint32(0, true)).toBe(0x04034b50);
    });

    it('should end with an end-of-central-directory signature', () => {
      const zip = createZip(entries);
      // The EOCD is the last 22 bytes; its signature is 4 bytes into the
      // fixed-size record only if there is no trailing comment.
      expect(view(zip).getUint32(zip.length - 22, true)).toBe(0x06054b50);
    });

    it('should record the entry count in the central directory', () => {
      const zip = createZip(entries);
      const eocd = view(zip);
      const total = eocd.getUint16(zip.length - 12, true);
      expect(total).toBe(entries.length);
    });

    it('should store content uncompressed and byte-identical', () => {
      const zip = createZip(entries);
      // Method 0 (store) means the payload sits verbatim right after the
      // local header, so the bytes must appear as-is.
      const text = new TextDecoder().decode(zip);
      expect(text).toContain('{"name":"Ada"}');
      expect(text).toContain('<svg viewBox="0 0 200 200"/>');
    });

    it('should flag entry names as UTF-8', () => {
      const zip = createZip([{ name: 'łaska.json', data: '{}' }]);
      // General purpose bit 11 lives in the low half of the flags field.
      expect(view(zip).getUint16(6, true) & 0x0800).toBe(0x0800);
    });

    it('should produce a valid empty archive', () => {
      const zip = createZip([]);
      expect(zip.length).toBe(22);
      expect(view(zip).getUint32(0, true)).toBe(0x06054b50);
    });

    it('should reject more entries than the format can address', () => {
      const many: ZipEntry[] = Array.from({ length: 65536 }, (_, i) => ({
        name: `f${i}.txt`,
        data: '',
      }));
      expect(() => createZip(many)).toThrowError(/65535/);
    });
  });
});
