// scripts/generate-demo-avatars.ts
//
// Regenerates the committed demo assets from demo-manifest.ts, using the exact
// same service the app's Export Bundle button uses. Run with `npm run demo:build`.
//
// The files are committed on purpose: the demo is a gallery of real exports,
// and a hand-edited file would defeat the whole point. Regenerating is a diff.
//
// Both halves of the export bundle are written per avatar — `avatar.json` and
// `avatar.svg` — so the demo page can feed the JSON to the player and prove the
// same data path a consuming app would use. The bundle's README is skipped: it
// documents the format once, and 17 identical copies would be noise.

import { writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AvatarService } from '../src/app/services/avatar.service';
import { DEMO_AVATARS, DEMO_ASSET_DIR } from '../src/app/demo/demo-manifest';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'src', 'app', 'demo', DEMO_ASSET_DIR);

mkdirSync(outDir, { recursive: true });

// The service is plain TypeScript with no Angular runtime dependency, so it
// bundles into this Node script as-is. Going through it rather than calling
// buildAvatarSvg directly is the point: the demo assets are then byte-identical
// to what a user gets from the export button, and the two cannot drift.
const service = new AvatarService();

const expected = new Set< string >();
for (const avatar of DEMO_AVATARS) {
  expected.add(`${avatar.slug}.svg`);
  expected.add(`${avatar.slug}.json`);

  // Written static and self-contained. The player re-renders the avatar from
  // the JSON, so nothing is baked into the SVG: a SMIL loop would fight the
  // player's own visemes, and would leave every avatar permanently talking.
  writeFileSync(
    join(outDir, `${avatar.slug}.svg`),
    service.buildSvg(avatar.config) + '\n',
    'utf8',
  );
  writeFileSync(
    join(outDir, `${avatar.slug}.json`),
    service.buildConfigJson(avatar.config) + '\n',
    'utf8',
  );
}

// Remove stale files so a renamed avatar does not linger in the gallery.
if (existsSync(outDir)) {
  for (const file of readdirSync(outDir)) {
    if ((file.endsWith('.svg') || file.endsWith('.json')) && !expected.has(file)) {
      unlinkSync(join(outDir, file));
      console.log(`removed stale ${file}`);
    }
  }
}

console.log(`wrote ${DEMO_AVATARS.length} avatars to src/app/demo/${DEMO_ASSET_DIR}/`);
for (const avatar of DEMO_AVATARS) {
  console.log(`  ${avatar.slug}.svg + .json  — ${avatar.label}`);
}
