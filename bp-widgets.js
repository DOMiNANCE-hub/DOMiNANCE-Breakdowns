/* DOMiNANCE Breakdowns — blood pressure widgets (Chapter 10).
 * cuff-simulator: deflate a cuff past a 120/70 patient; see the artery shut, spurt or stay open, and hear Korotkoff taps. */
(() => {
  'use strict';
  const W = window.DOMWidgets;
  if (!W) return;
  const {svgOpen, keepDescription} = W.helpers;
  const SBP = 120, DBP = 70, TOP = 160, BOTTOM = 50, STEP = 2.5;   // mmHg per beat
  const BEATS = (TOP - BOTTOM) / STEP;                              // 44 beats
  const X0 = 50, XW = 470, Y = p => 20 + (170 - p) * 1.25;          // 170 → 20 px, 50 → 170 px
  const art = ph => ph < 0.15 ? DBP + (SBP - DBP) * (ph / 0.15) : DBP + (SBP - DBP) * Math.pow((1 - ph) / 0.85, 1.6);
  let ctx = null;
  const tap = () => {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.08);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.6, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.14);
    } catch (e) { /* no audio */ }
  };

  function cuffSimulator(fig) {
    const wrap = document.createElement('div');
    wrap.className = 'cs-wrap';
    wrap.innerHTML = `<div class="tw-controls"><button type="button" class="tw-btn cs-play">▶ Deflate</button><button type="button" class="tw-btn cs-reset">Reset</button><button type="button" class="tw-btn cs-snd" aria-pressed="true">Sound on</button></div>` +
      `<div class="tw-stage"></div>` +
      `<label class="lv-slider"><span>Cuff pressure: <strong class="cs-p"></strong> mmHg</span><input type="range" min="${BOTTOM}" max="${TOP}" step="1" value="${TOP}" aria-label="Cuff pressure in mmHg"></label>` +
      `<p class="lv-readout cs-say" aria-live="polite"></p>`;
    const stage = wrap.querySelector('.tw-stage'), range = wrap.querySelector('input');
    let cuff = TOP, sound = true, timer = 0, beatOn = false, seenS = false, seenD = false;
    // static waveform path
    const pts = [];
    for (let i = 0; i <= BEATS * 40; i++) { const b = i / 40; pts.push(`${i ? 'L' : 'M'}${(X0 + (b / BEATS) * XW).toFixed(1)} ${Y(art(b % 1)).toFixed(1)}`); }
    const wave = pts.join(' ');
    const xOf = c => X0 + ((TOP - c) / (TOP - BOTTOM)) * XW;
    const draw = () => {
      const state = cuff > SBP ? 'shut' : cuff > DBP ? 'spurt' : 'open';
      if (cuff <= SBP) seenS = true; if (cuff <= DBP) seenD = true;
      const x = xOf(cuff);
      const vesselH = state === 'shut' ? 2 : state === 'spurt' ? (beatOn ? 22 : 4) : 22;
      stage.innerHTML = svgOpen(560, 300, `Cuff at ${cuff} mmHg. Blood pressure 120/70. The artery under the cuff is ${state === 'shut' ? 'shut: silence' : state === 'spurt' ? 'forced open at each peak: taps' : 'open all the time: silence'}.`) +
        [160, 120, 70, 50].map(p => `<line x1="${X0}" y1="${Y(p)}" x2="${X0 + XW}" y2="${Y(p)}" class="cs-grid"/><text x="${X0 - 6}" y="${Y(p) + 4}" text-anchor="end" class="tw-tiny tw-muted">${p}</text>`).join('') +
        `<text x="10" y="12" class="tw-tiny tw-muted">mmHg</text>` +
        `<path d="${wave}" class="cs-wave"/>` +
        `<line x1="${X0}" y1="${Y(TOP)}" x2="${X0 + XW}" y2="${Y(BOTTOM)}" class="cs-cuffline"/>` +
        `<text x="${X0 + XW}" y="${Y(BOTTOM) + 16}" text-anchor="end" class="tw-tiny tw-strong cs-cufflab">cuff pressure (falling) →</text>` +
        `<text x="${X0 + XW}" y="${Y(SBP) - 8}" text-anchor="end" class="tw-tiny tw-muted">arterial pressure, beat by beat (120/70)</text>` +
        (seenS ? `<line x1="${xOf(SBP)}" y1="${Y(170)}" x2="${xOf(SBP)}" y2="${Y(40)}" class="cs-mark"/><text x="${xOf(SBP) + 4}" y="${Y(165)}" class="tw-tiny tw-strong">first tap: systolic ${SBP}</text>` : '') +
        (seenD ? `<line x1="${xOf(DBP)}" y1="${Y(170)}" x2="${xOf(DBP)}" y2="${Y(40)}" class="cs-mark"/><text x="${xOf(DBP) + 4}" y="${Y(152)}" class="tw-tiny tw-strong">silence: diastolic ${DBP}</text>` : '') +
        `<circle cx="${x}" cy="${Y(cuff)}" r="7" class="cs-dot"/>` +
        `<text x="60" y="232" class="tw-tiny tw-strong">Brachial artery under the cuff</text>` +
        `<rect x="60" y="246" width="440" height="40" rx="8" class="cs-cuff"/>` +
        `<rect x="40" y="${266 - vesselH / 2}" width="480" height="${vesselH}" rx="${vesselH / 2}" class="cs-artery cs-${state}"/>` +
        `<text x="500" y="232" text-anchor="end" class="tw-small tw-strong cs-ear">${state === 'spurt' ? (beatOn ? 'TAP' : '') : 'silence'}</text></svg>`;
      wrap.querySelector('.cs-p').textContent = cuff;
      wrap.querySelector('.cs-say').innerHTML = state === 'shut'
        ? `<strong>Cuff above systolic.</strong> It squeezes harder than even the peak of each beat, so the artery stays shut: <strong>silence</strong>.`
        : state === 'spurt'
          ? `<strong>Cuff between ${SBP} and ${DBP}.</strong> Each peak forces the artery open and blood spurts through: a <strong>tap</strong> with every beat.${cuff >= SBP - 3 ? ' <strong>The first tap marks systolic pressure.</strong>' : ''}`
          : `<strong>Cuff below diastolic.</strong> Even the lowest pressure holds the artery open, so flow is smooth again: <strong>silence</strong>. <strong>The last tap marks diastolic pressure.</strong>`;
    };
    const stop = () => { clearInterval(timer); timer = 0; wrap.querySelector('.cs-play').textContent = '▶ Deflate'; };
    const beat = () => {
      cuff = Math.max(BOTTOM, Math.round((cuff - STEP) * 2) / 2); range.value = cuff;
      beatOn = true; if (sound && cuff <= SBP && cuff > DBP) tap(); draw();
      setTimeout(() => { beatOn = false; draw(); }, 140);
      if (cuff <= BOTTOM) stop();
    };
    wrap.querySelector('.cs-play').addEventListener('click', () => {
      if (timer) { stop(); return; }
      if (cuff <= BOTTOM) { cuff = TOP; seenS = seenD = false; }
      wrap.querySelector('.cs-play').textContent = '❚❚ Pause';
      timer = setInterval(beat, 360);
    });
    wrap.querySelector('.cs-reset').addEventListener('click', () => { stop(); cuff = TOP; range.value = TOP; seenS = seenD = false; draw(); });
    wrap.querySelector('.cs-snd').addEventListener('click', e => { sound = !sound; e.currentTarget.setAttribute('aria-pressed', String(sound)); e.currentTarget.textContent = sound ? 'Sound on' : 'Sound off'; });
    range.addEventListener('input', () => { stop(); cuff = Number(range.value); beatOn = cuff <= SBP && cuff > DBP; draw(); });
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    draw();
  }
  W.register('cuff-simulator', cuffSimulator);

  // ---------- Muscle pump (Chapter 12, §4) ----------
  function musclePump(fig) {
    const wrap = document.createElement('div');
    wrap.className = 'mp-wrap';
    wrap.innerHTML = `<div class="tw-controls"><button type="button" class="tw-btn" data-s="squeeze">Squeeze</button><button type="button" class="tw-btn" data-s="relax">Relax</button><button type="button" class="tw-btn mp-play">▶ Play</button><button type="button" class="tw-btn" data-s="stand">Stand still</button></div><div class="tw-stage"></div><p class="lv-readout mp-say" aria-live="polite"></p>`;
    const stage = wrap.querySelector('.tw-stage');
    let state = 'relax', timer = 0;
    const X = 200;
    const valve = (y, open) => open
      ? `<path d="M${X - 24} ${y} L${X - 16} ${y - 26} M${X + 24} ${y} L${X + 16} ${y - 26}" class="mp-valve"/>`
      : `<path d="M${X - 24} ${y} L${X} ${y - 16} L${X + 24} ${y}" class="mp-valve mp-shut"/>`;
    const SAY = {
      squeeze: '<strong>Muscle contracts.</strong> The squeezed vein can only empty upwards: the <strong>lower valve snaps shut</strong> and the <strong>upper valve is pushed open</strong>, so blood moves towards the heart.',
      relax: '<strong>Muscle relaxes.</strong> The vein springs open and <strong>refills from below</strong> through the open lower valve. The <strong>upper valve shuts</strong>, so blood that moved up does not fall back.',
      stand: '<strong>Standing still.</strong> No muscle squeezes, so the pump stops. Gravity pools blood in the swollen lower vein. <strong>Less blood returns → less filling → lower stroke volume.</strong>'
    };
    const draw = () => {
      const sq = state === 'squeeze', st = state === 'stand';
      const wm = sq ? 22 : 50, wl = st ? 78 : 50, mx = sq ? 34 : 62;
      stage.innerHTML = svgOpen(400, 290, `Leg vein with two valves between calf muscles: ${state}.`) +
        `<text x="${X}" y="14" text-anchor="middle" class="tw-tiny tw-strong">to the heart ↑</text>` +
        `<rect x="${X - 25}" y="20" width="50" height="78" class="mp-vein"/>` +
        `<rect x="${X - wm / 2}" y="98" width="${wm}" height="110" rx="${sq ? 10 : 0}" class="mp-vein${st ? '' : ' mp-mid'}"/>` +
        `<rect x="${X - wl / 2}" y="208" width="${wl}" height="72" rx="${st ? 20 : 0}" class="mp-vein${st ? ' mp-pool' : ''}"/>` +
        `<ellipse cx="${X - mx - 40}" cy="153" rx="42" ry="62" class="mp-muscle${sq ? ' is-on' : ''}"/><ellipse cx="${X + mx + 40}" cy="153" rx="42" ry="62" class="mp-muscle${sq ? ' is-on' : ''}"/>` +
        `<text x="${X - mx - 40}" y="157" text-anchor="middle" class="tw-tiny tw-strong">calf muscle</text><text x="${X + mx + 40}" y="157" text-anchor="middle" class="tw-tiny tw-strong">calf muscle</text>` +
        valve(98, sq || st) + valve(208, !sq) +
        `<text x="${X + 34}" y="92" class="tw-tiny tw-muted">upper valve: ${sq || st ? 'open' : 'shut'}</text><text x="${X + 34}" y="202" class="tw-tiny tw-muted">lower valve: ${!sq ? 'open' : 'shut'}</text>` +
        (sq ? `<path d="M${X} 190 V40" class="mp-arrow" marker-end="url(#mp-h)"/>` : '') +
        (state === 'relax' ? `<path d="M${X} 275 V130" class="mp-arrow" marker-end="url(#mp-h)"/>` : '') +
        `<defs><marker id="mp-h" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" class="mp-head"/></marker></defs></svg>`;
      wrap.querySelector('.mp-say').innerHTML = SAY[state];
      wrap.querySelectorAll('[data-s]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.s === state)));
    };
    const stop = () => { clearInterval(timer); timer = 0; wrap.querySelector('.mp-play').textContent = '▶ Play'; };
    wrap.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { stop(); state = b.dataset.s; draw(); }));
    wrap.querySelector('.mp-play').addEventListener('click', e => {
      if (timer) { stop(); return; }
      e.currentTarget.textContent = '❚❚ Pause';
      state = 'squeeze'; draw();
      timer = setInterval(() => { state = state === 'squeeze' ? 'relax' : 'squeeze'; draw(); }, 1300);
    });
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    draw();
  }
  W.register('muscle-pump', musclePump);
})();
