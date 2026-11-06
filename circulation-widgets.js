/* DOMiNANCE Breakdowns — circulation overview widgets (Chapter 1).
 * circuit-map: static schematic of the series loop (heart–lungs–heart) and the parallel systemic organs. */
(() => {
  'use strict';
  const W = window.DOMWidgets;
  if (!W) return;
  const {svgOpen, keepDescription, nextId} = W.helpers;

  function circuitMap(fig) {
    const id = nextId('cm');
    const arrow = (d, cls) => `<path d="${d}" class="cm-line ${cls}" marker-end="url(#${id}-${cls})"/>`;
    const box = (x, y, w, h, label, cls = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" class="tw-chamber ${cls}"/><text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle" class="tw-small tw-strong">${label}</text>`;
    const organs = ['Brain', 'Heart muscle (coronary arteries)', 'Gut and liver', 'Kidneys', 'Skeletal muscle', 'Skin'];
    const rungs = organs.map((o, i) => {
      const y = 168 + i * 30;
      return `<line x1="440" y1="${y}" x2="378" y2="${y}" class="cm-line cm-rich"/>` +
        `<rect x="160" y="${y - 11}" width="218" height="22" rx="6" class="tw-chamber cm-organ"/><text x="269" y="${y + 4}" text-anchor="middle" class="tw-tiny">${o}</text>` +
        arrow(`M160 ${y} H106`, 'cm-poor');
    }).join('');
    const svg = svgOpen(540, 392, 'Blood leaves the right heart, passes through the lungs and returns to the left heart: these two circuits are in series. From the left heart the aorta divides into side-by-side branches to the brain, heart muscle, gut and liver, kidneys, skeletal muscle and skin: these organs are in parallel. Their veins rejoin and return to the right heart.') +
      `<defs>${['cm-rich', 'cm-poor'].map(c => `<marker id="${id}-${c}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="cm-head ${c}"/></marker>`).join('')}</defs>` +
      box(196, 14, 148, 44, 'Lungs', 'cm-lungs') +
      box(40, 92, 120, 44, 'Right heart') + box(380, 92, 120, 44, 'Left heart') +
      arrow('M100 92 V36 H190', 'cm-poor') + arrow('M350 36 H440 V86', 'cm-rich') +
      `<text x="270" y="82" text-anchor="middle" class="tw-tiny tw-strong">In series: all the blood passes through the lungs</text>` +
      `<line x1="440" y1="136" x2="440" y2="318" class="cm-line cm-rich"/><text x="448" y="156" class="tw-tiny tw-strong cm-rich-text">Aorta</text>` +
      `<line x1="100" y1="318" x2="100" y2="160" class="cm-line cm-poor"/>` + arrow('M100 162 V142', 'cm-poor') +
      `<text x="90" y="246" text-anchor="end" class="tw-tiny tw-strong cm-poor-text">Veins</text>` +
      rungs +
      `<path d="M474 158 h8 v170 h-8" class="cm-bracket"/><text x="500" y="243" text-anchor="middle" class="tw-small tw-strong" transform="rotate(90 500 243)">In parallel</text>` + `<text x="269" y="346" text-anchor="middle" class="tw-tiny tw-strong">Each organ has its own branch from the aorta</text>` +
      `<line x1="40" y1="374" x2="70" y2="374" class="cm-line cm-rich"/><text x="76" y="378" class="tw-tiny">oxygen-rich blood</text>` +
      `<line x1="220" y1="374" x2="250" y2="374" class="cm-line cm-poor"/><text x="256" y="378" class="tw-tiny">oxygen-poor blood</text></svg>`;
    fig.querySelector('figcaption').insertAdjacentHTML('afterend', svg);
    keepDescription(fig);
  }

  W.register('circuit-map', circuitMap);
})();
