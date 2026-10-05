// Builds the framework-free `avatar-player-core` package.
//
// Two steps on purpose:
//
//   1. tsc emits .d.ts only. Types must stay per-file so a consumer's editor
//      can navigate into avatar.model / avatar-renderer rather than one opaque
//      index.d.ts.
//   2. esbuild bundles the runtime into a single index.js. Plain tsc would emit
//      extensionless relative imports (`from './visemes'`), which Node's ESM
//      loader rejects — the package would work in a bundler and break in Node,
//      and this package advertises Node support for offline SVG export.
//
// Usage: node scripts/build-core.mjs
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIB = join(ROOT, 'src/libs/avatar-core');
const OUT = join(ROOT, 'dist/avatar-core');

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// 1. Declarations
execFileSync(
  'npx',
  ['tsc', '-p', join(LIB, 'tsconfig.lib.json'), '--emitDeclarationOnly'],
  { stdio: 'inherit', cwd: ROOT },
);

// 2. Runtime bundle
execFileSync(
  'npx',
  [
    'esbuild',
    join(LIB, 'src/index.ts'),
    '--bundle',
    '--format=esm',
    '--platform=neutral',
    '--target=es2022',
    `--outfile=${join(OUT, 'index.js')}`,
    '--log-level=warning',
  ],
  { stdio: 'inherit', cwd: ROOT },
);

// 3. Manifest + docs ship with the types
cpSync(join(LIB, 'package.json'), join(OUT, 'package.json'));
for (const doc of ['README.md', 'LICENSE']) {
  const from = join(LIB, doc);
  if (existsSync(from)) cpSync(from, join(OUT, doc));
}

console.log(`built avatar-player-core → ${OUT}`);