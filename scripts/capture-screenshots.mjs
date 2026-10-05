// scripts/capture-screenshots.mjs
//
// Regenerates the UI screenshots in <repo>/docs/screenshots for the README.
//
// The avatar artwork in docs/images/avatars.png is generated from committed SVGs
// and needs no browser; this script does, because it photographs the running
// app. It drives the dev server with Playwright, so it captures what a user
// actually sees rather than a hand-built mock-up.
//
//   npm start -- --port 4210        # in one terminal
//   npm run screenshots             # in another
//
// Requires Playwright (not a project dependency — it is only needed when the
// README screenshots change):
//
//   npm i -D playwright && npx playwright install chromium
//
// Pass --url to point at an already-running server, e.g.
//   node scripts/capture-screenshots.mjs --url http://localhost:4200
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '../docs/screenshots');

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};

const BASE = arg('url', 'http://localhost:4210');

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    'Playwright is not installed.\n' +
      '  npm i -D playwright && npx playwright install chromium',
  );
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  // Single-process keeps Chromium inside this sandbox; the default zygote
  // model needs a Mach port this environment refuses. Harmless anywhere else.
  args: ['--no-sandbox', '--single-process', '--no-zygote', '--disable-gpu'],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
page.on('pageerror', (e) => console.warn('  page error:', e.message));

const shot = async (name, opts = {}) => {
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });
  console.log('  ✓', name);
};

/** Trait buttons are labelled with the trait they set. */
const trait = (label) => page.locator(`button[role="radio"][aria-label="${label}"]`);
const tab = (name) => page.getByRole('tab', { name });
const named = (name) => page.locator(`button[role="radio"][aria-label="${name}"]`);

/** A step that may not apply to a given build should not lose the other shots. */
const step = async (label, fn) => {
  try {
    await fn();
  } catch (e) {
    console.warn(`  ! skipped ${label}: ${e.message.split('\n')[0]}`);
  }
};

console.log(`capturing from ${BASE}`);

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('.avatar-svg');

// Creator, Form tab, untouched default avatar.
await shot('creator-form');

// Style tab: facial hair and glasses.
await step('style tab', async () => {
  await tab('Style').click();
  await trait('stubble').click();
  await trait('rectangular').click();
  await shot('creator-style');
});

// Trade tab: a profession and a name.
await step('trade tab', async () => {
  await tab('Trade').click();
  await trait('astronaut').click();
  await page.locator('.name-plate').fill('Nova');
  await page.locator('.name-plate').blur();
  await shot('creator-profession');
});

// Mid-speech: lip sync while the avatar talks. A short name finishes in a few
// hundred ms, so give it a long one and shoot as soon as the button confirms it
// started — otherwise the frame lands after the last viseme.
await step('test speech', async () => {
  await tab('Form').click();
  // Gender options are the only traits whose label is capitalised.
  await named('Woman').click();
  await trait('bun').click();
  await page.locator('.name-plate').fill('Nova Okonkwo-Bell');
  await page.locator('.name-plate').blur();
  await page.getByRole('button', { name: 'Test speech' }).click();
  await page.getByRole('button', { name: 'Speaking' }).waitFor({ timeout: 5000 });
  await page.waitForTimeout(240);
  await shot('creator-speaking');
});

// Export gallery, and the player inside it.
await step('demo gallery', async () => {
  await page.goto(`${BASE}/demo`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.demo-card');
  await page.waitForTimeout(1500);
  await shot('demo-gallery', { fullPage: true });
});

await step('player lightbox', async () => {
  await page.locator('.demo-thumb-btn').first().click();
  await page.waitForSelector('.demo-lightbox');
  const box = await page.locator('.demo-lightbox-inner').boundingBox();
  await shot('player-lightbox', { clip: box });
  await page.getByRole('button', { name: 'Play speech' }).click();
  // One viseme is 80ms, so aim at a vowel rather than the gap after a word —
  // a screenshot taken on a space viseme shows a closed mouth.
  await page.waitForTimeout(280);
  await shot('player-speaking', { clip: box });
});

await browser.close();
console.log(`\nwrote screenshots to ${OUT}`);
