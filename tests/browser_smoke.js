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
  // Chapters are downloaded on demand: wait until the route has finished rendering.
  await page.waitForFunction(h => document.getElementById('main')?.dataset.route === h, hash, { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(60);
}


// On phones the reading options are folded behind one "Reading options" button.
// Understanding Checks: on phones they open in their own sheet; on wider screens they sit in the page.
// Answers the first question of the first check and returns whether its explanation opened.
async function answerFirstCheck(page) {
  const launch = page.locator('.check-launch').first();
  const sheeted = await launch.isVisible().catch(() => false);
  if (sheeted) { await launch.click(); await page.waitForTimeout(260); }
  const scope = sheeted ? page.locator('.check-sheet') : page.locator('.article-text');
  const option = scope.locator('button.mcq-option').first();
  let opened;
  if (await option.count()) {
    await option.click();
    opened = await scope.locator('details:not(.figure-attribution)').first().evaluate(d => d.open);
  } else {
    await scope.locator('details:not(.figure-attribution) summary').first().click();
    opened = await scope.locator('details:not(.figure-attribution)').first().evaluate(d => d.open);
  }
  if (sheeted) { await page.locator('.check-sheet .cs-done').click(); await page.waitForTimeout(260); }
  return opened;
}
async function openReader(page) {
  const toggle = page.locator('.reader-toggle');
  if (await toggle.isVisible() && await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
}

const chapterUrl = slug => '#/physiology/cvs/' + slug;

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();

  // Chapter catalogue straight from the bundle the site uses.
  const probe = await newPage(browser, base);
  await probe.goto(base + '/', { waitUntil: 'load' });
  // The site loads chapters on demand; the full bundle (built alongside) gives the test catalogue in one go.
  await probe.addScriptTag({ url: base + '/content.js' });
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
    check(await answerFirstCheck(page), `${name}: answering a check did not reveal its explanation`);
    check(await page.locator('.check-sheet').evaluate(el => el.hidden) && /answered/.test(await page.locator('.check-launch .cl-sub').first().innerText()),
      `${name}: the question sheet did not close and record the answer`);
    // Understanding Checks open in a sheet: the back button closes it and keeps the reading position.
    const launch = page.locator('.check-launch').nth(1);
    await launch.evaluate(el => el.scrollIntoView({block: 'center', behavior: 'instant'}));
    const y = await page.evaluate(() => scrollY);
    await launch.tap(); await page.waitForTimeout(260);
    check(await page.locator('.check-sheet').isVisible(), `${name}: tapping a check card did not open the questions`);
    await page.goBack(); await page.waitForTimeout(300);
    check(await page.locator('.check-sheet').evaluate(el => el.hidden) && /cardiac-cycle$/.test(await page.evaluate(() => location.hash)) && Math.abs(await page.evaluate(() => scrollY) - y) < 3,
      `${name}: Back did not close the questions in place`);
    // Videos open in their own full-screen window.
    const play = page.locator('button[data-media-action="play-video"]').first();
    await play.evaluate(el => el.scrollIntoView({block: 'center', behavior: 'instant'}));
    await play.tap(); await page.waitForTimeout(200);
    check(await page.locator('.video-viewer iframe[src*="youtube-nocookie.com/embed/"]').count() === 1, `${name}: the video did not open in its own window`);
    await page.locator('.video-viewer .vv-close').tap(); await page.waitForTimeout(200);
    check(await page.locator('.video-viewer').count() === 0 && /cardiac-cycle$/.test(await page.evaluate(() => location.hash)), `${name}: closing the video window failed`);
    check(page.pageErrors.length === 0, `${name}: page errors ${page.pageErrors.join('; ')}`);
    await page.context().close();
    console.log(`  ${name}: ${topics.length} chapters checked`);
  }

  // ---------- Understanding Check on desktop ----------
  section('Desktop Understanding Checks: compact launcher, focused dialog, answer state and Escape');
  {
    const page = await newPage(browser, base, { viewport: { width: 1280, height: 800 } });
    await openRoute(page, base, chapterUrl('cardiac-cycle'));
    const launch = page.locator('.article-sheet .check-launch').first();
    check(await launch.isVisible(), 'desktop Understanding Check launcher is not visible');
    check(!(await page.locator('.article-sheet .check-body').first().isVisible()),
      'desktop Understanding Check questions should not appear inline in the notes');
    await launch.click();
    const dialog = page.locator('.check-sheet[role="dialog"]');
    check(await dialog.isVisible(), 'desktop Understanding Check window did not open');
    check(await dialog.getAttribute('aria-modal') === 'true', 'desktop Understanding Check missing modal semantics');
    const first = dialog.locator('button.mcq-option').first();
    if (await first.count()) {
      await first.click();
      check(await dialog.locator('details:not(.figure-attribution)').first().evaluate(e => e.open),
        'Understanding Check answer feedback did not open');
    } else {
      await dialog.locator('details:not(.figure-attribution) summary').first().click();
    }
    await page.keyboard.press('Escape');
    check(!(await dialog.isVisible()), 'Escape did not close the desktop Understanding Check');
    await launch.click();
    check(await dialog.locator('details:not(.figure-attribution)').first().evaluate(e => e.open),
      'Understanding Check lost its answer when reopened');
    await dialog.locator('.cs-done').click();
    await page.waitForTimeout(300);
    check(page.pageErrors.length === 0, 'desktop Understanding Check browser errors');
    await page.context().close();
  }

  // ---------- 3. Reading modes on every chapter ----------
  section('Reading modes (Continuous / Sections / Cards) on every chapter at 390 px');
  {
    const page = await newPage(browser, base, { viewport: { width: 390, height: 800 } });
    for (const t of topics) {
      await openRoute(page, base, chapterUrl(t.slug));
      const where = `${t.slug} reading modes`;
      await openReader(page);
      check(await page.locator('button[data-reader-mode="continuous"]').getAttribute('aria-pressed') === 'true',
        `${where}: continuous is not the default`);
      const expected = await page.evaluate(() => {
        const kids = [...document.querySelector('.article-text').children].filter(k => k.tagName !== 'H1');   // hidden chapter title
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
      if (check(await page.locator('.article-text .check-block').count() > 0, `${where}: no Understanding Check inside the article`)) {
        check(await answerFirstCheck(page), `${where}: check did not open`);
      }
    }
    // Keyboard navigation in Cards mode, text size and persistence.
    await openRoute(page, base, chapterUrl('cardiac-cycle'));
    await openReader(page);
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

  // Keep the responsive fraction checks after merging new media/reading styles from main.
  // ---------- 4. Equations ----------
  section('Equations retain stacked fractions and scripts on small screens');
  for (const width of [320, 360, 390, 768]) {
    const page = await newPage(browser, base, { viewport: { width, height: 800 } });
    for (const slug of ['cardiac-cycle', 'blood-pressure', 'cardiac-output', 'hemodynamics', 'co-measurement', 'ecg']) {
      await openRoute(page, base, chapterUrl(slug));
      const rows = await page.evaluate(() => [...document.querySelectorAll('.equation-block')].map(el => {
        const f = el.querySelector('.equation-formula');
        const fractions = [...el.querySelectorAll('.eq-fraction')];
        return {
          text: f?.getAttribute('aria-label') || '',
          right: el.getBoundingClientRect().right,
          height: f?.getBoundingClientRect().height || 0,
          hasMath: !!el.querySelector('math'),
          hasLayout: !!f?.querySelector('.eq-layout'),
          fractionCount: fractions.length,
          fractionsHaveBars: fractions.every(fr => {
            const top = fr.querySelector('.eq-numerator');
            const bottom = fr.querySelector('.eq-denominator');
            return !!(top && bottom && top.getBoundingClientRect().width > 0 &&
              parseFloat(getComputedStyle(top).borderBottomWidth) > 0);
          }),
          hasSup: !!el.querySelector('.eq-script > sup'),
          hasSub: !!el.querySelector('.eq-script > sub')
        };
      }));
      check(rows.length > 0, `${slug} @${width}: no equation blocks`);
      check(!rows.some(x => !x.text || x.hasMath || !x.hasLayout || !x.fractionsHaveBars || x.right > width + 2 || x.height > 170),
        `${slug} @${width}: badly rendered equation ${JSON.stringify(rows)}`);
      const texts = rows.map(r => r.text);
      if (slug === 'cardiac-cycle') {
        check(texts.some(x => x.includes('SV = EDV − ESV')), `stroke volume equation missing @${width}`);
        check(rows.some(x => x.text.startsWith('EF = ') && x.fractionCount > 0), `ejection fraction needs a stacked bar @${width}`);
      }
      if (slug === 'co-measurement') {
        check(texts.some(x => x.includes('V̇O₂ = CO × (CₐO₂ − CᵥO₂)')), `Fick oxygen balance missing @${width}`);
        check(texts.some(x => x.startsWith('CO = ') && x.includes('divided by')), `Fick output formula missing @${width}`);
      }
      if (slug === 'hemodynamics') {
        check(rows.some(x => x.fractionCount > 0 && x.hasSup), `Poiseuille needs fraction and superscript @${width}`);
      }
      if (slug === 'ecg') {
        check(rows.some(x => x.hasSub), `ECG lead subscripts missing @${width}`);
        check(rows.some(x => x.fractionCount > 0), `ECG rate fraction missing @${width}`);
      }
      if (slug === 'cardiac-output') {
        check(rows.some(x => x.text.startsWith('CI = ') && x.fractionCount > 0), `cardiac index fraction missing @${width}`);
      }
    }
    check(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2,
      `equations @${width}: page overflow`);
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
    // Lecture 5 repeats Circulation 3's slides, so the two share one card; its own page still opens.
    check(lectures.length === 5, `expected 5 lecture cards, found ${lectures.length}`);
    check(/Same slides as Lecture 5/.test(await page.locator('.lecture-card[href$="circulation-3"]').innerText()), 'Circulation 3 card should name Lecture 5');
    await page.locator('#search').fill('lecture 5');
    check(await page.locator('.lecture-card[href$="circulation-3"]').count() === 1, 'searching "lecture 5" should find the shared Homeostasis card');
    await page.locator('#search').fill('');
    for (const href of [...lectures, '#/physiology/cvs/lecture/lecture-5']) {
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
      await page.fill('#search', term);
      await page.waitForFunction(() => window.DOM_SEARCH, null, { timeout: 5000 }).catch(() => {});   // full-text index loads on first search
      await page.waitForTimeout(20);
      return page.locator('.topic-card h3').allTextContents();
    };
    check((await search('Bainbridge')).includes('Cardiovascular Reflexes'), 'search for "Bainbridge" failed');
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
    check(await page.locator('.video-viewer').count() === 1, 'on a phone the video should open in its own window');
    await page.keyboard.press('Escape');
    check(await page.locator('iframe').count() === 0, 'closing video did not remove the embed');
    // Wider screens keep the video in the page.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.locator('button[data-media-action="play-video"]').click();
    check(await page.locator('.video-viewer').count() === 0 && await page.locator('.media-stage iframe').count() === 1, 'desktop video should play in the page');
    await page.locator('button[data-media-action="stop-video"]').click();
    check(await page.locator('iframe').count() === 0, 'closing the in-page video did not remove the embed');
    await page.setViewportSize({ width: 390, height: 800 });
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

  // ---------- 7b. Chapter 4 teaching widgets, answer feedback, tooltip cards and section links ----------
  section('Cardiac Cycle widgets, answer feedback, tooltip cards and section deep links');
  {
    const page = await newPage(browser, base, { viewport: { width: 390, height: 860 } });
    await page.goto(base + '/' + chapterUrl('cardiac-cycle'), { waitUntil: 'load' });
    await page.waitForTimeout(80);
    const widgets = await page.$$eval('.teaching-widget', els => els.map(e => e.dataset.ready === '1' && !e.classList.contains('tw-failed') && !!e.querySelector('svg, input, button')));
    check(widgets.length === 7 && widgets.every(Boolean), `cardiac-cycle: ${widgets.filter(Boolean).length}/7 teaching widgets rendered (S2 splitting lives in Heart Sounds)`);
    await page.locator('[data-widget="wiggers"] .tw-dot').nth(4).click();
    check((await page.locator('[data-widget="wiggers"] .tw-step-title').innerText()).startsWith('Step 5'), 'Wiggers stepper did not reach step 5');
    const slider = page.locator('[data-widget="hr-slider"] input');
    await slider.evaluate(el => { el.value = '150'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    check((await page.locator('[data-widget="hr-slider"] output').innerText()).includes('0.40 s (400 ms)'), 'heart-rate slider: 150 beats/min should give 0.40 s');
    check(await page.locator('details.mcq-answer summary').first().isHidden(), 'multiple-choice explanations should not have a reveal button');
    await page.locator('.check-launch').first().click(); await page.waitForTimeout(260);
    const firstQuestion = page.locator('.check-sheet details.mcq-answer').first().locator('xpath=preceding-sibling::p[1]');
    await firstQuestion.locator('button.mcq-option[data-option="A"]').click();
    check(/best answer is D/.test(await firstQuestion.locator('.mcq-feedback').innerText()), 'wrong answer did not show the correct key');
    check(await page.locator('.check-sheet details.mcq-answer').first().evaluate(d => d.open), 'answer explanation did not open after answering');
    await page.locator('.check-sheet .sheet-close').click(); await page.waitForTimeout(260);
    await page.locator('.glossary-trigger[data-glossary="av-node"]').first().click();
    check(await page.locator('#dom-glossary-popup .gl-confuse').count() === 1, "tooltip card lacks its Don't confuse line");
    await page.locator('#dom-glossary-popup .gl-learn').click();
    await page.waitForTimeout(200);
    const landed = await page.evaluate(() => ({ hash: location.hash, top: document.getElementById('5-why-does-the-av-node-delay-electrical-conduction')?.getBoundingClientRect().top }));
    check(landed.hash.includes('cardiac-conduction') && Math.abs(landed.top ?? 999) < 160, `"Learn it fully" did not open Cardiac Conduction §5 (${JSON.stringify(landed)})`);
    const ids = await page.evaluate(() => Object.fromEntries(window.DOMINANCE_TOPICS.map(t => [t.slug, t.sections.map(s => s.id)])));
    const badLinks = await page.evaluate(ids => Object.entries(window.DOM_GLOSSARY).filter(([, v]) => v[3]).filter(([, v]) => {
      const m = v[3].match(/cvs\/([a-z0-9-]+)\?section=(.+)$/); return !m || !(ids[m[1]] || []).includes(m[2]); }).map(([k]) => k), ids);
    check(badLinks.length === 0, `tooltip links to missing sections: ${badLinks.join(', ')}`);
    const unlinked = await page.evaluate(() => Object.entries(window.DOM_GLOSSARY).filter(([, v]) => !v[3]).map(([k]) => k));
    check(unlinked.length === 0, `tooltips without a "Learn it fully" section: ${unlinked.join(', ')}`);
    check(page.pageErrors.length === 0, `cardiac-cycle widgets: page errors ${page.pageErrors.join('; ')}`);
    await page.context().close();
  }

  section('Heart Sounds widgets, recordings, murmur predictor and source notes');
  {
    const page = await newPage(browser, base, { viewport: { width: 390, height: 860 } });
    await page.goto(base + '/' + chapterUrl('heart-sounds'), { waitUntil: 'load' });
    await page.waitForTimeout(150);
    const widgets = await page.$$eval('.article-text .teaching-widget', els => els.map(e => ({ w: e.dataset.widget, ok: e.dataset.ready === '1' && !e.classList.contains('tw-failed') && !!e.querySelector('svg, button') })));
    check(widgets.length === 8 && widgets.every(w => w.ok), `heart-sound widgets did not all render: ${JSON.stringify(widgets)}`);
    check(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2, 'Heart Sounds page scrolls sideways at 390 px');
    check(await page.locator('details.mcq-answer').count() === 14, 'Heart Sounds should have 14 answer-feedback questions');
    const notes = page.locator('aside.source-note');
    check(await notes.count() === 3 && await notes.first().locator('.source-note-body').isHidden(), 'source notes should start collapsed');
    await notes.first().locator('.source-note-toggle').click();
    check(await notes.first().locator('.source-note-body').isVisible(), 'source note did not open');
    const pr = page.locator('[data-widget="murmur-predictor"]');
    await pr.locator('[data-valve="mitral"]').click(); await pr.locator('[data-fault="stenosis"]').click(); await pr.locator('.snd-all').click();
    check((await pr.locator('.snd-steps').innerText()).includes('diastolic murmur'), 'predictor: mitral stenosis should be diastolic');
    await pr.locator('[data-fault="regurgitation"]').click(); await pr.locator('.snd-all').click();
    check((await pr.locator('.snd-steps').innerText()).includes('systolic murmur'), 'predictor: mitral regurgitation should be systolic');
    check(await pr.locator('.snd-example .snd-play').count() === 1, 'predictor example recording button missing');
    await page.locator('[data-widget="filling-sounds"] .snd-play[data-clip="s3"]').click();
    check(await page.locator('audio').count() === 0, 'recordings should not add audio elements to the page');
    await page.locator('.snd-mode-btn[data-mode="phone"]').first().click();
    check(await page.locator('.snd-mode-btn[data-mode="phone"][aria-pressed="true"]').count() === await page.locator('.snd-mode-btn[data-mode="phone"]').count(), 'phone-speaker toggle not synced');
    const missing = await page.evaluate(async () => { const out = []; for (const n of ['normal-apex', 'normal-base', 'split-s2', 's3', 's4', 'aortic-stenosis', 'aortic-regurgitation', 'mitral-regurgitation', 'mitral-stenosis', 'pulmonary-stenosis']) for (const v of ['', '-phone']) if (!(await fetch('assets/chapter05/audio/' + n + v + '.mp3', { method: 'HEAD' })).ok) out.push(n + v); return out; });
    check(missing.length === 0, `missing heart-sound clips: ${missing.join(', ')}`);
    const ids = await page.evaluate(() => Object.fromEntries(window.DOMINANCE_TOPICS.map(t => [t.slug, t.sections.map(s => s.id)])));
    const bad = await page.evaluate(ids => [...document.querySelectorAll('.article-text a[href^="#/physiology/cvs/"]')].map(a => a.getAttribute('href')).filter(h => {
      const m = h.match(/cvs\/([a-z0-9-]+)(?:\?section=(.+))?$/); return !m || !ids[m[1]] || (m[2] && !ids[m[1]].includes(m[2])); }), ids);
    check(bad.length === 0, `Heart Sounds links to missing sections: ${bad.join(', ')}`);
    check(page.pageErrors.length === 0, `heart-sounds widgets: page errors ${page.pageErrors.join('; ')}`);
    await page.context().close();
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
    await openReader(blocked);
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

  // ---------- 12. Offline reading ----------
  // ---------- Feedback and anonymous usage ----------
  section('Feedback: clear? votes, problem reports, anonymous reading events');
  {
    for (const width of [390, 1280]) {
      const page = await newPage(browser, base, { viewport: { width, height: 860 } });
      const sent = [];
      let status = 204;
      await page.route('**/api/collect', async route => {
        const body = JSON.parse(route.request().postData() || '{}');
        sent.push(...(body.events || []));
        await route.fulfill({ status });
      });
      await openRoute(page, base, chapterUrl('reflexes'));
      check(await answerFirstCheck(page), `feedback @${width}: answering failed`);
      await page.locator('.article-text .glossary-trigger').first().click();
      await page.keyboard.press('Escape');
      // Clear? → Not really → a short form that names the section
      await page.locator('.article-end').scrollIntoViewIfNeeded();
      await page.locator('.cf-btn[data-vote="down"]').click();
      check(await page.locator('dialog.fb-dialog[open]').count() === 1, `feedback @${width}: "Not really" did not open the form`);
      check(await page.locator('#fb-where option').count() === 9, `feedback @${width}: the form should list the whole chapter and its 8 sections`);
      await page.locator('#fb-text').fill('The Cushing reflex section lost me at step 3.');
      await page.locator('.fb-send').click();
      await page.waitForTimeout(200);
      check(/Thank you/.test(await page.locator('dialog.fb-dialog').innerText()), `feedback @${width}: no thank-you after sending`);
      await page.locator('.fb-ok').click();
      check(/glad it helped|Thanks for saying so/.test(await page.locator('.chapter-feedback').innerText()), `feedback @${width}: vote not acknowledged`);
      // Reload: the vote is remembered; leaving the page sends the queued reading events.
      await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
      await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
      await page.waitForTimeout(300);
      const types = new Set(sent.map(e => e.t));
      for (const t of ['view', 'answer', 'tip', 'vote', 'note']) check(types.has(t), `feedback @${width}: no "${t}" event was sent (${[...types].join(', ')})`);
      const answer = sent.find(e => e.t === 'answer');
      check(answer && /^reflexes:[0-9a-f]{8}$/.test(answer.q) && /^[A-D]$/.test(answer.o), `feedback @${width}: answer event lacks a question id and option`);
      const note = sent.find(e => e.t === 'note');
      check(note && note.k === 'unclear' && note.c === 'reflexes' && note.x.includes('Cushing'), `feedback @${width}: note not sent correctly`);
      check(!JSON.stringify(sent).match(/@|name/i), `feedback @${width}: events should carry nothing personal`);
      // Report a problem with a set of questions
      await openRoute(page, base, chapterUrl('reflexes'));
      if (width < 760) { await page.locator('.check-launch').first().click(); await page.waitForTimeout(260); }
      const scope = width < 760 ? '.check-sheet' : '.article-text';
      await page.locator(`${scope} .check-report`).first().click();
      check(await page.locator('#fb-where option').count() === 4, `feedback @${width}: question report should offer "in general" + 3 questions`);
      // Before the database is connected the form says so instead of pretending.
      status = 503;
      await page.locator('#fb-text').fill('Question 2 option C looks right too.');
      await page.locator('.fb-send').click();
      await page.waitForTimeout(200);
      check(/isn’t switched on yet/.test(await page.locator('dialog.fb-dialog').innerText()), `feedback @${width}: an unconnected database should be reported honestly`);
      await page.locator('.fb-ok').click();
      check(page.pageErrors.length === 0, `feedback @${width}: page errors ${page.pageErrors.join('; ')}`);
      await page.context().close();
    }
    // Browsers that ask not to be tracked send no reading events.
    const quiet = await newPage(browser, base, { viewport: { width: 1280, height: 860 }, initScript: () => Object.defineProperty(navigator, 'globalPrivacyControl', { value: true }) });
    const quietSent = [];
    await quiet.route('**/api/collect', async route => { quietSent.push(...(JSON.parse(route.request().postData() || '{}').events || [])); await route.fulfill({ status: 204 }); });
    await openRoute(quiet, base, chapterUrl('reflexes'));
    await answerFirstCheck(quiet);
    await quiet.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    await quiet.waitForTimeout(300);
    check(quietSent.length === 0, `Global Privacy Control: ${quietSent.length} reading events were sent`);
    await quiet.context().close();
    console.log('  feedback checked at 390 and 1280 px');
  }

  // ---------- Lecture tests ----------
  section('Lecture tests: mark as you go, submit at the end, review, retry, resume');
  {
    const page = await newPage(browser, base, { viewport: { width: 390, height: 860 } });
    const answers = [];
    await page.route('**/api/collect', async route => { answers.push(...(JSON.parse(route.request().postData() || '{}').events || []).filter(e => e.t === 'answer')); await route.fulfill({ status: 204 }); });
    await openRoute(page, base, '#/physiology/cvs/lecture/circulation-2');
    check(await page.locator('.test-card').count() === 1, 'lecture page has no test card');
    await page.locator('.test-card').click();
    await page.waitForSelector('.lt-start');
    check(/60 questions/.test(await page.locator('.lt-lede').innerText()), 'test intro should say 60 questions');
    // Mark as you go
    await page.locator('.lt-start').click();
    check(await page.locator('.lt-next').isDisabled(), 'mark-as-you-go: Next should wait for an answer');
    const stem1 = await page.locator('.lt-stem').innerText();
    await page.locator('.lt-option').first().click();
    check(await page.locator('.lt-verdict').count() === 1, 'mark-as-you-go: no verdict after answering');
    check(await page.locator('.lt-option.is-correct').count() === 1, 'mark-as-you-go: correct option not shown');
    check(await page.locator('.lt-why-not').count() === 3, 'mark-as-you-go: each wrong option should explain itself');
    check(await page.locator('.lt-option:disabled').count() === 4, 'mark-as-you-go: answer should lock');
    await page.locator('.lt-next').click();
    check((await page.locator('.lt-stem').innerText()) !== stem1 && /2 \/ 60/.test(await page.locator('.lt-count').innerText()), 'Next did not move on');
    // Leave and resume
    await page.locator('.lt-exit').click();
    await page.waitForTimeout(200);
    await openRoute(page, base, '#/physiology/cvs/lecture/circulation-2/test');
    await page.waitForSelector('.lt-resume');
    check(/question 2 of 60/.test(await page.locator('.lt-resume').innerText()), 'resume should offer question 2 of 60');
    // Submit at the end, Quick 20
    await page.locator('input[name="mode"][value="exam"]').check();
    await page.locator('input[name="size"][value="quick"]').check();
    await page.locator('.lt-start').click();
    check(/1 \/ 20/.test(await page.locator('.lt-count').innerText()), 'Quick 20 should have 20 questions');
    await page.locator('.lt-option').nth(2).click();
    check(await page.locator('.lt-verdict').count() === 0 && await page.locator('.lt-option.is-chosen').count() === 1, 'exam mode should not mark answers');
    await page.locator('.lt-option').nth(1).click();
    check(await page.locator('.lt-option.is-chosen').count() === 1, 'exam mode should allow changing an answer');
    await page.locator('.lt-grid-btn').click();
    await page.locator('.lt-jump[data-to="19"]').click();
    await page.locator('.lt-option').first().click();
    await page.locator('.lt-finish').click();
    check(/haven’t answered 18 questions/.test(await page.locator('.lt-confirm').innerText()), 'exam mode should warn about unanswered questions');
    await page.locator('.lt-submit-anyway').click();
    await page.waitForSelector('.lt-pct');
    check(await page.locator('.lt-item').count() === 20 && await page.locator('.lt-unanswered').count() === 18, 'review should list all 20 with 18 unanswered');
    const missed = Number((await page.locator('.lt-retry').innerText()).match(/\d+/)[0]);
    check(missed >= 18, 'retry should include the unanswered questions');
    if (missed < 20) {   // the filter only appears when some were right
      await page.locator('[data-only="1"]').click();
      check(await page.locator('.lt-item').count() === missed, 'Missed filter should show only missed questions');
    }
    await page.locator('.lt-retry').click();
    check(new RegExp('1 / ' + missed).test(await page.locator('.lt-count').innerText()), 'retry should start with the missed questions');
    // Best score shows on the lecture page; answers are recorded with stable ids
    await openRoute(page, base, '#/physiology/cvs/lecture/circulation-2');
    check(/your best \d+%/.test(await page.locator('.test-card').innerText()), 'best score not shown on the lecture card');
    await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    await page.waitForTimeout(300);
    check(answers.length >= 3 && answers.every(a => /^lt-circulation-2:[0-9a-f]{8}$/.test(a.q) && /^[A-D]$/.test(a.o)), `test answers not recorded correctly (${answers.length})`);
    // The last chapter of the lecture invites the student to the test; Lecture 5 shares Circulation 3's (none yet)
    await openRoute(page, base, chapterUrl('reflexes'));
    check(await page.locator('.article-end .test-card[href$="circulation-2/test"]').count() === 1, 'Reflexes should end with the Circulation 2 test card');
    await openRoute(page, base, chapterUrl('local-regulation'));
    check(await page.locator('.article-end .test-card').count() === 0, 'only the last chapter of a lecture should show the test card');
    check(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2, 'lecture test overflows at 390 px');
    check(page.pageErrors.length === 0, `lecture test: page errors ${page.pageErrors.join('; ')}`);
    await page.context().close();
    console.log('  Circulation 2 test checked in both modes');
  }

  // ---------- Lecture 7 ECG test ----------
  section('Lecture 7 ECG test: 47 questions on phone and desktop');
  {
    for (const width of [390, 1280]) {
      const page = await newPage(browser, base, { viewport: { width, height: 860 } });
      await openRoute(page, base, '#/physiology/cvs/lecture/lecture-7');
      check(await page.locator('.test-card').count() === 1, `ECG @${width}: lecture test card missing`);
      await openRoute(page, base, '#/physiology/cvs/lecture/lecture-7/test');
      await page.waitForSelector('.lt-start');
      check(/47 questions/.test(await page.locator('.lt-lede').innerText()), `ECG @${width}: incorrect question count`);
      await page.locator('.lt-start').click();
      check(await page.locator('.lt-option').count() === 4, `ECG @${width}: expected four options`);
      await page.locator('.lt-option').first().click();
      check(await page.locator('.lt-why-not').count() === 3, `ECG @${width}: missing distractor explanations`);
      check(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2, `ECG @${width}: horizontal overflow`);
      check(page.pageErrors.length === 0, `ECG @${width}: page errors ${page.pageErrors.join('; ')}`);
      await page.context().close();
    }
    console.log('  Lecture 7 ECG test checked at 390 and 1280 px');
  }

  // ---------- Homeostasis lecture test ----------
  section('Homeostasis lecture test: 62 questions on phone and desktop');
  {
    for (const width of [390, 1280]) {
      const page = await newPage(browser, base, { viewport: { width, height: 860 } });
      await openRoute(page, base, '#/physiology/cvs/lecture/circulation-3');
      check(await page.locator('.test-card').count() === 1, `Homeostasis @${width}: test card missing`);
      await openRoute(page, base, '#/physiology/cvs/lecture/circulation-3/test');
      await page.waitForSelector('.lt-start');
      check(/62 questions/.test(await page.locator('.lt-lede').innerText()), `Homeostasis @${width}: incorrect question count`);
      await page.locator('.lt-start').click();
      check(await page.locator('.lt-option').count() === 4, `Homeostasis @${width}: expected four answer options`);
      await page.locator('.lt-option').first().click();
      check(await page.locator('.lt-why-not').count() === 3, `Homeostasis @${width}: missing distractor explanations`);
      check(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2, `Homeostasis @${width}: horizontal overflow`);
      check(page.pageErrors.length === 0, `Homeostasis @${width}: page errors ${page.pageErrors.join('; ')}`);
      await page.context().close();
    }
    console.log('  Homeostasis test checked at 390 and 1280 px');
  }

  // ---------- Lecture test check: lecture-6 ----------
  section('Regional lecture test: 62 questions, answers and mobile layout');
  {
    for (const width of [390, 1280]) {
      const page = await newPage(browser, base, { viewport: { width, height: 860 } });
      await openRoute(page, base, '#/physiology/cvs/lecture/lecture-6');
      check(await page.locator('.test-card').count() === 1, 'lecture-6: lecture test card missing');
      await openRoute(page, base, '#/physiology/cvs/lecture/lecture-6/test');
      await page.waitForSelector('.lt-start');
      check(/62 questions/.test(await page.locator('.lt-lede').innerText()), 'lecture-6: incorrect test length');
      await page.locator('.lt-start').click();
      check(await page.locator('.lt-option').count() === 4, 'lecture-6: MCQ options missing');
      await page.locator('.lt-option').first().click();
      check(await page.locator('.lt-why-not').count() === 3, 'lecture-6: distractor explanations missing');
      check(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2, 'lecture-6: horizontal overflow');
      check(page.pageErrors.length === 0, 'lecture-6: browser errors');
      await page.context().close();
    }
  }

  // ---------- Lecture test check: circulation-1 ----------
  section('Circulation 1 lecture test: 97 questions, answers and mobile layout');
  {
    for (const width of [390, 1280]) {
      const page = await newPage(browser, base, { viewport: { width, height: 860 } });
      await openRoute(page, base, '#/physiology/cvs/lecture/circulation-1');
      check(await page.locator('.test-card').count() === 1, 'circulation-1: lecture test card missing');
      await openRoute(page, base, '#/physiology/cvs/lecture/circulation-1/test');
      await page.waitForSelector('.lt-start');
      check(/97 questions/.test(await page.locator('.lt-lede').innerText()), 'circulation-1: incorrect test length');
      await page.locator('.lt-start').click();
      check(await page.locator('.lt-option').count() === 4, 'circulation-1: MCQ options missing');
      await page.locator('.lt-option').first().click();
      check(await page.locator('.lt-why-not').count() === 3, 'circulation-1: distractor explanations missing');
      check(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2, 'circulation-1: horizontal overflow');
      check(page.pageErrors.length === 0, 'circulation-1: browser errors');
      await page.context().close();
    }
  }

  // ---------- LAMLA (last-minute mode) ----------
  section('LAMLA: pick a lecture and time, questions first, must-know, mistakes, test');
  {
    for (const width of [390, 1280]) {
      const page = await newPage(browser, base, { viewport: { width, height: 860 } });
      await openRoute(page, base, '#/');
      check(await page.locator('.lamla-card').count() === 1, `LAMLA @${width}: no card on the homepage`);
      await openRoute(page, base, '#/physiology/cvs');
      check(await page.locator('.lamla-card').count() === 1, `LAMLA @${width}: no card on the CVS page`);
      await page.locator('.lamla-card').click();
      await page.waitForSelector('.lamla-lecture');
      check(await page.locator('.lamla-lecture[data-lecture]').count() === 5 && await page.locator('.lamla-lecture.is-soon').count() === 0, `LAMLA @${width}: picker should list all five lectures (Lecture 5 shares Circulation 3)`);
      await page.locator('input[name="minutes"][value="30"]').check();
      await page.locator('[data-lecture="circulation-2"]').click();
      await page.waitForSelector('.lt-stem');
      check(/Check yourself 1 of 2/.test(await page.locator('.lt-qmeta').innerText()), `LAMLA @${width}: 30 minutes should ask 2 questions per chapter`);
      // answer wrong on purpose, then right: the must-know page should reflect it
      const key = await page.evaluate(() => [...document.querySelectorAll('.lt-option')].map(b => b.dataset.key));
      await page.locator('.lt-option').nth(0).click();
      check(await page.locator('.lt-verdict').count() === 1 && await page.locator('.lt-option.is-correct').count() === 1, `LAMLA @${width}: answer not marked`);
      await page.locator('.lm-next').click();
      await page.locator('.lt-option').nth(0).click();
      await page.locator('.lm-next').click();
      await page.waitForSelector('.lm-learn');
      check(await page.locator('.lm-learn > .lm-must li').count() > 0 && await page.locator('.lm-learn > .lm-must li:not(.is-star)').count() === 0, `LAMLA @${width}: 30 minutes should show only the ★ points`);
      check(await page.locator('.lm-part h2', { hasText: 'Exam traps' }).count() === 1, `LAMLA @${width}: exam traps missing`);
      // resume after leaving
      await openRoute(page, base, '#/lamla');
      await page.locator('input[name="minutes"][value="30"]').check();
      await page.locator('[data-lecture="circulation-2"]').click();
      await page.waitForSelector('.lm-learn');
      check(true, 'resumed');
      // run to the end
      for (let guard = 0; guard < 40 && !(await page.locator('.lm-finish').count()); guard++) {
        if (await page.locator('.lt-option:not(:disabled)').count()) await page.locator('.lt-option').first().click();
        await page.locator('.lm-next').click();
      }
      check(await page.locator('.lm-finish').count() === 1, `LAMLA @${width}: did not reach the finish`);
      const wrong = await page.locator('.lm-finish .lt-item').count();
      check(/Checks: \d+ of 6 right/.test(await page.locator('.lm-finish .lm-result').innerText()), `LAMLA @${width}: score line wrong`);
      check(wrong === 0 || await page.locator('.lm-night li.is-star').count() > 0, `LAMLA @${width}: night-before list missing`);
      await page.locator('.lm-finish .test-card').click();
      await page.waitForSelector('.lt-running .lt-count');
      check(/1 \/ 20/.test(await page.locator('.lt-running .lt-count').innerText()), `LAMLA @${width}: the test should start straight away with 20 questions`);
      check(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2, `LAMLA @${width}: overflows`);
      check(page.pageErrors.length === 0, `LAMLA @${width}: page errors ${page.pageErrors.join('; ')}`);
      await page.context().close();
    }
    console.log('  LAMLA checked at 390 and 1280 px');
  }

  section('Offline reading: opened chapters, Save all chapters, error with retry');
  {
    const page = await newPage(browser, base, { ...devices['Pixel 7'] });
    const ctx = page.context();
    await page.goto(base + '/#/physiology/cvs', { waitUntil: 'load' });
    const controlled = await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 8000 }).then(() => true, () => false);
    if (check(controlled, 'offline: service worker did not take control')) {
      await openRoute(page, base, chapterUrl('shock'));
      await ctx.setOffline(true);
      await page.reload({ waitUntil: 'load' });
      await page.waitForFunction(() => document.getElementById('main')?.dataset.route, null, { timeout: 5000 }).catch(() => {});
      check(await page.locator('.article-sheet:not(.is-skeleton) > h1').count() === 1, 'offline: an opened chapter did not reopen without a connection');
      await openRoute(page, base, chapterUrl('fetal'));
      check(await page.locator('#retry-load').count() === 1, 'offline: an unsaved chapter did not show the retry message');
      await ctx.setOffline(false);
      await openRoute(page, base, '#/physiology/cvs');
      await page.locator('.offline-save').click();
      const saved = await page.waitForFunction(() => /All chapters saved/.test(document.getElementById('offline-card')?.textContent || ''), null, { timeout: 20000 }).then(() => true, () => false);
      check(saved, 'offline: Save all chapters did not finish');
      await ctx.setOffline(true);
      for (const slug of ['fetal', 'heart-sounds', 'reflexes']) {
        await openRoute(page, base, chapterUrl(slug));
        check(await page.locator('.article-sheet:not(.is-skeleton) > h1').count() === 1, `offline: saved chapter ${slug} did not open`);
      }
      check(await page.locator('[data-widget="reflex-tracer"][data-ready]').count() === 1, 'offline: interactive did not work offline');
      await ctx.setOffline(false);
    }
    check(page.pageErrors.length === 0, `offline: page errors ${page.pageErrors.join('; ')}`);
    await ctx.close();
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
