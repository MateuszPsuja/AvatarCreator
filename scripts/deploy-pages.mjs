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
// 2. Pages has no SPA rewrite. A deep link like /AvatarCreator/demo is a 404
//    on the server, so 404.html — a copy of index.html — is published next to
//    it. The browser then boots the app, which reads the real path out of the
//    URL and renders the matching route.
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
const SITE_URL = 'https://matesuszpsuja.github.io/AvatarCreator/';
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

// Deep links fall back to the app shell.
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
  console.log(`\nDry run: built ${OUT} with 404.html + .nojekyll. Nothing pushed.`);
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
      (f.endsWith('.html') && f !== 'index.html' && f !== '404.html'),
  );
  if (stray.length) {
    console.warn(`\nWarning: unexpected source-looking files published: ${stray.join(', ')}`);
  }

  console.log(`\nPublished ${files.length} files to ${BRANCH}.`);
  console.log(`Live at ${SITE_URL} (first build can take a minute).`);
  console.log('If it 404s: Settings → Pages → Source → Deploy from a branch → gh-pages / root.');
} finally {
  rmSync(stage, { recursive: true, force: true });
}
