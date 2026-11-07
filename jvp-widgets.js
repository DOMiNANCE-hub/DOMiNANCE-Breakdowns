/* DOMiNANCE Breakdowns — JVP widgets (Chapter 11).
 * jvp-explorer: step through the a, c, x, v and y parts of one JVP beat, with the ECG and heart-sound timing
 * above the trace and a small right heart showing what the atrium and tricuspid valve are doing at each step. */
(() => {
  'use strict';
  const W = window.DOMWidgets;
  if (!W) return;
  const {svgOpen, keepDescription, smooth, nextId} = W.helpers;

  // Schematic trace: x 40–380 is one beat; lower y = higher pressure.
  const TRACE = [[40, 200], [66, 197], [90, 150], [110, 182], [128, 166], [200, 222], [252, 152], [300, 216], [345, 201], [380, 199]];
  const STEPS = [
    {k: 'a', from: 66, to: 110, lx: 90, ly: 140,
      title: 'a wave: the right atrium contracts',
      text: 'Just after the P wave, the atrium squeezes and its pressure rises. With no valve between it and the great veins, venous inflow briefly stops and a little blood is pushed back up the neck.',
      heart: {ra: 'squeeze', valve: 'open', rv: 'relaxed', level: 0.55, back: true, fwd: true}},
    {k: 'c', from: 110, to: 140, lx: 128, ly: 156,
      title: 'c wave: the closed tricuspid valve bulges back',
      text: 'Just after the QRS, at S1, the right ventricle starts contracting. Its rising pressure pushes the shut tricuspid valve up into the atrium. The atrium itself is not contracting.',
      heart: {ra: 'rest', valve: 'bulge', rv: 'squeeze', level: 0.5, inflow: true}},
    {k: 'x', from: 140, to: 205, lx: 200, ly: 240,
      title: 'x descent: the atrium relaxes and is stretched open',
      text: 'The atrium relaxes. As the right ventricle ejects, it pulls the tricuspid valve ring downwards, making the atrium bigger, so its pressure falls.',
      heart: {ra: 'stretched', valve: 'shut-low', rv: 'squeeze', level: 0.35, inflow: true, eject: true}},
    {k: 'v', from: 205, to: 262, lx: 252, ly: 142,
      title: 'v wave: the atrium fills with the tricuspid valve shut',
      text: 'Blood keeps returning from the body throughout ventricular systole. With the tricuspid valve shut it can only collect in the atrium, so pressure rises slowly. The atrium is not contracting.',
      heart: {ra: 'rest', valve: 'shut', rv: 'relaxing', level: 0.9, inflow: true}},
    {k: 'y', from: 262, to: 345, lx: 300, ly: 234,
      title: 'y descent: the tricuspid valve opens',
      text: 'After S2, right ventricular pressure falls below right atrial pressure. The valve opens and the stored blood rushes into the ventricle, so atrial pressure drops.',
      heart: {ra: 'rest', valve: 'open', rv: 'filling', level: 0.3, inflow: true, fwd: true}}
  ];

  // ----- the small right heart (x 410–585) -----
  function heart(h) {
    const ring = h.valve === 'shut-low' ? 162 : 150;
    const ra = {squeeze: [436, 50, 88, 90], rest: [428, 42, 104, 100], stretched: [428, 42, 104, ring - 46]}[h.ra];
    const [rx, ry, rw, rh] = ra;
    const lvlH = (rh - 8) * h.level;
    let valve;
    if (h.valve === 'open') valve = `<path d="M448 ${ring} L462 ${ring + 30} M512 ${ring} L498 ${ring + 30}" class="jv-valve"/>`;
    else if (h.valve === 'bulge') valve = `<path d="M448 ${ring} Q480 ${ring - 26} 512 ${ring}" class="jv-valve jv-valve-hot"/>`;
    else valve = `<path d="M448 ${ring} L512 ${ring}" class="jv-valve"/>`;
    const rvCls = {relaxed: '', squeeze: ' is-on', relaxing: ' is-half', filling: ''}[h.rv];
    const arrows =
      (h.inflow ? `<path d="M480 2 V${ry - 4}" class="jv-arrow jv-in" marker-end="url(#JV-in)"/>` : '') +
      (h.back ? `<path d="M480 ${ry - 4} V4" class="jv-arrow jv-back" marker-end="url(#JV-back)"/>` : '') +
      (h.fwd ? `<path d="M480 ${ring - 34} V${ring + 42}" class="jv-arrow jv-in" marker-end="url(#JV-in)"/>` : '') +
      (h.eject ? `<path d="M530 250 Q566 240 566 208" class="jv-arrow jv-out" marker-end="url(#JV-out)"/><text x="588" y="196" text-anchor="end" class="tw-tiny tw-muted">to lungs</text>` : '');
    return `<rect x="471" y="0" width="18" height="${ry + 4}" class="jv-vein"/>` +
      `<text x="496" y="14" class="tw-tiny tw-muted">neck veins</text>` +
      `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="18" class="jv-ra${h.ra === 'squeeze' ? ' is-on' : ''}"/>` +
      `<rect x="${rx + 4}" y="${ry + rh - 4 - lvlH}" width="${rw - 8}" height="${lvlH}" rx="12" class="jv-blood"/>` +
      `<text x="480" y="${ry + 20}" text-anchor="middle" class="tw-tiny tw-strong">Right atrium</text>` +
      `<path d="M432 ${ring + 10} H528 V${ring + 70} Q528 290 480 290 Q432 290 432 ${ring + 70} Z" class="jv-rv${rvCls}"/>` +
      `<text x="480" y="270" text-anchor="middle" class="tw-tiny tw-strong">Right ventricle</text>` +
      `<line x1="440" y1="${ring}" x2="448" y2="${ring}" class="jv-ringline"/><line x1="512" y1="${ring}" x2="520" y2="${ring}" class="jv-ringline"/>` +
      valve + `<text x="418" y="${ring + 4}" text-anchor="end" class="tw-tiny tw-muted">tricuspid valve</text>` + arrows;
  }

  function jvpExplorer(fig) {
    const id = nextId('jv');
    const m = (n, cls) => `<marker id="${id}-${n}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" class="${cls}"/></marker>`;
    const ev = (x, label, row) => `<line x1="${x}" y1="${row ? 66 : 46}" x2="${x}" y2="232" class="jv-event"/><text x="${x}" y="${row ? 60 : 40}" text-anchor="middle" class="tw-tiny tw-strong">${label}</text>`;
    const path = smooth(TRACE);
    const svg = svgOpen(590, 300, 'One schematic jugular venous pulse beat with the P wave, QRS, S1 and S2 marked above it, beside a small right heart. Step through the a wave, c wave, x descent, v wave and y descent to see what the right atrium and tricuspid valve are doing at each one.') +
      `<defs>${m('in', 'jv-head-in')}${m('back', 'jv-head-back')}${m('out', 'jv-head-out')}<clipPath id="${id}-clip"><rect class="jv-win" x="0" y="0" width="0" height="300"/></clipPath></defs>` +
      `<text x="20" y="40" class="tw-tiny tw-muted">ECG</text><text x="20" y="60" class="tw-tiny tw-muted">Sound</text>` +
      ev(72, 'P', 0) + ev(110, 'QRS', 0) + ev(122, 'S1', 1) + ev(236, 'S2', 1) +
      `<path d="M122 80 H236" class="jv-bracket"/><text x="179" y="94" text-anchor="middle" class="tw-tiny tw-muted">ventricular systole</text>` +
      `<path d="${path}" class="jv-trace"/>` +
      `<path d="${path}" class="jv-trace jv-hot" clip-path="url(#${id}-clip)"/>` +
      STEPS.map(s => `<text x="${s.lx}" y="${s.ly}" text-anchor="middle" class="jv-letter" data-k="${s.k}">${s.k}</text>`).join('') +
      `<text x="40" y="262" class="tw-tiny tw-muted">JVP (right atrial pressure), schematic</text>` +
      `<text x="20" y="152" class="tw-tiny tw-muted" transform="rotate(-90 20 152)">pressure ↑</text>` +
      `<g class="jv-heart"></g></svg>`;
    // marker ids are per-instance
    const wrap = document.createElement('div');
    wrap.className = 'tw-stepper jv-wrap';
    wrap.innerHTML = `<div class="tw-stage">${svg.replace(/url\(#JV-/g, `url(#${id}-`)}</div>` +
      `<div class="tw-step-copy" aria-live="polite"><strong class="tw-step-title"></strong><span class="tw-step-text"></span></div>` +
      `<div class="tw-controls"><span class="tw-dots">${STEPS.map((s, j) => `<button type="button" class="tw-dot" aria-label="Show the ${s.k} ${s.k === 'x' || s.k === 'y' ? 'descent' : 'wave'}">${s.k}</button>`).join('')}</span><span class="jv-nav"><button type="button" class="tw-btn jv-prev">← Back</button><button type="button" class="tw-btn jv-next">Next →</button></span></div>`;
    const q = s => wrap.querySelector(s);
    let k = 0;
    const show = j => {
      k = Math.max(0, Math.min(STEPS.length - 1, j));
      const s = STEPS[k];
      const win = q('.jv-win');
      win.setAttribute('x', s.from); win.setAttribute('width', s.to - s.from);
      wrap.querySelectorAll('.jv-letter').forEach(e => e.classList.toggle('is-on', e.dataset.k === s.k));
      q('.jv-heart').innerHTML = heart(s.heart).replace(/url\(#JV-/g, `url(#${id}-`);
      q('.tw-step-title').textContent = s.title;
      q('.tw-step-text').textContent = s.text;
      wrap.querySelectorAll('.tw-dot').forEach((d, i) => d.setAttribute('aria-current', i === k ? 'step' : 'false'));
      q('.jv-prev').disabled = k === 0;
      q('.jv-next').disabled = k === STEPS.length - 1;
    };
    q('.jv-prev').addEventListener('click', () => show(k - 1));
    q('.jv-next').addEventListener('click', () => show(k + 1));
    wrap.querySelectorAll('.tw-dot').forEach((d, j) => d.addEventListener('click', () => show(j)));
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    show(0);
  }

  W.register('jvp-explorer', jvpExplorer);
})();
