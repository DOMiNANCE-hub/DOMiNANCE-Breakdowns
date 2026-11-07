/* DOMiNANCE Breakdowns — offline reading.
 * Registers the service worker, offers "Save all chapters for offline", tells students when they are
 * offline, and offers a one-tap refresh when new content has been published. */
(() => {
  'use strict';
  const supported = 'serviceWorker' in navigator && 'caches' in window && window.isSecureContext;
  const bundle = () => window.DOM_BUNDLE || {chapters: {}, core: [], widgets: {}, assets: []};
  const read = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* not saved */ } };

  // ---------- small notices ----------
  let toast = null, toastTimer = 0;
  function notify(html, {action, onAction, persist} = {}) {
    toast?.remove(); clearTimeout(toastTimer);
    toast = document.createElement('div');
    toast.className = 'dom-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML = `<span>${html}</span>` + (action ? `<button type="button">${action}</button>` : '') + '<button type="button" class="dom-toast-close" aria-label="Dismiss">✕</button>';
    if (action) toast.querySelector('button').addEventListener('click', onAction);
    toast.querySelector('.dom-toast-close').addEventListener('click', () => toast.remove());
    document.body.append(toast);
    if (!persist) toastTimer = setTimeout(() => toast?.remove(), 5000);
  }
  window.addEventListener('offline', () => notify('You’re offline. Chapters you’ve opened or saved still work.'));
  window.addEventListener('online', () => notify('Back online.'));

  // ---------- service worker and updates ----------
  let updateRequested = false;
  if (supported) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then(reg => {
        const offerUpdate = worker => notify('New content is available.', {
          action: 'Refresh', persist: true,
          onAction: () => { updateRequested = true; worker.postMessage('skip-waiting'); }
        });
        if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(worker);
          });
        });
      }).catch(() => {});
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (updateRequested) { updateRequested = false; location.reload(); }
      });
    });
  }

  // ---------- save every chapter ----------
  function allFiles() {
    const b = bundle();
    const files = new Set([...Object.values(b.chapters), b.search, ...b.core, ...Object.values(b.widgets), ...(b.assets || [])]);
    files.delete(undefined);
    return [...files];
  }
  async function saved() {
    if (!supported) return 0;
    const cache = await caches.open('dom-content');
    const keys = new Set((await cache.keys()).map(r => new URL(r.url).pathname + new URL(r.url).search));
    return Object.values(bundle().chapters).filter(f => keys.has('/' + f)).length;
  }
  async function saveAll(progress) {
    const cache = await caches.open('dom-content');
    const files = allFiles();
    let done = 0, failed = 0;
    const queue = [...files];
    const worker = async () => {
      while (queue.length) {
        const f = queue.shift();
        try {
          if (!(await cache.match(f))) {
            const r = await fetch(f);
            if (!r.ok) throw new Error(r.status);
            await cache.put(f, r);
          }
        } catch { failed += 1; }
        done += 1; progress?.(done, files.length);
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    if (!failed) write('dom-offline-saved', bundle().search || '1');
    return failed;
  }

  // The "Study offline" card on the CVS home page (app.js leaves an empty #offline-card).
  async function mountCard() {
    const card = document.getElementById('offline-card');
    if (!card || card.dataset.ready) return;
    card.dataset.ready = '1';
    if (!supported) { card.hidden = true; return; }
    const total = Object.keys(bundle().chapters).length;
    const render = async () => {
      const n = await saved();
      const all = n === total;
      card.innerHTML = `<div class="offline-text"><strong>${all ? '✓ All chapters saved for offline' : 'Study without a connection'}</strong><span>${all ? 'Every breakdown opens even with no signal.' : `Save all ${total} breakdowns on this device (about 1 MB). ${n ? `${n} already saved.` : 'Chapters you open are saved automatically.'}`}</span></div>` +
        (all ? '' : `<button type="button" class="btn btn-primary offline-save">Save all chapters</button>`);
      card.querySelector('.offline-save')?.addEventListener('click', async e => {
        const btn = e.currentTarget;
        btn.disabled = true;
        const failed = await saveAll((d, t) => { btn.textContent = `Saving… ${Math.round(100 * d / t)}%`; });
        if (failed) { btn.disabled = false; btn.textContent = 'Try again'; notify('Some files couldn’t be saved. Check your connection and try again.'); }
        else { notify('All chapters are saved on this device.'); render(); }
      });
    };
    render();
  }
  window.addEventListener('dom:rendered', mountCard);
  mountCard();
})();
