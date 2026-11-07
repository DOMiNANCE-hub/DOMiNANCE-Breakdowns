/* DOMiNANCE Breakdowns — student feedback and anonymous usage.
 * What students see: "Was this breakdown clear?" at the end of each chapter, and "Report a problem"
 * links on the chapter and on each set of questions. Both open one small form.
 * What is recorded (anonymously, no names or accounts): chapter opens and how far they are read,
 * which option is chosen for each question, which tooltips are opened, searches that found nothing,
 * and which recordings and videos are played. Events are sent in small batches when the page is put
 * away, and kept on the device while offline. Browsers that ask not to be tracked send only the
 * feedback a student chooses to give. */
(() => {
  'use strict';
  const main = document.getElementById('main');
  if (!main) return;
  const ENDPOINT = '/api/collect';
  const QUEUE_KEY = 'dom-events';
  const quiet = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* not saved */ } };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  // ---------- sending ----------
  let queue = (read(QUEUE_KEY) || []).slice(-200);
  let off = false;   // the database is not connected yet: stop trying for this visit
  function record(event, always = false) {
    if (off || (quiet && !always)) return;
    queue.push(event);
    if (queue.length > 200) queue = queue.slice(-200);
    write(QUEUE_KEY, queue);
    if (always) flush();
  }
  function flush(leaving = false) {
    if (off || !queue.length || !navigator.onLine) return;
    const batch = queue.slice(0, 60);
    const body = JSON.stringify({events: batch});
    const done = () => { queue = queue.slice(batch.length); write(QUEUE_KEY, queue); };
    if (leaving && navigator.sendBeacon) {
      if (navigator.sendBeacon(ENDPOINT, new Blob([body], {type: 'application/json'}))) done();
      return;
    }
    fetch(ENDPOINT, {method: 'POST', headers: {'Content-Type': 'application/json'}, body, keepalive: true})
      .then(r => {
        if (r.ok) { done(); if (queue.length) flush(); }
        else if (r.status === 503 || r.status === 404) { off = true; queue = []; write(QUEUE_KEY, queue); }
        else if (r.status === 400) done();
      })
      .catch(() => {});
  }
  // Feedback a student writes is sent straight away, so the form can say whether it arrived.
  function sendNow(event) {
    const keep = () => { queue.push(event); write(QUEUE_KEY, queue); return 'later'; };
    if (!navigator.onLine) return Promise.resolve(keep());
    return fetch(ENDPOINT, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({events: [event]})})
      .then(r => (r.ok ? 'sent' : r.status === 503 || r.status === 404 ? 'off' : keep()))
      .catch(keep);
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { sendDepth(); flush(true); } });
  window.addEventListener('pagehide', () => { sendDepth(); flush(true); });
  window.addEventListener('online', () => flush());
  setInterval(() => { if (queue.length >= 10) flush(); }, 30000);

  // ---------- reading ----------
  const chapterSlug = () => {
    const path = (location.hash || '').replace(/^#\/?/, '').split('?')[0].split('/');
    return path[0] === 'physiology' && path[1] === 'cvs' && path[2] && path[2] !== 'lecture' ? path[2] : '';
  };
  let viewing = '', deepest = 0, sentDepth = 0;
  function sendDepth() {
    const bucket = [100, 75, 50, 25].find(b => deepest >= b) || 0;
    if (viewing && bucket > sentDepth) { record({t: 'depth', c: viewing, d: bucket}); sentDepth = bucket; }
  }
  window.addEventListener('scroll', () => {
    if (!viewing) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max > 0) deepest = Math.max(deepest, Math.round(100 * scrollY / max));
  }, {passive: true});

  // ---------- what students do ----------
  document.addEventListener('click', e => {
    const option = e.target.closest?.('button.mcq-option');
    if (option && !option.disabled) {
      const details = option.closest('p')?.nextElementSibling;
      if (details?.dataset.qid) record({t: 'answer', q: details.dataset.qid, o: option.dataset.option, ok: option.dataset.option === details.dataset.answer ? 1 : 0});
      return;
    }
    const tip = e.target.closest?.('.glossary-trigger');
    if (tip && !tip.dataset.counted) { tip.dataset.counted = '1'; record({t: 'tip', k: tip.dataset.glossary}); return; }
    const play = e.target.closest?.('button[data-media-action^="play"]');
    if (play) {
      const panel = play.closest('.media-resource');
      const id = panel?.dataset.youtubeId || (panel?.dataset.audioSrc || panel?.dataset.animationSrc || '').split('/').pop().replace(/\.[a-z0-9]+$/i, '').slice(0, 40);
      if (id) record({t: 'media', m: id.replace(/[^\w-]/g, '-')});
    }
  }, true);
  window.addEventListener('dom:answer', e => record({t: 'answer', ...e.detail}));   // lecture-test answers
  let missTimer = 0;
  window.addEventListener('dom:search-miss', e => {
    clearTimeout(missTimer);
    missTimer = setTimeout(() => record({t: 'miss', s: e.detail}), 1500);   // only the finished search, not every keystroke
  });

  // ---------- the feedback form ----------
  let dialog = null;
  function form({title, kind, chapter, choices = [], chosen = '', question = false}) {
    dialog?.remove();
    dialog = document.createElement('dialog');
    dialog.className = 'fb-dialog';
    dialog.setAttribute('aria-labelledby', 'fb-title');
    dialog.innerHTML = `<form method="dialog" class="fb-form">
      <h2 id="fb-title">${esc(title)}</h2>
      ${choices.length ? `<label class="fb-label" for="fb-where">${question ? 'Which question?' : 'Which part?'}</label>
      <select id="fb-where">${choices.map(([v, l]) => `<option value="${esc(v)}"${v === chosen ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>` : ''}
      <label class="fb-label" for="fb-text">${kind === 'unclear' ? 'What was confusing? The more specific, the better.' : 'What is wrong or confusing?'}</label>
      <textarea id="fb-text" rows="4" maxlength="1000" required placeholder="${kind === 'unclear' ? 'For example: I didn’t follow why the heart slows in the Cushing reflex.' : 'For example: the answer to question 2 seems to contradict section 3.'}"></textarea>
      <p class="fb-privacy">Anonymous: please don’t include your name or contact details.</p>
      <div class="fb-actions"><button type="button" class="btn fb-cancel">Cancel</button><button type="submit" class="btn btn-primary fb-send">Send</button></div>
    </form>`;
    document.body.append(dialog);
    const close = () => { dialog.close(); dialog.remove(); dialog = null; };
    dialog.querySelector('.fb-cancel').addEventListener('click', close);
    dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
    dialog.addEventListener('click', e => { if (e.target === dialog) close(); });
    dialog.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const text = dialog.querySelector('#fb-text').value.trim();
      if (text.length < 2) { dialog.querySelector('#fb-text').focus(); return; }
      const where = dialog.querySelector('#fb-where')?.value || '';
      const [section, q] = question ? where.split('|') : [where, ''];
      const note = {t: 'note', k: kind, c: chapter, s: section || '', q: q || '', x: text};
      const say = (heading, message) => {
        if (!dialog) return;
        dialog.querySelector('.fb-form').innerHTML = `<h2 id="fb-title">${heading}</h2><p class="fb-thanks">${message}</p><div class="fb-actions"><button type="button" class="btn btn-primary fb-ok">Done</button></div>`;
        dialog.querySelector('.fb-ok').addEventListener('click', close);
        dialog.querySelector('.fb-ok').focus();
      };
      dialog.querySelector('.fb-send').disabled = true;
      sendNow(note).then(state => {
        if (state === 'sent') say('Thank you', 'Your note has been sent. It helps make these breakdowns clearer for everyone.');
        else if (state === 'later') say('Saved', 'You’re offline, so your note is saved on this device and will be sent when you’re back online.');
        else say('Couldn’t send', 'Feedback isn’t switched on yet. Please try again later.');
      });
    });
    dialog.showModal();
    dialog.querySelector('#fb-text').focus();
  }
  const sectionChoices = article => [['', 'The whole chapter'], ...[...article.querySelectorAll('.article-text > h2[id]')].map(h => [h.id, h.textContent.trim()])];

  // ---------- on each chapter ----------
  function mount() {
    sendDepth();
    flush();
    const slug = chapterSlug();
    const article = main.querySelector('.article-sheet:not(.is-skeleton)');
    viewing = slug && article ? slug : '';
    deepest = 0; sentDepth = 0;
    if (!viewing || article.dataset.feedback) return;
    article.dataset.feedback = '1';
    record({t: 'view', c: slug});

    // End of chapter: was it clear?
    const end = article.querySelector('.article-end');
    if (end && !end.querySelector('.chapter-feedback')) {
      const votes = read('dom-votes') || {};
      const box = document.createElement('div');
      box.className = 'chapter-feedback';
      const ask = () => {
        box.innerHTML = `<p class="cf-q" id="cf-q">Was this breakdown clear?</p><div class="cf-buttons" role="group" aria-labelledby="cf-q"><button type="button" class="cf-btn" data-vote="up"><span aria-hidden="true">👍</span> Yes</button><button type="button" class="cf-btn" data-vote="down"><span aria-hidden="true">👎</span> Not really</button></div><button type="button" class="cf-report">Report a problem</button>`;
      };
      const thanked = vote => {
        box.innerHTML = `<p class="cf-q">${vote === 'up' ? 'Thanks: glad it helped.' : 'Thanks for saying so.'} <button type="button" class="cf-link cf-tell">${vote === 'up' ? 'Anything we could still improve?' : 'Tell us what was confusing'}</button></p><button type="button" class="cf-report">Report a problem</button>`;
      };
      votes[slug] ? thanked(votes[slug]) : ask();
      box.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.vote) {
          votes[slug] = b.dataset.vote; write('dom-votes', votes);
          record({t: 'vote', c: slug, v: b.dataset.vote}, true);
          thanked(b.dataset.vote);
          if (b.dataset.vote === 'down') form({title: 'What wasn’t clear?', kind: 'unclear', chapter: slug, choices: sectionChoices(article), chosen: ''});
        } else if (b.classList.contains('cf-tell')) {
          form({title: votes[slug] === 'down' ? 'What wasn’t clear?' : 'What could be better?', kind: 'unclear', chapter: slug, choices: sectionChoices(article), chosen: ''});
        } else if (b.classList.contains('cf-report')) {
          form({title: 'Report a problem', kind: 'problem', chapter: slug, choices: sectionChoices(article), chosen: ''});
        }
      });
      end.append(box);
    }

    // Each set of questions: report a problem with one of them.
    article.querySelectorAll('.check-block').forEach(block => {
      const body = block.querySelector('.check-body');
      if (!body || body.querySelector('.check-report')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'check-report';
      button.textContent = 'Report a problem with these questions';
      button.addEventListener('click', () => {
        let h = block.previousElementSibling;
        while (h && !(h.tagName === 'H2' && h.id)) h = h.previousElementSibling;
        const section = h?.id || '';
        const qs = [...body.querySelectorAll('details.mcq-answer[data-qid]')];
        const choices = qs.length ? [[section + '|', 'The questions in general'], ...qs.map((d, i) => [section + '|' + d.dataset.qid, `Question ${i + 1}: ${(d.previousElementSibling?.childNodes ? [...d.previousElementSibling.childNodes].filter(n => !(n.classList && n.classList.contains('mcq-options')) && !(n.classList && n.classList.contains('mcq-feedback'))).map(n => n.textContent).join('') : '').replace(/^\s*\d+\.\s*/, '').trim().slice(0, 70)}…`])] : [];
        form({title: 'Report a problem with these questions', kind: 'question', chapter: slug, choices, chosen: '', question: true});
      });
      body.append(button);
    });
  }
  window.addEventListener('dom:rendered', mount);
  if (main.dataset.route) mount();
  flush();
})();
