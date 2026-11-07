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

  // ---------- Fick calculator (Chapter 8, §2) ----------
  function fickCalculator(fig) {
    const wrap = document.createElement('div');
    wrap.className = 'fk-wrap';
    const sl = (k, label, min, max, step, val, unit) => `<label class="lv-slider"><span>${label}: <strong class="fk-${k}"></strong> ${unit}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${label}"></label>`;
    wrap.innerHTML = sl('vo2', 'Oxygen used by the body', 150, 1000, 10, 250, 'mL O₂/min') +
      sl('ca', 'Arterial O₂ content', 0.10, 0.22, 0.01, 0.20, 'mL O₂ per mL blood') +
      sl('cv', 'Mixed venous O₂ content', 0.05, 0.18, 0.01, 0.15, 'mL O₂ per mL blood') +
      `<div class="fk-bar" aria-hidden="true"><span class="fk-left"></span><span class="fk-taken"></span></div><p class="fk-bar-lab"></p>` +
      `<ol class="rr-steps" aria-live="polite"></ol><p class="lv-readout fk-say"></p>`;
    const q = s => wrap.querySelector(s), inputs = wrap.querySelectorAll('input');
    const draw = changed => {
      let vo2 = Number(q('[data-k="vo2"]').value), ca = Number(q('[data-k="ca"]').value), cv = Number(q('[data-k="cv"]').value);
      if (cv > ca - 0.01) { if (changed === 'ca') { cv = Math.max(0.05, ca - 0.01); q('[data-k="cv"]').value = cv; } else { cv = ca - 0.01; q('[data-k="cv"]').value = cv; } }
      const diff = Math.round((ca - cv) * 100) / 100, co = vo2 / diff;
      q('.fk-vo2').textContent = vo2; q('.fk-ca').textContent = ca.toFixed(2); q('.fk-cv').textContent = cv.toFixed(2);
      q('.fk-left').style.width = `${(cv / 0.22) * 100}%`; q('.fk-taken').style.width = `${(diff / 0.22) * 100}%`;
      q('.fk-bar-lab').innerHTML = `Each mL of blood arrives with ${ca.toFixed(2)} mL O₂ and leaves with ${cv.toFixed(2)}: it drops off <strong>${diff.toFixed(2)} mL O₂</strong> (gold).`;
      q('.rr-steps').innerHTML = `<li><strong>Oxygen used:</strong> ${vo2} mL O₂/min</li>` +
        `<li><strong>Dropped off per mL of blood:</strong> ${ca.toFixed(2)} − ${cv.toFixed(2)} = <strong>${diff.toFixed(2)}</strong> mL O₂</li>` +
        `<li><strong>Flow:</strong> ${vo2} ÷ ${diff.toFixed(2)} = ${Math.round(co).toLocaleString('en-GB')} mL/min = <strong>${(co / 1000).toFixed(1)} L/min</strong></li>`;
      q('.fk-say').innerHTML = 'Pattern: when tissues take <strong>more</strong> oxygen from each mL, the same oxygen use needs <strong>less</strong> flow. Try widening the gap.';
    };
    inputs.forEach(i => i.addEventListener('input', () => draw(i.dataset.k)));
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    draw();
  }
  W.register('fick-calculator', fickCalculator);

  // ---------- Radius dial (Chapter 9, §6) ----------
  function radiusDial(fig) {
    const wrap = document.createElement('div');
    wrap.className = 'rd-wrap';
    wrap.innerHTML = `<div class="tw-controls" role="group" aria-label="Presets"><span class="fs-lab">Try:</span>${[50, 80, 100, 150].map(v => `<button type="button" class="tw-btn" data-r="${v}">${v}%</button>`).join('')}</div>` +
      `<div class="tw-stage"></div>` +
      `<label class="lv-slider"><span>Radius: <strong class="rd-r"></strong> of normal</span><input type="range" min="50" max="150" step="5" value="100" aria-label="Vessel radius as a percentage of normal"></label>` +
      `<ol class="rr-steps" aria-live="polite"></ol><p class="lv-readout rd-say"></p>`;
    const stage = wrap.querySelector('.tw-stage'), range = wrap.querySelector('input');
    const draw = () => {
      const pct = Number(range.value), f = pct / 100, f4 = f ** 4, flow = f4 * 100, res = 1 / f4;
      const h = 40 * f, cy = 70, bw = 420;
      stage.innerHTML = svgOpen(540, 190, `A vessel at ${pct}% of normal radius. Resistance is ${res.toFixed(1)} times normal and flow is ${Math.round(flow)}% of normal.`) +
        `<rect x="40" y="${cy - 40}" width="460" height="80" rx="12" class="rd-ghost"/>` +
        `<rect x="40" y="${cy - h}" width="460" height="${2 * h}" rx="${Math.min(12, h)}" class="rd-vessel"/>` +
        `<text x="270" y="${cy + 5}" text-anchor="middle" class="tw-small tw-strong rd-in">radius ${pct}%</text>` +
        `<text x="40" y="136" class="tw-tiny tw-muted">Flow at normal radius</text><rect x="40" y="142" width="${bw / 5.1}" height="12" rx="6" class="rd-bar0"/>` +
        `<text x="40" y="170" class="tw-tiny tw-strong">Flow now: ${Math.round(flow)}%</text><rect x="40" y="176" width="${Math.max(2, bw / 5.1 * f4)}" height="12" rx="6" class="rd-bar"/></svg>`;
      wrap.querySelector('.rd-r').textContent = `${pct}%`;
      const r = f.toFixed(2);
      wrap.querySelector('.rr-steps').innerHTML = `<li><strong>Radius:</strong> × ${r}</li>` +
        `<li><strong>Radius to the fourth power:</strong> ${r} × ${r} × ${r} × ${r} = <strong>${f4.toFixed(3)}</strong></li>` +
        `<li><strong>Resistance:</strong> 1 ÷ ${f4.toFixed(3)} = <strong>× ${res >= 10 ? res.toFixed(0) : res.toFixed(2)}</strong></li>` +
        `<li><strong>Flow</strong> (same pressure difference): <strong>${flow >= 10 ? Math.round(flow) : flow.toFixed(1)}% of normal</strong></li>`;
      wrap.querySelector('.rd-say').innerHTML = pct === 100 ? 'Move the slider: a small change in radius makes a big change in flow.'
        : pct < 100 ? `A ${100 - pct}% narrowing cuts flow by <strong>${Math.round(100 - flow)}%</strong>. ${pct === 80 ? '<strong>A 20% narrowing more than halves flow.</strong>' : ''}`
          : `A ${pct - 100}% widening raises flow by <strong>${Math.round(flow - 100)}%</strong>.`;
      wrap.querySelectorAll('[data-r]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.r) === pct)));
    };
    range.addEventListener('input', draw);
    wrap.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => { range.value = b.dataset.r; draw(); }));
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    draw();
  }
  W.register('radius-dial', radiusDial);
})();
