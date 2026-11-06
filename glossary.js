/* DOMiNANCE Breakdowns — reusable, accessible inline glossary.
 * Entry format: [title, definition, dontConfuse?, learnHref?, learnLabel?].
 * Hover or keyboard focus previews a card; a click or tap opens it as a small dialog
 * (a bottom sheet on phones) whose "Learn it fully" link opens the section that owns the term. */
(() => {
  'use strict';
  const terms = Object.freeze({
    'functional-syncytium': ['Functional syncytium', 'Heart muscle cells remain separate cells, but electrical signals pass between them so they contract together as one coordinated unit.'],
    'ecc': ['Excitation–contraction coupling (ECC)', 'How an electrical impulse makes heart muscle contract: it triggers a rise in calcium inside the cell, allowing the contractile proteins to work.'],
    'cicr': ['Calcium-induced calcium release (CICR)', 'A small amount of calcium entering a heart cell opens RyR2 channels, releasing much more calcium from its internal store to strengthen contraction.'],
    'serca': ['SERCA2a', 'A pump that uses ATP to return calcium to the heart cell’s internal store, allowing the muscle to relax.'],
    'ncx': ['Na⁺–Ca²⁺ exchanger (NCX)', 'A protein in the heart-cell membrane that usually moves calcium out of the cell by using the energy stored in the sodium gradient.'],
    'phospholamban': ['Phospholamban', 'A protein that normally slows the SERCA calcium pump. When phosphorylated, it releases this brake, so calcium is stored faster and the heart relaxes sooner.'],
    'inotropy': ['Inotropy', 'How strongly heart muscle contracts at a given filling level. Positive inotropy means a stronger contraction without needing extra filling.'],
    'lusitropy': ['Lusitropy', 'How quickly heart muscle relaxes after contracting. Faster relaxation helps the ventricles fill between beats.'],
    'automaticity': ['Automaticity', 'The ability of pacemaker cells to generate their own electrical impulses without needing a signal from a nerve.'],
    'pacemaker-potential': ['Pacemaker potential', 'The slow rise in a pacemaker cell’s membrane voltage between beats until it reaches the level needed to fire again.'],
    'funny-current': ['Funny current (I_f)', 'An inward electrical current through HCN channels that open when pacemaker cells become sufficiently negative. It helps their voltage rise toward the next impulse.'],
    'overdrive-suppression': ['Overdrive suppression', 'Faster impulses from the main pacemaker temporarily suppress slower backup pacemakers. A backup rhythm may take time to start if the main rhythm stops.'],
    'dromotropy': ['Dromotropy', 'The speed at which an electrical impulse travels through heart tissue, especially the AV node. Increased dromotropy means faster conduction.'],
    'bruit': ['Bruit', 'A whooshing sound heard over a blood vessel when moving blood makes the vessel or surrounding tissue vibrate, often due to disturbed flow.'],
    'ecg': ['Electrocardiogram (ECG)', 'A tracing of the heart’s electrical activity recorded from electrodes on the skin. It shows electrical activation and recovery, not the pumping force directly.'],
    'ecg-vector': ['Cardiac electrical vector', 'An arrow representing the overall strength and direction of the heart’s electrical activity at a moment. Each ECG lead records how much of that arrow points along its viewing direction.'],
    'preload': ['Preload', 'How stretched the ventricular muscle is just before contraction. It depends mainly on ventricular filling; end-diastolic volume and pressure help estimate it.'],
    'afterload': ['Afterload', 'The force or load the ventricle must overcome to eject blood. It depends on arterial pressure and ventricular wall stress, not just vascular resistance.'],
    'chronotropy': ['Chronotropy', 'A change in heart rate. Positive chronotropy makes the heart beat faster; negative chronotropy slows it.'],
    'systole-diastole': ["Systole and diastole", "Systole means contraction; diastole means relaxation. Always say which chambers: atrial systole and ventricular systole happen at different times.", "", "#/physiology/cvs/cardiac-cycle?section=1-one-heartbeat-what-the-atria-and-ventricles-are-doing", "Cardiac Cycle §1"],
    'sa-node': ["SA node (sinoatrial node)", "A small patch of pacemaker cells in the wall of the right atrium. It fires on its own and starts every normal heartbeat.", "", "#/physiology/cvs/cardiac-conduction?section=3-why-is-the-sa-node-the-normal-pacemaker", "Cardiac Conduction §3"],
    'av-node': ["AV node (atrioventricular node)", "The normal electrical gateway from the atria to the ventricles. It holds the impulse back briefly, so the atria finish contracting before the ventricles start.", "The AV valves, which are valves, not electrical tissue.", "#/physiology/cvs/cardiac-conduction?section=5-why-does-the-av-node-delay-electrical-conduction", "Cardiac Conduction §5"],
    'his-purkinje': ["His–Purkinje system", "Fast-conducting fibres that carry the impulse from the AV node through both ventricles, so the ventricular muscle is activated almost all at once.", "", "#/physiology/cvs/cardiac-conduction?section=6-why-is-ventricular-conduction-so-rapid", "Cardiac Conduction §6"],
    'av-valves': ["AV valves (atrioventricular valves)", "The valves between each atrium and its ventricle: the mitral valve on the left and the tricuspid valve on the right. They let blood into the ventricles.", "Semilunar valves, which let blood out of the ventricles.", "#/physiology/cvs/cardiac-cycle?section=2-the-one-rule-every-valve-follows", "Cardiac Cycle §2"],
    'semilunar-valves': ["Semilunar valves", "The valves between each ventricle and its artery: the aortic valve on the left and the pulmonary valve on the right. They let blood out of the ventricles.", "AV valves, which let blood into the ventricles.", "#/physiology/cvs/cardiac-cycle?section=2-the-one-rule-every-valve-follows", "Cardiac Cycle §2"],
    'papillary-muscles': ["Papillary muscles", "Small muscles in the ventricle wall, tied to the AV valve cusps by cords called chordae tendineae. They stop the cusps being pushed back into the atria.", "Valve openers. Valves open and shut by pressure alone.", "#/physiology/cvs/cardiac-cycle?section=2-the-one-rule-every-valve-follows", "Cardiac Cycle §2"],
    'atrial-kick': ["Atrial kick", "The final push of blood into the ventricles when the atria contract at the end of diastole. Most filling has already happened before it.", "The main source of filling, which is passive inflow.", "#/physiology/cvs/cardiac-cycle?section=3-filling-how-blood-enters-the-relaxed-ventricle", "Cardiac Cycle §3"],
    'diastasis': ["Diastasis", "The slow part of ventricular filling after the early rush. Atrial and ventricular pressures are now close, so blood only trickles in.", "", "#/physiology/cvs/cardiac-cycle?section=3-filling-how-blood-enters-the-relaxed-ventricle", "Cardiac Cycle §3"],
    'edv': ["EDV (end-diastolic volume)", "The blood in a ventricle at the end of filling, just before it contracts. About 130 mL in the lecture's example.", "Stroke volume, the part that is then ejected.", "#/physiology/cvs/cardiac-cycle?section=3-filling-how-blood-enters-the-relaxed-ventricle", "Cardiac Cycle §3"],
    'esv': ["ESV (end-systolic volume)", "The blood left in a ventricle after it finishes ejecting. A ventricle never empties completely.", "Stroke volume, the part that left.", "#/physiology/cvs/cardiac-cycle?section=5-ejection-why-blood-finally-leaves", "Cardiac Cycle §5"],
    'isovolumetric': ["Isovolumetric phase", "\"Iso\" means same, while \"volumetric\" refers to volume. It describes a period in the cardiac cycle when the inlet and outlet valves of each ventricle are closed, so no blood enters or leaves the ventricles. As a result, ventricular volume remains constant even though ventricular pressure changes.", "Ejection. It happens twice each beat, as isovolumetric contraction and isovolumetric relaxation, and blood only leaves once the outflow valves open: the aortic valve for the left ventricle and the pulmonary valve for the right.", "#/physiology/cvs/cardiac-cycle?section=4-isovolumetric-contraction-contracting-but-no-blood-leaves", "Cardiac Cycle §4"],
    'rapid-reduced-ejection': ["Rapid and reduced ejection", "Ejection starts fast, while the muscle is strong and the push is biggest (rapid). It then slows as the muscle weakens and the aorta fills (reduced).", "", "#/physiology/cvs/cardiac-cycle?section=5-ejection-why-blood-finally-leaves", "Cardiac Cycle §5"],
    's1': ["S1 (first heart sound)", "The \"lub\", heard as the mitral and tricuspid valves shut at the start of ventricular contraction.", "S2, heard when the aortic and pulmonary valves shut.", "#/physiology/cvs/heart-sounds?section=2-why-does-s1-occur-before-s2", "Heart Sounds §2"],
    's2': ["S2 (second heart sound)", "The \"dub\", heard as the aortic and pulmonary valves shut at the end of ejection.", "S1, heard when the mitral and tricuspid valves shut.", "#/physiology/cvs/heart-sounds?section=2-why-does-s1-occur-before-s2", "Heart Sounds §2"],
    'p-wave': ["P wave", "The ECG wave made as the impulse spreads across the atria. The atria contract just after it.", "The a wave, the pressure rise caused by that contraction.", "#/physiology/cvs/ecg?section=5-connect-the-ecg-to-mechanical-events", "Electrocardiography §5"],
    'qrs': ["QRS complex", "The tall ECG spike made as the impulse spreads through the ventricles. The ventricles contract just after it.", "S1, the sound that follows once the AV valves shut.", "#/physiology/cvs/ecg?section=5-connect-the-ecg-to-mechanical-events", "Electrocardiography §5"],
    't-wave': ["T wave", "The ECG wave made as the ventricles recover electrically (repolarise). It appears during late ejection; the muscle's force fades over the moments after.", "The end of ejection. Blood is still leaving during the T wave.", "#/physiology/cvs/ecg?section=5-connect-the-ecg-to-mechanical-events", "Electrocardiography §5"],
    'a-wave': ["a wave", "A small rise in atrial pressure caused by the atria contracting at the end of diastole.", "The P wave, the electrical signal that comes just before it.", "#/physiology/cvs/cardiac-cycle?section=9-reading-the-wiggers-diagram-one-trace-at-a-time", "Cardiac Cycle §9"],
    'c-wave': ["c wave", "A small bump in atrial pressure just as the ventricles start contracting. The rising ventricular pressure pushes the shut tricuspid and mitral valves so they bulge back into the atria. The atria themselves are not contracting.", "The a wave (the atria contracting) or the v wave (the atria filling up with blood).", "#/physiology/cvs/cardiac-cycle?section=4-isovolumetric-contraction-contracting-but-no-blood-leaves", "Cardiac Cycle §4"],
    'x-descent': ["x descent", "A dip in atrial pressure early in ejection. The atria are relaxing, and the contracting ventricles pull the AV valve ring down, making the atria bigger.", "The y descent, which happens when the AV valves open.", "#/physiology/cvs/cardiac-cycle?section=5-ejection-why-blood-finally-leaves", "Cardiac Cycle §5"],
    'v-wave': ["v wave", "A slow rise in atrial pressure while the AV valves are shut, as blood returning from the veins fills the atria. The atria are not contracting.", "The a wave, caused by the atria contracting.", "#/physiology/cvs/cardiac-cycle?section=6-closing-the-outflow-valves-and-isovolumetric-relaxation", "Cardiac Cycle §6"],
    'y-descent': ["y descent", "A drop in atrial pressure when the AV valves open and the blood stored in the atria rushes into the ventricles.", "The x descent, which happens while the AV valves are still shut.", "#/physiology/cvs/cardiac-cycle?section=6-closing-the-outflow-valves-and-isovolumetric-relaxation", "Cardiac Cycle §6"],
    'protodiastole': ["Protodiastole", "The brief moment at the end of ejection when forward flow stops and briefly reverses, pushing the aortic and pulmonary valves shut.", "", "#/physiology/cvs/cardiac-cycle?section=6-closing-the-outflow-valves-and-isovolumetric-relaxation", "Cardiac Cycle §6"],
    'dicrotic-notch': ["Dicrotic notch", "A small dip on the aortic pressure curve the moment the aortic valve snaps shut. For an instant blood moves backwards, causing the dip. Then the stretched aorta springs back against the closed valve, causing the small bump after it.", "A second heartbeat. The heart has not contracted again.", "#/physiology/cvs/cardiac-cycle?section=6-closing-the-outflow-valves-and-isovolumetric-relaxation", "Cardiac Cycle §6"],
    'stroke-volume': ["Stroke volume (SV)", "The blood one ventricle ejects in one beat: SV = EDV − ESV. About 70–90 mL in the lecture.", "EDV, what the ventricle holds before ejecting.", "#/physiology/cvs/cardiac-cycle?section=7-how-much-blood-does-the-ventricle-pump", "Cardiac Cycle §7"],
    'ejection-fraction': ["Ejection fraction (EF)", "The share of a ventricle's filled volume that it ejects each beat: EF = SV ÷ EDV × 100%. About 65% in the lecture.", "Stroke volume, which is a volume in mL, not a percentage.", "#/physiology/cvs/cardiac-cycle?section=7-how-much-blood-does-the-ventricle-pump", "Cardiac Cycle §7"],
    'wiggers': ["Wiggers diagram", "One chart that lines up the ECG, heart pressures, ventricular volume and heart sounds on the same timeline for one heartbeat.", "", "#/physiology/cvs/cardiac-cycle?section=9-reading-the-wiggers-diagram-one-trace-at-a-time", "Cardiac Cycle §9"],
    'pulmonary-impedance': ["Pulmonary impedance", "How much the lung blood vessels oppose blood flow. It falls when the lungs expand on inspiration, so blood keeps flowing into the pulmonary artery for longer.", "", "#/physiology/cvs/cardiac-cycle?section=10-right-versus-left-heart-s2-splitting-and-heart-rate", "Cardiac Cycle §10"],
    's2-splitting': ["Physiological splitting of S2", "S2 has two parts: A2 (aortic valve shutting) and P2 (pulmonary valve shutting). On inspiration, more blood returns to the right heart and the pulmonary vessels offer less opposition to flow, so right ventricular ejection lasts longer, P2 is delayed and the A2–P2 gap widens.", "A sign of disease. This widening on inspiration is normal.", "#/physiology/cvs/cardiac-cycle?section=10-right-versus-left-heart-s2-splitting-and-heart-rate", "Cardiac Cycle §10"]
  });
  window.DOM_GLOSSARY = terms;

  const main = document.getElementById('main');
  if (!main) return;

  const popup = document.createElement('div');
  popup.id = 'dom-glossary-popup';
  popup.className = 'glossary-popup';
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-modal', 'false');
  popup.tabIndex = -1;
  popup.hidden = true;
  document.body.appendChild(popup);
  let active = null;
  let pinned = false;
  let restoring = false;
  const phone = () => window.matchMedia && matchMedia('(max-width: 560px)').matches;

  function place(trigger) {
    if (!trigger || popup.classList.contains('is-sheet')) return;
    const r = trigger.getBoundingClientRect();
    const p = popup.getBoundingClientRect();
    const w = p.width;
    const left = Math.max(10, Math.min(innerWidth - w - 10, r.left + r.width / 2 - w / 2));
    const yAbove = r.top - p.height - 10;
    const top = yAbove >= 8 ? yAbove : Math.min(innerHeight - p.height - 8, r.bottom + 10);
    popup.style.left = left + 'px';
    popup.style.top = Math.max(8, top) + 'px';
  }
  function hide(returnFocus = false) {
    const trigger = active;
    if (active) {active.removeAttribute('aria-describedby');active.setAttribute('aria-expanded','false');}
    popup.hidden = true;
    popup.classList.remove('is-sheet');
    active = null;
    pinned = false;
    if (returnFocus && trigger && document.contains(trigger)) {restoring = true; trigger.focus({preventScroll: true}); restoring = false;}
  }
  function show(trigger, stick = false) {
    const entry = terms[trigger?.dataset.glossary];
    if (!entry) return;
    if (active && active !== trigger) {active.removeAttribute('aria-describedby');active.setAttribute('aria-expanded','false');}
    active = trigger; pinned = stick;
    const [name, definition, confuse, href, label] = entry;
    popup.replaceChildren();
    const title = document.createElement('strong');
    title.className = 'gl-title';
    title.id = 'dom-glossary-title';
    title.textContent = name;
    const body = document.createElement('span');
    body.className = 'gl-def';
    body.textContent = definition;
    popup.append(title, body);
    if (confuse) {
      const c = document.createElement('span');
      c.className = 'gl-confuse';
      const b = document.createElement('b');
      b.textContent = "Don't confuse with: ";
      c.append(b, confuse);
      popup.append(c);
    }
    if (href) {
      const a = document.createElement('a');
      a.className = 'gl-learn';
      a.href = href;
      a.textContent = 'Learn it fully → ' + (label || '');
      a.addEventListener('click', () => hide());
      popup.append(a);
    }
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'gl-close';
    close.setAttribute('aria-label', 'Close definition');
    close.textContent = '×';
    close.addEventListener('click', () => hide(true));
    popup.append(close);
    popup.setAttribute('aria-labelledby', title.id);
    popup.classList.toggle('is-sheet', stick && phone());
    popup.hidden = false;
    trigger.setAttribute('aria-describedby', popup.id);
    trigger.setAttribute('aria-expanded', 'true');
    place(trigger);
    if (stick && (href || popup.classList.contains('is-sheet'))) popup.focus({preventScroll: true});
  }
  function enhance() {
    main.querySelectorAll('span[data-term]').forEach(span => {
      if (!terms[span.dataset.term]) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'glossary-trigger';
      b.dataset.glossary = span.dataset.term;
      b.innerHTML = span.innerHTML;
      b.setAttribute('aria-label', span.textContent + ', show glossary definition');
      b.setAttribute('aria-expanded','false');
      b.setAttribute('aria-haspopup','dialog');
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
    if (!active.contains(e.relatedTarget) && !popup.contains(e.relatedTarget)) hide();
  });
  popup.addEventListener('pointerleave', e => {
    if (!pinned && e.pointerType !== 'touch' && !(active && active.contains(e.relatedTarget))) hide();
  });
  main.addEventListener('focusin', e => {
    if (e.target.matches?.('.glossary-trigger') && !pinned && !restoring) show(e.target);
  });
  main.addEventListener('focusout', e => {
    if (active === e.target && !pinned && !popup.contains(e.relatedTarget)) hide();
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
  document.addEventListener('keydown', e => {if (e.key === 'Escape' && active) hide(popup.contains(document.activeElement));});
  window.addEventListener('scroll', () => {if (active) place(active);}, {passive:true});
  window.addEventListener('resize', () => {if (active) place(active);}, {passive:true});
})();
