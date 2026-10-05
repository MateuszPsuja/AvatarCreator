// scripts/render-avatar-gallery.mjs
//
// Composes <repo>/docs/images/avatars.png — the README's avatar grid — out of
// the committed demo SVGs. No browser and no dev server involved, so this can
// run in CI or on a headless box.
//
//   npm i -D @resvg/resvg-js && npm run gallery
//
// The PNG is committed, so this only needs re-running when the demo set or the
// renderer changes. Run `npm run demo:build` first if you changed the renderer.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(HERE, '../src/app/demo/demo-assets');
const OUT = path.join(HERE, '../docs/images/avatars.png');

let Resvg;
try {
  ({ Resvg } = await import('@resvg/resvg-js'));
} catch {
  console.error('resvg is not installed.\n  npm i -D @resvg/resvg-js');
  process.exit(1);
}

const order = [
  'plain-man', 'tone-deep', 'tone-tan', 'tone-light',
  'eyes-almond-blue', 'eyes-wide-green', 'glasses-sunglasses', 'astronaut-woman-long-beard',
  'doctor-woman', 'engineer-man-long', 'teacher-woman', 'chef-man',
  'police-woman-bun', 'business-woman', 'artist-man', 'tone-dark',
];

/**
 * Each exported SVG reuses the same clipPath ids and paints itself with CSS
 * custom properties (`fill="var(--skin-base)"`). A single composed document
 * therefore needs both namespaced and resolved, and resvg does not evaluate
 * custom properties at all — so the palette is inlined here.
 */
const namespace = (svg, p, vars) =>
  svg
    .replace(/id="([\w-]+)"/g, (_, id) => `id="${p}-${id}"`)
    .replace(/url\(#([\w-]+)\)/g, (_, id) => `url(#${p}-${id})`)
    .replace(/var\(--([\w-]+)\)/g, (_, name) => vars[name] ?? 'none');

/** Pull the palette off the root <svg style="..."> before stripping the tag. */
const palette = (svg) => {
  const style = svg.match(/<svg[^>]*\sstyle="([^"]*)"/)?.[1] ?? '';
  return Object.fromEntries(
    [...style.matchAll(/--([\w-]+)\s*:\s*([^;]+)/g)].map((m) => [m[1], m[2].trim()]),
  );
};

// Mirrors the `.dark` block in src/styles.scss — the app root ships dark
// (see `class="dark"` in src/index.html), so the grid matches the screenshots.
const PAPER = '#16120E';
const CARD = '#1E1A17';
const INK = '#F2EFE3';
const RULE = '#46403A';

const CELL = 200, GAP = 26, PAD = 44, LABEL = 30;
const COLS = 4, ROWS = Math.ceil(order.length / COLS);
const W = PAD * 2 + COLS * CELL + (COLS - 1) * GAP;
const H = PAD * 2 + ROWS * (CELL + LABEL) + (ROWS - 1) * GAP;

const cells = order.map((slug, i) => {
  const raw = fs.readFileSync(path.join(ASSETS, `${slug}.svg`), 'utf8');
  const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const col = i % COLS, row = (i / COLS) | 0;
  const x = PAD + col * (CELL + GAP);
  const y = PAD + row * (CELL + LABEL + GAP);
  const label = slug.replace(/-/g, ' ');
  return `
  <g transform="translate(${x} ${y})">
    <rect width="${CELL}" height="${CELL + LABEL}" fill="${CARD}" stroke="${RULE}"/>
    <svg x="0" y="0" width="${CELL}" height="${CELL}" viewBox="0 0 200 200">${namespace(inner, `a${i}`, palette(raw))}</svg>
    <text x="${CELL / 2}" y="${CELL + 20}" text-anchor="middle"
      font-family="Helvetica, Arial, sans-serif" font-size="14" fill="${INK}" fill-opacity="0.6">${label}</text>
  </g>`;
}).join('');

const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="none" stroke="${RULE}" stroke-opacity="0.5"/>
  ${cells}
</svg>`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const png = new Resvg(doc, { fitTo: { mode: 'width', value: 1400 }, font: { loadSystemFonts: true } })
  .render()
  .asPng();
fs.writeFileSync(OUT, png);
console.log('wrote', OUT, png.length, 'bytes', `${W}x${H}`);
