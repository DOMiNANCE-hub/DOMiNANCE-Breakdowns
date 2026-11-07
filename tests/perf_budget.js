#!/usr/bin/env node
/*
 * Performance budget for DOMiNANCE Breakdowns. Fails if the site gets heavier or jumpier.
 * Run from the repository root:  node tests/perf_budget.js
 *
 * Sizes are measured as gzip (servers send brotli, which is smaller still), so the budget is conservative.
 * Layout shift is measured on a phone with chapter files deliberately delayed, which is when jumps happen.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const http = require('http');
const { chromium, devices } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const BUDGET = {
  homeKB: 60,          // everything needed to show the home page
  chapterKB: 140,      // home + chapter + its interactives + shared chapter scripts, heaviest chapter
  chapterFileKB: 30,   // a single chapter file
  cls: 0.05,           // layout shift while a chapter loads slowly
};
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); return ok; };
const gz = rel => zlib.gzipSync(fs.readFileSync(path.join(ROOT, rel.split('?')[0])), { level: 9 }).length / 1024;

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const sandbox = { window: {} };
new Function('window', fs.readFileSync(path.join(ROOT, 'content/index.js'), 'utf8'))(sandbox.window);
const bundle = sandbox.window.DOM_BUNDLE;

// 1. Nothing blocks the first paint.
const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*>/g)];
for (const m of scripts) check(/\bdefer\b|\basync\b/.test(m[0]), `index.html: script ${m[1]} blocks rendering (add defer)`);
check(!/src="content\.js/.test(html), 'index.html loads the full 1 MB bundle (content.js) instead of the catalogue');

// 2. Download sizes.
const shell = ['index.html', ...[...html.matchAll(/(?:src|href)="((?:[\w-]+\/)?[\w.-]+\.(?:js|css)(?:\?v=\w+)?)"/g)].map(m => m[1])];
const homeKB = shell.reduce((a, f) => a + gz(f), 0);
check(homeKB <= BUDGET.homeKB, `home page downloads ${homeKB.toFixed(1)} KB (budget ${BUDGET.homeKB} KB)`);
const coreKB = bundle.core.reduce((a, f) => a + gz(f), 0);
let worst = { kb: 0, slug: '' };
for (const [slug, file] of Object.entries(bundle.chapters)) {
  const fileKB = gz(file);
  check(fileKB <= BUDGET.chapterFileKB, `${slug}: chapter file is ${fileKB.toFixed(1)} KB (budget ${BUDGET.chapterFileKB} KB)`);
  const body = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const widgetFiles = new Set([...body.matchAll(/data-widget=\\?"([a-z0-9-]+)/g)].map(m => bundle.widgets[m[1]]).filter(Boolean));
  const kb = homeKB + coreKB + fileKB + [...widgetFiles].reduce((a, f) => a + gz(f), 0);
  if (kb > worst.kb) worst = { kb, slug };
}
check(worst.kb <= BUDGET.chapterKB, `${worst.slug}: opening it downloads ${worst.kb.toFixed(1)} KB (budget ${BUDGET.chapterKB} KB)`);

// 3. No layout jumps while chapters load slowly on a phone.
(async () => {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(ROOT, u === '/' ? 'index.html' : u);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    const delay = u.startsWith('/content/') && !u.endsWith('index.js') ? 700 : 0;
    setTimeout(() => { res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res); }, delay);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  for (const slug of ['cardiac-cycle', 'heart-sounds', 'shock', 'reflexes']) {
    for (const profile of [devices['Pixel 7'], { viewport: { width: 1366, height: 850 } }]) {
      const ctx = await browser.newContext({ ...profile, serviceWorkers: 'block' });
      await ctx.addInitScript(() => {
        window.__cls = 0;
        new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
      });
      const page = await ctx.newPage();
      await page.route('**/*', r => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
      await page.goto(`${base}/#/physiology/cvs/${slug}`, { waitUntil: 'load' });
      await page.waitForTimeout(500);
      const cls = await page.evaluate(() => window.__cls);
      check(cls <= BUDGET.cls, `${slug} (${profile.viewport.width}px): layout shift ${cls.toFixed(3)} while loading (budget ${BUDGET.cls})`);
      await ctx.close();
    }
  }
  await browser.close();
  server.close();
  console.log(`Home ${homeKB.toFixed(1)} KB · heaviest chapter (${worst.slug}) ${worst.kb.toFixed(1)} KB · shared chapter scripts ${coreKB.toFixed(1)} KB`);
  if (failures.length) { console.log('\nFAILURES:\n  ✗ ' + failures.join('\n  ✗ ')); process.exit(1); }
  console.log('PASS performance budget');
})().catch(e => { console.error(e); process.exit(1); });
