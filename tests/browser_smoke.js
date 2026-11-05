#!/usr/bin/env node
/*
 * Browser regression suite for DOMiNANCE Breakdowns (all 27 CVS chapters).
 *
 * Run from the repository root:  node tests/browser_smoke.js
 * Requires the `playwright` package and a Chromium build (installed in CI).
 *
 * The suite serves the repository itself and blocks every external request
 * (fonts, Wikimedia images, YouTube), so results never depend on the network.
 * Failures are collected and reported together; the process exits 1 if any occur.
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const WIDTHS = [320, 360, 390, 768, 1280];
const failures = [];
let passes = 0;

function check(condition, message) {
  if (condition) passes += 1;
  else failures.push(message);
  return condition;
}
const section = name => console.log(`\n▶ ${name}`);

// ---------- tiny static server (no dependencies) ----------
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
function serve() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function newPage(browser, base, options = {}) {
  const { initScript, ...contextOptions } = options;
  const context = await browser.newContext(contextOptions);
  if (initScript) await context.addInitScript(initScript);
  await context.route('**/*', route => (route.request().url().startsWith(base) ? route.continue() : route.abort()));
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  page.pageErrors = [];
  page.on('pageerror', e => page.pageErrors.push(e.message));
  return page;
}

async function openRoute(page, base, hash) {
  if (!page.url().startsWith(base)) await page.goto(base + '/' + hash, { waitUntil: 'load' });
  else await page.evaluate(h => { location.hash = h; }, hash);
  await page.waitForTimeout(60);
}

