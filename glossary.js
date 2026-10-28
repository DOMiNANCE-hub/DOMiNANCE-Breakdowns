/* DOMiNANCE Breakdowns — reusable, accessible inline glossary. */
(() => {
  'use strict';
  const terms = Object.freeze({
    'functional-syncytium': ['Functional syncytium', 'Heart muscle cells remain separate cells, but electrical signals pass between them so they contract together as one coordinated unit.'],
    'ecc': ['Excitation–contraction coupling (ECC)', 'How an electrical impulse makes heart muscle contract: it triggers a rise in calcium inside the cell, allowing the contractile proteins to work.'],
    'cicr': ['Calcium-induced calcium release (CICR)', 'A small amount of calcium entering a heart cell opens RyR2 channels, releasing much more calcium from its internal store to strengthen contraction.'],
    'serca': ['SERCA2a', 'A pump that uses ATP to return calcium to the heart cell's internal store, allowing the muscle to relax.'],
    'ncx': ['Na⁺–Ca²⁺ exchanger (NCX)', 'A protein in the heart-cell membrane that usually moves calcium out of the cell by using the energy stored in the sodium gradient.'],
    'phospholamban': ['Phospholamban', 'A protein that normally slows the SERCA calcium pump. When phosphorylated, it releases this brake, so calcium is stored faster and the heart relaxes sooner.'],
    'inotropy': ['Inotropy', 'How strongly heart muscle contracts at a given filling level. Positive inotropy means a stronger contraction without needing extra filling.'],
    'lusitropy': ['Lusitropy', 'How quickly heart muscle relaxes after contracting. Faster relaxation helps the ventricles fill between beats.'],
    'automaticity': ['Automaticity', 'The ability of pacemaker cells to generate their own electrical impulses without needing a signal from a nerve.'],
    'pacemaker-potential': ['Pacemaker potential', 'The slow rise in a pacemaker cell's membrane voltage between beats until it reaches the level needed to fire again.'],
    'funny-current': ['Funny current (I_f)', 'An inward electrical current through HCN channels that open when pacemaker cells become sufficiently negative. It helps their voltage rise toward the next impulse.'],
    'overdrive-suppression': ['Overdrive suppression', 'Faster impulses from the main pacemaker temporarily suppress slower backup pacemakers. A backup rhythm may take time to start if the main rhythm stops.'],
    'dromotropy': ['Dromotropy', 'The speed at which an electrical impulse travels through heart tissue, especially the AV node. Increased dromotropy means faster conduction.'],
    'diastasis': ['Diastasis', 'The slower part of ventricular filling after most of the early rapid flow has occurred, because the pressure difference between atrium and ventricle has become smaller.'],
    'atrial-kick': ['Atrial kick', 'The extra blood pushed into a ventricle when its atrium contracts just before ventricular contraction. Most filling normally happens before this.'],
    'esv': ['End-systolic volume (ESV)', 'The volume of blood left in a ventricle after it finishes ejecting blood in systole.'],
    'edv': ['End-diastolic volume (EDV)', 'The volume of blood in a ventricle at the end of filling, just before it contracts.'],
    'isovolumetric': ['Isovolumetric phase', 'A phase when ventricular pressure changes but blood volume stays the same because both the inlet and outlet valves are closed.'],
    'ejection-fraction': ['Ejection fraction (EF)', 'The percentage of blood in a filled ventricle that is pumped out with each beat. EF = stroke volume ÷ end-diastolic volume × 100%.'],
    'wiggers': ['Wiggers diagram', 'A diagram showing the electrical, pressure, volume, valve and heart-sound changes during one heartbeat on the same timeline.'],
    'bruit': ['Bruit', 'A whooshing sound heard over a blood vessel when moving blood makes the vessel or surrounding tissue vibrate, often due to disturbed flow.'],
    'ecg': ['Electrocardiogram (ECG)', 'A tracing of the heart's electrical activity recorded from electrodes on the skin. It shows electrical activation and recovery, not the pumping force directly.'],
    'ecg-vector': ['Cardiac electrical vector', 'An arrow representing the overall strength and direction of the heart's electrical activity at a moment. Each ECG lead records how much of that arrow points along its viewing direction.'],
    'preload': ['Preload', 'How stretched the ventricular muscle is just before contraction. It depends mainly on ventricular filling; end-diastolic volume and pressure help estimate it.'],
    'afterload': ['Afterload', 'The force or load the ventricle must overcome to eject blood. It depends on arterial pressure and ventricular wall stress, not just vascular resistance.'],
    'chronotropy': ['Chronotropy', 'A change in heart rate. Positive chronotropy makes the heart beat faster; negative chronotropy slows it.']
  });
  window.DOM_GLOSSARY = terms;

  const main = document.getElementById('main');
  if (!main) return;

  const popup = document.createElement('div');
  popup.id = 'dom-glossary-popup';
  popup.className = 'glossary-popup';
  popup.setAttribute('role', 'tooltip');
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
    if (active) {active.removeAttribute('aria-describedby');active.setAttribute('aria-expanded','false');}
    popup.hidden = true;
    active = null;
    pinned = false;
  }
  function show(trigger, stick = false) {
    const entry = terms[trigger?.dataset.glossary];
    if (!entry) return;
    if (active && active !== trigger) {active.removeAttribute('aria-describedby');active.setAttribute('aria-expanded','false');}
    active = trigger; pinned = stick;
    popup.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = entry[0];
    const body = document.createElement('span');
    body.textContent = entry[1];
    popup.append(title, body);
    popup.hidden = false;
    trigger.setAttribute('aria-describedby', popup.id);
    trigger.setAttribute('aria-expanded', 'true');
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
      b.setAttribute('aria-expanded','false');
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
