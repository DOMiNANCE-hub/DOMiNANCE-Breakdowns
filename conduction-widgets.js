/* DOMiNANCE Breakdowns — conduction widgets (Chapter 3).
 * conduction-timeline: one beat's signal travelling SA → atria → AV pause → His → Purkinje, drawn in step with an ECG strip.
 * pacemaker-slope: SA node voltage for four nerve states, showing how the phase 4 climb sets heart rate. */
(() => {
  'use strict';
  const W = window.DOMWidgets;
  if (!W) return;
  const {svgOpen, keepDescription, nextId} = W.helpers;
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- 1. Conduction timeline (§6) ----------
  // schematic times in ms: P 0–90, AV pause 90–140, His + branches 140–165, ventricles (QRS) 165–245
  const STAGES = [
    {t: 10, title: '1. The SA node fires', text: 'The beat starts in the SA node, high in the right atrium.'},
    {t: 90, title: '2. The atria activate: the P wave', text: 'The signal spreads across both atria. The ECG draws the P wave.'},
    {t: 140, title: '3. The AV node holds the signal back', text: 'The signal crawls through the AV node: the AV delay. The ECG stays flat (the PR segment) while the atria finish contracting.'},
    {t: 165, title: '4. Down the bundle of His and the bundle branches', text: 'The signal races through the fibrous barrier and down both sides of the wall between the ventricles.'},
    {t: 245, title: '5. The Purkinje fibres activate both ventricles: the QRS', text: 'The Purkinje fibres spread the signal through both ventricles within about 0.1 s, so they contract together. The ECG draws the QRS complex.'}
  ];
  const EB = 340;   // ECG baseline y
  function ecgY(t) {
    const base = EB, bump = (a, b, h) => (t > a && t < b ? -h * Math.sin(Math.PI * (t - a) / (b - a)) : 0);
    let y = base + bump(10, 90, 12);
    if (t >= 165 && t < 180) y += 6 * ((t - 165) / 15);
    else if (t >= 180 && t < 195) y += 6 - 62 * ((t - 180) / 15);
    else if (t >= 195 && t < 212) y += -56 + 72 * ((t - 195) / 17);
    else if (t >= 212 && t < 228) y += 16 - 16 * ((t - 212) / 16);
    return y;
  }
  function conductionTimeline(fig) {
    const id = nextId('ct'), X = t => 30 + t * 1.6;   // 0–300 ms → x 30–510
    const ecg = Array.from({length: 301}, (_, t) => `${t ? 'L' : 'M'}${X(t).toFixed(1)} ${ecgY(t).toFixed(1)}`).join(' ');
    const svg = svgOpen(540, 384, 'A heart outline with the conducting system, above an ECG strip. The signal starts at the SA node, spreads across the atria (P wave), pauses at the AV node (flat PR segment), then runs down the bundle of His, the bundle branches and the Purkinje fibres so both ventricles activate together (QRS complex).') +
      `<defs><clipPath id="${id}-clip"><rect x="0" y="270" width="0" height="114" class="ct-reveal"/></clipPath></defs>` +
      // chambers (patient's right on the viewer's left)
      `<path d="M52 20 H222 V122 H56 Q40 122 40 106 V36 Q40 20 52 20 Z" class="ct-ch ct-atria"/>` +
      `<path d="M238 20 H408 Q420 20 420 36 V106 Q420 122 404 122 H238 Z" class="ct-ch ct-atria"/>` +
      `<path d="M40 140 H222 V262 Q160 262 100 225 Q40 185 40 140 Z" class="ct-ch ct-vent"/>` +
      `<path d="M238 140 H420 Q420 185 360 225 Q300 262 238 262 Z" class="ct-ch ct-vent"/>` +
      `<text x="50" y="112" class="tw-tiny tw-strong">Right atrium</text><text x="330" y="96" text-anchor="middle" class="tw-tiny tw-strong">Left atrium</text>` +
      `<text x="128" y="186" text-anchor="middle" class="tw-tiny tw-strong">Right ventricle</text><text x="334" y="186" text-anchor="middle" class="tw-tiny tw-strong">Left ventricle</text>` +
      `<line x1="30" y1="131" x2="430" y2="131" class="ct-ring"/><text x="436" y="135" class="tw-tiny tw-muted">fibrous ring</text>` +
      // conducting system
      `<path d="M84 42 Q140 80 216 118" class="ct-path"/><path d="M84 42 Q200 22 320 46" class="ct-path ct-faint"/>` +
      `<path d="M222 120 H230 V150 M230 150 Q226 200 214 250 M230 150 Q234 200 246 250" class="ct-path"/>` +
      `<path d="M214 250 Q100 240 60 160 M246 250 Q360 240 400 160" class="ct-path ct-faint"/>` +
      `<circle cx="84" cy="42" r="8" class="ct-node ct-sa"/><text x="50" y="70" class="tw-tiny tw-strong">SA node</text>` +
      `<circle cx="222" cy="120" r="8" class="ct-node ct-av"/><text x="242" y="116" class="tw-tiny tw-strong">AV node</text>` +
      `<text x="242" y="158" class="tw-tiny tw-strong">His bundle</text>` +
      `<text x="436" y="186" class="tw-tiny tw-strong">Purkinje</text><text x="436" y="200" class="tw-tiny tw-strong">fibres</text><path d="M434 182 L398 166" class="ct-pointer"/>` +
      `<text x="150" y="158" text-anchor="middle" class="tw-small tw-strong ct-delay">AV delay</text>` +
      `<circle r="7" class="ct-signal" cx="84" cy="42"/>` +
      // ECG strip
      `<line x1="${X(0)}" y1="${EB}" x2="${X(300)}" y2="${EB}" class="ct-base"/>` +
      `<path d="${ecg}" class="ct-ecg" clip-path="url(#${id}-clip)"/>` +
      `<text x="${X(50)}" y="${EB - 22}" text-anchor="middle" class="tw-tiny ct-lab" data-from="60">P</text>` +
      `<text x="${X(115)}" y="${EB - 10}" text-anchor="middle" class="tw-tiny ct-lab" data-from="130">PR segment</text>` +
      `<text x="${X(205)}" y="${EB - 66}" text-anchor="middle" class="tw-tiny ct-lab" data-from="200">QRS</text>` +
      `<path d="M${X(0)} ${EB + 24} H${X(165)}" class="ct-bracket ct-lab" data-from="165"/><text x="${X(82)}" y="${EB + 38}" text-anchor="middle" class="tw-tiny ct-lab" data-from="165">PR interval</text>` +
      `<text x="${X(300)}" y="${EB + 38}" text-anchor="end" class="tw-tiny tw-muted">ECG (schematic)</text></svg>`;
    const wrap = document.createElement('div');
    wrap.className = 'tw-stepper ct-wrap';
    wrap.innerHTML = `<div class="tw-stage">${svg}</div><div class="tw-step-copy" aria-live="polite"><strong class="tw-step-title"></strong><span class="tw-step-text"></span></div>` +
      `<div class="tw-controls"><button type="button" class="tw-btn ct-play">▶ Play one beat</button><span class="tw-dots">${STAGES.map((_, j) => `<button type="button" class="tw-dot" aria-label="Show stage ${j + 1}">${j + 1}</button>`).join('')}</span></div>`;
    const q = s => wrap.querySelector(s);
    const sig = q('.ct-signal'), reveal = q('.ct-reveal');
    const pt = t => {   // signal position along the pathway at time t (ms)
      const lerp = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      if (t < 90) { const f = t / 90; return [(1 - f) ** 2 * 84 + 2 * (1 - f) * f * 140 + f * f * 216, (1 - f) ** 2 * 42 + 2 * (1 - f) * f * 80 + f * f * 118]; }
      if (t < 140) return [222, 120];
      if (t < 150) return lerp([230, 120], [230, 150], (t - 140) / 10);
      if (t < 165) return lerp([230, 150], [230, 205], (t - 150) / 15);
      return lerp([230, 205], [230, 250], Math.min(1, (t - 165) / 80));
    };
    const show = t => {
      const [x, y] = pt(t);
      sig.setAttribute('cx', x); sig.setAttribute('cy', y);
      sig.classList.toggle('is-gone', t >= 245);
      reveal.setAttribute('width', X(Math.min(t, 300)));
      const atria = Math.max(0, Math.min(1, (t - 5) / 80)), vent = Math.max(0, Math.min(1, (t - 165) / 80));
      wrap.querySelectorAll('.ct-atria').forEach(e => e.style.setProperty('--on', atria.toFixed(2)));
      wrap.querySelectorAll('.ct-vent').forEach(e => e.style.setProperty('--on', vent.toFixed(2)));
      q('.ct-delay').classList.toggle('is-on', t >= 90 && t < 145);
      q('.ct-av').classList.toggle('is-on', t >= 90 && t < 145);
      q('.ct-sa').classList.toggle('is-on', t < 20);
      wrap.querySelectorAll('.ct-lab').forEach(e => e.classList.toggle('is-on', t >= Number(e.dataset.from)));
      const k = STAGES.reduce((acc, s, j) => (t >= s.t - 1 ? j : acc), 0);
      q('.tw-step-title').textContent = STAGES[k].title;
      q('.tw-step-text').textContent = STAGES[k].text;
      wrap.querySelectorAll('.tw-dot').forEach((d, j) => d.setAttribute('aria-current', j === k ? 'step' : 'false'));
    };
    let raf = 0;
    const stop = () => { cancelAnimationFrame(raf); raf = 0; q('.ct-play').disabled = false; };
    q('.ct-play').addEventListener('click', () => {
      if (reduced()) { show(300); return; }
      stop(); q('.ct-play').disabled = true;
      const t0 = performance.now(), slow = 9;   // 300 ms of heart time over 2.7 s
      const tick = now => { const t = (now - t0) / slow; show(Math.min(t, 300)); if (t < 300) raf = requestAnimationFrame(tick); else stop(); };
      raf = requestAnimationFrame(tick);
    });
    wrap.querySelectorAll('.tw-dot').forEach((d, j) => d.addEventListener('click', () => { stop(); show(STAGES[j].t); }));
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    show(10);
  }

  // ---------- 2. Pacemaker slope (§7) ----------
  const STATES = {
    vagal: {label: 'Strong vagal', mdp: -65, slope: 20, note: 'Starts lower (−65 mV) and climbs slowly, so threshold comes late.'},
    rest: {label: 'Rest (vagal tone)', mdp: -60, slope: 33.3, note: 'Constant vagal tone makes the climb a little shallower than the SA node’s own rate.'},
    none: {label: 'No nerve input', mdp: -60, slope: 50, note: 'The SA node’s own rate, with no nerve braking or speeding it.'},
    symp: {label: 'Sympathetic', mdp: -60, slope: 100, note: 'Same starting point, much steeper climb, so threshold comes quickly.'}
  };
  const THR = -40, PEAK = 10;
  function trace(st, dur = 3) {   // voltage path over `dur` seconds
    const climb = (THR - st.mdp) / st.slope, cyc = 0.2 + climb, pts = [];
    for (let t = 0; t <= dur + 1e-9; t += 0.005) {
      const ph = t % cyc;
      let v;
      if (ph < climb) v = st.mdp + st.slope * ph;
      else if (ph < climb + 0.05) v = THR + (PEAK - THR) * ((ph - climb) / 0.05);
      else v = PEAK - (PEAK - st.mdp) * ((ph - climb - 0.05) / 0.15);
      pts.push([t, v]);
    }
    return {pts, bpm: Math.round(60 / cyc), climb};
  }
  function pacemakerSlope(fig) {
    const X = t => 56 + t * 136, Y = v => 30 + (20 - v) * 2.2;   // 3 s → 408 px; +20..−70 mV
    const path = pts => pts.map(([t, v], i) => `${i ? 'L' : 'M'}${X(t).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
    const ref = trace(STATES.none);
    const wrap = document.createElement('div');
    wrap.className = 'ps-wrap';
    wrap.innerHTML = `<div class="tw-controls ps-btns" role="group" aria-label="Nerve input">${Object.entries(STATES).map(([k, s]) => `<button type="button" class="tw-btn" data-state="${k}" aria-pressed="false">${s.label}</button>`).join('')}</div><div class="tw-stage"></div><p class="ps-readout" aria-live="polite"></p>`;
    const stage = wrap.querySelector('.tw-stage'), out = wrap.querySelector('.ps-readout');
    const draw = key => {
      const st = STATES[key], tr = trace(st);
      stage.innerHTML = svgOpen(540, 240, `SA node voltage over 3 seconds, ${st.label}: about ${tr.bpm} beats per minute.`) +
        [20, 0, -20, -40, -60].map(v => `<line x1="56" y1="${Y(v)}" x2="464" y2="${Y(v)}" class="ps-grid"/><text x="50" y="${Y(v) + 4}" text-anchor="end" class="tw-tiny tw-muted">${v}</text>`).join('') +
        `<text x="10" y="18" class="tw-tiny tw-muted">mV</text>` +
        `<line x1="56" y1="${Y(THR)}" x2="464" y2="${Y(THR)}" class="ps-thr"/><text x="470" y="${Y(THR) + 4}" class="tw-tiny tw-strong">threshold</text>` +
        (key === 'none' ? '' : `<path d="${path(ref.pts)}" class="ps-ref"/>`) +
        `<path d="${path(tr.pts)}" class="ps-trace ps-${key}"/>` +
        [0, 1, 2, 3].map(s => `<text x="${X(s)}" y="232" text-anchor="middle" class="tw-tiny tw-muted">${s} s</text>`).join('') +
        (key === 'none' ? '' : `<text x="464" y="16" text-anchor="end" class="tw-tiny tw-muted">faint line: no nerve input (100/min)</text>`) + '</svg>';
      out.innerHTML = `<strong>${tr.bpm} beats/min.</strong> ${st.note}`;
      wrap.querySelectorAll('[data-state]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.state === key)));
    };
    wrap.querySelectorAll('[data-state]').forEach(b => b.addEventListener('click', () => draw(b.dataset.state)));
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    draw('rest');
  }

  W.register('conduction-timeline', conductionTimeline);
  W.register('pacemaker-slope', pacemakerSlope);
})();
