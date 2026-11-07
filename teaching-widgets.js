/* DOMiNANCE Breakdowns — chapter teaching widgets (diagrams, steppers, slider, answer feedback).
 * Chapter Markdown contains placeholders such as <figure class="teaching-widget" data-widget="wiggers">
 * whose text is the accessible description. This script draws the visual and keeps that text visible.
 * No dependencies; works offline; respects light/dark themes through CSS variables. */
(() => {
  'use strict';
  const main = document.getElementById('main');
  if (!main) return;
  const NS = 'http://www.w3.org/2000/svg';
  let uid = 0;

  // ---------- small helpers ----------
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  function smooth(points) {
    // Catmull-Rom spline through the points, converted to cubic Bézier segments.
    if (points.length < 2) return '';
    let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i], p1 = points[i], p2 = points[i + 1], p3 = points[i + 2] || p2;
      const k = 0.16;
      const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
      const c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  }
  const line = pts => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
  const svgOpen = (w, h, label, cls = '') => `<svg class="tw-svg ${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" xmlns="${NS}">`;
  const keepDescription = fig => {
    const p = fig.querySelector(':scope > p');
    if (p) p.classList.add('tw-description');
    // Descriptions generated from a build spec are for screen readers only.
    if (p && fig.dataset.desc === 'sr') p.classList.add('tw-visually-hidden');
    return p;
  };

  // ---------- 1. Chamber timeline (Section 1) ----------
  function chamberTimeline(fig) {
    const x0 = 96, x1 = 500, T = 0.8, X = t => x0 + (x1 - x0) * t / T;
    const bar = (y, a, b, cls, text) => `<rect x="${X(a)}" y="${y}" width="${X(b) - X(a)}" height="34" rx="6" class="${cls}"/>` +
      (text ? `<text x="${(X(a) + X(b)) / 2}" y="${y + 22}" text-anchor="middle" class="tw-bar-text">${text}</text>` : '');
    const svg = svgOpen(520, 236, 'Timeline of one 0.8 second heartbeat: atrial systole first, then ventricular systole, then both chambers relaxed for about 0.4 seconds.') +
      `<rect x="${X(0.4)}" y="22" width="${X(0.8) - X(0.4)}" height="122" rx="8" class="tw-overlap"/>` +
      `<text x="8" y="58" class="tw-row-label">Atria</text>` + bar(36, 0, 0.1, 'tw-sys', '') + bar(36, 0.1, 0.8, 'tw-dia', 'Diastole') +
      `<text x="8" y="118" class="tw-row-label">Ventricles</text>` + bar(96, 0, 0.1, 'tw-dia', '') + bar(96, 0.1, 0.4, 'tw-sys', 'Systole 0.3 s') + bar(96, 0.4, 0.8, 'tw-dia', 'Diastole') +
      `<text x="${X(0.05)}" y="30" text-anchor="middle" class="tw-small tw-strong">Atrial systole</text>` +
      [0, 0.1, 0.4, 0.8].map(t => `<line x1="${X(t)}" y1="146" x2="${X(t)}" y2="152" class="tw-axis"/><text x="${X(t)}" y="168" text-anchor="middle" class="tw-small">${t} s</text>`).join('') +
      `<line x1="${x0}" y1="146" x2="${x1}" y2="146" class="tw-axis"/>` +
      `<path d="M${X(0.4)} 184 v6 H${X(0.48)} v-6" class="tw-bracket"/><path d="M${X(0.48) + 4} 184 v6 H${X(0.8)} v-6" class="tw-bracket"/>` +
      `<text x="${X(0.44)}" y="206" text-anchor="middle" class="tw-small">pause</text><text x="${X(0.44)}" y="222" text-anchor="middle" class="tw-small tw-muted">no filling</text>` +
      `<text x="${X(0.64)}" y="206" text-anchor="middle" class="tw-small">passive filling</text>` +
      `<text x="${X(0.6)}" y="16" text-anchor="middle" class="tw-small tw-strong">Both relaxed ≈ 0.4 s</text></svg>`;
    fig.querySelector('figcaption').insertAdjacentHTML('afterend', svg);
    keepDescription(fig);
  }

  // ---------- 2. Diastolic pressure plot (Section 3) ----------
  function diastolicPlot(fig) {
    const X = t => 70 + 420 * t, P = p => 150 - p * 9, V = v => 270 - (v - 50) * 1.1;
    const la = [[0, 11], [0.06, 6.5], [0.15, 4.6], [0.35, 4.3], [0.62, 4.6], [0.72, 5], [0.8, 8.5], [0.88, 6.4], [1, 6]];
    const lv = [[0, 10], [0.03, 4.5], [0.12, 3], [0.35, 3.9], [0.62, 4.3], [0.72, 4.8], [0.8, 8], [0.88, 6.2], [1, 6]];
    const vol = [[0, 50], [0.05, 66], [0.12, 90], [0.22, 104], [0.4, 110], [0.62, 114], [0.72, 116], [0.8, 126], [0.88, 130], [1, 130]];
    const svg = svgOpen(520, 304, 'Atrial and ventricular pressure and ventricular volume during ventricular filling.') +
      `<rect x="${X(0)}" y="18" width="${X(0.22) - X(0)}" height="268" class="tw-band"/><rect x="${X(0.72)}" y="18" width="${X(0.9) - X(0.72)}" height="268" class="tw-band"/>` +
      `<text x="${X(0.11)}" y="34" text-anchor="middle" class="tw-small tw-strong">Rapid filling</text>` +
      `<text x="${X(0.47)}" y="34" text-anchor="middle" class="tw-small tw-strong">Diastasis</text>` +
      `<text x="${X(0.81)}" y="34" text-anchor="middle" class="tw-small tw-strong">Atrial kick</text>` +
      `<text x="8" y="${P(7)}" class="tw-row-label">Pressure</text><text x="8" y="${V(95)}" class="tw-row-label">Volume</text>` +
      `<path d="${smooth(la.map(([t, p]) => [X(t), P(p)]))}" class="tw-la"/>` +
      `<path d="${smooth(lv.map(([t, p]) => [X(t), P(p)]))}" class="tw-lv"/>` +
      `<path d="${smooth(vol.map(([t, v]) => [X(t), V(v)]))}" class="tw-vol"/>` +
      `<text x="${X(0.3)}" y="${P(4.4) - 9}" class="tw-small tw-la-text">Left atrium</text>` +
      `<text x="${X(0.3)}" y="${P(3.8) + 22}" class="tw-small tw-lv-text">Left ventricle</text>` +
      `<text x="${X(0.8)}" y="${P(10.4)}" text-anchor="middle" class="tw-small tw-la-text">a wave</text>` +
      `<text x="${X(0.95)}" y="${V(130) - 8}" text-anchor="middle" class="tw-small tw-vol-text">EDV</text>` +
      `<line x1="${X(0)}" y1="18" x2="${X(0)}" y2="286" class="tw-event"/><text x="${X(0) + 4}" y="296" class="tw-small">↑ Mitral opens</text>` +
      `<text x="490" y="296" text-anchor="end" class="tw-small tw-muted">time →</text></svg>`;
    fig.querySelector('figcaption').insertAdjacentHTML('afterend', svg);
    keepDescription(fig);
  }

  // ---------- 3. Valve stepper (Section 4) ----------
  function valveStepper(fig) {
    const steps = [
      {title: 'Step 1: the AV valves close', text: 'The ventricles start contracting. Ventricular pressure rises above atrial pressure, so the mitral and tricuspid valves close (S1). The aortic and pulmonary valves are still shut.', av: false, sl: false, vent: 'pressure rising'},
      {title: 'Step 2: all four valves closed', text: 'All four valves are shut. Ventricular pressure climbs steeply, but no blood can enter or leave, so volume stays at EDV.', av: false, sl: false, vent: 'pressure climbing · volume fixed'},
      {title: 'Step 3: the semilunar valves open', text: 'Ventricular pressure now exceeds arterial pressure, so the aortic and pulmonary valves open and ejection begins.', av: false, sl: true, vent: 'ejecting'}
    ];
    const id = 'tw-step-' + (++uid);
    const valve = (x, y, open, label) => open
      ? `<g class="tw-valve open"><line x1="${x}" y1="${y - 16}" x2="${x + 9}" y2="${y - 22}"/><line x1="${x}" y1="${y + 16}" x2="${x + 9}" y2="${y + 22}"/></g><text x="${x + 4}" y="${y + 40}" text-anchor="middle" class="tw-tiny">${label}</text>`
      : `<g class="tw-valve shut"><line x1="${x}" y1="${y - 16}" x2="${x}" y2="${y + 16}"/></g><text x="${x}" y="${y + 40}" text-anchor="middle" class="tw-tiny">${label}</text>`;
    const row = (y, side, s, names) => `<text x="8" y="${y - 30}" class="tw-small tw-strong">${side}</text>` +
      `<rect x="10" y="${y - 20}" width="104" height="40" rx="8" class="tw-chamber atrium"/><text x="62" y="${y + 5}" text-anchor="middle" class="tw-small">${names[0]}</text>` +
      valve(124, y, s.av, names[1]) +
      `<rect x="136" y="${y - 20}" width="150" height="40" rx="8" class="tw-chamber ventricle"/><text x="211" y="${y + 5}" text-anchor="middle" class="tw-small">${names[2]}</text>` +
      valve(296, y, s.sl, names[3]) +
      `<rect x="${s.sl ? 316 : 308}" y="${y - 20}" width="${s.sl ? 116 : 124}" height="40" rx="8" class="tw-chamber artery"/><text x="372" y="${y + 5}" text-anchor="middle" class="tw-small">${names[4]}</text>` +
      (s.sl ? `<path d="M234 ${y} H312" class="tw-flow" marker-end="url(#${id}-arrow)"/>` : '');
    const plot = i => {
      const X = t => 40 + 380 * t, P = p => 150 - p * 0.9;
      const la = [[0, 6], [0.15, 6], [0.3, 9], [0.45, 7], [1, 6]].map(([t, p]) => [X(t), P(p)]);
      const lv = [[0, 4], [0.1, 5], [0.2, 12], [0.4, 45], [0.62, 80], [0.8, 100], [1, 112]].map(([t, p]) => [X(t), P(p)]);
      const ao = [[0, 84], [0.6, 80], [0.7, 88], [0.85, 102], [1, 110]].map(([t, p]) => [X(t), P(p)]);
      const mark = [[0.17, 6], [0.4, 45], [0.62, 80]][i];
      return `<path d="${smooth(la)}" class="tw-la"/><path d="${smooth(ao)}" class="tw-ao"/><path d="${smooth(lv)}" class="tw-lv"/>` +
        `<text x="${X(1) + 6}" y="${P(6) + 4}" class="tw-tiny tw-la-text">LA</text><text x="${X(1) + 6}" y="${P(118)}" class="tw-tiny tw-lv-text">LV</text><text x="${X(1) + 6}" y="${P(104)}" class="tw-tiny tw-ao-text">Aorta</text>` +
        (i === 1 ? `<rect x="${X(0.17)}" y="${P(118)}" width="${X(0.62) - X(0.17)}" height="${P(0) - P(118)}" class="tw-band"/>` : '') +
        `<circle cx="${X(mark[0])}" cy="${P(mark[1])}" r="7" class="tw-mark"/>` +
        `<line x1="${X(0)}" y1="${P(0)}" x2="${X(1)}" y2="${P(0)}" class="tw-axis"/><text x="${X(0)}" y="${P(0) + 16}" class="tw-tiny tw-muted">LV pressure crosses LA first, then the aorta →</text>`;
    };
    const draw = i => {
      const s = steps[i];
      const svg = svgOpen(470, 400, s.title + '. ' + s.text) +
        `<defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="tw-arrowhead"/></marker></defs>` +
        row(60, 'Right heart', s, ['RA', 'Tricuspid', 'RV', 'Pulmonary', 'Pulm. artery']) +
        row(160, 'Left heart', s, ['LA', 'Mitral', 'LV', 'Aortic', 'Aorta']) +
        `<text x="10" y="222" class="tw-tiny tw-muted">Atria: relaxed, filling with venous blood · Ventricles: ${s.vent}</text>` +
        `<g transform="translate(0,220)">${plot(i)}</g></svg>`;
      wrap.querySelector('.tw-stage').innerHTML = svg;
      wrap.querySelector('.tw-step-title').textContent = s.title;
      wrap.querySelector('.tw-step-text').textContent = s.text;
      wrap.querySelector('.tw-prev').disabled = i === 0;
      wrap.querySelector('.tw-next').disabled = i === steps.length - 1;
      wrap.querySelectorAll('.tw-dot').forEach((d, j) => d.setAttribute('aria-current', j === i ? 'step' : 'false'));
    };
    const wrap = document.createElement('div');
    wrap.className = 'tw-stepper';
    wrap.innerHTML = `<div class="tw-stage"></div><div class="tw-step-copy" aria-live="polite"><strong class="tw-step-title"></strong><span class="tw-step-text"></span></div>` +
      `<div class="tw-controls"><button type="button" class="tw-btn tw-prev">← Previous</button><span class="tw-dots">${steps.map((_, j) => `<button type="button" class="tw-dot" aria-label="Show step ${j + 1}">${j + 1}</button>`).join('')}</span><button type="button" class="tw-btn tw-next">Next →</button></div>`;
    let at = 0;
    wrap.querySelector('.tw-prev').addEventListener('click', () => draw(at = Math.max(0, at - 1)));
    wrap.querySelector('.tw-next').addEventListener('click', () => draw(at = Math.min(steps.length - 1, at + 1)));
    wrap.querySelectorAll('.tw-dot').forEach((d, j) => d.addEventListener('click', () => draw(at = j)));
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    draw(0);
  }

  // ---------- 4. Volume bar (Section 7) ----------
  function volumeBar(fig) {
    const Y = v => 210 - v * 1.4;
    const svg = svgOpen(520, 230, 'A ventricle holding 130 millilitres at end-diastole; 80 millilitres are ejected, leaving 50 millilitres. Ejection fraction 61.5 percent.') +
      `<rect x="120" y="${Y(140)}" width="110" height="${Y(0) - Y(140)}" rx="14" class="tw-tank"/>` +
      `<rect x="120" y="${Y(50)}" width="110" height="${Y(0) - Y(50)}" rx="0" class="tw-esv"/>` +
      `<rect x="120" y="${Y(130)}" width="110" height="${Y(50) - Y(130)}" class="tw-sv"/>` +
      `<line x1="112" y1="${Y(130)}" x2="238" y2="${Y(130)}" class="tw-level"/><line x1="112" y1="${Y(50)}" x2="238" y2="${Y(50)}" class="tw-level"/>` +
      `<text x="106" y="${Y(130) + 5}" text-anchor="end" class="tw-small tw-strong">EDV 130 mL</text>` +
      `<text x="106" y="${Y(50) + 5}" text-anchor="end" class="tw-small tw-strong">ESV 50 mL</text>` +
      `<path d="M248 ${Y(130)} h10 V${Y(50)} h-10" class="tw-bracket"/>` +
      `<text x="268" y="${Y(95)}" class="tw-small tw-strong">SV = 130 − 50 = 80 mL</text><text x="268" y="${Y(95) + 20}" class="tw-small">ejected this beat</text>` +
      `<path d="M248 ${Y(48)} h10 V${Y(2)} h-10" class="tw-bracket"/><text x="268" y="${Y(28)}" class="tw-small">stays behind (reserve)</text>` +
      `<text x="268" y="${Y(142)}" class="tw-small tw-strong">EF = 80 ÷ 130 × 100 ≈ 61.5%</text></svg>`;
    fig.querySelector('figcaption').insertAdjacentHTML('afterend', svg);
    keepDescription(fig);
  }

  // ---------- 5. Progressive Wiggers diagram (Section 9) ----------
  function wiggers(fig) {
    const L = 78, R = 700, T1 = 0.95, X = t => L + (R - L) * t / T1;
    const P = p => 412 - p * 2.05;              // pressure panel: 0–130 mmHg
    const V = v => 572 - (v - 40) * 1.08;       // volume panel: 40–140 mL
    const E = v => 92 - v * 54;                 // ECG panel
    const g = (t, m, s) => Math.exp(-((t - m) * (t - m)) / (2 * s * s));
    const ecg = [];
    for (let t = 0; t <= T1 + 0.0001; t += 0.002) {
      const v = 0.15 * g(t, 0.04, 0.017) - 0.12 * g(t, 0.163, 0.005) + 1.0 * g(t, 0.178, 0.0065) - 0.25 * g(t, 0.193, 0.006) + 0.3 * g(t, 0.44, 0.028) + 0.15 * g(t, 0.84, 0.017);
      ecg.push([X(t), E(v)]);
    }
    const la = [[0, 5], [0.06, 5.5], [0.1, 8.5], [0.15, 5.6], [0.19, 5.2], [0.21, 5.6], [0.235, 8.2], [0.27, 4.2], [0.3, 3.2], [0.4, 6], [0.5, 9], [0.575, 11], [0.6, 8], [0.63, 6], [0.7, 5.2], [0.8, 5.2], [0.86, 6], [0.9, 9], [0.95, 6]];
    const lv = [[0, 4.6], [0.06, 5.1], [0.1, 8], [0.15, 5.2], [0.19, 5], [0.203, 5.6], [0.215, 12], [0.23, 34], [0.25, 60], [0.27, 80], [0.3, 103], [0.36, 120], [0.42, 113], [0.47, 95], [0.49, 87], [0.505, 72], [0.525, 45], [0.55, 22], [0.57, 13], [0.585, 8], [0.6, 4.2], [0.66, 3], [0.72, 3.8], [0.8, 4.6], [0.86, 5.6], [0.9, 8.4], [0.95, 5.6]];
    const ao = [[0, 85], [0.1, 82.5], [0.2, 80.4], [0.27, 79.6], [0.3, 101], [0.36, 117], [0.42, 111], [0.47, 96], [0.495, 90], [0.505, 85], [0.517, 91.5], [0.56, 95], [0.65, 91], [0.8, 84.5], [0.95, 80.5]];
    const vol = [[0, 118], [0.06, 121], [0.1, 128], [0.14, 130], [0.22, 130], [0.27, 130], [0.3, 118], [0.34, 92], [0.38, 74], [0.44, 58], [0.5, 50], [0.54, 50], [0.58, 50], [0.61, 72], [0.65, 95], [0.7, 108], [0.76, 113], [0.82, 116], [0.86, 119], [0.9, 127], [0.95, 130]];
    const toXY = (arr, f) => arr.map(([t, v]) => [X(t), f(v)]);
    const events = [
      {t: 0.207, code: 'MC', p: 5.4, name: 'Mitral closes'},
      {t: 0.27, code: 'AO', p: 80, name: 'Aortic opens'},
      {t: 0.505, code: 'AC', p: 85, name: 'Aortic closes'},
      {t: 0.578, code: 'MO', p: 10.6, name: 'Mitral opens'}
    ];
    const bands = [
      {a: 0.06, b: 0.2, name: 'Atrial systole'}, {a: 0.207, b: 0.27, name: 'Isovolumetric contraction'},
      {a: 0.27, b: 0.505, name: 'Ejection'}, {a: 0.505, b: 0.578, name: 'Isovolumetric relaxation'}, {a: 0.578, b: 0.84, name: 'Filling'}
    ];
    const labels = [
      [0.04, E(0.15) - 8, 'P', 'tw-ecg-text'], [0.178, E(1) - 6, 'QRS', 'tw-ecg-text'], [0.44, E(0.3) - 8, 'T', 'tw-ecg-text'], [0.84, E(0.15) - 8, 'P', 'tw-ecg-text'],
      [0.1, P(8.5) - 10, 'a', 'tw-la-text'], [0.235, P(8.2) - 10, 'c', 'tw-la-text'], [0.3, P(3.2) + 18, 'x', 'tw-la-text'], [0.575, P(11) - 10, 'v', 'tw-la-text'], [0.63, P(6) + 18, 'y', 'tw-la-text'],
      [0.36, P(120) - 10, 'Left ventricle', 'tw-lv-text'], [0.7, P(91) - 10, 'Aorta', 'tw-ao-text'], [0.76, P(5.2) - 10, 'Left atrium', 'tw-la-text'],
      [0.6, P(70), 'dicrotic notch', 'tw-ao-text'],
      [0.205, V(130) - 8, 'EDV', 'tw-vol-text'], [0.535, V(50) + 20, 'ESV', 'tw-vol-text']
    ];
    const sound = (a, b, label) => {
      let d = `M${X(a)} 596`;
      const n = 12;
      for (let i = 1; i <= n; i++) d += ` L${(X(a) + (X(b) - X(a)) * i / n).toFixed(1)} ${i % 2 ? 586 : 606}`;
      return `<path d="${d}" class="tw-sound"/>`;
    };
    const clipId = 'tw-clip-' + (++uid);
    const steps = [
      {to: 0.2, band: 0, title: 'Step 1: Atrial systole', text: 'P wave, then atrial contraction: the a wave, and volume rises to EDV.'},
      {to: 0.27, band: 1, title: 'Step 2: Ventricular contraction begins', text: 'QRS, then LV pressure crosses atrial pressure: the mitral valve closes (S1), the c wave appears and volume stays flat.'},
      {to: 0.42, band: 2, title: 'Step 3: Ejection', text: 'LV pressure crosses aortic pressure: the aortic valve opens, the two traces run together and volume falls steeply, then gently. Atrial pressure dips (x descent).'},
      {to: 0.576, band: 3, title: 'Step 4: Relaxation', text: 'T wave; flow reverses and the aortic valve closes (S2, dicrotic notch). Pressure falls while volume stays at ESV; atrial pressure reaches the v wave.'},
      {to: T1, band: 4, title: 'Step 5: Filling resumes', text: 'LV pressure falls below atrial pressure: the mitral valve opens, atrial pressure falls (y descent) and volume rises again.'}
    ];
    const static_ = `${svgOpen(720, 650, 'Wiggers diagram of one heartbeat: ECG, left atrial, left ventricular and aortic pressures, left ventricular volume and heart sounds, with the four valve events where pressure curves cross.', 'tw-wiggers-svg')}` +
      `<defs><clipPath id="${clipId}"><rect class="tw-clip" x="0" y="0" width="${X(T1) + 30}" height="650"/></clipPath></defs>` +
      bands.map((b, i) => `<rect x="${X(b.a)}" y="112" width="${X(b.b) - X(b.a)}" height="508" class="tw-phase" data-band="${i}"/>`).join('') +
      // panel labels and axes
      `<text x="8" y="70" class="tw-row-label">ECG</text>` +
      `<text x="8" y="140" class="tw-row-label">Pressure</text><text x="8" y="158" class="tw-tiny tw-muted">mmHg</text>` +
      [0, 40, 80, 120].map(p => `<line x1="${L - 4}" y1="${P(p)}" x2="${R}" y2="${P(p)}" class="tw-grid"/><text x="${L - 8}" y="${P(p) + 4}" text-anchor="end" class="tw-tiny tw-muted">${p}</text>`).join('') +
      `<text x="8" y="${V(96)}" class="tw-row-label">Volume</text><text x="8" y="${V(96) + 18}" class="tw-tiny tw-muted">mL</text>` +
      [50, 130].map(v => `<line x1="${L - 4}" y1="${V(v)}" x2="${R}" y2="${V(v)}" class="tw-grid"/><text x="${L - 8}" y="${V(v) + 4}" text-anchor="end" class="tw-tiny tw-muted">${v}</text>`).join('') +
      `<text x="8" y="600" class="tw-row-label">Sounds</text>` +
      `<g clip-path="url(#${clipId})">` +
      `<path d="${line(ecg)}" class="tw-ecg"/>` +
      `<path d="${smooth(toXY(ao, P))}" class="tw-ao"/>` +
      `<path d="${smooth(toXY(lv, P))}" class="tw-lv"/>` +
      `<path d="${smooth(toXY(la, P))}" class="tw-la"/>` +
      `<path d="${smooth(toXY(vol, V))}" class="tw-vol"/>` +
      sound(0.207, 0.25, 'S1') + sound(0.505, 0.535, 'S2') +
      `</g>` +
      `<text x="${X(0.228)}" y="626" text-anchor="middle" class="tw-small tw-strong tw-timed" data-t="0.25">S1</text><text x="${X(0.52)}" y="626" text-anchor="middle" class="tw-small tw-strong tw-timed" data-t="0.535">S2</text>` +
      events.map(e => `<g class="tw-timed" data-t="${e.t}"><line x1="${X(e.t)}" y1="112" x2="${X(e.t)}" y2="620" class="tw-event"/><circle cx="${X(e.t)}" cy="${P(e.p)}" r="7" class="tw-mark"/><text x="${X(e.t)}" y="108" text-anchor="middle" class="tw-small tw-strong">${e.code}</text></g>`).join('') +
      labels.map(([t, y, text, cls]) => `<text x="${X(t)}" y="${y}" text-anchor="middle" class="tw-small tw-timed ${cls}" data-t="${text === 'dicrotic notch' ? 0.505 : t}">${text}</text>`).join('') +
      `</svg>`;
    const wrap = document.createElement('div');
    wrap.className = 'tw-wiggers';
    wrap.innerHTML = `<div class="tw-scroll" tabindex="0" aria-label="Wiggers diagram; scroll sideways on small screens">${static_}</div>` +
      `<p class="tw-legend"><span><b>MC</b> mitral closes</span><span><b>AO</b> aortic opens</span><span><b>AC</b> aortic closes</span><span><b>MO</b> mitral opens</span><span class="tw-swipe">Swipe sideways to see the whole diagram.</span></p>` +
      `<div class="tw-step-copy" aria-live="polite"><strong class="tw-step-title"></strong><span class="tw-step-text"></span></div>` +
      `<div class="tw-controls"><button type="button" class="tw-btn tw-prev">← Previous</button><span class="tw-dots">${steps.map((_, j) => `<button type="button" class="tw-dot" aria-label="Show step ${j + 1}">${j + 1}</button>`).join('')}</span><button type="button" class="tw-btn tw-next">Next →</button><button type="button" class="tw-btn tw-all">Show all</button></div>`;
    const clip = wrap.querySelector('.tw-clip');
    const phases = wrap.querySelectorAll('.tw-phase');
    const timed = wrap.querySelectorAll('.tw-timed');
    let at = 0;
    const show = i => {
      at = i;
      const all = i === -1;
      const s = all ? null : steps[i];
      const end = all ? T1 : s.to;
      clip.setAttribute('width', String(all ? X(T1) + 30 : X(s.to) + 1));
      timed.forEach(el => { el.style.visibility = Number(el.dataset.t) <= end + 0.0005 ? 'visible' : 'hidden'; });
      const box = wrap.querySelector('.tw-scroll'), svgEl = box.querySelector('svg');
      if (box.scrollWidth > box.clientWidth + 2) {
        const scale = svgEl.getBoundingClientRect().width / 720;
        const target = Math.min(box.scrollWidth - box.clientWidth, Math.max(0, X(end) * scale - box.clientWidth * 0.92));
        box.scrollTo({left: all ? 0 : target, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
      }
      phases.forEach((p, j) => p.classList.toggle('active', !all && j === s.band));
      wrap.querySelector('.tw-step-title').textContent = all ? 'The whole heartbeat' : s.title;
      wrap.querySelector('.tw-step-text').textContent = all ? 'All traces shown. Find the four crossings (MC, AO, AC, MO), then read the volume curve between them.' : s.text;
      wrap.querySelector('.tw-prev').disabled = !all && i === 0;
      wrap.querySelector('.tw-next').disabled = all || i === steps.length - 1;
      wrap.querySelectorAll('.tw-dot').forEach((d, j) => d.setAttribute('aria-current', j === i ? 'step' : 'false'));
      wrap.querySelector('.tw-all').setAttribute('aria-pressed', String(all));
    };
    wrap.querySelector('.tw-prev').addEventListener('click', () => show(at === -1 ? steps.length - 1 : Math.max(0, at - 1)));
    wrap.querySelector('.tw-next').addEventListener('click', () => show(Math.min(steps.length - 1, at + 1)));
    wrap.querySelector('.tw-all').addEventListener('click', () => show(-1));
    wrap.querySelectorAll('.tw-dot').forEach((d, j) => d.addEventListener('click', () => show(j)));
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    show(0);
  }

  // ---------- 6. S2 timing (Section 10) ----------
  function s2Timing(fig) {
    const row = (y, label, a2, p2) => `<text x="8" y="${y + 5}" class="tw-row-label">${label}</text>` +
      `<line x1="130" y1="${y}" x2="500" y2="${y}" class="tw-axis"/>` +
      `<line x1="170" y1="${y - 16}" x2="170" y2="${y + 16}" class="tw-s1"/><text x="170" y="${y - 22}" text-anchor="middle" class="tw-small">S1</text>` +
      `<line x1="${a2}" y1="${y - 16}" x2="${a2}" y2="${y + 16}" class="tw-a2"/><text x="${a2 - 3}" y="${y - 22}" text-anchor="end" class="tw-small tw-ao-text">A2</text>` +
      `<line x1="${p2}" y1="${y - 16}" x2="${p2}" y2="${y + 16}" class="tw-p2"/><text x="${p2 + 3}" y="${y - 22}" text-anchor="start" class="tw-small tw-lv-text">P2</text>` +
      `<path d="M${a2} ${y + 24} v6 H${p2} v-6" class="tw-bracket"/>`;
    const svg = svgOpen(520, 200, 'S2 timing: in expiration A2 and P2 are almost together; in inspiration A2 is slightly earlier and P2 clearly later.') +
      row(56, 'Expiration', 370, 384) + `<text x="377" y="98" text-anchor="middle" class="tw-tiny tw-muted">tiny gap</text>` +
      row(146, 'Inspiration', 362, 420) + `<text x="391" y="188" text-anchor="middle" class="tw-tiny tw-muted">wider gap: P2 delayed</text>` +
      `<text x="500" y="14" text-anchor="end" class="tw-tiny tw-muted">schematic, not to scale</text></svg>`;
    fig.querySelector('figcaption').insertAdjacentHTML('afterend', svg);
    keepDescription(fig);
  }

  // ---------- 7. Heart-rate slider (Section 10) ----------
  function hrSlider(box) {
    const note = box.querySelector('p');
    const id = 'tw-hr-' + (++uid);
    const ui = document.createElement('div');
    ui.className = 'tw-hr';
    ui.innerHTML = `<label for="${id}" class="tw-hr-label">Heart rate: <strong class="tw-hr-rate">75</strong> beats/min</label>` +
      `<input id="${id}" type="range" min="50" max="180" step="5" value="75" aria-describedby="${id}-out">` +
      `<div class="tw-hr-bar" aria-hidden="true"><span></span></div>` +
      `<output id="${id}-out" for="${id}" aria-live="polite" class="tw-hr-out"></output>` +
      `<p class="tw-hr-note">This tool calculates total cycle length only; it does not model the exact split between systole and diastole.</p>`;
    const input = ui.querySelector('input'), out = ui.querySelector('output'), bar = ui.querySelector('.tw-hr-bar span'), rate = ui.querySelector('.tw-hr-rate');
    const update = () => {
      const hr = Number(input.value), s = 60 / hr;
      rate.textContent = hr;
      out.textContent = `Cycle length = 60 ÷ ${hr} = ${s.toFixed(2)} s (${Math.round(s * 1000)} ms)`;
      bar.style.width = (100 * s / 1.2).toFixed(1) + '%';
    };
    input.addEventListener('input', update);
    box.prepend(ui);
    if (note) note.classList.add('tw-description', 'tw-visually-hidden');
    update();
  }

  // ---------- 8. "Test yourself" toggle for the cycle map (Section 8) ----------
  function mapQuiz(box) {
    let table = box.nextElementSibling;
    while (table && table.tagName !== 'TABLE') table = table.nextElementSibling;
    if (!table) return;
    const cells = [...table.querySelectorAll('tbody tr')].map(r => r.children[1]).filter(Boolean);
    box.innerHTML = `<button type="button" class="tw-btn tw-quiz-toggle" aria-pressed="false">Test yourself: hide the consequences</button><span class="tw-quiz-status" aria-live="polite"></span>`;
    const button = box.querySelector('button'), status = box.querySelector('.tw-quiz-status');
    const reveal = cell => { cell.classList.remove('tw-hidden-cell'); cell.removeAttribute('role'); cell.removeAttribute('tabindex'); cell.removeAttribute('aria-label'); };
    cells.forEach(cell => {
      cell.addEventListener('click', () => { if (cell.classList.contains('tw-hidden-cell')) reveal(cell); });
      cell.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && cell.classList.contains('tw-hidden-cell')) { e.preventDefault(); reveal(cell); } });
    });
    button.addEventListener('click', () => {
      const on = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(on));
      button.textContent = on ? 'Show all answers' : 'Test yourself: hide the consequences';
      cells.forEach(cell => {
        if (on) { cell.classList.add('tw-hidden-cell'); cell.setAttribute('role', 'button'); cell.setAttribute('tabindex', '0'); cell.setAttribute('aria-label', 'Hidden consequence. Press to reveal.'); }
        else reveal(cell);
      });
      status.textContent = on ? 'Consequences hidden. Recall each one, then tap a cell to check.' : 'All consequences shown.';
    });
  }

  // ---------- 9. Single-best-answer questions with instant feedback ----------
  function mcq(details) {
    const question = details.previousElementSibling;
    const options = question?.querySelector('.mcq-options');
    if (!options || options.dataset.ready) return;
    options.dataset.ready = '1';
    const key = details.dataset.answer;
    const feedback = document.createElement('span');
    feedback.className = 'mcq-feedback';
    feedback.setAttribute('aria-live', 'polite');
    options.setAttribute('role', 'group');
    options.setAttribute('aria-label', 'Answer options');
    const buttons = [...options.querySelectorAll('.mcq-option')].map(span => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mcq-option';
      b.dataset.option = span.dataset.option;
      b.innerHTML = span.innerHTML;
      span.replaceWith(b);
      return b;
    });
    buttons.forEach(b => b.addEventListener('click', () => {
      const right = b.dataset.option === key;
      buttons.forEach(o => {
        o.disabled = true;
        if (o.dataset.option === key) o.classList.add('is-correct');
      });
      if (!right) b.classList.add('is-wrong');
      b.setAttribute('aria-pressed', 'true');
      feedback.textContent = right ? `Correct: ${key}.` : `Not quite. You chose ${b.dataset.option}; the best answer is ${key}.`;
      feedback.classList.toggle('is-wrong', !right);
      details.open = true;
    }));
    options.after(feedback);
  }

  const builders = {'chamber-timeline': chamberTimeline, 'diastolic-plot': diastolicPlot, 'valve-stepper': valveStepper,
    'volume-bar': volumeBar, 'wiggers': wiggers, 's2-timing': s2Timing, 'hr-slider': hrSlider, 'map-quiz': mapQuiz};

  // ---------- 10. Source notes: collapsed behind a toggle (all chapters) ----------
  function sourceNote(aside) {
    if (aside.dataset.ready) return;
    aside.dataset.ready = '1';
    const lead = aside.querySelector(':scope > strong:first-child');
    if (lead && /^\s*Source note:?\s*$/i.test(lead.textContent)) lead.remove();
    const id = 'tw-src-' + (++uid);
    const body = document.createElement('div');
    body.className = 'source-note-body';
    body.id = id;
    body.hidden = true;
    while (aside.firstChild) body.appendChild(aside.firstChild);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'source-note-toggle';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', id);
    button.innerHTML = '<span class="source-note-label">Source note</span><span class="source-note-hint">how this compares with the lecture</span>';
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      body.hidden = !open;
    });
    aside.classList.add('is-collapsible');
    aside.append(button, body);
  }

  // Other scripts (e.g. heart-sound-widgets.js) can add builders and reuse the helpers.
  window.DOMWidgets = {
    helpers: {esc, smooth, line, svgOpen, keepDescription, nextId: p => p + (++uid), NS},
    register(name, fn) { builders[name] = fn; enhance(); }
  };


  // ---------- Diagram | Interactive switch ----------
  // <div class="view-switch"> holding a static figure (.static-view) and an interactive figure (.teaching-widget).
  const VIEW_KEY = 'dom-view-mode';
  const readView = () => { try { return localStorage.getItem(VIEW_KEY) || 'interactive'; } catch (e) { return 'interactive'; } };
  function applyView(box, mode) {
    const stat = box.querySelector(':scope > .static-view'), inter = box.querySelector(':scope > .teaching-widget');
    if (!stat || !inter) return;
    stat.hidden = mode !== 'diagram'; inter.hidden = mode === 'diagram';
    box.querySelectorAll(':scope > .view-switch-bar button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === mode)));
  }
  function viewSwitch(box) {
    if (box.dataset.ready) return;
    box.dataset.ready = '1';
    const bar = document.createElement('div');
    bar.className = 'view-switch-bar'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Choose how to view this figure');
    bar.innerHTML = '<span>View as:</span><button type="button" data-view="diagram">Diagram</button><button type="button" data-view="interactive">Interactive</button>';
    box.prepend(bar);
    bar.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      try { localStorage.setItem(VIEW_KEY, b.dataset.view); } catch (e) { /* storage blocked */ }
      main.querySelectorAll('.view-switch').forEach(x => applyView(x, b.dataset.view));
    }));
    applyView(box, readView());
  }

  function enhance() {
    main.querySelectorAll('.teaching-widget[data-widget]:not([data-ready])').forEach(el => {
      const build = builders[el.dataset.widget];
      if (!build) return;
      el.dataset.ready = '1';
      try { build(el); } catch (e) { el.classList.add('tw-failed'); if (window.console) console.error('Teaching widget failed:', el.dataset.widget, e); }
    });
    main.querySelectorAll('details.mcq-answer').forEach(mcq);
    main.querySelectorAll('aside.source-note').forEach(sourceNote);
    main.querySelectorAll('.view-switch').forEach(viewSwitch);
  }
  new MutationObserver(enhance).observe(main, {childList: true, subtree: true});
  enhance();
})();
