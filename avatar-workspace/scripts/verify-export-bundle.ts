// scripts/verify-export-bundle.ts
//
// Writes the real export bundle to disk and asserts the guarantees the Jasmine
// specs make about it, so the contract can be checked outside a browser.
//
// Two reasons this exists rather than relying on the specs alone:
//   1. it runs the exact code path the button uses — the service builds the
//      entries, createZip packs them — so a malformed archive is caught by a
//      real extractor (`unzip -t`, Python's zipfile) instead of by assertions
//      on offsets we computed ourselves;
//   2. the browser test runner is not always available (headless Chrome can
//      be blocked by the sandbox), and this needs nothing but Node.

import { writeFileSync, mkdirSync } from 'node:fs';
import { AvatarService } from '../src/app/services/avatar.service';
import { createZip, crc32 } from '../src/app/services/zip.util';

let failures = 0;

function check(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures++;
    console.error(`  FAIL ${label}`);
  }
}

const service = new AvatarService();
const config = service.defaultConfig();
config.name = 'Ada Lovelace';
config.beard = 'goatee';

console.log('zip.util');
// The published CRC-32/ISO-HDLC check value. If this drifts, every extractor
// rejects the archive.
check('crc32("123456789") === 0xcbf43926',
  crc32(new TextEncoder().encode('123456789')) === 0xcbf43926);
check('crc32("") === 0', crc32(new Uint8Array(0)) === 0);

console.log('buildConfigJson');
const json = service.buildConfigJson(config);
check('round-trips through JSON unchanged',
  JSON.stringify(JSON.parse(json)) === JSON.stringify(config));

console.log('buildBundleFiles');
const files = service.buildBundleFiles(config);
check('ships exactly avatar.json, avatar.svg, README.md',
  JSON.stringify(files.map((f) => f.name)) ===
    JSON.stringify(['avatar.json', 'avatar.svg', 'README.md']));

const parsed = JSON.parse(files[0].data as string);
// Bare AvatarConfig — no version envelope — because the player's [config]
// input takes exactly this object.
check('avatar.json is a bare AvatarConfig',
  JSON.stringify(Object.keys(parsed).sort()) ===
    JSON.stringify(Object.keys(config).sort()));
check('avatar.json preserves field values', parsed.name === 'Ada Lovelace' && parsed.beard === 'goatee');
check('avatar.svg matches the standalone SVG export',
  files[1].data === service.buildSvg(config));

const readme = files[2].data as string;
const undocumented = Object.keys(config).filter((f) => !readme.includes(`\`${f}\``));
check('README documents every config field', undocumented.length === 0);
if (undocumented.length) console.error(`       missing: ${undocumented.join(', ')}`);

console.log('createZip');
const zip = createZip(files);
const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
check('starts with a local file header', view.getUint32(0, true) === 0x04034b50);
check('ends with an end-of-central-directory record',
  view.getUint32(zip.length - 22, true) === 0x06054b50);
check('entry count matches', view.getUint16(zip.length - 12, true) === files.length);

mkdirSync('tmp', { recursive: true });
const out = 'tmp/verify-bundle.zip';
writeFileSync(out, zip);
console.log(`\nwrote ${out} (${zip.length} bytes) — validate with: unzip -t ${out}`);

if (failures) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\nall checks passed');

