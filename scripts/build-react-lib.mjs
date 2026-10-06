// Builds the `react-avatar-player` package: declarations via tsc, runtime via
// esbuild, plus the stylesheet and manifest.
//
// Two things this script gets right that are easy to get wrong:
//
//   1. tsc runs INSIDE the script, after the clean. Running it from package.json
//      and then cleaning the output directory here would delete the .d.ts tree
//      and ship a package with no types.
//   2. React stays external — it is a peer dependency, and bundling it would
//      give the consumer a second React and break hooks. The avatar geometry is
//      imported from the sibling Angular library with a relative specifier, so
//      esbuild inlines it and the tarball is self-contained.
//
// Usage: node scripts/build-react-lib.mjs
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIB = join(ROOT, 'src/libs/avatar-player-react');
const OUT = join(ROOT, 'dist/avatar-player-react');

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// 1. Types — per-file, so a consumer's editor can navigate into them.
execFileSync(
  'npx',
  ['tsc', '-p', join(LIB, 'tsconfig.lib.json')],
  { stdio: 'inherit', cwd: ROOT },
);

// 2. Runtime
execFileSync(
  'npx',
  [
    'esbuild',
    join(LIB, 'src/index.ts'),
    '--bundle',
    '--format=esm',
    '--platform=neutral',
    '--target=es2022',
    '--jsx=automatic',
    '--external:react',
    '--external:react-dom',
    '--external:react/jsx-runtime',
    `--outfile=${join(OUT, 'index.js')}`,
    '--log-level=warning',
  ],
  { stdio: 'inherit', cwd: ROOT },
);

// 3. The stylesheet is a real export (`react-avatar-player/styles.css`) because
// the markup is injected as raw HTML, so no bundler can extract it from JSX.
cpSync(join(LIB, 'src/avatar.css'), join(OUT, 'styles.css'));
cpSync(join(LIB, 'package.json'), join(OUT, 'package.json'));
for (const doc of ['README.md', 'LICENSE']) {
  const from = join(LIB, doc);
  if (existsSync(from)) cpSync(from, join(OUT, doc));
}

console.log(`built react-avatar-player → ${OUT}`);