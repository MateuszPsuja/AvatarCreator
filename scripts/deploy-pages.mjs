// scripts/deploy-pages.mjs
//
// Publishes the built app to GitHub Pages on the `gh-pages` branch.
//
//   node scripts/deploy-pages.mjs             # build + publish
//   node scripts/deploy-pages.mjs --dry-run   # build only, no push
//
// Two GitHub Pages specifics are handled here, because both break the app
// silently rather than failing the build:
//
// 1. `baseHref` is /AvatarCreator/, not /. The `github-pages` build
//    configuration in angular.json sets it, since the project site is served
//    from https://<user>.github.io/AvatarCreator/. Every router link, lazy
//    chunk URL and asset path in index.html is emitted relative to it.
//
// 2. Pages has no SPA rewrite, so a deep link like /AvatarCreator/demo has no
//    file to serve. Two mitigations, and both are needed:
//
//    a. Every route gets a real `demo/index.html`, so a known deep link returns
//       HTTP 200. Without it Pages serves the fallback below with a 404 *status*
//       — the app still boots in a browser, but link previews, crawlers and
//       `curl` all see a broken link.
//    b. 404.html — a copy of index.html — stays as the catch-all, so an unknown
//       URL boots the app instead of showing a raw Pages 404. That one is 404 by
//       design; it is the fallback, not a route.
//
//    The route list is read out of src/app/app.routes.ts so a new route cannot
//    be added without also getting a directory.
//
// The publish is a hand-rolled orphan branch rather than the `gh-pages` npm
// package: that tool stages into a clone of the repo, and its first run copied
// repo dotfiles (.gitignore, .editorconfig) into the published site. An orphan
// branch built from a temp directory contains the build output and nothing
// else, by construction.

import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist/avatar-workspace/browser');
const BRANCH = 'gh-pages';
const SITE_URL = 'https://mateuszpsuja.github.io/AvatarCreator/';
const dryRun = process.argv.includes('--dry-run');

function run(cmd, args, cwd = ROOT) {
  console.log(`> ${cmd} ${args.join(' ')}`);
  execFileSync(cmd, args, { cwd, stdio: 'inherit' });
}

function git(args, cwd = ROOT) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
}

run('npx', ['ng', 'build', '--configuration', 'github-pages']);

const index = join(OUT, 'index.html');
if (!existsSync(index)) {
  console.error(`No index.html in ${OUT} — did the build output path change?`);
  process.exit(1);
}

// One directory per route, each holding a copy of the app shell, so a deep
// link resolves to a real file and returns HTTP 200 instead of the 404
// fallback. The route list comes from the router itself, so adding a route to
// app.routes.ts is enough — nothing here has to be kept in sync by hand.
const routesFile = readFileSync(join(ROOT, 'src/app/app.routes.ts'), 'utf8');
const routes = [...routesFile.matchAll(/path:\s*'([^']*)'/g)]
  .map((m) => m[1])
  .filter((route) => route.length > 0); // '' is the root, index.html already covers it

if (routes.length === 0) {
  console.error('No routes found in src/app/app.routes.ts — refusing to publish.');
  process.exit(1);
}

for (const route of routes) {
  const dir = join(OUT, route);
  mkdirSync(dir, { recursive: true });
  copyFileSync(index, join(dir, 'index.html'));
}

// Catch-all for unknown URLs. Served with a 404 status by design — this is the
// fallback, not a route.
copyFileSync(index, join(OUT, '404.html'));

// Disable Jekyll. It only processes underscore-prefixed names, but the
// failure mode if it ever did is a 404 for a file the build did produce.
writeFileSync(join(OUT, '.nojekyll'), '');

// Catch a wrong base href here rather than from a blank page on Pages.
const html = readFileSync(index, 'utf8');
if (!html.includes('<base href="/AvatarCreator/">')) {
  console.error(
    'index.html has no <base href="/AvatarCreator/">. Pages would serve the app from the wrong path.',
  );
  process.exit(1);
}

if (dryRun) {
  console.log(
    `\nDry run: built ${OUT} with route dirs [${routes.join(', ')}], 404.html + .nojekyll. Nothing pushed.`,
  );
  process.exit(0);
}

// Stage in a temp dir so the published tree is exactly the build output.
const stage = mkdtempSync(join(tmpdir(), 'avatarcreator-pages-'));
try {
  cpSync(OUT, stage, { recursive: true });

  git(['init', '-q', '-b', BRANCH], stage);
  git(['add', '-A'], stage);
  git(['commit', '-q', '-m', `deploy: AvatarCreator (${new Date().toISOString().slice(0, 10)})`], stage);
  git(['remote', 'add', 'origin', git(['remote', 'get-url', 'origin']).trim()], stage);
  // Orphan branch: no parent, so a stale publish cannot leave files behind.
  git(['push', '--force', 'origin', `HEAD:refs/heads/${BRANCH}`], stage);

  const files = git(['ls-files'], stage).trim().split('\n');
  // demo-assets/*.json are the exported avatar configs the gallery fetches, so
  // they are expected. Anything else that looks like source means the staging
  // directory picked up more than the build output.
  const stray = files.filter(
    (f) =>
      /\.(ts|scss)$/.test(f) ||
      (f.endsWith('.json') && !f.startsWith('demo-assets/')) ||
      // The generated per-route index.html files are the app shell on purpose.
      (f.endsWith('.html') && !/^(index|404)\.html$/.test(f) && !routes.some((r) => f === `${r}/index.html`)),
  );
  if (stray.length) {
    console.warn(`\nWarning: unexpected source-looking files published: ${stray.join(', ')}`);
  }

  console.log(`\nPublished ${files.length} files to ${BRANCH} (routes: ${routes.join(', ')}).`);
  console.log(`Live at ${SITE_URL} (first build can take a minute).`);
  console.log('If it 404s: Settings → Pages → Source → Deploy from a branch → gh-pages / root.');
} finally {
  rmSync(stage, { recursive: true, force: true });
}
