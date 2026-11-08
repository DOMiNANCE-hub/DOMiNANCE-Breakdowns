/* DOMiNANCE Breakdowns — lecture tests.
 * One comprehensive test per lecture document, opened at #/physiology/cvs/lecture/<lecture>/test.
 * Two modes: "Mark as you go" (answer and explanation after every question) and "Submit at the end"
 * (exam style: answer everything, then see the score and review). Question order and option order are
 * shuffled on every attempt; explanations follow the options wherever they move.
 * Progress is kept on the device, so a test can be resumed; the best score shows on the lecture page. */
(() => {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* not saved */ } };
  const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const LETTERS = ['A', 'B', 'C', 'D'];
  const QUICK = 20;

  function mount(root, {test, lecture, topics, chapterUrl, lectureUrl}) {
    const key = 'dom-test-' + lecture.slug;
    const store = () => read(key) || {};
    const save = patch => write(key, {...store(), ...patch});
    const byId = Object.fromEntries(test.questions.map(q => [q.id, q]));
    const title = slug => topics.find(t => t.slug === slug)?.title || slug;
    const section = (slug, id) => topics.find(t => t.slug === slug)?.sections.find(s => s.id === id)?.title || '';
    let run = null;   // the attempt in progress

    // ---------- start ----------
    function intro() {
      const s = store();
      const chapters = test.chapters.map(c => `<li>${esc(title(c))}</li>`).join('');
      const resume = s.run && s.run.ids.length && !s.run.done ? `<button type="button" class="btn btn-primary lt-resume">Resume: question ${s.run.index + 1} of ${s.run.ids.length}</button>` : '';
      root.innerHTML = `<div class="lt-wrap">
        <nav class="breadcrumb"><a href="#/">Home</a> / <a href="#/physiology/cvs">Cardiovascular System</a> / <a href="${lectureUrl}">${esc(lecture.name)}</a></nav>
        <section class="lt-intro">
          <p class="lt-kicker">Lecture test</p>
          <h1>${esc(lecture.name)}</h1>
          <p class="lt-lede">${test.questions.length} questions available. Choose how to practise and start.</p>
          <details class="lt-topics"><summary>See topics covered</summary><ul class="lt-chapters" aria-label="Chapters covered">${chapters}</ul></details>
          ${s.best != null ? `<p class="lt-best">Your best score: <strong>${s.best}%</strong>${s.last != null ? ` · last attempt ${s.last}%` : ''}</p>` : ''}
          ${resume}${!resume && s.run && s.run.done ? '<button type="button" class="btn lt-last">Review your last attempt</button>' : ''}
          <form class="lt-setup">
            <fieldset><legend>How should questions be marked?</legend>
              <label class="lt-choice"><input type="radio" name="mode" value="instant" checked><span><strong>Mark as you go</strong><small>Get explanations after each answer.</small></span></label>
              <label class="lt-choice"><input type="radio" name="mode" value="exam"><span><strong>Submit at the end</strong><small>See your results after submitting.</small></span></label>
            </fieldset>
            ${test.questions.length > QUICK + 5 ? `<fieldset><legend>Length</legend>
              <label class="lt-choice"><input type="radio" name="size" value="all" checked><span><strong>All ${test.questions.length}</strong><small>Complete lecture test.</small></span></label>
              <label class="lt-choice"><input type="radio" name="size" value="quick"><span><strong>Quick ${QUICK}</strong><small>Random lecture questions.</small></span></label>
            </fieldset>` : ''}
            <button type="submit" class="btn btn-primary lt-start">${resume ? 'Start a new attempt' : 'Start questions'}</button>
          </form>
        </section></div>`;
      root.querySelector('.lt-resume')?.addEventListener('click', () => { run = store().run; question(); window.scrollTo({top: 0, behavior: 'instant'}); });
      root.querySelector('.lt-last')?.addEventListener('click', () => { run = store().run; results(); });
      root.querySelector('.lt-setup').addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        let ids = shuffle(test.questions.map(q => q.id));
        if (form.get('size') === 'quick') ids = ids.slice(0, QUICK);
        begin(ids, form.get('mode') || 'instant');
      });
      root.querySelector('h1').focus?.();
    }
    function begin(ids, mode) {
      run = {ids, mode, index: 0, answers: {}, orders: Object.fromEntries(ids.map(id => [id, shuffle(LETTERS)])), done: false};
      save({run});
      question();
      window.scrollTo({top: 0, behavior: 'instant'});
    }

    // ---------- one question ----------
    function question() {
      const q = byId[run.ids[run.index]];
      const order = run.orders[q.id];
      const chosen = run.answers[q.id];
      const marked = run.mode === 'instant' && chosen;
      const n = run.ids.length, i = run.index;
      const answered = Object.keys(run.answers).length;
      root.innerHTML = `<div class="lt-wrap lt-running">
        <div class="lt-top">
          <button type="button" class="lt-exit" aria-label="Leave the test (your progress is saved)">✕</button>
          <div class="lt-progress" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${run.mode === 'exam' ? answered : i + (marked ? 1 : 0)}"><span style="transform:scaleX(${(run.mode === 'exam' ? answered : i + (marked ? 1 : 0)) / n})"></span></div>
          <span class="lt-count">${i + 1} / ${n}</span>
        </div>
        <section class="lt-question" aria-labelledby="lt-stem">
          <p class="lt-qmeta">${esc(title(q.chapter))}</p>
          <h1 id="lt-stem" class="lt-stem" tabindex="-1">${esc(q.stem)}</h1>
          <div class="lt-feedback" aria-live="polite">${marked ? feedback(q, chosen) : ''}</div>
          <div class="lt-options" role="group" aria-labelledby="lt-stem">
            ${order.map((orig, k) => {
              const state = marked ? (orig === q.answer ? ' is-correct' : orig === chosen ? ' is-wrong' : ' is-other') : (chosen === orig ? ' is-chosen' : '');
              const note = marked && orig !== q.answer ? `<span class="lt-why-not">${esc(q.not[orig] || '')}</span>` : '';
              return `<button type="button" class="lt-option${state}" data-orig="${orig}" aria-pressed="${chosen === orig}"${marked ? ' disabled' : ''}><span class="lt-letter">${LETTERS[k]}</span><span class="lt-text">${esc(q.options[orig])}${note}</span></button>`;
            }).join('')}
          </div>
        </section>
        <div class="lt-nav">
          ${run.mode === 'exam' ? `<button type="button" class="btn lt-prev"${i === 0 ? ' disabled' : ''}>Previous</button><button type="button" class="btn lt-grid-btn" aria-expanded="false">${answered} of ${n} answered</button>` : '<span></span>'}
          ${i < n - 1 ? `<button type="button" class="btn btn-primary lt-next"${run.mode === 'instant' && !marked ? ' disabled' : ''}>Next question</button>`
            : `<button type="button" class="btn btn-primary lt-finish"${run.mode === 'instant' && !marked ? ' disabled' : ''}>${run.mode === 'exam' ? 'Submit test' : 'See my score'}</button>`}
        </div>
        ${run.mode === 'exam' ? `<div class="lt-grid" hidden>${run.ids.map((id, k) => `<button type="button" class="lt-jump${run.answers[id] ? ' is-done' : ''}${k === i ? ' is-here' : ''}" data-to="${k}" aria-label="Question ${k + 1}${run.answers[id] ? ', answered' : ''}">${k + 1}</button>`).join('')}</div>` : ''}
      </div>`;
      root.querySelectorAll('.lt-option').forEach(b => b.addEventListener('click', () => choose(q, b.dataset.orig)));
      root.querySelector('.lt-next')?.addEventListener('click', () => go(i + 1));
      root.querySelector('.lt-prev')?.addEventListener('click', () => go(i - 1));
      root.querySelector('.lt-finish')?.addEventListener('click', finish);
      root.querySelector('.lt-exit').addEventListener('click', () => { save({run}); location.hash = lectureUrl; });
      const grid = root.querySelector('.lt-grid');
      root.querySelector('.lt-grid-btn')?.addEventListener('click', e => { grid.hidden = !grid.hidden; e.currentTarget.setAttribute('aria-expanded', String(!grid.hidden)); });
      grid?.addEventListener('click', e => { const b = e.target.closest('[data-to]'); if (b) go(Number(b.dataset.to)); });
      root.querySelector(marked ? '.lt-next, .lt-finish' : '#lt-stem')?.focus({preventScroll: true});
    }
    function feedback(q, chosen) {
      const right = chosen === q.answer;
      return `<div class="lt-verdict ${right ? 'is-right' : 'is-wrong'}"><strong>${right ? 'Correct.' : 'Not quite.'}</strong> <span>${esc(q.why)}</span>
        <a class="lt-revise" href="${chapterUrl(q.chapter, q.section)}" target="_blank" rel="noopener">Revise: ${esc(title(q.chapter))}, §${esc(section(q.chapter, q.section).split('.')[0])}</a></div>`;
    }
    function choose(q, orig) {
      if (run.mode === 'instant' && run.answers[q.id]) return;
      const first = !run.answers[q.id];
      run.answers[q.id] = orig;
      save({run});
      if (first) window.dispatchEvent(new CustomEvent('dom:answer', {detail: {q: q.id, o: orig, ok: orig === q.answer ? 1 : 0}}));
      if (run.mode === 'instant') { question(); const top = root.querySelector('.lt-question').getBoundingClientRect().top + scrollY - 70; if (scrollY > top) window.scrollTo({top, behavior: 'smooth'}); }
      else {
        root.querySelectorAll('.lt-option').forEach(b => { const on = b.dataset.orig === orig; b.classList.toggle('is-chosen', on); b.setAttribute('aria-pressed', String(on)); });
        const answered = Object.keys(run.answers).length;
        const counter = root.querySelector('.lt-grid-btn'); if (counter) counter.textContent = `${answered} of ${run.ids.length} answered`;
        root.querySelector(`.lt-jump[data-to="${run.index}"]`)?.classList.add('is-done');
        const bar = root.querySelector('.lt-progress span'); if (bar) bar.style.transform = `scaleX(${answered / run.ids.length})`;
      }
    }
    function go(k) { run.index = Math.max(0, Math.min(run.ids.length - 1, k)); save({run}); question(); window.scrollTo({top: 0, behavior: 'instant'}); }
    function finish() {
      const missing = run.ids.filter(id => !run.answers[id]).length;
      if (run.mode === 'exam' && missing && !finish.confirmed) {
        const box = root.querySelector('.lt-feedback');
        box.innerHTML = `<div class="lt-confirm" role="alert"><p>You haven’t answered ${missing} question${missing === 1 ? '' : 's'}. Unanswered questions count as wrong.</p><div class="lt-actions"><button type="button" class="btn lt-first-missing">Go to the first one</button><button type="button" class="btn btn-primary lt-submit-anyway">Submit anyway</button></div></div>`;
        box.querySelector('.lt-first-missing').addEventListener('click', () => go(run.ids.findIndex(id => !run.answers[id])));
        box.querySelector('.lt-submit-anyway').addEventListener('click', () => { finish.confirmed = true; finish(); });
        box.querySelector('.lt-first-missing').focus();
        return;
      }
      finish.confirmed = false;
      run.done = true;
      const right = run.ids.filter(id => run.answers[id] === byId[id].answer).length;
      const pct = Math.round(100 * right / run.ids.length);
      const s = store();
      save({run, last: pct, best: Math.max(pct, s.best ?? 0)});
      results();
    }

    // ---------- results and review ----------
    function results(onlyMissed = false) {
      const ids = run.ids;
      const right = ids.filter(id => run.answers[id] === byId[id].answer);
      const missed = ids.filter(id => run.answers[id] !== byId[id].answer);
      const pct = Math.round(100 * right.length / ids.length);
      const perChapter = test.chapters.map(c => {
        const all = ids.filter(id => byId[id].chapter === c);
        return {c, all: all.length, right: all.filter(id => run.answers[id] === byId[id].answer).length};
      }).filter(x => x.all);
      const weak = {};
      missed.forEach(id => { const q = byId[id]; const k = q.chapter + '|' + q.section; weak[k] = (weak[k] || 0) + 1; });
      const revise = Object.entries(weak).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, n]) => {
        const [c, sid] = k.split('|');
        return `<li><a href="${chapterUrl(c, sid)}">${esc(title(c))}: ${esc(section(c, sid))}</a> <span>${n} missed</span></li>`;
      }).join('');
      const message = pct >= 85 ? 'Excellent: you know this lecture well.' : pct >= 70 ? 'Good. Revise the sections below to close the gaps.' : pct >= 50 ? 'Getting there. Work through the sections below, then try again.' : 'Start with the sections below, then retry the questions you missed.';
      const list = (onlyMissed ? missed : ids).map((id, k) => review(byId[id], run.answers[id], onlyMissed ? missed.indexOf(id) + 1 : k + 1)).join('');
      root.innerHTML = `<div class="lt-wrap">
        <section class="lt-result" aria-labelledby="lt-score">
          <p class="lt-kicker">${esc(lecture.name)} · ${run.mode === 'exam' ? 'Submitted' : 'Marked as you went'}</p>
          <h1 id="lt-score" tabindex="-1"><span class="lt-pct">${pct}%</span> <span class="lt-of">${right.length} of ${ids.length} correct</span></h1>
          <p class="lt-message">${message}</p>
          <div class="lt-chapter-scores">${perChapter.map(x => `<div class="lt-cs"><span>${esc(title(x.c))}</span><span class="lt-cs-bar"><i style="transform:scaleX(${x.right / x.all})"></i></span><b>${x.right}/${x.all}</b></div>`).join('')}</div>
          ${revise ? `<h2>Revise these first</h2><ul class="lt-revise-list">${revise}</ul>` : ''}
          <div class="lt-actions">
            ${missed.length ? `<button type="button" class="btn btn-primary lt-retry">Retry the ${missed.length} I missed</button>` : ''}
            <button type="button" class="btn lt-again">Take the test again</button>
            <a class="btn" href="${lectureUrl}">Back to the lecture</a>
          </div>
        </section>
        <section class="lt-review" aria-labelledby="lt-review-title">
          <div class="lt-review-head"><h2 id="lt-review-title">Review</h2>
            ${missed.length && missed.length < ids.length ? `<div class="lt-filter" role="group" aria-label="Which questions to show"><button type="button" data-only="0" aria-pressed="${!onlyMissed}">All ${ids.length}</button><button type="button" data-only="1" aria-pressed="${onlyMissed}">Missed ${missed.length}</button></div>` : ''}</div>
          ${list}
        </section></div>`;
      root.querySelector('.lt-retry')?.addEventListener('click', () => begin(shuffle(missed), 'instant'));
      root.querySelector('.lt-again').addEventListener('click', () => { save({run: null}); intro(); });
      root.querySelectorAll('[data-only]').forEach(b => b.addEventListener('click', () => { results(b.dataset.only === '1'); root.querySelector('.lt-review').scrollIntoView({block: 'start'}); }));
      if (!onlyMissed) { window.scrollTo({top: 0, behavior: 'instant'}); root.querySelector('#lt-score').focus({preventScroll: true}); }
    }
    function review(q, chosen, n) {
      const right = chosen === q.answer;
      return `<article class="lt-item ${right ? 'is-right' : 'is-wrong'}">
        <p class="lt-item-head"><span class="lt-mark" aria-hidden="true">${right ? '✓' : '✕'}</span> <span class="tw-visually-hidden">${right ? 'Correct' : chosen ? 'Wrong' : 'Not answered'}.</span> Question ${n} · ${esc(title(q.chapter))}</p>
        <p class="lt-item-stem">${esc(q.stem)}</p>
        <ul class="lt-item-options">${run.orders[q.id].map((orig, k) => `<li class="${orig === q.answer ? 'is-correct' : orig === chosen ? 'is-wrong' : ''}"><span class="lt-letter">${LETTERS[k]}</span><span>${esc(q.options[orig])}${orig === chosen ? ' <em>(your answer)</em>' : ''}${orig !== q.answer && q.not[orig] ? `<span class="lt-why-not">${esc(q.not[orig])}</span>` : ''}</span></li>`).join('')}</ul>
        ${!chosen ? '<p class="lt-unanswered">Not answered.</p>' : ''}
        <p class="lt-item-why"><strong>Why:</strong> ${esc(q.why)} <a href="${chapterUrl(q.chapter, q.section)}">Revise §${esc(section(q.chapter, q.section).split('.')[0])}</a></p>
      </article>`;
    }

    // Keyboard: 1–4 or A–D choose, Enter or → goes on, ← goes back.
    const keys = e => {
      if (!root.isConnected) { document.removeEventListener('keydown', keys); return; }
      if (!run || run.done || !root.querySelector('.lt-running') || e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      const k = e.key.toUpperCase();
      const idx = ['1', '2', '3', '4'].indexOf(k) >= 0 ? Number(k) - 1 : LETTERS.indexOf(k);
      if (idx >= 0) { root.querySelectorAll('.lt-option')[idx]?.click(); e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === 'ArrowRight') { const b = root.querySelector('.lt-next:not(:disabled), .lt-finish:not(:disabled)'); if (b && (e.key === 'ArrowRight' || document.activeElement === document.body || !document.activeElement?.matches('button,a'))) { b.click(); e.preventDefault(); } }
      else if (e.key === 'ArrowLeft') root.querySelector('.lt-prev:not(:disabled)')?.click();
    };
    document.addEventListener('keydown', keys);

    // A link can choose the setup and start straight away (LAMLA ends with ?mode=instant&size=quick&start=1).
    const ask = new URLSearchParams((location.hash || '').split('?')[1] || '');
    if (ask.get('start') === '1') {
      let ids = shuffle(test.questions.map(q => q.id));
      if (ask.get('size') === 'quick' && ids.length > QUICK + 5) ids = ids.slice(0, QUICK);
      try { history.replaceState(null, '', location.pathname + location.hash.split('?')[0]); } catch { /* keep */ }
      begin(ids, ask.get('mode') === 'exam' ? 'exam' : 'instant');
    } else intro();
  }

  window.DOMLectureTest = {mount, best: slug => read('dom-test-' + slug)?.best ?? null};
})();
