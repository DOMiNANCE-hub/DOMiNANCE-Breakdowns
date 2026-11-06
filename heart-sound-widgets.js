/* DOMiNANCE Breakdowns — heart-sound widgets (Chapter 5).
 * Registers extra builders with teaching-widgets.js (window.DOMWidgets):
 *   heart-sound-timeline · sound-clips · filling-sounds · s1-loudness · murmur-figure · murmur-predictor
 * Recordings: University of Michigan Heart Sound and Murmur Library (CC BY-SA 4.0), trimmed to short mono clips.
 * Each clip has a "-phone" twin with added overtones so ~80 Hz sounds are audible on small speakers;
 * timing and loudness pattern are unchanged. Audio objects are created only when a student presses play. */
(() => {
  'use strict';
  const W = window.DOMWidgets;
  if (!W) return;
  const {esc, svgOpen, keepDescription, nextId} = W.helpers;

  // ---------- recordings ----------
  const AUDIO_BASE = 'assets/chapter05/audio/';
  const CREDIT = 'Recording: University of Michigan Heart Sound and Murmur Library (Judge &amp; Mangrulkar, Open.Michigan), <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>; trimmed to a short clip.';
  const CLIPS = {
    'normal-apex': {label: 'Listen at the apex', note: 'Mitral area, bell. S1 is the louder sound.'},
    'normal-base': {label: 'Listen at the base', note: 'Aortic area, bell. S2 is the louder sound.'},
    'split-s2': {label: 'Listen: split S2', note: 'Pulmonary area, diaphragm. The "dub" becomes "da-dub" and back every few beats.'},
    's3': {label: 'Hear S3', note: 'Apex, bell, lying on the left side: lub-dub-dum.'},
    's4': {label: 'Hear S4', note: 'Apex, bell, lying on the left side: da-lub-dub.'},
    'aortic-stenosis': {label: 'Typical of aortic stenosis', note: 'A murmur filling systole, with S2 missing because this severely narrowed, stiff valve barely moves (see §5).'},
    'mitral-regurgitation': {label: 'Typical of mitral regurgitation', note: 'A murmur filling all of systole.'},
    'aortic-regurgitation': {label: 'Typical of aortic regurgitation', note: 'A murmur starting right after S2.'},
    'mitral-stenosis': {label: 'Typical of mitral stenosis', note: 'A click just after S2 (an "opening snap", where the stiff, narrowed valve snaps open, unlike a normal valve), then a low rumble.'},
    'pulmonary-stenosis': {label: 'Typical of pulmonary stenosis', note: 'A systolic murmur.'}
  };
  const MODE_KEY = 'dom-audio-mode';
  const getMode = () => { try { return localStorage.getItem(MODE_KEY) === 'phone' ? 'phone' : 'headphones'; } catch (e) { return 'headphones'; } };
  const setMode = m => { try { localStorage.setItem(MODE_KEY, m); } catch (e) { /* storage unavailable */ } document.dispatchEvent(new CustomEvent('dom:audio-mode', {detail: m})); };
  const clipSrc = name => AUDIO_BASE + name + (getMode() === 'phone' ? '-phone' : '') + '.mp3';

  // One recording plays at a time across the page.
  let current = null;
  function stopCurrent() { if (current) { current.stop(); current = null; } }
  function playClip(name, {onTick, onEnd} = {}) {
    stopCurrent();
    const audio = new Audio(clipSrc(name));
    audio.preload = 'auto';
    let raf = 0, stopped = false;
    const tick = () => { if (stopped) return; if (onTick) onTick(audio.currentTime); raf = requestAnimationFrame(tick); };
    const handle = {
      name,
      stop() { if (stopped) return; stopped = true; cancelAnimationFrame(raf); audio.pause(); if (onEnd) onEnd(); }
    };
    audio.addEventListener('ended', () => { handle.stop(); if (current === handle) current = null; });
    audio.addEventListener('error', () => { handle.stop(); if (current === handle) current = null; });
    current = handle;
    const p = audio.play();
    if (p && p.catch) p.catch(() => handle.stop());
    raf = requestAnimationFrame(tick);
    return handle;
  }
  document.addEventListener('dom:audio-mode', stopCurrent);
  window.addEventListener('hashchange', stopCurrent);

  function modeToggle() {
    const box = document.createElement('div');
    box.className = 'snd-mode';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Playback device');
    box.innerHTML = '<span class="snd-mode-label">Playing through:</span>' +
      '<button type="button" class="tw-btn snd-mode-btn" data-mode="headphones">Headphones</button>' +
      '<button type="button" class="tw-btn snd-mode-btn" data-mode="phone">Phone speaker</button>' +
      '<span class="snd-mode-hint">Heart sounds are very low-pitched. The phone-speaker version adds overtones so you can hear them on small speakers; the timing is unchanged.</span>';
    const sync = () => box.querySelectorAll('.snd-mode-btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === getMode())));
    box.querySelectorAll('.snd-mode-btn').forEach(b => b.addEventListener('click', () => { setMode(b.dataset.mode); }));
    document.addEventListener('dom:audio-mode', sync);
    sync();
    return box;
  }
  function clipButton(name, label, hooks = {}) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tw-btn snd-play';
    b.dataset.clip = name;
    b.setAttribute('aria-pressed', 'false');
    const text = label || CLIPS[name].label;
    b.innerHTML = `<span class="snd-icon" aria-hidden="true">▶</span><span class="snd-text">${esc(text)}</span>`;
    const idle = () => { b.setAttribute('aria-pressed', 'false'); b.querySelector('.snd-icon').textContent = '▶'; if (hooks.onEnd) hooks.onEnd(); };
    b.addEventListener('click', () => {
      if (current && current.name === name && b.getAttribute('aria-pressed') === 'true') { stopCurrent(); return; }
      document.querySelectorAll('.snd-play[aria-pressed="true"]').forEach(o => { o.setAttribute('aria-pressed', 'false'); o.querySelector('.snd-icon').textContent = '▶'; });
      b.setAttribute('aria-pressed', 'true');
      b.querySelector('.snd-icon').textContent = '■';
      playClip(name, {onTick: hooks.onTick, onEnd: idle});
    });
    return b;
  }

  // ---------- synthetic heart sounds (Web Audio) ----------
  let ctx = null;
  const audioCtx = () => {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) ctx = new C(); }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  // A low thump with a few overtones so it is audible on phone speakers too.
  function thump(c, t, {f = 55, dur = 0.11, gain = 0.7} = {}) {
    const out = c.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    out.connect(c.destination);
    [[1, 1], [2, 0.5], [3, 0.28], [4.2, 0.12]].forEach(([m, g]) => {
      const o = c.createOscillator(), og = c.createGain();
      o.frequency.setValueAtTime(f * m * 1.15, t);
      o.frequency.exponentialRampToValueAtTime(f * m, t + dur);
      og.gain.value = g;
      o.connect(og).connect(out);
      o.start(t);
      o.stop(t + dur + 0.02);
    });
  }
  // Systole shortens a little with rate, diastole absorbs most of the cut (teaching approximation).
  const phases = hr => { const cycle = 60 / hr, sys = 0.3 * Math.pow(cycle / 0.8, 0.4); return {cycle, sys, dia: cycle - sys}; };

  // ---------- 1. Watch and listen to one heartbeat (§1) ----------
  function heartSoundTimeline(fig) {
    const x0 = 40, x1 = 500, Xf = f => x0 + (x1 - x0) * f;
    const wrap = document.createElement('div');
    wrap.className = 'snd-timeline';
    wrap.innerHTML = '<div class="tw-stage"></div>' +
      '<div class="snd-valves" aria-hidden="true"><span class="snd-valve" data-v="in"><strong>Mitral + tricuspid</strong><em>open</em></span><span class="snd-valve" data-v="out"><strong>Aortic + pulmonary</strong><em>shut</em></span></div>' +
      '<div class="tw-controls snd-controls"><button type="button" class="tw-btn snd-go" aria-pressed="false">▶ Play</button>' +
      '<label class="snd-hr"><span>Heart rate <strong class="snd-hr-val">75</strong> beats/min</span><input type="range" min="60" max="150" step="5" value="75" aria-label="Heart rate in beats per minute"></label></div>' +
      '<p class="snd-readout" aria-live="polite"></p>';
    const stage = wrap.querySelector('.tw-stage'), input = wrap.querySelector('input'), go = wrap.querySelector('.snd-go');
    const readout = wrap.querySelector('.snd-readout'), hrVal = wrap.querySelector('.snd-hr-val');
    const vIn = wrap.querySelector('[data-v="in"]'), vOut = wrap.querySelector('[data-v="out"]');
    let hr = 75;
    const draw = () => {
      const {cycle, sys, dia} = phases(hr), fs = sys / cycle;
      stage.innerHTML = svgOpen(540, 150, `One heartbeat at ${hr} beats per minute: S1, then ventricular systole of about ${sys.toFixed(2)} seconds, then S2, then ventricular diastole of about ${dia.toFixed(2)} seconds.`) +
        `<rect x="${Xf(0)}" y="40" width="${Xf(fs) - Xf(0)}" height="44" rx="6" class="tw-sys"/>` +
        `<rect x="${Xf(fs)}" y="40" width="${Xf(1) - Xf(fs)}" height="44" rx="6" class="tw-dia"/>` +
        `<text x="${(Xf(0) + Xf(fs)) / 2}" y="67" text-anchor="middle" class="tw-bar-text">Systole</text>` +
        `<text x="${(Xf(fs) + Xf(1)) / 2}" y="67" text-anchor="middle" class="tw-bar-text">Diastole</text>` +
        [[0, 'S1'], [fs, 'S2'], [1, 'S1']].map(([f, l]) => `<line x1="${Xf(f)}" y1="30" x2="${Xf(f)}" y2="94" class="${l === 'S1' ? 'tw-s1' : 'tw-a2'}"/><text x="${Xf(f)}" y="22" text-anchor="middle" class="tw-small tw-strong">${l}</text>`).join('') +
        `<text x="${(Xf(0) + Xf(fs)) / 2}" y="114" text-anchor="middle" class="tw-small">≈ ${sys.toFixed(2)} s</text>` +
        `<text x="${(Xf(fs) + Xf(1)) / 2}" y="114" text-anchor="middle" class="tw-small">≈ ${dia.toFixed(2)} s</text>` +
        `<text x="${Xf(0)}" y="140" class="tw-tiny tw-muted">lub</text><text x="${Xf(fs)}" y="140" text-anchor="middle" class="tw-tiny tw-muted">dub</text><text x="${Xf(1)}" y="140" text-anchor="end" class="tw-tiny tw-muted">next lub</text>` +
        `<line x1="${Xf(0)}" y1="34" x2="${Xf(0)}" y2="90" class="snd-cursor"/></svg>`;
      hrVal.textContent = hr;
      readout.textContent = `Cycle ${cycle.toFixed(2)} s: systole ≈ ${sys.toFixed(2)} s, diastole ≈ ${dia.toFixed(2)} s.`;
    };
    const setValves = f => {
      const fs = phases(hr).sys / phases(hr).cycle;
      const inShut = f < fs + 0.06, outOpen = f > 0.06 && f < fs;
      vIn.querySelector('em').textContent = inShut ? 'shut' : 'open';
      vOut.querySelector('em').textContent = outOpen ? 'open' : 'shut';
      vIn.classList.toggle('is-flash', f < 0.08);
      vOut.classList.toggle('is-flash', f >= fs && f < fs + 0.08);
    };
    // playback: beats scheduled on the audio clock (or performance clock if Web Audio is missing)
    let playing = false, raf = 0, timer = 0, beats = [], nextT = 0;
    const now = () => (ctx ? ctx.currentTime : performance.now() / 1000);
    const schedule = () => {
      while (nextT < now() + 0.3) {
        const p = phases(hr);
        beats.push({t: nextT, ...p});
        if (ctx) { thump(ctx, nextT, {f: 52, dur: 0.13, gain: 0.75}); thump(ctx, nextT + p.sys, {f: 68, dur: 0.09, gain: 0.6}); }
        nextT += p.cycle;
      }
      beats = beats.filter(b => b.t + b.cycle > now() - 1);
    };
    const frame = () => {
      const t = now(), b = [...beats].reverse().find(x => x.t <= t);
      const cursor = stage.querySelector('.snd-cursor');
      if (b && cursor) {
        const f = Math.min(1, (t - b.t) / b.cycle);
        cursor.setAttribute('x1', Xf(f)); cursor.setAttribute('x2', Xf(f));
        setValves(f);
      }
      raf = requestAnimationFrame(frame);
    };
    const stop = () => { playing = false; clearInterval(timer); cancelAnimationFrame(raf); go.textContent = '▶ Play'; go.setAttribute('aria-pressed', 'false'); vIn.classList.remove('is-flash'); vOut.classList.remove('is-flash'); draw(); setValves(0.5); };
    go.addEventListener('click', () => {
      if (playing) { stop(); return; }
      stopCurrent();
      audioCtx();
      playing = true; beats = []; nextT = now() + 0.15;
      go.textContent = '■ Stop'; go.setAttribute('aria-pressed', 'true');
      schedule(); timer = setInterval(schedule, 100); raf = requestAnimationFrame(frame);
    });
    input.addEventListener('input', () => { hr = Number(input.value); draw(); });
    window.addEventListener('hashchange', stop);
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    draw(); setValves(0.5);
  }

  // ---------- 2. Recording buttons (§3, §8) ----------
  function soundClips(box) {
    const names = (box.dataset.clips || '').split(',').map(s => s.trim()).filter(n => CLIPS[n]);
    const desc = box.querySelector(':scope > p');
    if (desc) desc.classList.add('tw-description', 'tw-visually-hidden');
    const list = document.createElement('div');
    list.className = 'snd-list';
    names.forEach(n => {
      const row = document.createElement('div');
      row.className = 'snd-row';
      row.append(clipButton(n));
      row.insertAdjacentHTML('beforeend', `<span class="snd-note">${esc(CLIPS[n].note)}</span>`);
      list.append(row);
    });
    const credit = document.createElement('p');
    credit.className = 'media-credit';
    credit.innerHTML = CREDIT + ' Simulator recordings.';
    box.prepend(list);
    list.after(modeToggle(), credit);
  }

  // ---------- 3. Where S3 and S4 sit in filling (§4) ----------
  function fillingSounds(fig) {
    const X = t => 84 + 420 * t, V = v => 210 - (v - 50) * 1.9;
    const vol = [[0, 50], [0.06, 50], [0.1, 62], [0.18, 90], [0.26, 106], [0.32, 110], [0.5, 113], [0.74, 115], [0.82, 122], [0.9, 130], [1, 130]];
    const pts = vol.map(([t, v]) => [X(t), V(v)]);
    const marks = {s2: [0, 50], s3: [0.3, 109], s4: [0.86, 126], s1: [1, 130]};
    const svg = svgOpen(540, 270, 'Ventricular volume through one diastole: a steep rise during rapid filling, a flat stretch during diastasis, then a small final rise with the atrial kick. S3 sits where the steep rise levels off; S4 sits on the atrial kick.') +
      `<rect x="${X(0.06)}" y="20" width="${X(0.32) - X(0.06)}" height="200" class="tw-band"/><rect x="${X(0.76)}" y="20" width="${X(0.92) - X(0.76)}" height="200" class="tw-band"/>` +
      `<text x="${X(0.19)}" y="36" text-anchor="middle" class="tw-small tw-strong">Rapid filling</text>` +
      `<text x="${X(0.54)}" y="36" text-anchor="middle" class="tw-small tw-strong">Diastasis</text>` +
      `<text x="${X(0.84)}" y="36" text-anchor="middle" class="tw-small tw-strong">Atrial kick</text>` +
      `<text x="8" y="${V(80)}" class="tw-row-label">Volume</text>` +
      `<path d="${W.helpers.smooth(pts)}" class="tw-vol"/>` +
      `<line x1="${X(0)}" y1="220" x2="${X(1)}" y2="220" class="tw-axis"/>` +
      `<line x1="${X(0)}" y1="44" x2="${X(0)}" y2="220" class="tw-event"/><text x="${X(0) + 4}" y="238" class="tw-small tw-strong">S2</text>` +
      `<line x1="${X(1)}" y1="44" x2="${X(1)}" y2="220" class="tw-event"/><text x="${X(1) - 4}" y="238" text-anchor="end" class="tw-small tw-strong">next S1</text>` +
      ['s3', 's4'].map(k => { const [t, v] = marks[k]; return `<g class="snd-mark" data-k="${k}"><circle cx="${X(t)}" cy="${V(v)}" r="9" class="tw-mark"/><text x="${X(t) + (k === 's3' ? 16 : 0)}" y="${V(v) + (k === 's3' ? -14 : 32)}" text-anchor="${k === 's3' ? 'start' : 'middle'}" class="tw-small tw-strong">${k.toUpperCase()}</text></g>`; }).join('') +
      `<text x="${X(0.33)}" y="${V(109) + 30}" text-anchor="start" class="tw-tiny tw-muted">S3: rush suddenly slowed</text>` +
      `<text x="${X(0.86)}" y="${V(64)}" text-anchor="end" class="tw-tiny tw-muted">S4: atria push into a stiff ventricle</text>` +
      `<text x="${X(1)}" y="258" text-anchor="end" class="tw-tiny tw-muted">time through diastole →</text></svg>`;
    fig.querySelector('figcaption').insertAdjacentHTML('afterend', svg);
    // event times in the trimmed clips (seconds), measured from the recordings
    const times = {s3: {first: 0.508, period: 0.8543}, s4: {first: 0.714, period: 0.8275}};
    const lit = (k, t) => { const {first, period} = times[k]; if (t < first - 0.02) return false; const ph = (t - first) % period; return ph < 0.2; };
    const controls = document.createElement('div');
    controls.className = 'tw-controls snd-list';
    ['s3', 's4'].forEach(k => {
      const mark = () => fig.querySelector(`.snd-mark[data-k="${k}"]`);
      controls.append(clipButton(k, CLIPS[k].label, {
        onTick: t => mark()?.classList.toggle('is-lit', lit(k, t)),
        onEnd: () => mark()?.classList.remove('is-lit')
      }));
    });
    const credit = document.createElement('p');
    credit.className = 'media-credit';
    credit.innerHTML = CREDIT + ' Simulator recordings.';
    fig.querySelector('svg').after(controls, modeToggle(), credit);
    keepDescription(fig);
  }

  // ---------- 4. Why a slow heart has a soft S1 (§5) ----------
  function s1Loudness(fig) {
    const panel = (cx, angle, title, out, cls) => {
      const y = 92, hx = 46;   // hinge points at cx ± hx; cusp length hx (tips meet when angle = 0)
      const cusp = side => `<g class="snd-cusp ${cls}" data-side="${side}" style="transform-origin:${cx + side * hx}px ${y}px;transform:rotate(${side * -angle}deg)"><line x1="${cx + side * hx}" y1="${y}" x2="${cx}" y2="${y}"/></g>`;
      const tip = a => [cx + hx - hx * Math.cos(a * Math.PI / 180), y + hx * Math.sin(a * Math.PI / 180)];
      const [tx, ty] = tip(angle);
      return `<text x="${cx}" y="18" text-anchor="middle" class="tw-small tw-strong">${title}</text>` +
        `<rect x="${cx - 84}" y="30" width="168" height="54" rx="8" class="tw-chamber atrium"/><text x="${cx}" y="52" text-anchor="middle" class="tw-tiny">Left atrium</text>` +
        `<rect x="${cx - 84}" y="100" width="168" height="76" rx="8" class="tw-chamber ventricle"/><text x="${cx}" y="150" text-anchor="middle" class="tw-tiny">Left ventricle</text><text x="${cx}" y="167" text-anchor="middle" class="tw-tiny tw-muted">starts to contract</text>` +
        `<circle cx="${cx - hx}" cy="${y}" r="3" class="tw-hinge"/><circle cx="${cx + hx}" cy="${y}" r="3" class="tw-hinge"/>` +
        cusp(-1) + cusp(1) +
        `<path d="M${tx + 6} ${ty} Q ${cx + hx * 0.55} ${y + 4} ${cx + 4} ${y + 2}" class="snd-travel" marker-end="url(#${fig.dataset.sid}-a)"/>` +
        `<text x="${cx}" y="200" text-anchor="middle" class="tw-small tw-strong ${cls}-text">${out}</text>`;
    };
    fig.dataset.sid = nextId('snd-l');
    const svg = svgOpen(540, 214, 'Two mitral valves at the moment the ventricle starts to contract. Slow heart: the cusps have floated nearly shut and travel a short way, giving a soft S1. Fast heart: the cusps are still wide open and travel a long way, giving a loud S1.') +
      `<defs><marker id="${fig.dataset.sid}-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="tw-arrowhead"/></marker></defs>` +
      panel(135, 16, 'Slow heart (long diastole)', 'Cusps nearly shut → soft S1', 'snd-soft') +
      panel(405, 72, 'Fast heart (short diastole)', 'Cusps wide open → loud S1', 'snd-loud') + '</svg>';
    fig.querySelector('figcaption').insertAdjacentHTML('afterend', svg);
    const controls = document.createElement('div');
    controls.className = 'tw-controls';
    controls.innerHTML = '<button type="button" class="tw-btn snd-go">▶ Play: close both valves</button><span class="tw-tiny-note">Plays the slow heart first, then the fast heart, so you can compare the two lubs.</span>';
    const go = controls.querySelector('button');
    const close = (cls, delay) => setTimeout(() => fig.querySelectorAll('.snd-cusp.' + cls).forEach(g => { g.dataset.angle = g.style.transform; g.style.transform = 'rotate(0deg)'; g.classList.add('is-closing'); }), delay);
    const reset = () => fig.querySelectorAll('.snd-cusp').forEach(g => { g.classList.remove('is-closing'); if (g.dataset.angle) g.style.transform = g.dataset.angle; });
    go.addEventListener('click', () => {
      stopCurrent(); reset(); go.disabled = true;
      const c = audioCtx();
      setTimeout(() => {
        close('snd-soft', 0); close('snd-loud', 900);
        if (c) { const t = c.currentTime; thump(c, t + 0.1, {f: 52, dur: 0.12, gain: 0.12}); thump(c, t + 1.0, {f: 52, dur: 0.14, gain: 0.85}); }
        setTimeout(() => { reset(); go.disabled = false; }, 2600);
      }, 60);
    });
    fig.querySelector('svg').after(controls);
    keepDescription(fig);
  }

  // ---------- 5. Three ways to make a murmur (§6), static ----------
  function murmurFigure(fig) {
    const id = nextId('snd-m');
    const swirl = (x, y, s = 1) => `<path d="M${x} ${y} a${6 * s} ${6 * s} 0 1 1 ${6 * s} ${6 * s} a${4 * s} ${4 * s} 0 1 1 ${-4 * s} ${-4 * s}" class="snd-swirl"/>`;
    const arrow = (x1, y, x2, cls = 'tw-flow') => `<path d="M${x1} ${y} H${x2}" class="${cls}" marker-end="url(#${id}-${cls.includes('tw-back') ? 'b' : 'a'})"/>`;
    const tube = (ox, oy, title, sub) => `<text x="${ox}" y="${oy - 10}" class="tw-small tw-strong">${title}</text><text x="${ox + 250}" y="${oy - 10}" text-anchor="end" class="tw-tiny tw-muted">${sub}</text>` +
      `<line x1="${ox}" y1="${oy}" x2="${ox + 250}" y2="${oy}" class="tw-wall"/><line x1="${ox}" y1="${oy + 80}" x2="${ox + 250}" y2="${oy + 80}" class="tw-wall"/>`;
    const leaflets = (ox, oy, gap, open) => open
      ? `<line x1="${ox + 110}" y1="${oy}" x2="${ox + 140}" y2="${oy + 10}" class="tw-leaflet"/><line x1="${ox + 110}" y1="${oy + 80}" x2="${ox + 140}" y2="${oy + 70}" class="tw-leaflet"/>`
      : `<line x1="${ox + 120}" y1="${oy}" x2="${ox + 128}" y2="${oy + 40 - gap / 2}" class="tw-leaflet"/><line x1="${ox + 120}" y1="${oy + 80}" x2="${ox + 128}" y2="${oy + 40 + gap / 2}" class="tw-leaflet"/>`;
    const p1 = (ox, oy) => tube(ox, oy, '1. Normal', 'laminar: silent') + leaflets(ox, oy, 0, true) + [22, 40, 58].map(y => arrow(ox + 16, oy + y, ox + 234)).join('');
    const p2 = (ox, oy) => tube(ox, oy, '2. Stenosis', 'forward jet') + leaflets(ox, oy, 12, false) + arrow(ox + 20, oy + 28, ox + 90, 'tw-flow tw-faint') + arrow(ox + 20, oy + 52, ox + 90, 'tw-flow tw-faint') +
      arrow(ox + 112, oy + 40, ox + 186, 'tw-flow tw-jet') + swirl(ox + 196, oy + 22) + swirl(ox + 206, oy + 50) + swirl(ox + 228, oy + 34, 0.8);
    const p3 = (ox, oy) => tube(ox, oy, '3. Regurgitation', 'backward jet') + leaflets(ox, oy, 6, false) + `<text x="${ox + 124}" y="${oy + 98}" text-anchor="middle" class="tw-tiny tw-muted">valve should be shut</text>` +
      arrow(ox + 140, oy + 40, ox + 66, 'tw-flow tw-jet tw-back') + swirl(ox + 30, oy + 24) + swirl(ox + 46, oy + 50) + swirl(ox + 18, oy + 44, 0.8);
    const p4 = (ox, oy) => tube(ox, oy, '4. High flow', 'normal valve, fast flow') + leaflets(ox, oy, 0, true) + [16, 28, 40, 52, 64].map(y => arrow(ox + 10, oy + y, ox + 190, 'tw-flow tw-fast')).join('') + swirl(ox + 214, oy + 24) + swirl(ox + 226, oy + 50, 0.8);
    const svg = svgOpen(540, 282, 'Four panels: normal laminar flow is silent; a narrowed valve makes a forward jet that swirls beyond it; a leaking valve makes a backward jet that swirls behind it; fast flow through a normal valve also swirls.') +
      `<defs><marker id="${id}-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="tw-arrowhead"/></marker><marker id="${id}-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="tw-arrowhead tw-arrowhead-back"/></marker></defs>` +
      p1(10, 30) + p2(280, 30) + p3(10, 166) + p4(280, 166) + '</svg>';
    fig.querySelector('figcaption').insertAdjacentHTML('afterend', svg);
    keepDescription(fig);
  }

  // ---------- 6. Murmur predictor (§7) ----------
  function murmurPredictor(fig) {
    const VALVES = {
      aortic: {name: 'aortic', side: 'left', type: 'outlet'}, pulmonary: {name: 'pulmonary', side: 'right', type: 'outlet'},
      mitral: {name: 'mitral', side: 'left', type: 'inlet'}, tricuspid: {name: 'tricuspid', side: 'right', type: 'inlet'}
    };
    const SIDE = {left: ['left atrium', 'mitral', 'left ventricle', 'aortic', 'aorta'], right: ['right atrium', 'tricuspid', 'right ventricle', 'pulmonary', 'pulmonary artery']};
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    const id = nextId('snd-p');
    const wrap = document.createElement('div');
    wrap.className = 'snd-predictor';
    wrap.innerHTML = '<div class="snd-pick" role="group" aria-label="Valve"><span class="snd-pick-label">Valve</span>' +
      Object.keys(VALVES).map(v => `<button type="button" class="tw-btn snd-opt" data-valve="${v}" aria-pressed="false">${cap(v)}</button>`).join('') + '</div>' +
      '<div class="snd-pick" role="group" aria-label="Fault"><span class="snd-pick-label">Fault</span>' +
      '<button type="button" class="tw-btn snd-opt" data-fault="stenosis" aria-pressed="false">Narrowed (stenosis)</button>' +
      '<button type="button" class="tw-btn snd-opt" data-fault="regurgitation" aria-pressed="false">Leaking (regurgitation)</button></div>' +
      '<div class="tw-stage"></div><ol class="snd-steps" aria-live="polite"></ol>' +
      '<div class="tw-controls"><button type="button" class="tw-btn snd-next" disabled>Next step →</button><button type="button" class="tw-btn snd-all" disabled>Show all</button></div>' +
      '<div class="snd-example"></div>';
    const stage = wrap.querySelector('.tw-stage'), steps = wrap.querySelector('.snd-steps'), next = wrap.querySelector('.snd-next'), all = wrap.querySelector('.snd-all'), example = wrap.querySelector('.snd-example');
    let valve = null, fault = null, shown = 0, plan = null;
    const reason = (v, f) => {
      const V = VALVES[v], names = SIDE[V.side];
      const phase = (V.type === 'outlet') === (f === 'stenosis') ? 'systole' : 'diastole';
      const should = f === 'stenosis' ? 'open' : 'shut';
      const why = {outlet: {open: 'for ejection', shut: 'while the ventricle relaxes'}, inlet: {open: 'for filling', shut: 'while the ventricle contracts'}}[V.type][should];
      const forward = V.type === 'inlet' ? [names[0], names[2]] : [names[2], names[4]];
      const [from, to] = f === 'stenosis' ? forward : [forward[1], forward[0]];
      return {phase, should, names, from, to, lines: [
        `The ${v} valve should be <strong>${should}</strong> during <strong>ventricular ${phase}</strong>, ${why}.`,
        f === 'stenosis' ? `A narrowed ${v} valve squeezes <strong>forward</strong> flow from the ${from} into the ${to} as a fast jet.` : `A leaking ${v} valve lets blood jet <strong>backwards</strong> from the ${from} into the ${to}.`,
        `That abnormal flow happens in <strong>${phase}</strong>: ${phase === 'systole' ? 'between S1 and S2' : 'between S2 and the next S1'}.`,
        `So ${cap(v)} ${f} gives a <strong>${phase === 'systole' ? 'systolic' : 'diastolic'} murmur</strong>.`
      ]};
    };
    const draw = () => {
      if (!plan) { stage.innerHTML = '<p class="snd-prompt">Pick a valve and a fault, then predict the timing before you press Next.</p>'; return; }
      const V = VALVES[valve], [a, inV, ven, outV, art] = plan.names;
      const box = (x, w, label) => `<rect x="${x}" y="30" width="${w}" height="46" rx="8" class="tw-chamber"/><text x="${x + w / 2}" y="58" text-anchor="middle" class="tw-tiny">${cap(label)}</text>`;
      const vx = V.type === 'inlet' ? 182 : 362;
      const jet = shown >= 2 ? (() => {
        const fwd = fault === 'stenosis', y = 53;
        const [x1, x2] = fwd ? [vx - 34, vx + 34] : [vx + 34, vx - 34];
        return `<path d="M${x1} ${y} H${x2}" class="tw-flow tw-jet" marker-end="url(#${id}-a)"/>`;
      })() : '';
      const vmark = (x, label, bad) => `<line x1="${x}" y1="26" x2="${x}" y2="80" class="tw-valve-line ${bad ? 'is-bad' : ''}"/><text x="${x}" y="98" text-anchor="middle" class="tw-tiny ${bad ? 'tw-strong' : 'tw-muted'}">${cap(label)}</text>`;
      const T0 = 60, T1 = 500, s2 = T0 + (T1 - T0) * 0.38;
      const hi = shown >= 3 ? (plan.phase === 'systole' ? [T0, s2] : [s2, T1]) : null;
      stage.innerHTML = svgOpen(540, 190, `${cap(valve)} ${fault}: ${plan.phase === 'systole' ? 'systolic' : 'diastolic'} murmur.`) +
        `<defs><marker id="${id}-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="tw-arrowhead"/></marker></defs>` +
        box(20, 140, a) + box(200, 140, ven) + box(380, 140, art) +
        vmark(182, inV, V.type === 'inlet') + vmark(362, outV, V.type === 'outlet') + jet +
        (hi ? `<rect x="${hi[0]}" y="128" width="${hi[1] - hi[0]}" height="26" rx="5" class="tw-band snd-phase"/>` : '') +
        `<line x1="${T0}" y1="141" x2="${T1}" y2="141" class="tw-axis"/>` +
        [[T0, 'S1'], [s2, 'S2'], [T1, 'S1']].map(([x, l]) => `<line x1="${x}" y1="130" x2="${x}" y2="152" class="${l === 'S1' ? 'tw-s1' : 'tw-a2'}"/><text x="${x}" y="172" text-anchor="middle" class="tw-small tw-strong">${l}</text>`).join('') +
        `<text x="${(T0 + s2) / 2}" y="124" text-anchor="middle" class="tw-tiny">systole</text><text x="${(s2 + T1) / 2}" y="124" text-anchor="middle" class="tw-tiny">diastole</text></svg>`;
    };
    const render = () => {
      steps.innerHTML = plan ? plan.lines.slice(0, shown).map(l => `<li>${l}</li>`).join('') : '';
      next.disabled = !plan || shown >= 4;
      all.disabled = !plan || shown >= 4;
      draw();
      example.innerHTML = '';
      if (plan && shown >= 4) {
        const key = valve + '-' + fault;
        if (CLIPS[key]) {
          example.append(clipButton(key, 'Hear an example'));
          example.insertAdjacentHTML('beforeend', `<p class="snd-note"><strong>${esc(CLIPS[key].label)}:</strong> ${esc(CLIPS[key].note)}</p>`);
          example.append(modeToggle());
          example.insertAdjacentHTML('beforeend', `<p class="media-credit">${CREDIT} Simulator recording; the library labels the sounds, not the diagnoses.</p>`);
        } else {
          const partner = {tricuspid: 'mitral', pulmonary: 'aortic'}[valve];
          example.innerHTML = `<p class="snd-note">No recording; same timing as the ${partner} lesion.</p>`;
        }
      }
    };
    const choose = () => {
      wrap.querySelectorAll('[data-valve]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.valve === valve)));
      wrap.querySelectorAll('[data-fault]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.fault === fault)));
      stopCurrent();
      plan = valve && fault ? reason(valve, fault) : null;
      shown = plan ? 1 : 0;
      render();
    };
    wrap.querySelectorAll('[data-valve]').forEach(b => b.addEventListener('click', () => { valve = b.dataset.valve; choose(); }));
    wrap.querySelectorAll('[data-fault]').forEach(b => b.addEventListener('click', () => { fault = b.dataset.fault; choose(); }));
    next.addEventListener('click', () => { shown = Math.min(4, shown + 1); render(); });
    all.addEventListener('click', () => { shown = 4; render(); });
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    render();
  }

  W.register('heart-sound-timeline', heartSoundTimeline);
  W.register('sound-clips', soundClips);
  W.register('filling-sounds', fillingSounds);
  W.register('s1-loudness', s1Loudness);
  W.register('murmur-figure', murmurFigure);
  W.register('murmur-predictor', murmurPredictor);
})();
