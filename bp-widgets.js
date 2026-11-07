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
})();
