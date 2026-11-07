/* DOMiNANCE Breakdowns — chapter navigation chrome.
 * Phones: a header that slides away while reading down and returns on scrolling up, and a bottom
 * chapter bar (Sections sheet, progress, back to top). All screens: the table of contents and the
 * Sections sheet highlight the section being read. Runs after each render (the 'dom:rendered' event). */
(() => {
  'use strict';
  const main = document.getElementById('main');
  const topbar = document.querySelector('.topbar');
  if (!main || !topbar) return;
  const phone = matchMedia('(max-width: 760px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let bar = null, sheet = null, backdrop = null, headings = [], activeId = '', lastFocus = null;

  // ---------- header that gets out of the way ----------
  let lastY = window.scrollY, headerHidden = false, ticking = false;
  const setHeader = hide => {
    if (hide === headerHidden) return;
    headerHidden = hide;
    topbar.classList.toggle('is-hidden', hide);
    document.documentElement.classList.toggle('header-hidden', hide);
  };
  function frame() {
    ticking = false;
    const y = window.scrollY, dy = y - lastY;
    if (!phone.matches || y < 140 || sheetOpen()) setHeader(false);
    else if (dy > 8) setHeader(true);
    else if (dy < -8) setHeader(false);
    if (Math.abs(dy) > 8) lastY = y;
    progress();
    spyNow();
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, {passive: true});
  topbar.addEventListener('focusin', () => setHeader(false));

  // ---------- bottom chapter bar ----------
  function progress() {
    if (!bar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const f = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.querySelector('.cb-fill').style.transform = `scaleX(${f})`;
    bar.querySelector('.cb-pct').textContent = Math.round(f * 100) + '%';
  }
  const sheetOpen = () => !!sheet && !sheet.hidden;
  function openSheet() {
    lastFocus = document.activeElement;
    sheet.hidden = false; backdrop.hidden = false;
    requestAnimationFrame(() => { sheet.classList.add('is-open'); backdrop.classList.add('is-open'); });
    bar.querySelector('.cb-sections').setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('sheet-open');
    (sheet.querySelector('a.is-active') || sheet.querySelector('a'))?.focus({preventScroll: true});
    sheet.querySelector('a.is-active')?.scrollIntoView({block: 'center'});
  }
  function closeSheet(restore = true) {
    if (!sheetOpen()) return;
    sheet.classList.remove('is-open'); backdrop.classList.remove('is-open');
    bar.querySelector('.cb-sections').setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('sheet-open');
    const done = () => { sheet.hidden = true; backdrop.hidden = true; };
    if (reduce.matches) done(); else setTimeout(done, 220);
    if (restore) lastFocus?.focus?.({preventScroll: true});
  }
  function goTo(id) {
    const target = document.getElementById(id);
    if (!target) return;
    window.dispatchEvent(new CustomEvent('dom:section', {detail: id}));   // the reader shows it in Sections/Cards mode
    target.scrollIntoView({behavior: reduce.matches ? 'instant' : 'smooth', block: 'start'});
  }
  function teardown() {
    headings = []; activeId = '';
    [bar, sheet, backdrop].forEach(el => el?.remove());
    bar = sheet = backdrop = null;
    document.documentElement.classList.remove('sheet-open', 'has-chapter-bar');
  }
  function mount() {
    teardown();
    setHeader(false);
    const article = main.querySelector('.article-sheet:not(.is-skeleton)');
    if (!article) return;
    headings = [...article.querySelectorAll('.article-text > h2[id]')];
    const esc = s => s.replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
    bar = document.createElement('nav');
    bar.className = 'chapter-bar';
    bar.setAttribute('aria-label', 'Chapter navigation');
    bar.innerHTML = `<button type="button" class="cb-sections" aria-haspopup="dialog" aria-expanded="false" aria-controls="section-sheet"><span class="cb-icon" aria-hidden="true">☰</span><span class="cb-label">Sections</span></button>` +
      `<div class="cb-track" aria-hidden="true"><span class="cb-fill"></span></div><span class="cb-pct" aria-hidden="true">0%</span>` +
      `<button type="button" class="cb-top" aria-label="Back to the top of the breakdown"><span aria-hidden="true">↑</span></button>`;
    backdrop = document.createElement('div');
    backdrop.className = 'sheet-backdrop'; backdrop.hidden = true;
    sheet = document.createElement('div');
    sheet.className = 'section-sheet'; sheet.id = 'section-sheet'; sheet.hidden = true;
    sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-labelledby', 'section-sheet-title');
    sheet.innerHTML = `<div class="sheet-grip" aria-hidden="true"></div><div class="sheet-head"><h2 id="section-sheet-title">In this breakdown</h2><button type="button" class="sheet-close" aria-label="Close sections">✕</button></div>` +
      `<ol>${headings.map(h => `<li><a href="#${h.id}" data-sheet="${h.id}">${esc(h.textContent.trim())}</a></li>`).join('')}</ol>`;
    document.body.append(backdrop, sheet, bar);
    document.documentElement.classList.add('has-chapter-bar');
    bar.querySelector('.cb-sections').addEventListener('click', () => sheetOpen() ? closeSheet() : openSheet());
    bar.querySelector('.cb-top').addEventListener('click', () => {
      window.scrollTo({top: 0, behavior: reduce.matches ? 'instant' : 'smooth'});
      main.querySelector('h1')?.focus?.({preventScroll: true});
    });
    backdrop.addEventListener('click', () => closeSheet());
    sheet.querySelector('.sheet-close').addEventListener('click', () => closeSheet());
    sheet.addEventListener('click', e => {
      const a = e.target.closest('a[data-sheet]');
      if (!a) return;
      e.preventDefault();
      closeSheet(false);
      goTo(a.dataset.sheet);
    });
    sheet.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); closeSheet(); }
      if (e.key === 'Tab') {   // keep focus inside the sheet while it is open
        const f = [...sheet.querySelectorAll('a,button')];
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    spyNow();
    const toc = main.querySelector('.toc');
    if (toc && !toc.querySelector('.toc-keys')) toc.querySelector('.toc-info')?.insertAdjacentHTML('afterend', '<p class="toc-keys"><kbd>[</kbd> <kbd>]</kbd> previous / next section</p>');
    progress();
  }
  // Scrollspy: the last section heading above the upper third of the screen is the one being read.
  function spyNow() {
    if (!headings.length) return;
    let current = '';
    const line = window.innerHeight * 0.35;
    for (const h of headings) { if (!h.hidden && h.getBoundingClientRect().top < line) current = h.id; }
    if (current !== activeId) setActive(current);
  }
  function setActive(id) {
    activeId = id;
    main.querySelectorAll('.toc a[data-scroll]').forEach(a => a.classList.toggle('is-active', a.dataset.scroll === id));
    sheet?.querySelectorAll('a[data-sheet]').forEach(a => {
      const on = a.dataset.sheet === id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
    const label = bar?.querySelector('.cb-label');
    if (label) {
      const i = headings.findIndex(h => h.id === id);
      label.textContent = i >= 0 ? `Section ${i + 1} of ${headings.length}` : 'Sections';
    }
  }
  // ---------- keyboard shortcuts (desktop) ----------
  // [ and ] move between sections, / jumps to search on the library pages.
  document.addEventListener('keydown', e => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
    if (e.key === '/') {
      const search = document.getElementById('search');
      if (search) { e.preventDefault(); search.focus(); }
      return;
    }
    if ((e.key === '[' || e.key === ']') && headings.length) {
      e.preventDefault();
      const navButton = document.getElementById(e.key === ']' ? 'reader-next' : 'reader-prev');
      if (navButton && navButton.offsetParent) { if (!navButton.disabled) navButton.click(); return; }   // Sections / Cards mode
      const i = headings.findIndex(h => h.id === activeId);
      const next = headings[Math.max(0, Math.min(headings.length - 1, (i < 0 ? -1 : i) + (e.key === ']' ? 1 : -1)))];
      if (next) goTo(next.id);
    }
  });
  window.addEventListener('dom:rendered', mount);
  window.addEventListener('hashchange', () => closeSheet(false));
  phone.addEventListener?.('change', () => { if (!phone.matches) { setHeader(false); closeSheet(false); } });
  mount();
})();
