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

  // ---------- Starling balance (Chapters 13 and 14) ----------
  const SCEN = {
    normal: {label: 'Normal', pca: 30, pcv: 10, pic: 28, say: 'The push wins at the arterial end (fluid leaves) and the pull wins at the venous end (classic model). Overall, a little more leaves than returns, and the lymph carries it away.'},
    hf: {label: 'Heart failure', pca: 38, pcv: 22, pic: 28, say: '<strong>Push too high.</strong> Back pressure raises capillary pressure all along, so fluid leaves along the whole capillary and almost none returns: oedema.'},
    alb: {label: 'Low albumin', pca: 30, pcv: 10, pic: 14, say: '<strong>Pull too weak.</strong> With little albumin, the protein pull is small, so fluid leaves along the whole capillary: generalised oedema.'},
    leak: {label: 'Leaky capillary', pca: 32, pcv: 14, pic: 12, say: '<strong>Wall too leaky.</strong> Proteins escape into the tissue, so the effective pull falls and the escaped proteins pull water out too: local swelling.'}
  };
  const PI = -3, PII = 8;
  function starlingBalance(fig) {
    const wrap = document.createElement('div');
    wrap.className = 'sb-wrap';
    wrap.innerHTML = `<div class="tw-controls" role="group" aria-label="Scenarios">${Object.entries(SCEN).map(([k, v]) => `<button type="button" class="tw-btn" data-sc="${k}">${v.label}</button>`).join('')}</div><div class="tw-stage"></div>` +
      `<label class="lv-slider"><span>Capillary pressure at the arterial end (Pc): <strong class="sb-pc"></strong> mmHg</span><input type="range" data-k="pc" min="15" max="50" step="1"></label>` +
      `<label class="lv-slider"><span>Plasma protein pull (πc): <strong class="sb-pi"></strong> mmHg</span><input type="range" data-k="pi" min="8" max="35" step="1"></label>` +
      `<p class="lv-readout sb-say" aria-live="polite"></p>`;
    const stage = wrap.querySelector('.tw-stage'), rPc = wrap.querySelector('[data-k="pc"]'), rPi = wrap.querySelector('[data-k="pi"]');
    let sc = SCEN[fig.dataset.start] ? fig.dataset.start : 'normal', pca, pcv, pic;
    const set = k => { sc = k; pca = SCEN[k].pca; pcv = SCEN[k].pcv; pic = SCEN[k].pic; rPc.value = pca; rPi.value = pic; };
    const arrow = (x, y1, y2, cls, lab, val, side) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" class="sb-arr ${cls}" marker-end="url(#sb-${cls})"/><text x="${x + side * 8}" y="${(y1 + y2) / 2 + 4}" text-anchor="${side > 0 ? 'start' : 'end'}" class="tw-tiny tw-strong">${lab} ${val}</text>`;
    const end = (x, pc, title) => {
      const out = pc - PI + PII, net = out - pic, k = 1.9;
      return `<text x="${x}" y="16" text-anchor="middle" class="tw-tiny tw-strong">${title}</text>` +
        arrow(x - 24, 150, 150 - out * k, 'out', 'push out', Math.round(out), -1) +
        arrow(x + 24, 150 - pic * k, 148, 'in', 'pull in', pic, 1) +
        `<rect x="${x - 70}" y="232" width="140" height="30" rx="8" class="sb-net ${net > 0.5 ? 'is-out' : net < -0.5 ? 'is-in' : ''}"/>` +
        `<text x="${x}" y="252" text-anchor="middle" class="tw-small tw-strong">${net > 0.5 ? `fluid leaves (net ${Math.round(net)})` : net < -0.5 ? `fluid returns (net ${Math.round(-net)})` : 'balanced'}</text>`;
    };
    const draw = () => {
      stage.innerHTML = svgOpen(560, 272, `Capillary with Pc ${pca} at the arterial end, ${pcv} at the venous end, and a protein pull of ${pic} mmHg.`) +
        `<defs><marker id="sb-out" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" class="sb-h-out"/></marker><marker id="sb-in" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" class="sb-h-in"/></marker></defs>` +
        `<text x="548" y="70" text-anchor="end" class="tw-tiny tw-muted">tissue</text>` +
        `<rect x="40" y="154" width="480" height="56" rx="28" class="sb-cap"/>` +
        `<text x="280" y="187" text-anchor="middle" class="tw-tiny tw-muted">capillary: arterial end → venous end</text>` +
        end(140, pca, `Arterial end (Pc ${pca})`) + end(420, pcv, `Venous end (Pc ${pcv})`) + `</svg>`;
      wrap.querySelector('.sb-pc').textContent = pca; wrap.querySelector('.sb-pi').textContent = pic;
      wrap.querySelector('.sb-say').innerHTML = sc ? SCEN[sc].say : 'Custom values: compare the push out and the pull in at each end. Whichever is bigger decides which way fluid moves.';
      wrap.querySelectorAll('[data-sc]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sc === sc)));
    };
    wrap.querySelectorAll('[data-sc]').forEach(b => b.addEventListener('click', () => { set(b.dataset.sc); draw(); }));
    rPc.addEventListener('input', () => { sc = null; const d = Number(rPc.value) - pca; pca += d; pcv = Math.max(2, pcv + d); draw(); });
    rPi.addEventListener('input', () => { sc = null; pic = Number(rPi.value); draw(); });
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    set(sc); draw();
  }
  W.register('starling-balance', starlingBalance);

  // ---------- Diastole clock (Chapter 23, §5) ----------
  function diastoleClock(fig) {
    const wrap = document.createElement('div');
    wrap.className = 'dc-wrap';
    wrap.innerHTML = `<div class="tw-stage"></div><label class="lv-slider"><span>Heart rate: <strong class="dc-hr"></strong> beats/min</span><input type="range" min="60" max="180" step="5" value="70" aria-label="Heart rate in beats per minute"></label><p class="lv-readout dc-say" aria-live="polite"></p>`;
    const stage = wrap.querySelector('.tw-stage'), range = wrap.querySelector('input');
    const draw = () => {
      const hr = Number(range.value), beat = 60 / hr, sys = 0.29 - 0.05 * (hr - 70) / 80, dia = beat - sys;
      const W0 = 40, WB = 480, scale = WB / 1.0;   // 1.0 s = full width
      const perMin = dia * hr, frac = dia / beat;
      stage.innerHTML = svgOpen(560, 170, `At ${hr} beats per minute each beat lasts ${beat.toFixed(2)} s, of which diastole is ${dia.toFixed(2)} s.`) +
        `<text x="${W0}" y="22" class="tw-tiny tw-strong">One beat (${beat.toFixed(2)} s), drawn to scale (full width = 1 s)</text>` +
        `<rect x="${W0}" y="32" width="${sys * scale}" height="40" rx="6" class="dc-sys"/><rect x="${W0 + sys * scale}" y="32" width="${dia * scale}" height="40" rx="6" class="dc-dia"/>` +
        `<text x="${W0 + sys * scale / 2}" y="57" text-anchor="middle" class="tw-tiny tw-strong">systole ${sys.toFixed(2)} s</text>` +
        (dia * scale > 120 ? `<text x="${W0 + sys * scale + dia * scale / 2}" y="57" text-anchor="middle" class="tw-tiny tw-strong">diastole ${dia.toFixed(2)} s</text>` : `<text x="${W0 + sys * scale + dia * scale + 6}" y="57" class="tw-tiny tw-strong">diastole ${dia.toFixed(2)} s</text>`) +
        `<text x="${W0}" y="104" class="tw-tiny tw-strong">Diastole per minute: time the left ventricle is perfused</text>` +
        `<rect x="${W0}" y="114" width="${WB}" height="22" rx="6" class="dc-track"/><rect x="${W0}" y="114" width="${WB * perMin / 60}" height="22" rx="6" class="dc-dia"/>` +
        `<text x="${W0 + WB}" y="156" text-anchor="end" class="tw-tiny tw-strong">${perMin.toFixed(0)} s of every 60 s (${Math.round(frac * 100)}%)</text></svg>`;
      wrap.querySelector('.dc-hr').textContent = hr;
      wrap.querySelector('.dc-say').innerHTML = frac < 0.42
        ? `<strong>Diastole is now only ${Math.round(frac * 100)}% of each beat.</strong> The left ventricle has little time to be perfused, while its oxygen demand is higher. With a narrowed coronary artery, this can cause ischaemia.`
        : `At ${hr} beats/min, diastole fills <strong>${Math.round(frac * 100)}%</strong> of each beat. Raise the rate: systole shortens only a little, so diastole takes almost all of the cut.`;
    };
    range.addEventListener('input', draw);
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    draw();
  }
  W.register('diastole-clock', diastoleClock);
  // ---------- Reflex tracer (Chapter 18, §3) ----------
  const RT = {
    rise: {label: 'Blood pressure rises', steps: [
      ['Blood pressure', 1, 'Arterial pressure rises and stretches the walls of the carotid sinus and aortic arch.'],
      ['Baroreceptors', 1, 'More stretch, so they fire faster.'],
      ['IX and X → NTS', 1, 'More signals reach the NTS in the medulla.'],
      ['Depressor area', 1, 'The NTS excites the depressor area, which inhibits the pressor area.'],
      ['Sympathetic firing', -1, 'Less sympathetic drive to the heart, arterioles and veins.'],
      ['Vagal firing', 1, 'The NTS also excites the vagal neurons, so more vagal firing reaches the SA node.'],
      ['Heart and vessels', 0, 'The heart beats slower and less forcefully; arterioles dilate; veins relax.'],
      ['Blood pressure', -1, 'Cardiac output and resistance fall, so pressure falls back towards normal.']],
      sum: [['Heart rate', -1], ['Contractility', -1], ['Arterioles', -1, 'dilate'], ['Veins', -1, 'relax'], ['Blood pressure', -1, 'back to normal']]},
    fall: {label: 'Blood pressure falls', steps: [
      ['Blood pressure', -1, 'Arterial pressure falls, for example after a bleed, so the arterial walls stretch less.'],
      ['Baroreceptors', -1, 'Less stretch, so they fire less.'],
      ['IX and X → NTS', -1, 'Fewer signals reach the NTS in the medulla.'],
      ['Depressor area', -1, 'The depressor area is no longer excited, so the pressor area is released.'],
      ['Sympathetic firing', 1, 'More sympathetic drive to the heart, arterioles and veins.'],
      ['Vagal firing', -1, 'Vagal firing to the SA node falls.'],
      ['Heart and vessels', 0, 'The heart beats faster (tachycardia) and harder; arterioles constrict; veins squeeze stored blood towards the heart.'],
      ['Blood pressure', 1, 'Cardiac output and resistance rise, so pressure rises back towards normal.']],
      sum: [['Heart rate', 1], ['Contractility', 1], ['Arterioles', 1, 'constrict'], ['Veins', 1, 'constrict'], ['Blood pressure', 1, 'back to normal']]},
    icp: {label: 'Intracranial pressure rises', steps: [
      ['Intracranial pressure', 1, 'A tumour, blood clot or hydrocephalus raises the pressure inside the skull.'],
      ['Cerebral perfusion pressure', -1, 'CPP = MAP − ICP, so less blood reaches the medulla.'],
      ['Vasomotor centre', 1, 'Its own hypoxia and high CO₂ stimulate it directly.'],
      ['Sympathetic firing', 1, 'A massive sympathetic discharge constricts the arterioles.'],
      ['Blood pressure', 1, 'Arterial pressure rises sharply, forcing blood back into the brain.'],
      ['Baroreceptors', 1, 'They detect the high pressure and fire faster.'],
      ['Vagal firing', 1, 'The baroreflex increases vagal firing to the SA node.'],
      ['Heart rate', -1, 'The heart slows: high blood pressure with bradycardia, the Cushing reflex.']],
      sum: [['Heart rate', -1], ['Arterioles', 1, 'constrict'], ['Blood pressure', 1, 'high'], ['Breathing', 0, 'irregular']]}
  };
  function reflexTracer(fig) {
    const wrap = document.createElement('div');
    wrap.className = 'rt-wrap';
    wrap.innerHTML = `<div class="tw-controls rt-scen" role="group" aria-label="Choose a starting change">${Object.entries(RT).map(([k, s]) => `<button type="button" class="tw-btn" data-sc="${k}" aria-pressed="false">${s.label}</button>`).join('')}</div>` +
      `<ol class="rt-chain" aria-live="polite"></ol><div class="rt-sum"></div>` +
      `<div class="tw-controls rt-nav"><button type="button" class="tw-btn" data-go="-1">Back</button><span class="rt-count"></span><button type="button" class="tw-btn" data-go="1">Next</button></div>`;
    let sc = 'fall', i = 0;
    const arrow = d => d > 0 ? '<span class="rt-up" aria-label="rises">↑</span>' : d < 0 ? '<span class="rt-down" aria-label="falls">↓</span>' : '<span class="rt-eq" aria-hidden="true">→</span>';
    const draw = () => {
      const s = RT[sc], n = s.steps.length;
      wrap.querySelector('.rt-chain').innerHTML = s.steps.slice(0, i + 1).map(([name, d, say], k) =>
        `<li class="${k === i ? 'is-now' : ''}"><span class="rt-badge">${arrow(d)}</span><span><strong>${name}</strong> ${say}</span></li>`).join('');
      wrap.querySelector('.rt-sum').innerHTML = i === n - 1 ? `<p class="lv-readout"><strong>Overall:</strong> ${s.sum.map(([k, d, w]) => `${k} ${arrow(d)}${w ? ' ' + w : ''}`).join(' · ')}</p>` : '';
      wrap.querySelector('.rt-count').textContent = `Step ${i + 1} of ${n}`;
      wrap.querySelector('[data-go="-1"]').disabled = i === 0;
      wrap.querySelector('[data-go="1"]').disabled = i === n - 1;
      wrap.querySelectorAll('[data-sc]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sc === sc)));
    };
    wrap.querySelectorAll('[data-sc]').forEach(b => b.addEventListener('click', () => { sc = b.dataset.sc; i = 0; draw(); }));
    wrap.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { i = Math.max(0, Math.min(RT[sc].steps.length - 1, i + Number(b.dataset.go))); draw(); }));
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    draw();
  }
  W.register('reflex-tracer', reflexTracer);
})();
