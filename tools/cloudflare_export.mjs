// Build a clean static DOMiNANCE Breakdowns bundle for Cloudflare Pages.
// Uses only Node built-ins. Never ships repository notes, tests, or Vercel API code.
import { cpSync, copyFileSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const publicExtensions = new Set(['.html', '.js', '.css']);
const excludedSources = new Set(['sw-template.js']);
for (const name of readdirSync(root)) {
  const src = join(root, name);
  if (!statSync(src).isFile() || !publicExtensions.has(extname(name)) || excludedSources.has(name)) continue;
  copyFileSync(src, join(out, name));
}
for (const dir of ['content', 'assets']) {
  const src = join(root, dir);
  if (existsSync(src)) cpSync(src, join(out, dir), { recursive: true });
}

writeFileSync(join(out, '_headers'), `/
  Cache-Control: public, max-age=0, must-revalidate
/index.html
  Cache-Control: public, max-age=0, must-revalidate
/sw.js
  Cache-Control: no-cache
/stats.html
  Cache-Control: no-store
`);
// Cloudflare Pages Functions should run ONLY for feedback and protected stats routes.
writeFileSync(join(out, '_routes.json'), JSON.stringify({
  version: 1, include: ['/api/*'], exclude: []
}, null, 2) + '\n');

// Validate bundled essentials, including all five test bundles.
const catalogue = join(out, 'content', 'index.js');
if (!existsSync(join(out, 'index.html')) || !existsSync(join(out, 'sw.js')) || !existsSync(catalogue)) {
  throw new Error('Cloudflare export is missing a required app file.');
}
const files = readdirSync(join(out, 'content'));
const tests = files.filter(name => /^test-(circulation-[123]|lecture-[67])\.[a-f0-9]+\.js$/.test(name));
if (tests.length !== 5) throw new Error(`Expected five published lecture test bundles, found ${tests.length}.`);
if (existsSync(join(out, 'api')) || existsSync(join(out, 'functions')) || existsSync(join(out, 'tests'))) {
  throw new Error('A private source directory was copied into the static output.');
}
console.log(`Cloudflare Pages export ready: ${out}; ${tests.length} lecture test bundles.`);
