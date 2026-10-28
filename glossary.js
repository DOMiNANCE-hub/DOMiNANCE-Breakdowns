/* DOMiNANCE Breakdowns — reusable, accessible inline glossary. */
(() => {
  'use strict';
  const terms = Object.freeze({
    'functional-syncytium': ['Functional syncytium', 'Separate cells that coordinate electrical activity and contraction as a functional unit.'],
    'ecc': ['Excitation–contraction coupling (ECC)', 'The process by which an action potential raises intracellular Ca²⁺ and initiates contraction.'],
    'cicr': ['Calcium-induced calcium release (CICR)', 'Incoming Ca²⁺ activates RyR2 channels so the sarcoplasmic reticulum releases much more Ca²⁺.'],
    'serca': ['SERCA2a', 'ATP-driven pump that transfers Ca²⁺ from the cytosol into the sarcoplasmic reticulum, promoting relaxation.'],
    'ncx': ['Na⁺–Ca²⁺ exchanger (NCX)', 'A protein in the heart-cell membrane that usually moves calcium out of the cell by using the energy stored in the sodium gradient.'],
    'phospholamban': ['Phospholamban', 'SR regulatory protein that inhibits SERCA2a. Phosphorylation reduces this inhibition and speeds Ca²⁺ reuptake.'],
    'inotropy': ['Inotropy', 'How strongly heart muscle contracts at a given filling level. Positive inotropy means a stronger contraction without needing extra filling.'],
    'lusitropy': ['Lusitropy', 'How quickly heart muscle relaxes after contracting. Faster relaxation helps the ventricles fill between beats.'],
    'automaticity': ['Automaticity', 'The ability of specialised cardiac cells to initiate action potentials spontaneously without an external nerve impulse.'],
    'pacemaker-potential': ['Pacemaker potential', 'Gradual spontaneous diastolic depolarisation (phase 4) that brings pacemaker cells towards threshold.'],
    'funny-current': ['Funny current (I_f)', 'Net inward pacemaker current carried by HCN channels that open at negative membrane potentials and help drive phase 4 depolarisation.'],
    'overdrive-suppression': ['Overdrive suppression', 'Reduced subsidiary pacemaker automaticity after sustained faster pacing, which can delay the onset of an escape rhythm.'],
    'dromotropy': ['Dromotropy', 'An effect on cardiac conduction speed, particularly through the atrioventricular node.'],
    'diastasis': ['Diastasis', 'Slower ventricular filling after the early rapid-filling phase, as the atrioventricular pressure difference narrows.'],
    'atrial-kick': ['Atrial kick', 'The additional blood delivered to a ventricle by atrial contraction near the end of ventricular diastole.'],
    'esv': ['End-systolic volume (ESV)', 'Blood remaining inside a ventricle at the end of ejection.'],
    'edv': ['End-diastolic volume (EDV)', 'Amount of blood in one ventricle after filling and just before ventricular systole.'],
    'isovolumetric': ['Isovolumetric phase', 'A phase when ventricular pressure changes but blood volume stays the same because both the inlet and outlet valves are closed.'],
    'ejection-fraction': ['Ejection fraction (EF)', 'Stroke volume divided by end-diastolic volume, expressed as a percentage: EF = SV / EDV × 100%.'],
    'wiggers': ['Wiggers diagram', 'A time-aligned plot linking ECG, cardiac chamber and arterial pressures, ventricular volume, valve events and heart sounds.'],
    'bruit': ['Bruit', 'An abnormal vascular sound heard over a blood vessel, caused by flow-induced vibrations, often associated with disturbed blood flow.'],
    'ecg': ['Electrocardiogram (ECG)', 'A time-based recording of electrical potential differences produced by cardiac activation and recovery, detected on the skin.'],
    'ecg-vector': ['Cardiac electrical vector', 'The combined direction and magnitude of the heart’s electrical activity at an instant; each ECG lead records its projection along that lead’s axis.'],
    'preload': ['Preload', 'How stretched the ventricular muscle is just before contraction. It depends mainly on ventricular filling; end-diastolic volume and pressure help estimate it.'],
    'afterload': ['Afterload', 'The force or load the ventricle must overcome to eject blood. It depends on arterial pressure and ventricular wall stress, not just vascular resistance.'],
    'chronotropy': ['Chronotropy', 'Effect on heart rate. Positive chronotropy means a faster heart rate.']
  });
  window.DOM_GLOSSARY = terms;

  const main = document.getElementById('main');
  if (!main) return;

  const popup = document.createElement('div');
  popup.id = 'dom-glossary-popup';
  popup.className = 'glossary-popup';
  popup.setAttribute('role', 'tooltip');
  popup.setAttribute('aria-live','polite');
  popup.hidden = true;
  document.body.appendChild(popup);
  let active = null;
  let pinned = false;

  function place(trigger) {
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    const p = popup.getBoundingClientRect();
    const w = p.width;
    const left = Math.max(10, Math.min(innerWidth - w - 10, r.left + r.width / 2 - w / 2));
    const yAbove = r.top - p.height - 10;
    const top = yAbove >= 8 ? yAbove : Math.min(innerHeight - p.height - 8, r.bottom + 10);
    popup.style.left = left + 'px';
    popup.style.top = Math.max(8, top) + 'px';
  }
  function hide() {
    if (active) active.removeAttribute('aria-describedby');
    popup.hidden = true;
    active = null;
    pinned = false;
  }
  function show(trigger, stick = false) {
    const entry = terms[trigger?.dataset.glossary];
    if (!entry) return;
    if (active && active !== trigger) active.removeAttribute('aria-describedby');
    active = trigger; pinned = stick;
    popup.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = entry[0];
    const body = document.createElement('span');
    body.textContent = entry[1];
    popup.append(title, body);
    popup.hidden = false;
    trigger.setAttribute('aria-describedby', popup.id);
    place(trigger);
  }
  function enhance() {
    main.querySelectorAll('span[data-term]').forEach(span => {
      if (!terms[span.dataset.term]) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'glossary-trigger';
      b.dataset.glossary = span.dataset.term;
      b.textContent = span.textContent;
      b.setAttribute('aria-label', span.textContent + ', show glossary definition');
      span.replaceWith(b);
    });
    if (active && !document.contains(active)) hide();
  }
  const observer = new MutationObserver(enhance);
  observer.observe(main, {childList: true, subtree: true});
  enhance();

  main.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch') return;
    const target = e.target.closest?.('.glossary-trigger');
    if (target && !pinned) show(target);
  });
  main.addEventListener('pointerout', e => {
    if (pinned || !active || e.pointerType === 'touch') return;
    if (!active.contains(e.relatedTarget)) hide();
  });
  main.addEventListener('focusin', e => {
    if (e.target.matches?.('.glossary-trigger') && !pinned) show(e.target);
  });
  main.addEventListener('focusout', e => {
    if (active === e.target && !pinned) hide();
  });
  main.addEventListener('click', e => {
    const target = e.target.closest?.('.glossary-trigger');
    if (!target) return;
    e.preventDefault();
    if (active === target && pinned) hide();
    else show(target, true);
  });
  document.addEventListener('pointerdown', e => {
    if (pinned && active && !active.contains(e.target) && !popup.contains(e.target)) hide();
  });
  document.addEventListener('keydown', e => {if (e.key === 'Escape') hide();});
  window.addEventListener('scroll', () => {if (active) place(active);}, {passive:true});
  window.addEventListener('resize', () => {if (active) place(active);}, {passive:true});
})();