const chapterUrl = slug => '#/physiology/cvs/' + slug;

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();

  // Chapter catalogue straight from the bundle the site uses.
  const probe = await newPage(browser, base);
  await probe.goto(base + '/', { waitUntil: 'load' });
  const topics = await probe.evaluate(() => window.DOMINANCE_TOPICS.map(t => {
    const doc = new DOMParser().parseFromString(t.html, 'text/html');
    const checks = [...doc.querySelectorAll('details')].filter(d => !d.classList.contains('figure-attribution')).length;
    // Last words of the chapter as rendered, independent of the search index being tested.
    const words = doc.body.textContent.replace(/\s+/g, ' ').trim().split(' ');
    return { slug: t.slug, title: t.title, checks, tail: words.slice(-6).join(' ').toLowerCase() };
  }));
  await probe.context().close();
  check(topics.length === 27, `catalogue has ${topics.length} chapters, expected 27`);

  // ---------- 1. Every chapter at every width ----------
  section('All chapters render inside the article at 320–1280 px');
  for (const width of WIDTHS) {
    const page = await newPage(browser, base, { viewport: { width, height: 800 } });
    for (const t of topics) {
      await openRoute(page, base, chapterUrl(t.slug));
      const r = await page.evaluate(() => {
        const sheet = document.querySelector('.article-sheet');
        const text = document.querySelector('.article-text');
        const checks = [...document.querySelectorAll('#main details')].filter(d => !d.classList.contains('figure-attribution'));
        return {
          h1: document.querySelector('.article-sheet h1')?.textContent.trim(),
          overflow: document.documentElement.scrollWidth - innerWidth,
          articleTexts: document.querySelectorAll('.article-text').length,
          checksInside: checks.filter(d => text?.contains(d)).length,
          checksOutside: checks.filter(d => !text?.contains(d)).length,
          headingsOutside: [...(sheet?.querySelectorAll('h2') || [])].filter(h => !text.contains(h)).length,
          strayAfterSheet: sheet ? [...sheet.parentElement.children].filter(e => !e.matches('.article-sheet, .toc')).length : -1,
          missingAlt: [...(text?.querySelectorAll('img') || [])].filter(i => !(i.getAttribute('alt') || '').trim()).length,
          unzoomable: [...(text?.querySelectorAll('figure img') || [])].filter(i => !i.closest('.figure-zoom, .media-resource')).length,
          sectionOptions: document.querySelectorAll('#sections-select option').length - 1,
        };
      });
      const where = `${t.slug} @${width}px`;
      check(page.pageErrors.length === 0, `${where}: page errors ${page.pageErrors.join('; ')}`);
      page.pageErrors.length = 0;
      check(r.h1 === t.title, `${where}: heading "${r.h1}" ≠ "${t.title}"`);
      check(r.overflow <= 2, `${where}: horizontal overflow ${r.overflow}px`);
      check(r.articleTexts === 1, `${where}: ${r.articleTexts} .article-text containers`);
      check(r.checksInside === t.checks && r.checksOutside === 0,
        `${where}: ${r.checksInside}/${t.checks} checks inside article, ${r.checksOutside} outside`);
      check(r.headingsOutside === 0 && r.strayAfterSheet === 0,
        `${where}: content escaped the article (${r.headingsOutside} headings outside .article-text, ${r.strayAfterSheet} stray blocks)`);
      check(r.missingAlt === 0, `${where}: ${r.missingAlt} images without alt text`);
      check(r.unzoomable === 0, `${where}: ${r.unzoomable} figure images without the enlarge control`);
      check(r.sectionOptions >= 2, `${where}: section picker has ${r.sectionOptions} entries`);
    }
    await page.context().close();
    console.log(`  ${width}px: ${topics.length} chapters checked`);
  }

  // ---------- 2. Real phone emulation (touch, device pixel ratio, mobile viewport) ----------
  section('Phone emulation (Pixel 7, iPhone 13 viewport)');
  for (const name of ['Pixel 7', 'iPhone 13']) {
    const { defaultBrowserType, ...device } = devices[name];
    const page = await newPage(browser, base, device);
    for (const t of topics) {
      await openRoute(page, base, chapterUrl(t.slug));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      check(overflow <= 2, `${t.slug} on ${name}: horizontal overflow ${overflow}px`);
    }
    await openRoute(page, base, chapterUrl('cardiac-cycle'));
    await page.locator('.article-text details summary').first().tap();
    check(await page.locator('.article-text details').first().evaluate(d => d.open), `${name}: tapping a check did not reveal it`);
    check(page.pageErrors.length === 0, `${name}: page errors ${page.pageErrors.join('; ')}`);
    await page.context().close();
    console.log(`  ${name}: ${topics.length} chapters checked`);
  }

  // ---------- 3. Reading modes on every chapter ----------
  section('Reading modes (Continuous / Sections / Cards) on every chapter at 390 px');
  {
    const page = await newPage(browser, base, { viewport: { width: 390, height: 800 } });
    for (const t of topics) {
      await openRoute(page, base, chapterUrl(t.slug));
      const where = `${t.slug} reading modes`;
      check(await page.locator('button[data-reader-mode="continuous"]').getAttribute('aria-pressed') === 'true',
        `${where}: continuous is not the default`);
      const expected = await page.evaluate(() => {
        const kids = [...document.querySelector('.article-text').children];
        return kids.filter(k => k.tagName === 'H2').length + (kids[0] && kids[0].tagName !== 'H2' ? 1 : 0);
      });
      const visibleGroups = () => page.evaluate(() => {
        const kids = [...document.querySelector('.article-text').children];
        return { hidden: kids.filter(k => k.hidden).length, visibleH2: kids.filter(k => k.tagName === 'H2' && !k.hidden).length };
      });
      // The reader keeps the current position when switching between Sections and Cards.
      const position = async () => {
        const m = (await page.locator('#reader-position').innerText()).match(/^(Section|Card) (\d+) of (\d+)$/);
        return m ? { label: m[1], index: Number(m[2]), total: Number(m[3]) } : null;
      };
      for (const [mode, label] of [['section', 'Section'], ['presentation', 'Card']]) {
        await page.locator(`button[data-reader-mode="${mode}"]`).click();
        const at = await position();
        check(at && at.label === label && at.total === expected,
          `${where}: ${mode} shows "${await page.locator('#reader-position').innerText()}", expected "${label} n of ${expected}"`);
        const v = await visibleGroups();
        check(v.hidden > 0 && v.visibleH2 <= 1, `${where}: ${mode} mode shows ${v.visibleH2} sections at once`);
        if (at && at.index < at.total) {
          await page.locator('#reader-next').click();
          check((await position())?.index === at.index + 1, `${where}: ${mode} next failed`);
        }
        await page.locator('button[data-reader-mode="continuous"]').click();
        check((await visibleGroups()).hidden === 0, `${where}: continuous mode did not restore all content after ${mode}`);
      }
      const first = page.locator('.article-text details:not(.figure-attribution) summary').first();
      if (check(await first.count() === 1, `${where}: no Understanding Check inside the article`)) {
        await first.click();
        check(await page.locator('.article-text details:not(.figure-attribution)').first().evaluate(d => d.open), `${where}: check did not open`);
      }
    }
    // Keyboard navigation in Cards mode, text size and persistence.
    await openRoute(page, base, chapterUrl('cardiac-cycle'));
    await page.locator('button[data-reader-mode="presentation"]').click();
    await page.locator('#reader-prev').click();
    const before = Number((await page.locator('#reader-position').innerText()).match(/Card (\d+)/)[1]);
    // Known limitation (pre-existing): arrow keys are only handled while focus is inside the article on a
    // non-button element, so the handler is exercised directly here rather than through real focus.
    await page.locator('.article-sheet').dispatchEvent('keydown', { key: 'ArrowRight' });
    check((await page.locator('#reader-position').innerText()).startsWith(`Card ${before + 1} of`), 'Cards mode: ArrowRight did not advance');
    await page.locator('#reader-size').selectOption('120');
    check(await page.locator('html').getAttribute('data-reader-scale') === '120', 'text size control failed');
    await page.reload(); await page.waitForTimeout(100);
    check(await page.locator('button[data-reader-mode="presentation"]').getAttribute('aria-pressed') === 'true', 'reading mode did not persist');
    check(await page.locator('html').getAttribute('data-reader-scale') === '120', 'text size did not persist');
    check(page.pageErrors.length === 0, `reading modes: page errors ${page.pageErrors.join('; ')}`);
    await page.context().close();
    console.log(`  ${topics.length} chapters checked in all three modes`);
  }

  // ---------- 4. Equations ----------
  section('Equations are readable text and fit small screens');
  for (const width of [320, 360, 390]) {
    const page = await newPage(browser, base, { viewport: { width, height: 800 } });
    for (const slug of ['cardiac-cycle', 'blood-pressure', 'cardiac-output', 'hemodynamics', 'co-measurement']) {
      await openRoute(page, base, chapterUrl(slug));
      const rows = await page.evaluate(() => [...document.querySelectorAll('.equation-block')].map(el => {
        const f = el.querySelector('.equation-formula');
        return { text: f?.textContent || '', right: el.getBoundingClientRect().right,
          height: f?.getBoundingClientRect().height || 0, hasMath: !!el.querySelector('math') };
      }));
      check(rows.length > 0, `${slug} @${width}: no equation blocks`);
      check(!rows.some(x => !x.text || x.hasMath || x.right > width + 2 || x.height > 100),
        `${slug} @${width}: badly rendered equation ${JSON.stringify(rows)}`);
      const texts = rows.map(r => r.text);
      if (slug === 'cardiac-cycle') {
        check(texts.some(x => x.includes('SV = EDV − ESV')), `stroke volume equation missing @${width}`);
        check(texts.some(x => x.includes('EF = (SV) / (EDV) × 100')), `ejection fraction equation missing @${width}`);
      }
      if (slug === 'co-measurement') {
        check(texts.some(x => x.includes('V̇O₂ = CO × (CₐO₂ − CᵥO₂)')), `Fick oxygen balance missing @${width}`);
        check(texts.some(x => x.includes('CO = V̇O₂ / (CₐO₂ − CᵥO₂)')), `Fick output formula missing @${width}`);
      }
    }
    await page.context().close();
  }

  // ---------- 5. Home, library, lecture pages and search ----------
  section('Home, CVS library, lecture pages and search');
  {
    const page = await newPage(browser, base, { viewport: { width: 390, height: 800 } });
    await page.goto(base + '/#/', { waitUntil: 'load' });
    check((await page.locator('h1').innerText()).includes('Complex concepts.'), 'platform home heading missing');
    check(await page.locator('.platform-available').count() === 1, 'CVS system card missing');
    check(await page.locator('.platform-upcoming a').count() === 0, 'unavailable systems are linked');
    await page.locator('.platform-available').click(); await page.waitForTimeout(60);
    check((await page.locator('h1').innerText()).includes('Cardiovascular Physiology'), 'CVS landing heading missing');
    check((await page.locator('.hero-chip').innerText()).includes('6 lecture documents'), 'CVS lecture count missing');
    check(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2, 'CVS landing overflows');

    const lectures = await page.locator('.lecture-card').evaluateAll(cards => cards.map(c => c.getAttribute('href')));
    check(lectures.length === 6, `expected 6 lecture cards, found ${lectures.length}`);
    for (const href of lectures) {
      await openRoute(page, base, href);
      const info = await page.evaluate(() => ({
        h1: document.querySelector('h1')?.textContent || '',
        rows: [...document.querySelectorAll('.lecture-row')].map(a => a.getAttribute('href')),
        overflow: document.documentElement.scrollWidth - innerWidth,
      }));
      check(info.h1 && info.rows.length > 0, `${href}: lecture page has no topic rows`);
      check(info.overflow <= 2, `${href}: lecture page overflows by ${info.overflow}px`);
      for (const row of info.rows) {
        const slug = row.split('?')[0].split('/').pop();
        check(topics.some(t => t.slug === slug), `${href}: links to unknown chapter ${slug}`);
      }
      if (info.rows[0]) {
        await openRoute(page, base, info.rows[0]);
        check(await page.locator('.breadcrumb').innerText().then(b => b.includes(info.h1.trim())),
          `${href}: chapter opened from lecture lacks lecture breadcrumb`);
      }
    }

    // Topic view, filters and full-text search (including the end of every chapter).
    await openRoute(page, base, '#/physiology/cvs?view=topics');
    await page.goto(base + '/#/physiology/cvs?view=topics', { waitUntil: 'load' });
    check(await page.locator('.topic-card').count() === 27, 'topic view does not list 27 chapters');
    await page.locator('[data-group="Regional"]').click();
    check(await page.locator('.topic-card').count() === 6, 'Regional filter does not show 6 chapters');
    await page.locator('[data-group="All"]').click();
    const search = async term => {
      await page.fill('#search', term); await page.waitForTimeout(20);
      return page.locator('.topic-card h3').allTextContents();
    };
    check((await search('Bainbridge')).includes('Cardiovascular Reflexes and Cushing Response'), 'search for "Bainbridge" failed');
    for (const t of topics) {
      check((await search(t.tail)).includes(t.title), `${t.slug}: search cannot find text at the end of the chapter ("${t.tail}")`);
    }
    check((await search('zzzz-no-such-topic')).length === 0 && await page.locator('.empty').count() === 1, 'empty search state missing');
    check(page.pageErrors.length === 0, `library: page errors ${page.pageErrors.join('; ')}`);

    // Deep links, unknown routes and wordmark.
    await page.goto(base + '/#/physiology/cvs/heart-sounds', { waitUntil: 'load' });
    check((await page.locator('h1').first().innerText()).includes('Heart Sounds'), 'deep link to Heart Sounds failed');
    await page.locator('.brand').click(); await page.waitForTimeout(60);
    check((await page.locator('h1').innerText()).includes('Complex concepts.'), 'wordmark did not return to platform home');
    await openRoute(page, base, '#/no/such/route');
    check((await page.locator('h1').innerText()).includes('Complex concepts.'), 'unknown route does not fall back to home');
    await page.context().close();
  }

  // ---------- 6. Theme, reviewed status, glossary ----------
  section('Theme, reviewed status and glossary');
  {
    const page = await newPage(browser, base, { viewport: { width: 390, height: 800 } });
    await page.goto(base + '/' + chapterUrl('cardiac-muscle'), { waitUntil: 'load' });
    await page.locator('#theme-toggle').click();
    check(await page.locator('html').getAttribute('data-theme') === 'dark', 'theme toggle did not switch to dark');
    await page.locator('#mark-read').click();
    check((await page.locator('#mark-read').innerText()).includes('Reviewed'), 'mark as reviewed failed');
    await page.reload(); await page.waitForTimeout(80);
    check(await page.locator('html').getAttribute('data-theme') === 'dark', 'dark theme did not persist');
    check((await page.locator('#mark-read').innerText()).includes('Reviewed'), 'reviewed status did not persist');
    await openRoute(page, base, '#/physiology/cvs?view=topics');
    await page.goto(base + '/#/physiology/cvs?view=topics', { waitUntil: 'load' });
    check(await page.locator('.topic-card', { hasText: 'Cardiac Muscle Physiology' }).locator('.done-tag').count() === 1,
      'reviewed badge missing on topic card');
    await page.goto(base + '/' + chapterUrl('cardiac-muscle'), { waitUntil: 'load' });
    const term = page.locator('.glossary-trigger').first();
    check(await term.count() === 1, 'glossary term missing in Cardiac Muscle');
    await term.click();
    check(await term.getAttribute('aria-expanded') === 'true', 'glossary term not expanded');
    check(await page.locator('#dom-glossary-popup').isVisible(), 'glossary popup not shown');
    await page.keyboard.press('Escape');
    check(await page.locator('#dom-glossary-popup').isHidden(), 'Escape did not dismiss glossary');
    check(page.pageErrors.length === 0, `theme/glossary: page errors ${page.pageErrors.join('; ')}`);
    await page.context().close();
  }

  // ---------- 7. Media: audio, video, animation, image viewer ----------
  section('Optional media and figure viewer');
  {
    const page = await newPage(browser, base, { viewport: { width: 390, height: 800 } });
    await page.goto(base + '/' + chapterUrl('heart-sounds'), { waitUntil: 'load' });
    const listen = page.locator('button[data-media-action="play-audio"]');
    check(await listen.count() === 1, 'heart-sound button missing');
    check(await page.locator('.article-text .media-resource.audio-resource').count() === 1, 'heart-sound panel is outside the article');
    await listen.click();
    check(await page.locator('audio').count() === 1, 'audio element missing');
    check((await page.locator('audio source[type="audio/ogg"]').getAttribute('src') || '').includes('HROgg_Louder.ogg'), 'not using amplified recording');
    await page.locator('.audio-speed-control select').selectOption('0.85');
    check(await page.locator('audio').evaluate(a => a.playbackRate) === 0.85, 'playback speed not applied');
    await page.locator('button[data-media-action="stop-audio"]').click();
    check(await page.locator('audio').count() === 0, 'closing audio did not remove the player');

    await page.goto(base + '/' + chapterUrl('cardiac-cycle'), { waitUntil: 'load' });
    check(await page.locator('iframe').count() === 0, 'video iframe loaded before being requested');
    await page.locator('button[data-media-action="play-video"]').click();
    check((await page.locator('iframe').getAttribute('src') || '').startsWith('https://www.youtube-nocookie.com/embed/'), 'video embed not created');
    await page.locator('button[data-media-action="stop-video"]').click();
    check(await page.locator('iframe').count() === 0, 'closing video did not remove the embed');
    await page.locator('button[data-media-action="play-animation"]').click();
    check(await page.locator('.animation-resource .media-stage img').count() === 1, 'animation did not start');
    await page.locator('button[data-media-action="stop-animation"]').click();
    check(await page.locator('.animation-resource .media-stage img').count() === 0, 'animation did not stop');

    await page.goto(base + '/' + chapterUrl('cardiac-muscle'), { waitUntil: 'load' });
    await page.locator('button.figure-zoom').first().click();
    check(await page.locator('dialog.figure-viewer').evaluate(d => d.open), 'image viewer did not open');
    check(!!(await page.locator('dialog.figure-viewer img').getAttribute('src')), 'image viewer has no image');
    await page.keyboard.press('Escape');
    check(!(await page.locator('dialog.figure-viewer').evaluate(d => d.open)), 'Escape did not close image viewer');
    check(await page.locator('.figure-credit a').count() > 0, 'figure credit links lost');
    check(page.pageErrors.length === 0, `media: page errors ${page.pageErrors.join('; ')}`);
    await page.context().close();

    const calm = await newPage(browser, base, { viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' });
    await calm.goto(base + '/' + chapterUrl('cardiac-cycle'), { waitUntil: 'load' });
    await calm.locator('button[data-media-action="play-animation"]').click();
    check(await calm.locator('.animation-resource .media-stage img').count() === 0, 'animation played despite reduced-motion preference');
    await calm.context().close();
  }

  // ---------- 8. Browser storage blocked or corrupted ----------
  section('Works when browser storage is blocked or corrupted');
  {
    const blocked = await newPage(browser, base, {
      viewport: { width: 390, height: 800 },
      initScript: () => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('denied', 'SecurityError'); } }),
    });
    for (const hash of ['#/', '#/physiology/cvs', '#/physiology/cvs?view=topics', chapterUrl('cardiac-cycle'), '#/physiology/cvs/lecture/circulation-1']) {
      await blocked.goto(base + '/' + hash, { waitUntil: 'load' });
      await blocked.waitForTimeout(60);
      check(await blocked.locator('#main h1').count() >= 1, `storage blocked: ${hash} rendered nothing`);
    }
    await blocked.goto(base + '/' + chapterUrl('cardiac-cycle'), { waitUntil: 'load' });
    await blocked.locator('#mark-read').click();
    await blocked.locator('#theme-toggle').click();
    await blocked.locator('button[data-reader-mode="section"]').click();
    check(await blocked.locator('html').getAttribute('data-theme') === 'dark', 'storage blocked: theme toggle failed');
    check(blocked.pageErrors.length === 0, `storage blocked: page errors ${blocked.pageErrors.join('; ')}`);
    await blocked.context().close();

    const corrupt = await newPage(browser, base, {
      viewport: { width: 390, height: 800 },
      initScript: () => { try { localStorage.setItem('dom-completed', '{not json'); localStorage.setItem('dom-theme', 'purple'); } catch {} },
    });
    await corrupt.goto(base + '/' + chapterUrl('cardiac-cycle'), { waitUntil: 'load' });
    check(await corrupt.locator('.article-sheet > h1').innerText() === 'The Cardiac Cycle', 'corrupted storage: chapter did not render');
    check(await corrupt.locator('html').getAttribute('data-theme') === 'light', 'corrupted storage: invalid theme applied');
    check(corrupt.pageErrors.length === 0, `corrupted storage: page errors ${corrupt.pageErrors.join('; ')}`);
    await corrupt.context().close();
  }

  await browser.close();
  server.close();
  console.log(`\n${passes} assertions passed, ${failures.length} failed.`);
  if (failures.length) {
    console.log('\nFAILURES:\n' + failures.map(f => '  ✗ ' + f).join('\n'));
    process.exit(1);
  }
  console.log('PASS browser regression suite');
})().catch(error => {
  console.error('\nSuite aborted:', error.message);
  if (failures.length) console.log('\nFAILURES before abort:\n' + failures.map(f => '  ✗ ' + f).join('\n'));
  process.exit(1);
});
