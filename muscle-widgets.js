/* DOMiNANCE Breakdowns — cardiac muscle widgets (Chapter 2).
 * calcium-cycle: seven-step walk through excitation–contraction coupling and relaxation on one simple cell drawing.
 * Ca²⁺ ions are dots that move between compartments (CSS transitions on transform). */
(() => {
  'use strict';
  const W = window.DOMWidgets;
  if (!W) return;
  const {svgOpen, keepDescription} = W.helpers;

  const STEPS = [
    {part: 'ttub', title: 'Step 1: the signal arrives', text: 'The action potential travels along the cell surface and down the T-tubule, deep into the cell.', ca: 'start', fil: 'relaxed'},
    {part: 'ltype', title: 'Step 2: a little Ca²⁺ enters', text: 'The voltage change opens the L-type channels, and a small amount of Ca²⁺ flows in from outside the cell.', ca: 'trigger', fil: 'relaxed'},
    {part: 'ryr', title: 'Step 3: the SR releases much more', text: 'That Ca²⁺ opens RyR2, the release channel of the SR, and the store pours out far more Ca²⁺. This is calcium-induced calcium release.', ca: 'released', fil: 'relaxed'},
    {part: 'trop', title: 'Step 4: Ca²⁺ unlocks the filaments', text: 'Ca²⁺ binds troponin C on the actin filament. Tropomyosin shifts and uncovers the spots where myosin can grab actin.', ca: 'bound', fil: 'relaxed'},
    {part: 'myo', title: 'Step 5: myosin pulls', text: 'Myosin heads grab actin and pull, using ATP. The actin filaments slide inwards, the sarcomere shortens and the cell contracts.', ca: 'boundC', fil: 'contracted'},
    {part: 'serca', title: 'Step 6: SERCA2a refills the store', text: 'SERCA2a, powered by ATP, pumps most of the Ca²⁺ back into the SR, ready for the next beat.', ca: 'stored', fil: 'contracted'},
    {part: 'ncx', title: 'Step 7: NCX removes the rest, and the cell relaxes', text: 'NCX swaps Na⁺ in for Ca²⁺ out, removing the Ca²⁺ that entered. With Ca²⁺ gone from troponin, myosin lets go and the cell relaxes.', ca: 'end', fil: 'relaxed'}
  ];
  // dot positions per state: 3 trigger ions (entered from outside) + 9 store ions (live in the SR)
  const sr = [[182, 120], [212, 120], [242, 120], [272, 120], [302, 120], [197, 140], [227, 140], [257, 140], [287, 140]];
  const troponin = [[178, 214], [214, 214], [250, 214], [286, 214], [352, 214], [388, 214], [424, 214], [460, 214], [322, 214], [196, 214], [406, 214], [442, 214]];
  const cytosol = [[176, 178], [204, 188], [232, 176], [262, 190], [292, 178], [322, 190], [352, 178], [382, 190], [412, 178]];
  const shift = pts => pts.map(([x, y]) => [x + (x < 320 ? 18 : -18), y]);
  const POS = {
    start: {t: [[110, 58], [110, 78], [110, 98]], s: sr},
    trigger: {t: [[140, 118], [140, 138], [140, 158]], s: sr},
    released: {t: [[140, 118], [140, 138], [140, 158]], s: cytosol},
    bound: {t: troponin.slice(9), s: troponin.slice(0, 9)},
    boundC: {t: shift(troponin.slice(9)), s: shift(troponin.slice(0, 9))},
    stored: {t: [[420, 120], [440, 132], [460, 120]], s: sr},
    end: {t: [[440, 20], [458, 14], [476, 20]], s: sr}
  };

  function calciumCycle(fig) {
    const svg = svgOpen(540, 300, 'A heart muscle cell: the cell membrane with a T-tubule and an L-type calcium channel, the sarcoplasmic reticulum with its release channel RyR2 and its pump SERCA2a, the sodium–calcium exchanger NCX in the membrane, and one actin–myosin unit. Calcium ions move between these compartments in seven steps.') +
      `<text x="26" y="22" class="tw-tiny tw-muted">Outside the cell</text>` +
      `<path d="M20 40 H100 V176 H120 V40 H520" class="cc-membrane"/>` +
      `<g class="cc-part" data-part="ttub"><path d="M100 40 V176 H120 V40" class="cc-ttub"/><text x="72" y="196" class="tw-tiny tw-strong">T-tubule</text></g>` +
      `<g class="cc-part" data-part="ltype"><rect x="116" y="138" width="12" height="22" rx="3" class="cc-channel"/><text x="62" y="152" class="tw-tiny tw-strong" text-anchor="middle">L-type</text><path d="M78 149 H112" class="cc-pointer"/></g>` +
      `<rect x="160" y="104" width="160" height="50" rx="22" class="cc-sr"/><text x="240" y="98" text-anchor="middle" class="tw-tiny tw-strong">SR (calcium store)</text>` +
      `<g class="cc-part" data-part="ryr"><rect x="154" y="120" width="12" height="18" rx="3" class="cc-channel"/><text x="150" y="88" class="tw-tiny tw-strong" text-anchor="middle">RyR2</text><path d="M152 92 L159 118" class="cc-pointer"/></g>` +
      `<g class="cc-part" data-part="serca"><circle cx="322" cy="129" r="9" class="cc-pump"/><text x="342" y="118" class="tw-tiny tw-strong">SERCA2a</text></g>` +
      `<g class="cc-part" data-part="ncx"><rect x="454" y="34" width="22" height="12" rx="3" class="cc-channel"/><text x="465" y="64" text-anchor="middle" class="tw-tiny tw-strong">NCX</text><text x="465" y="78" class="tw-tiny tw-muted" text-anchor="middle">Na⁺ in · Ca²⁺ out</text></g>` +
      `<g class="cc-part" data-part="trop">` +
        `<g class="cc-actin cc-left"><line x1="166" y1="222" x2="298" y2="222" class="cc-actin-line"/></g>` +
        `<g class="cc-actin cc-right"><line x1="342" y1="222" x2="474" y2="222" class="cc-actin-line"/></g>` +
        `<text x="160" y="266" class="tw-tiny tw-muted">actin (with troponin)</text></g>` +
      `<g class="cc-part" data-part="myo"><line x1="230" y1="248" x2="410" y2="248" class="cc-myosin"/>` +
        [242, 266, 290, 350, 374, 398].map(x => `<line x1="${x}" y1="248" x2="${x + (x < 320 ? -8 : 8)}" y2="230" class="cc-head"/>`).join('') +
        `<text x="410" y="266" class="tw-tiny tw-muted" text-anchor="end">myosin</text></g>` +
      `<line x1="166" y1="210" x2="166" y2="256" class="cc-zline cc-left"/><line x1="474" y1="210" x2="474" y2="256" class="cc-zline cc-right"/>` +
      `<text x="320" y="290" text-anchor="middle" class="tw-tiny tw-muted">one sarcomere</text>` +
      `<g class="cc-signal">${[62, 92, 122, 152].map(y => `<text x="92" y="${y}" text-anchor="middle" class="cc-plus">+</text>`).join('')}</g>` +
      Array.from({length: 12}, (_, k) => `<circle r="6" class="cc-ion ${k < 3 ? 'cc-trigger' : ''}" data-k="${k}"/>`).join('') +
      `<text x="520" y="290" text-anchor="end" class="tw-tiny cc-legend">● Ca²⁺</text></svg>`;
    const wrap = document.createElement('div');
    wrap.className = 'tw-stepper cc-stepper';
    wrap.innerHTML = `<div class="tw-stage">${svg}</div><div class="tw-step-copy" aria-live="polite"><strong class="tw-step-title"></strong><span class="tw-step-text"></span></div>` +
      `<div class="tw-controls"><button type="button" class="tw-btn tw-prev">← Back</button><span class="tw-dots">${STEPS.map((_, j) => `<button type="button" class="tw-dot" aria-label="Show step ${j + 1}">${j + 1}</button>`).join('')}</span><button type="button" class="tw-btn tw-next">Next →</button></div>`;
    const ions = [...wrap.querySelectorAll('.cc-ion')];
    const draw = i => {
      const s = STEPS[i], p = POS[s.ca];
      ions.forEach((c, k) => { const [x, y] = k < 3 ? p.t[k] : p.s[k - 3]; c.style.transform = `translate(${x}px, ${y}px)`; });
      wrap.querySelectorAll('.cc-part').forEach(g => g.classList.toggle('is-on', g.dataset.part === s.part));
      wrap.querySelector('.cc-signal').classList.toggle('is-on', i === 0);
      wrap.querySelector('svg').classList.toggle('cc-contracted', s.fil === 'contracted');
      wrap.querySelector('.tw-step-title').textContent = s.title;
      wrap.querySelector('.tw-step-text').textContent = s.text;
      wrap.querySelector('.tw-prev').disabled = i === 0;
      wrap.querySelector('.tw-next').disabled = i === STEPS.length - 1;
      wrap.querySelectorAll('.tw-dot').forEach((d, j) => d.setAttribute('aria-current', j === i ? 'step' : 'false'));
    };
    let at = 0;
    wrap.querySelector('.tw-prev').addEventListener('click', () => draw(at = Math.max(0, at - 1)));
    wrap.querySelector('.tw-next').addEventListener('click', () => draw(at = Math.min(STEPS.length - 1, at + 1)));
    wrap.querySelectorAll('.tw-dot').forEach((d, j) => d.addEventListener('click', () => draw(at = j)));
    fig.querySelector('figcaption').after(wrap);
    keepDescription(fig);
    draw(0);
  }

  W.register('calcium-cycle', calciumCycle);
})();
