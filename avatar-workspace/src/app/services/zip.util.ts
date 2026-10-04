// services/zip.util.ts — minimal ZIP writer (STORE, no compression)
//
// Why hand-rolled instead of a dependency: the export bundle is three small
// text files (config JSON, static SVG, README) totalling well under 100 KB.
// DEFLATE would save a few KB on top of that, which is not worth taking a
// runtime dependency — and every ZIP library in node_modules is transitive
// anyway. Uncompressed ZIP is what `zip -0` produces and what every
// extractor reads.
//
// Scope is deliberately narrow: STORE only, no ZIP64, no encryption, no
// directory entries, no unicode-path extras beyond the UTF-8 name flag.
// If a file ever outgrows 4 GB or 65535 entries this needs revisiting, and
// both limits are checked below rather than silently truncating.

const LOCAL_SIG = 0x04034b50;
const CENTRAL_SIG = 0x02014b50;
const EOCD_SIG = 0x06054b50;

/** General purpose bit 11: file name is UTF-8. */
const FLAG_UTF8 = 0x0800;

const U32_MAX = 0xffffffff;

const encoder = new TextEncoder();

/** Lazily built CRC-32 table (polynomial 0xEDB88320, the ZIP variant). */
let crcTable: Uint32Array | null = null;

function table(): Uint32Array {
  if (crcTable) return crcTable;
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  crcTable = t;
  return t;
}

export function crc32(bytes: Uint8Array): number {
  const t = table();
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = t[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export interface ZipEntry {
  /** Path inside the archive, forward slashes only. */
  name: string;
  data: string | Uint8Array;
}

function toBytes(data: string | Uint8Array): Uint8Array {
  return typeof data === 'string' ? encoder.encode(data) : data;
}

/**
 * Pack a JS Date into the DOS time/date pair ZIP uses.
 *
 * DOS timestamps are 2-second granular and start at 1980; anything earlier
 * would underflow, so the epoch is clamped rather than producing a corrupt
 * header.
 */
function dosDateTime(date: Date): { time: number; date: number } {
  const year = Math.max(date.getFullYear(), 1980);
  return {
    time:
      ((date.getHours() & 0x1f) << 11) |
      ((date.getMinutes() & 0x3f) << 5) |
      ((date.getSeconds() / 2) & 0x1f),
    date:
      (((year - 1980) & 0x7f) << 9) |
      (((date.getMonth() + 1) & 0x0f) << 5) |
      (date.getDate() & 0x1f),
  };
}

/**
 * Build a ZIP archive from `entries`.
 *
 * @throws when the archive would exceed the format's 32-bit limits, so an
 *   oversized export fails loudly instead of writing a file no extractor
 *   can open.
 */
export function createZip(entries: ZipEntry[], now: Date = new Date()): Uint8Array {
  if (entries.length > 0xffff) {
    throw new Error(`ZIP supports at most 65535 entries, got ${entries.length}`);
  }

  const { time, date } = dosDateTime(now);
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const data = toBytes(entry.data);
    if (data.length > U32_MAX || offset > U32_MAX) {
      throw new Error(`ZIP entry "${entry.name}" exceeds the 4 GB limit`);
    }
    const crc = crc32(data);

    // ── local file header ──
    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, LOCAL_SIG, true);
    lv.setUint16(4, 20, true); // version needed to extract
    lv.setUint16(6, FLAG_UTF8, true);
    lv.setUint16(8, 0, true); // method 0 = store
    lv.setUint16(10, time, true);
    lv.setUint16(12, date, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true); // compressed size
    lv.setUint32(22, data.length, true); // uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra length
    local.set(nameBytes, 30);

    locals.push(local, data);

    // ── central directory header ──
    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, CENTRAL_SIG, true);
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, FLAG_UTF8, true);
    cv.setUint16(10, 0, true); // method
    cv.setUint16(12, time, true);
    cv.setUint16(14, date, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // extra
    cv.setUint16(32, 0, true); // comment
    cv.setUint16(34, 0, true); // disk number start
    cv.setUint16(36, 0, true); // internal attrs
    cv.setUint32(38, 0, true); // external attrs
    cv.setUint32(42, offset, true); // relative offset of local header
    central.set(nameBytes, 46);

    centrals.push(central);
    offset += local.length + data.length;
  }

  const centralSize = centrals.reduce((sum, c) => sum + c.length, 0);

  // ── end of central directory ──
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, EOCD_SIG, true);
  ev.setUint16(4, 0, true); // this disk
  ev.setUint16(6, 0, true); // disk with central directory
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true); // comment length

  const total =
    offset + centralSize + eocd.length;
  const out = new Uint8Array(total);
  let p = 0;
  for (const chunk of [...locals, ...centrals, eocd]) {
    out.set(chunk, p);
    p += chunk.length;
  }
  return out;
}
