// scripts/generate-demo-avatars.ts
//
// Regenerates the committed demo SVGs from demo-manifest.ts, using the exact
// same renderer the app exports from. Run with `npm run demo:build`.
//
// The files are committed on purpose: the demo is a gallery of real exports,
// and a hand-edited SVG would defeat the whole point. Regenerating is a diff.

import { writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAvatarSvg } from '../src/libs/avatar-shared/src/lib/avatar-renderer';
import { DEMO_AVATARS, DEMO_ASSET_DIR } from '../src/app/demo/demo-manifest';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'src', 'app', 'demo', DEMO_ASSET_DIR);

mkdirSync(outDir, { recursive: true });

const expected = new Set(DEMO_AVATARS.map((a) => `${a.slug}.svg`));

for (const avatar of DEMO_AVATARS) {
  // Files are written static and self-contained. The demo page fetches each
  // file and drives the mouth itself, because an <img>-loaded SVG cannot be
  // controlled by the host page — that is what the per-avatar play button
  // needs. Baking a SMIL loop in here would fight that, and would also mean
  // every avatar was permanently talking.
  const svg = buildAvatarSvg(avatar.config);
  writeFileSync(join(outDir, `${avatar.slug}.svg`), svg + '\n', 'utf8');
}

// Remove stale files so a renamed avatar does not linger in the gallery.
if (existsSync(outDir)) {
  for (const file of readdirSync(outDir)) {
    if (file.endsWith('.svg') && !expected.has(file)) {
      unlinkSync(join(outDir, file));
      console.log(`removed stale ${file}`);
    }
  }
}

console.log(`wrote ${DEMO_AVATARS.length} avatars to src/app/demo/${DEMO_ASSET_DIR}/`);
for (const avatar of DEMO_AVATARS) {
  console.log(`  ${avatar.slug}.svg  — ${avatar.label}`);
}
