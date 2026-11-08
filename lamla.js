/* DOMiNANCE Breakdowns — LAMLA (last-minute mode).
 * For a student short of time before an exam: for each chapter of a lecture, questions first (the chapter's
 * own Understanding Checks), then the must-know points from the lecture's High-yield sheet, then on to the
 * next chapter. It ends with the student's mistakes, a "night before" list and the lecture test.
 * The time chosen sets the depth: 30 min = 2 questions and the ★ points per chapter; 1 h = 4 questions and all
 * points; 2 h = every question and the whole sheet. Progress is kept on the device. */
(() => {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* not saved */ } };
  const PLANS = {
    30: {label: '30 minutes', checks: 2, must: 'star', parts: ['traps'], test: 'quick'},
    60: {label: '1 hour', checks: 4, must: 'all', parts: ['confuse', 'traps'], test: 'quick'},
    120: {label: '2 hours', checks: 99, must: 'all', parts: ['numbers', 'chains', 'confuse', 'traps'], test: 'all'},
  };
  const PART_TITLES = {numbers: 'Numbers to know', chains: 'Core chains', confuse: 'Don’t confuse', traps: 'Exam traps'};

  // The chapter's Understanding Checks, read from its published page.
  function checksFrom(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let section = '';
    const out = [];
    doc.body.querySelectorAll('h2[id], details.mcq-answer').forEach(el => {
      if (el.tagName === 'H2') { section = el.id; return; }
      const p = el.previousElementSibling;
      if (!p) return;
      const options = [...p.querySelectorAll('.mcq-option')].map(o => ({key: o.dataset.option, text: o.textContent.replace(/^[A-F]\.\s*/, '')}));
      const stem = [...p.childNodes].filter(n => !(n.classList && n.classList.contains('mcq-options'))).map(n => n.textContent).join('').replace(/^\s*\d+\.\s*/, '').trim();
      el.querySelector('summary')?.remove();
      out.push({id: el.dataset.qid || stem.slice(0, 40), section, stem, options, answer: el.dataset.answer, why: el.innerHTML.trim()});
    });
    return out;
  }

  function mount(root, {lecture, sheet, minutes, topics, chapterHtml, chapterUrl, testUrl, testCount, homeUrl}) {
    const plan = PLANS[minutes] || PLANS[60];
    const key = 'dom-lamla-' + lecture.slug;
    const title = slug => topics.find(t => t.slug === slug)?.title || slug;
    const sectionNo = (slug, id) => (topics.find(t => t.slug === slug)?.sections.find(s => s.id === id)?.title || '').split('.')[0];
    const chapters = sheet.chapters.map(c => ({...c, checks: checksFrom(chapterHtml(c.slug) || '').slice(0, plan.checks)}));
    let st = read(key);
    if (!st || st.minutes !== minutes || st.done) st = {minutes, ci: 0, step: 'check', qi: 0, answers: {}, wrong: []};
    const save = () => write(key, st);
    const totalChecks = chapters.reduce((a, c) => a + c.checks.length, 0);

    function frame(inner, label) {
      const pos = st.step === 'finish' ? chapters.length : st.ci + (st.step === 'learn' ? 0.5 : 0);
      root.innerHTML = `<div class="lm-wrap">
        <div class="lm-top">
          <a class="lt-exit lm-exit" href="${homeUrl}" aria-label="Leave LAMLA (your place is saved)">✕</a>
          <div class="lt-progress" role="progressbar" aria-label="Progress through the lecture" aria-valuemin="0" aria-valuemax="${chapters.length}" aria-valuenow="${Math.floor(pos)}"><span style="transform:scaleX(${pos / chapters.length})"></span></div>
          <span class="lt-count">${Math.min(st.ci + 1, chapters.length)} / ${chapters.length}</span>
        </div>
        <p class="lm-where"><span class="lm-badge">LAMLA</span> ${esc(lecture.name)} · ${plan.label}${label ? ' · ' + label : ''}</p>
        ${inner}</div>`;
      root.querySelector('.lm-exit').addEventListener('click', save);
    }

    // ---------- 1. questions first ----------
    function check() {
      const c = chapters[st.ci];
      if (!c.checks.length) { st.step = 'learn'; save(); return learn(); }
      const q = c.checks[st.qi];
      const chosen = st.answers[q.id];
      frame(`<section class="lt-question" aria-labelledby="lm-stem">
          <p class="lt-qmeta">${esc(title(c.slug))} · Check yourself ${st.qi + 1} of ${c.checks.length}</p>
          <h1 id="lm-stem" class="lt-stem" tabindex="-1">${esc(q.stem)}</h1>
          <div class="lt-feedback" aria-live="polite">${chosen ? `<div class="lt-verdict ${chosen === q.answer ? 'is-right' : 'is-wrong'}"><strong>${chosen === q.answer ? 'Correct.' : 'Not quite.'}</strong> <div class="lm-why">${q.why}</div></div>` : ''}</div>
          <div class="lt-options" role="group" aria-labelledby="lm-stem">${q.options.map((o, k) => `<button type="button" class="lt-option${chosen ? (o.key === q.answer ? ' is-correct' : o.key === chosen ? ' is-wrong' : ' is-other') : ''}" data-key="${o.key}"${chosen ? ' disabled' : ''}><span class="lt-letter">${'ABCD'[k]}</span><span class="lt-text">${esc(o.text)}</span></button>`).join('')}</div>
        </section>
        <div class="lt-nav"><span></span><button type="button" class="btn btn-primary lm-next"${chosen ? '' : ' disabled'}>${st.qi < c.checks.length - 1 ? 'Next question' : 'See the must-know points'}</button></div>`, 'Check yourself');
      root.querySelectorAll('.lt-option').forEach(b => b.addEventListener('click', () => {
        if (st.answers[q.id]) return;
        st.answers[q.id] = b.dataset.key;
        if (b.dataset.key !== q.answer) st.wrong.push({chapter: c.slug, section: q.section, stem: q.stem, answer: q.options.find(o => o.key === q.answer)?.text || '', why: q.why});
        window.dispatchEvent(new CustomEvent('dom:answer', {detail: {q: q.id, o: b.dataset.key, ok: b.dataset.key === q.answer ? 1 : 0}}));
        save(); check();
      }));
      root.querySelector('.lm-next').addEventListener('click', () => {
        if (st.qi < c.checks.length - 1) st.qi += 1; else { st.step = 'learn'; st.qi = 0; }
        save(); (st.step === 'learn' ? learn : check)(); window.scrollTo({top: 0, behavior: 'instant'});
      });
      root.querySelector(chosen ? '.lm-next' : '#lm-stem')?.focus({preventScroll: true});
    }

    // ---------- 2. the must-know points ----------
    function learn() {
      const c = chapters[st.ci];
      const right = c.checks.filter(q => st.answers[q.id] === q.answer).length;
      const allRight = c.checks.length > 0 && right === c.checks.length;
      const shown = plan.must === 'star' || allRight ? c.must.filter(m => m.star) : c.must;
      const rest = c.must.filter(m => !shown.includes(m));
      const parts = plan.parts.filter(p => c[p]).map(p => `<section class="lm-part"><h2>${PART_TITLES[p]}</h2>${c[p]}</section>`).join('');
      const last = st.ci === chapters.length - 1;
      frame(`<section class="lm-learn" aria-labelledby="lm-title">
          <h1 id="lm-title" tabindex="-1">${esc(title(c.slug))}</h1>
          ${c.checks.length ? `<p class="lm-result ${allRight ? 'is-good' : ''}">${allRight ? `You got all ${right} right. Here are the key points to lock it in.` : `You got ${right} of ${c.checks.length}. Read these carefully: they cover what you missed.`}</p>` : ''}
          <h2 class="lm-must-title">Must-know</h2>
          <ul class="lm-must">${shown.map(m => `<li class="${m.star ? 'is-star' : ''}">${m.star ? '<span class="lm-star" aria-label="Highest yield">★</span>' : ''}<span>${m.html}</span></li>`).join('')}</ul>
          ${rest.length ? `<details class="lm-more"><summary>Show ${rest.length} more point${rest.length === 1 ? '' : 's'}</summary><ul class="lm-must">${rest.map(m => `<li><span>${m.html}</span></li>`).join('')}</ul></details>` : ''}
          ${parts}
          <p class="lm-full"><a href="${chapterUrl(c.slug)}" target="_blank" rel="noopener">Open the full breakdown of ${esc(title(c.slug))}</a></p>
        </section>
        <div class="lt-nav"><span></span><button type="button" class="btn btn-primary lm-next">${last ? (testUrl ? 'Finish: my mistakes and the test' : 'Finish: my mistakes') : 'Next chapter: ' + esc(title(chapters[st.ci + 1].slug))}</button></div>`, 'Must-know');
      root.querySelector('.lm-next').addEventListener('click', () => {
        if (last) st.step = 'finish'; else { st.ci += 1; st.step = 'check'; st.qi = 0; }
        save(); (last ? finish : check)(); window.scrollTo({top: 0, behavior: 'instant'});
      });
      root.querySelector('#lm-title').focus({preventScroll: true});
    }

    // ---------- 3. mistakes, the night-before list, the test ----------
    function finish() {
      const right = totalChecks - st.wrong.length;
      const weakChapters = [...new Set(st.wrong.map(w => w.chapter))];
      const night = chapters.filter(c => weakChapters.includes(c.slug)).map(c => `<h3>${esc(title(c.slug))}</h3><ul class="lm-must">${c.must.filter(m => m.star).map(m => `<li class="is-star"><span class="lm-star" aria-hidden="true">★</span><span>${m.html}</span></li>`).join('')}</ul>`).join('');
      const size = plan.test === 'quick' && testCount > 25 ? 'quick' : 'all';
      frame(`<section class="lm-finish" aria-labelledby="lm-done">
          <h1 id="lm-done" tabindex="-1">You’ve been through ${esc(lecture.name)}</h1>
          <p class="lm-result ${st.wrong.length ? '' : 'is-good'}">Checks: ${right} of ${totalChecks} right.${st.wrong.length ? ' Your mistakes are below.' + (testUrl ? ' Fix them, then take the test.' : '') : (testUrl ? ' No mistakes. Now prove it on the lecture test.' : ' No mistakes.')}</p>
          ${testUrl ? `<a class="test-card" href="${testUrl}?mode=instant&size=${size}&start=1"><span class="test-card-text"><span class="test-card-kicker">Last step</span><strong>Take the lecture test</strong><span>${size === 'quick' ? '20 random questions' : testCount + ' questions'} from the whole lecture, marked as you go</span></span><span class="test-card-go" aria-hidden="true">→</span></a>` : ''}
          ${st.wrong.length ? `<h2>Your mistakes</h2>${st.wrong.map(w => `<article class="lt-item is-wrong"><p class="lt-item-head">${esc(title(w.chapter))}</p><p class="lt-item-stem">${esc(w.stem)}</p><div class="lm-why">${w.why}</div><a class="lt-revise" href="${chapterUrl(w.chapter, w.section)}" target="_blank" rel="noopener">Revise §${esc(sectionNo(w.chapter, w.section))}</a></article>`).join('')}` : ''}
          ${night ? `<section class="lm-night"><h2>Your night-before list</h2><p>The highest-yield points from the chapters you slipped on. Read them again just before the exam.</p>${night}</section>` : ''}
          <div class="lt-actions"><button type="button" class="btn lm-again">Start LAMLA again</button><a class="btn" href="${homeUrl}">Choose another lecture</a></div>
        </section>`, 'Finish');
      root.querySelector('.lm-again').addEventListener('click', () => { st = {minutes, ci: 0, step: 'check', qi: 0, answers: {}, wrong: []}; save(); check(); window.scrollTo({top: 0, behavior: 'instant'}); });
      st.done = true; save();
      root.querySelector('#lm-done').focus({preventScroll: true});
    }

    ({check, learn, finish})[st.step]();
  }

  window.DOMLamla = {mount, plans: PLANS};
})();
