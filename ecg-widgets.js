/* DOMiNANCE Breakdowns — ECG widgets (Chapter 7).
 * lead-view: turn the depolarisation arrow and watch one lead draw an upward, downward or biphasic QRS.
 * rate-ruler: set the gap between two R waves and see squares → seconds → beats/min worked out step by step. */
(() => {
  'use strict';
  const W = window.DOMWidgets;
  if (!W) return;
  const {svgOpen, keepDescription, nextId} = W.helpers;

  // ---------- 1. Lead view (§2) ----------
  // Frontal-plane angles: 0° = patient's left (viewer's right), +90° = downwards.
  const LEADS = {
    I: {deg: 0, label: 'Lead I', from: 'the left arm'},
    II: {deg: 60, label: 'Lead II', from: 'the left leg'},
    aVR: {deg: -150, label: 'aVR', from: 'the right shoulder'}
  };
  const rad = d => d * Math.PI / 180;
  const norm = d => ((d + 540) % 360) - 180;

  function leadView(fig) {
    const id = nextId('lv');
    const CX = 150, CY = 140, R = 92;
    const wrap = document.createElement('div');
    wrap.className = 'lv-wrap';
    wrap.innerHTML =
      `<div class="tw-controls lv-leads" role="group" aria-label="Choose a lead">${Object.entries(LEADS).map(([k, l]) => `<button type="button" class="tw-btn" data-lead="${k}" aria-pressed="false">${l.label}</button>`).join('')}</div>` +
      `<div class="tw-stage lv-stage"></div>` +
      `<label class="lv-slider"><span>Turn the arrow</span><input type="range" min="-180" max="180" step="5" value="60" aria-label="Direction of the depolarisation arrow, in degrees"></label>` +
      `<p class="lv-readout" aria-live="polite"></p>`;
    const stage = wrap.querySelector('.lv-stage'), out = wrap.querySelector('.lv-readout'), range = wrap.querySelector('input');
    let lead = 'II', ang = 60;

    const trace = a => {   // a = cos(angle between arrow and lead), −1..1
      const b = 150, k = 70;
      const qrs = Math.abs(a) < 0.3 ? `L397 ${b - 28} L403 ${b + 28} L408 ${b}` : `L398 ${(b - a * k).toFixed(1)} L404 ${b}`;
      const t = Math.abs(a) < 0.3 ? 0 : -Math.sign(a) * 16;
      return `<line x1="330" y1="${b}" x2="520" y2="${b}" class="lv-base"/>` +
        `<path d="M330 ${b} H350 q8 -8 16 0 H392 ${qrs} H430 q14 ${t} 28 0 H520" class="lv-ecg"/>` +
        `<text x="425" y="40" text-anchor="middle" class="tw-small tw-strong">What ${LEADS[lead].label} draws</text>` +
        `<text x="398" y="${a >= 0.3 ? b - a * k - 8 : a <= -0.3 ? b - 12 : b - 36}" text-anchor="middle" class="tw-tiny tw-muted">QRS</text>`;
    };

    const draw = () => {
      const L = LEADS[lead], la = rad(L.deg), va = rad(ang);
      const a = Math.cos(va - la);
      const lx = CX + Math.cos(la) * (R + 26), ly = CY + Math.sin(la) * (R + 26);
      const tx = CX + Math.cos(va) * (R - 14), ty = CY + Math.sin(va) * (R - 14);
      stage.innerHTML = svgOpen(540, 290, `${L.label} looks from ${L.from}. The depolarisation arrow points ${Math.round(Math.abs(norm(ang - L.deg)))} degrees away from the lead, so the lead draws ${Math.abs(a) < 0.3 ? 'a small up-and-down QRS' : a > 0 ? 'an upward QRS' : 'a downward QRS'}.`) +
        `<defs><marker id="${id}-h" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" class="lv-head"/></marker></defs>` +
        `<circle cx="${CX}" cy="${CY}" r="${R}" class="lv-body"/>` +
        `<path d="M58 0C40 -26 4 -44 -26 -36C-54 -28 -62 4 -50 26C-38 46 -6 50 22 34C38 25 50 12 58 0Z" transform="translate(${CX} ${CY}) rotate(40)" class="lv-heart"/>` +
        `<line x1="${CX - Math.cos(la) * (R + 8)}" y1="${CY - Math.sin(la) * (R + 8)}" x2="${CX + Math.cos(la) * (R + 8)}" y2="${CY + Math.sin(la) * (R + 8)}" class="lv-axis"/>` +
        `<circle cx="${lx}" cy="${ly}" r="15" class="lv-eye"/><text x="${lx}" y="${ly + 6}" text-anchor="middle" class="lv-plus">+</text>` +
        `<line x1="${CX}" y1="${CY}" x2="${tx}" y2="${ty}" class="lv-vec" marker-end="url(#${id}-h)"/>` +
        `<text x="${CX - R - 4}" y="${CY - R + 4}" text-anchor="middle" class="lv-side">Right</text><text x="${CX + R + 4}" y="${CY - R + 4}" text-anchor="middle" class="lv-side">Left</text>` +
        `<text x="${CX}" y="${CY + R + 40}" text-anchor="middle" class="lv-hint">Drag to turn the arrow</text>` +
        trace(a) + `</svg>`;
      const svg = stage.querySelector('svg');
      const point = e => {
        const r = svg.getBoundingClientRect(), k = 540 / r.width;
        const x = (e.clientX - r.left) * k - CX, y = (e.clientY - r.top) * k - CY;
        if (Math.hypot(x, y) < 12 || (e.clientX - r.left) * k > 300) return;
        ang = Math.round(Math.atan2(y, x) * 180 / Math.PI / 5) * 5; range.value = ang; draw();
      };
      let dragging = false;
      svg.addEventListener('pointerdown', e => { dragging = true; svg.setPointerCapture?.(e.pointerId); point(e); });
      svg.addEventListener('pointermove', e => { if (dragging) point(e); });
      svg.addEventListener('pointerup', () => { dragging = false; });
      const diff = Math.round(Math.abs(norm(ang - L.deg)));
      out.innerHTML = Math.abs(a) < 0.3
        ? `The arrow runs <strong>across</strong> ${L.label} (${diff}° from it), so the lead draws a <strong>small up-and-down</strong> QRS.`
        : a > 0 ? `The arrow points <strong>towards</strong> ${L.label}'s positive end (${diff}° from it), so the lead draws an <strong>upward</strong> QRS.`
          : `The arrow points <strong>away from</strong> ${L.label}'s positive end (${diff}° from it), so the lead draws a <strong>downward</strong> QRS.`;
      wrap.querySelectorAll('[data-lead]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lead === lead)));
    };
    wrap.querySelectorAll('[data-lead]').forEach(b => b.addEventListener('click', () => { lead = b.dataset.lead; draw(); }));
    range.addEventListener('input', () => { ang = Number(range.value); draw(); });
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    draw();
  }

  // ---------- 2. Rate ruler (§7) ----------
  const COUNT = [300, 150, 100, 75, 60, 50, 43, 38];
  const fmt = (x, d = 2) => (Math.round(x * 10 ** d) / 10 ** d).toString();

  function rateRuler(fig) {
    const X0 = 24, SQ = 10, B = 104, COLS = 52;   // 10 px per small square
    const wrap = document.createElement('div');
    wrap.className = 'rr-wrap';
    wrap.innerHTML = `<div class="tw-stage rr-stage"></div>` +
      `<label class="lv-slider"><span>Small squares between the two R waves: <strong class="rr-n"></strong></span><input type="range" min="10" max="40" step="1" value="22" aria-label="Number of small squares between the two R waves"></label>` +
      `<ol class="rr-steps" aria-live="polite"></ol><p class="rr-alt"></p>`;
    const stage = wrap.querySelector('.rr-stage'), range = wrap.querySelector('input');
    const beat = x => `H${x - 40} q8 -10 16 0 H${x - 8} l4 6 l4 -76 l4 84 l4 -14 H${x + 26} q12 -18 24 0`;
    const draw = () => {
      const n = Number(range.value), x1 = X0 + 5 * SQ, x2 = x1 + n * SQ, rr = n * 0.04, hr = 60 / rr, large = n / 5;
      let grid = '';
      for (let i = 0; i <= COLS; i++) grid += `<line x1="${X0 + i * SQ}" y1="20" x2="${X0 + i * SQ}" y2="140" class="${i % 5 ? 'rr-thin' : 'rr-thick'}"/>`;
      for (let j = 0; j <= 12; j++) grid += `<line x1="${X0}" y1="${20 + j * SQ}" x2="${X0 + COLS * SQ}" y2="${20 + j * SQ}" class="${j % 5 ? 'rr-thin' : 'rr-thick'}"/>`;
      const path = `M${X0} ${B} ${beat(x1)} ${beat(x2)} H${X0 + COLS * SQ}`;
      stage.innerHTML = svgOpen(560, 196, `Two R waves ${n} small squares apart: RR interval ${fmt(rr)} seconds, heart rate about ${Math.round(hr)} beats per minute.`) +
        `<rect x="${X0}" y="20" width="${COLS * SQ}" height="120" class="rr-paper"/>` + grid +
        `<path d="${path}" class="rr-ecg"/>` +
        `<text x="${x1}" y="${B - 76}" text-anchor="middle" class="tw-tiny tw-strong">R</text><text x="${x2}" y="${B - 76}" text-anchor="middle" class="tw-tiny tw-strong">R</text>` +
        `<path d="M${x1} 156 V150 H${x2} V156" class="rr-bracket"/>` +
        `<text x="${(x1 + x2) / 2}" y="172" text-anchor="middle" class="tw-small tw-strong">${n} small squares = ${fmt(large, 1)} large squares</text>` +
        `<text x="${(x1 + x2) / 2}" y="190" text-anchor="middle" class="tw-tiny tw-muted">RR interval = ${fmt(rr)} s</text></svg>`;
      wrap.querySelector('.rr-n').textContent = n;
      wrap.querySelector('.rr-steps').innerHTML =
        `<li><strong>Count:</strong> ${n} small squares between the R waves.</li>` +
        `<li><strong>Squares → seconds:</strong> ${n} × 0.04 = <strong>${fmt(rr)} s</strong> per beat.</li>` +
        `<li><strong>Seconds → beats/min:</strong> 60 ÷ ${fmt(rr)} ≈ <strong>${Math.round(hr)} beats/min</strong>.</li>`;
      const lo = Math.floor(large), hi = Math.ceil(large);
      const cd = Number.isInteger(large) && large <= 8 ? `${large} large squares, so 300 ÷ ${large} ${300 % large ? '≈' : '='} <strong>${Math.round(300 / large)}</strong>`
        : hi <= 8 ? `between ${lo} and ${hi} large squares, so between <strong>${COUNT[lo - 1]}</strong> and <strong>${COUNT[hi - 1]}</strong>` : 'more than 8 large squares, so under 38';
      wrap.querySelector('.rr-alt').innerHTML = `<strong>Shortcut:</strong> 1500 ÷ ${n} ≈ ${Math.round(1500 / n)} beats/min. <strong>Countdown</strong> (300, 150, 100, 75, 60, 50…): ${cd}.`;
    };
    range.addEventListener('input', draw);
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    draw();
  }

  W.register('lead-view', leadView);
  W.register('rate-ruler', rateRuler);
})();
