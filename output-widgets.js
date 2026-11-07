/* DOMiNANCE Breakdowns — cardiac output widgets (Chapter 7).
 * starling-explorer: move along a Frank–Starling curve (EDV slider) or jump between curves (contractility buttons). */
(() => {
  'use strict';
  const W = window.DOMWidgets;
  if (!W) return;
  const {svgOpen, keepDescription, line} = W.helpers;
  const CURVES = {
    low: {label: 'Low contractility', short: 'Low', max: 62, cls: 'fs-low'},
    normal: {label: 'Normal', short: 'Normal', max: 100, cls: 'fs-normal'},
    high: {label: 'High contractility', short: 'High', max: 140, cls: 'fs-high'}
  };
  const HR = 70;
  const sv = (edv, k) => CURVES[k].max * (1 - Math.exp(-(edv - 50) / 60));
  const X = e => 70 + (e - 50) * (430 / 150), Y = v => 250 - v * (210 / 150);

  function starlingExplorer(fig) {
    const wrap = document.createElement('div');
    wrap.className = 'fs-wrap';
    wrap.innerHTML = `<div class="tw-controls" role="group" aria-label="Contractility"><span class="fs-lab">Contractility:</span>${Object.entries(CURVES).map(([k, c]) => `<button type="button" class="tw-btn" data-curve="${k}" aria-pressed="false">${c.short}</button>`).join('')}</div>` +
      `<div class="tw-stage"></div>` +
      `<label class="lv-slider"><span>Filling (EDV): <strong class="fs-edv"></strong> mL</span><input type="range" min="60" max="200" step="5" value="120" aria-label="End-diastolic volume in millilitres"></label>` +
      `<div class="fs-read"><span><small>EDV</small><strong class="fs-r-edv"></strong></span><span><small>Stroke volume</small><strong class="fs-r-sv"></strong></span><span><small>CO at ${HR} beats/min</small><strong class="fs-r-co"></strong></span></div>` +
      `<p class="lv-readout fs-say" aria-live="polite"></p>`;
    const stage = wrap.querySelector('.tw-stage'), range = wrap.querySelector('input');
    let curve = 'normal', edv = 120, prev = null;
    const draw = kind => {
      const v = sv(edv, curve);
      const paths = Object.entries(CURVES).map(([k, c]) => {
        const pts = []; for (let e = 50; e <= 200; e += 2) pts.push([X(e), Y(sv(e, k))]);
        return `<path d="${line(pts)}" class="fs-curve ${c.cls}${k === curve ? ' is-on' : ''}"/><text x="${X(200) - 4}" y="${Y(sv(200, k)) - 8}" text-anchor="end" class="tw-tiny ${k === curve ? 'tw-strong' : 'tw-muted'}">${c.label}</text>`;
      }).join('');
      let grid = '';
      [0, 50, 100, 150].forEach(t => { grid += `<line x1="70" y1="${Y(t)}" x2="500" y2="${Y(t)}" class="fs-grid"/><text x="62" y="${Y(t) + 4}" text-anchor="end" class="tw-tiny tw-muted">${t}</text>`; });
      [50, 100, 150, 200].forEach(t => { grid += `<text x="${X(t)}" y="268" text-anchor="middle" class="tw-tiny tw-muted">${t}</text>`; });
      stage.innerHTML = svgOpen(540, 300, `Frank–Starling curves. On the ${CURVES[curve].label.toLowerCase()} curve at an EDV of ${edv} mL, stroke volume is about ${Math.round(v)} mL.`) +
        grid + `<line x1="70" y1="250" x2="500" y2="250" class="fs-axis"/><line x1="70" y1="30" x2="70" y2="250" class="fs-axis"/>` +
        `<text x="285" y="292" text-anchor="middle" class="tw-small tw-strong">Filling: end-diastolic volume (mL) →</text>` +
        `<text x="18" y="140" text-anchor="middle" transform="rotate(-90 18 140)" class="tw-small tw-strong">Stroke volume (mL) →</text>` +
        paths +
        `<line x1="${X(edv)}" y1="250" x2="${X(edv)}" y2="${Y(v)}" class="fs-drop"/><line x1="70" y1="${Y(v)}" x2="${X(edv)}" y2="${Y(v)}" class="fs-drop"/>` +
        `<circle cx="${X(edv)}" cy="${Y(v)}" r="9" class="fs-dot"/></svg>`;
      wrap.querySelector('.fs-edv').textContent = edv;
      wrap.querySelector('.fs-r-edv').textContent = `${edv} mL`;
      wrap.querySelector('.fs-r-sv').textContent = `${Math.round(v)} mL`;
      wrap.querySelector('.fs-r-co').textContent = `${(v * HR / 1000).toFixed(1)} L/min`;
      wrap.querySelectorAll('[data-curve]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.curve === curve)));
      const say = wrap.querySelector('.fs-say');
      if (kind === 'along' && prev) {
        const up = edv > prev.edv;
        say.innerHTML = `<strong>Moving along the curve (preload changed).</strong> Filling ${up ? 'rose' : 'fell'} from ${prev.edv} to ${edv} mL, so stroke volume ${up ? 'rose' : 'fell'} from ${Math.round(prev.sv)} to ${Math.round(v)} mL. Contractility did not change.`;
      } else if (kind === 'jump' && prev) {
        const up = v > prev.sv;
        say.innerHTML = `<strong>A new curve (contractility changed).</strong> At the same filling (${edv} mL), stroke volume ${up ? 'jumped up' : 'dropped'} from ${Math.round(prev.sv)} to ${Math.round(v)} mL, with no change in stretch.`;
      } else say.innerHTML = 'Move the slider to change <strong>filling</strong> (along the curve), or pick a <strong>contractility</strong> button (to a new curve).';
      prev = {edv, sv: v};
    };
    range.addEventListener('input', () => { edv = Number(range.value); draw('along'); });
    wrap.querySelectorAll('[data-curve]').forEach(b => b.addEventListener('click', () => { if (b.dataset.curve === curve) return; curve = b.dataset.curve; draw('jump'); }));
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    draw();
  }
  W.register('starling-explorer', starlingExplorer);
})();
