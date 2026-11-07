# Arterial Blood Pressure

## 1. What exactly is arterial blood pressure?

**Blood pressure** is the push of blood against the artery walls. It rises and falls with every heartbeat, so we report two numbers:

| | What it is |
|---|---|
| **Systolic (SBP)** | The **highest** pressure, reached as the ventricle ejects |
| **Diastolic (DBP)** | The **lowest** pressure, just before the next ejection |

**120/70 mmHg** means systolic 120, diastolic 70. These are the lecture's example values. Diagnosing high blood pressure uses clinical guidelines, not one fixed number.

**Why does pressure swing up and down?** Each ejection pushes extra blood into the arteries, so pressure rises. Between beats, blood keeps draining into the small vessels, so pressure falls until the next beat.

## 2. Why doesn't blood stop moving during diastole?

In diastole the aortic valve is shut and no blood is being ejected, yet blood keeps flowing through the arteries. The reason is the **Windkessel effect** (German for "air chamber", after the air-filled chamber old fire pumps used to smooth out their spurts):

1. **Systole:** blood is ejected faster than it can drain away, so the elastic aorta **stretches**, storing some of the energy.
2. **Diastole:** the aorta **springs back**, pushing the stored blood onwards.

<figure class="learning-figure bp-windkessel-figure dg-figure"><figcaption>Figure 1. Windkessel mechanism — elastic arterial energy storage and recoil</figcaption><svg viewBox="0 0 360 392" role="img" aria-label="Two panels. Systole: the aortic valve is open, the left ventricle ejects and the aorta stretches outwards, storing energy. Diastole: the aortic valve is shut, the aortic wall recoils inwards and keeps blood flowing forward."><defs><marker id="wk-m" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="dg-head"/></marker><marker id="wk-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="dg-head-blue"/></marker><marker id="wk-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="dg-head-red"/></marker><marker id="wk-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="dg-head-gold"/></marker></defs><text x="10" y="22" class="dg-h">Systole: aortic valve open</text><rect x="10" y="40" width="70" height="70" rx="14" class="dg-blue"/><text x="45" y="80" class="dg-b" text-anchor="middle">LV</text><path d="M84 60l12-9M84 90l12 9" class="dg-valve-open"/><path d="M96 58C150 30 290 30 350 56V94C290 120 150 120 96 92Z" class="dg-red-soft"/><path d="M104 75H334" class="dg-flow" marker-end="url(#wk-b)"/><path d="M222 44V22" class="dg-push" marker-end="url(#wk-m)"/><path d="M222 106V128" class="dg-push" marker-end="url(#wk-m)"/><text x="10" y="148" class="dg-s">Blood is ejected faster than it can</text><text x="10" y="166" class="dg-s">run off, so the aorta stretches and</text><text x="10" y="184" class="dg-s">stores energy in its elastic wall.</text><text x="10" y="222" class="dg-h">Diastole: aortic valve shut</text><rect x="10" y="240" width="70" height="70" rx="14" class="dg-blue"/><text x="45" y="280" class="dg-b" text-anchor="middle">LV</text><path d="M89 256V294" class="dg-valve-shut"/><path d="M96 258C150 268 290 268 350 258V292C290 282 150 282 96 292Z" class="dg-red-soft"/><path d="M110 275H334" class="dg-flow" marker-end="url(#wk-b)"/><path d="M222 234V258" class="dg-push" marker-end="url(#wk-m)"/><path d="M222 318V294" class="dg-push" marker-end="url(#wk-m)"/><text x="10" y="344" class="dg-s">No blood leaves the heart, but the wall</text><text x="10" y="362" class="dg-s">recoils and keeps pushing blood onwards,</text><text x="10" y="380" class="dg-s">so flow continues and pressure falls slowly.</text></svg><p>Original schematic, not to scale. Elastic recoil turns the heart's pulsed output into a steadier flow through the tissues.</p></figure>

So flow is **smooth and continuous** in the tissues even though the heart pumps in spurts. Pressure still falls in diastole; the recoil just slows the fall.

**A stiff aorta can't stretch much.** The same <span data-term="stroke-volume">stroke volume</span> then pushes systolic pressure higher, and with less recoil, diastolic pressure falls lower. That is why older people often have high systolic pressure with a **wide <span data-term="pulse-pressure">pulse pressure</span>**. *(<a href="#/physiology/cvs/pulses?section=1-what-is-an-arterial-pulse">→ Pulses and JVP, §1</a>)*

## 3. Why do systolic and diastolic pressure depend on more than heart rate?

Blood pressure is set by **how much blood the heart pumps** and **how hard it is for that blood to drain away**:

<div class="equation-block"><span class="equation-label">Mean pressure and flow</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>MAP</mi><mo>−</mo><mi>CVP</mi><mo>≈</mo><mi>CO</mi><mo>×</mo><mi>SVR</mi></math><span class="equation-example">MAP = mean arterial pressure; CVP = central venous pressure; SVR = systemic vascular resistance.</span></div>

Because <span data-term="cvp">CVP</span> is near zero, this is usually written **<span data-term="map">MAP</span> ≈ CO × SVR** (systemic vascular resistance). It is the same rule as Q = ΔP ÷ R, rearranged. *(<a href="#/physiology/cvs/hemodynamics?section=2-what-actually-determines-flow">→ Haemodynamics, §2</a>)*

So pressure rises if **cardiac output** rises or if the **arterioles tighten** (SVR rises). Heart rate alone doesn't tell you what BP will do.

**Blood pressure is not the same as blood flow.** After a bleed, the arterioles tighten hard (high SVR), which can hold BP near normal even while cardiac output, and tissue blood flow, are falling. A normal BP doesn't prove the tissues are getting enough blood. *(<a href="#/physiology/cvs/shock">→ Shock</a>)*

**Understanding Check: Sections 1–3**

<p><strong>1.</strong> Why does blood keep flowing through the arteries in diastole, with the aortic valve shut?<span class="mcq-options"><span class="mcq-option" data-option="A">A. The ventricle keeps ejecting a small amount in diastole</span><span class="mcq-option" data-option="B">B. The aorta stretched in systole recoils and pushes blood onwards</span><span class="mcq-option" data-option="C">C. The veins draw blood out of the arteries by suction</span><span class="mcq-option" data-option="D">D. The aortic valve leaks slightly in every healthy heart</span></span></p>
<details class="mcq-answer" data-answer="B"><summary>Show answer and explanation</summary><p><em>Answer: B.</em> The Windkessel effect: energy stored in the stretched aortic wall is released as it springs back.</p></details>

<p><strong>2.</strong> An older person's aorta has become stiff. What happens to their pulse pressure?<span class="mcq-options"><span class="mcq-option" data-option="A">A. It widens, because systolic rises and diastolic falls</span><span class="mcq-option" data-option="B">B. It narrows, because the aorta can't stretch</span><span class="mcq-option" data-option="C">C. It stays the same, because stroke volume is unchanged</span><span class="mcq-option" data-option="D">D. It falls to zero, because there is no recoil</span></span></p>
<details class="mcq-answer" data-answer="A"><summary>Show answer and explanation</summary><p><em>Answer: A.</em> A stiff aorta can't absorb the stroke volume, so systolic rises. With less recoil, diastolic falls. The gap between them widens.</p></details>

<p><strong>3.</strong> A patient who has lost a lot of blood has a BP of 110/80 but cold, poorly perfused hands. How can BP be near normal?<span class="mcq-options"><span class="mcq-option" data-option="A">A. Blood loss raises cardiac output, keeping pressure up</span><span class="mcq-option" data-option="B">B. Arterioles tighten (SVR rises), holding pressure up as flow falls</span><span class="mcq-option" data-option="C">C. The heart pumps more blood with each beat after a bleed</span><span class="mcq-option" data-option="D">D. Pressure and flow always change together, so the flow must be normal</span></span></p>
<details class="mcq-answer" data-answer="B"><summary>Show answer and explanation</summary><p><em>Answer: B.</em> MAP ≈ CO × SVR. A large rise in SVR can hold MAP up even while CO, and tissue flow, falls.</p></details>

## 4. What is pulse pressure?

**Pulse pressure** is the difference between the two numbers:

<div class="equation-block"><span class="equation-label">Pulse pressure</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>PP</mi><mo>=</mo><mi>SBP</mi><mo>−</mo><mi>DBP</mi></math><span class="equation-example">For 120/70 mmHg: <strong>PP = 50 mmHg</strong>.</span></div>

It is the size of the pressure rise with each beat, and it is what you feel as the strength of the pulse. *(<a href="#/physiology/cvs/pulses?section=2-what-do-we-assess-when-palpating-a-pulse">→ Pulses and JVP, §2</a>)*

Two things widen it:

- **A bigger stroke volume**: more blood pushed in per beat.
- **A stiffer aorta**: less stretch, so the same volume raises pressure more.

So a wide pulse pressure doesn't by itself prove a big stroke volume. It may be a stiff aorta.

## 5. What is mean arterial pressure, and why isn't it simply the midpoint?

**Mean arterial pressure (MAP)** is the **average pressure over a whole beat**. It is the pressure that actually drives blood into the tissues.

**Why isn't it halfway between 120 and 70?** At a resting heart rate, the heart spends about **one-third of each beat in systole** and **two-thirds in diastole**. The pressure sits near diastolic for longer, so the average is pulled towards it.

<div class="equation-block"><span class="equation-label">Approximate mean arterial pressure</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>MAP</mi><mo>≈</mo><mi>DBP</mi><mo>+</mo><mfrac><mn>1</mn><mn>3</mn></mfrac><mo>(</mo><mi>SBP</mi><mo>−</mo><mi>DBP</mi><mo>)</mo></math><span class="equation-example">At ordinary resting heart rates: MAP ≈ DBP + ⅓ pulse pressure.</span></div>

**For 120/70:** pulse pressure = 50, and ⅓ × 50 ≈ 17, so MAP ≈ 70 + 17 = **about 87 mmHg**, lower than the midpoint of 95.

**This is an estimate.** At fast heart rates diastole shortens, the beat is closer to half systole and half diastole, and the ⅓ rule becomes less accurate.

## 6. Why does measured BP depend on whether the arm is above or below the heart?

Blood is a column of fluid, so **gravity adds pressure below the heart and takes it away above**. For blood, the change is about **0.77 mmHg per centimetre** of height. *(<a href="#/physiology/cvs/gravity">→ Gravity</a>)*

<div class="equation-block"><span class="equation-label">Hydrostatic pressure change</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>Δ</mi><mi>P</mi><mo>=</mo><mi>ρ</mi><mi>g</mi><mi>h</mi></math><span class="equation-example">ρ = fluid density; g = gravitational acceleration; h = vertical height difference.</span></div>

<div class="bp-height-rules" role="group" aria-label="Arm height measurement bias"><div><strong>Arm 20 cm below heart</strong><span>About +15–16 mmHg</span><small>Hydrostatic contribution makes the reading higher</small></div><div><strong>Arm 20 cm above heart</strong><span>About −15–16 mmHg</span><small>Hydrostatic contribution makes the reading lower</small></div></div>

**Rule:** measure with the cuff **at heart level**. Rest the arm on a support: if the patient holds it up with their own muscles, the effort itself raises BP.

**Understanding Check: Sections 4–6**

<p><strong>1.</strong> A BP is 130/70 mmHg. What is the approximate mean arterial pressure?<span class="mcq-options"><span class="mcq-option" data-option="A">A. 60 mmHg, from 130 − 70</span><span class="mcq-option" data-option="B">B. 90 mmHg, from 70 + ⅓ × 60</span><span class="mcq-option" data-option="C">C. 100 mmHg, from the midpoint of 130 and 70</span><span class="mcq-option" data-option="D">D. 110 mmHg, from 130 − ⅓ × 60</span></span></p>
<details class="mcq-answer" data-answer="B"><summary>Show answer and explanation</summary><p><em>Answer: B.</em> PP = 60 mmHg; MAP ≈ DBP + ⅓PP = 70 + 20 = 90 mmHg.</p></details>

<p><strong>2.</strong> Why is MAP closer to diastolic than to systolic pressure at rest?<span class="mcq-options"><span class="mcq-option" data-option="A">A. Diastolic pressure is the more important number clinically</span><span class="mcq-option" data-option="B">B. The heart spends about two-thirds of each beat in diastole</span><span class="mcq-option" data-option="C">C. Systolic pressure is measured less accurately</span><span class="mcq-option" data-option="D">D. The aorta's recoil raises diastolic pressure to match systolic</span></span></p>
<details class="mcq-answer" data-answer="B"><summary>Show answer and explanation</summary><p><em>Answer: B.</em> MAP is a time average. More time is spent at the lower, diastolic pressure, so the average is pulled towards it.</p></details>

<p><strong>3.</strong> The cuff is on an arm hanging 20 cm below heart level. How will the reading be affected?<span class="mcq-options"><span class="mcq-option" data-option="A">A. About 15 mmHg too low</span><span class="mcq-option" data-option="B">B. Unchanged, because gravity doesn't affect arteries</span><span class="mcq-option" data-option="C">C. About 15 mmHg too high</span><span class="mcq-option" data-option="D">D. About 77 mmHg too high</span></span></p>
<details class="mcq-answer" data-answer="C"><summary>Show answer and explanation</summary><p><em>Answer: C.</em> About 0.77 mmHg per cm × 20 cm ≈ 15 mmHg added by gravity below the heart.</p></details>

<p><strong>4.</strong> Two people have the same stroke volume, but one has a wider pulse pressure. What is the most likely reason?<span class="mcq-options"><span class="mcq-option" data-option="A">A. Their aorta is stiffer</span><span class="mcq-option" data-option="B">B. Their heart rate is slower</span><span class="mcq-option" data-option="C">C. Their arterioles are more dilated</span><span class="mcq-option" data-option="D">D. Their blood is thinner</span></span></p>
<details class="mcq-answer" data-answer="A"><summary>Show answer and explanation</summary><p><em>Answer: A.</em> With SV the same, a stiffer aorta stretches less, so the same volume raises pressure more and the pulse pressure widens.</p></details>

## 7. How does a cuff and stethoscope reveal systolic and diastolic pressure?

The cuff squeezes the brachial artery in the upper arm. A stethoscope over the artery, just below the cuff, listens for **Korotkoff sounds**: taps made by blood forcing its way through the squeezed artery. **The whole method is a contest: is the cuff squeezing harder than the blood is pushing?**

**1. Cuff above systolic (say 150; BP 120/70).** The cuff squeezes harder than even the peak of each beat. The artery stays **shut**. No blood gets through, so there is **silence**.

**2. Cuff falls just below systolic (119).** At the peak of each beat, blood pressure briefly beats the cuff. A spurt of blood **forces the artery open** and makes a **tap**. **The first tap (Korotkoff phase I) = systolic pressure.**

**3. Cuff between systolic and diastolic (100).** Each beat forces the artery open for part of the beat, and it is squeezed shut again for the rest. The taps continue and may change in quality as the cuff falls.

**4. Cuff falls below diastolic (69).** Now even the lowest pressure in each beat is higher than the cuff. The artery **stays open** all the time, flow is smooth again, and the sounds **stop**. **Silence (Korotkoff phase V) = diastolic pressure** in adults. In some situations, such as pregnancy or children, the point where the sounds **muffle** (phase IV) is used instead.

| Cuff pressure | The artery under the cuff | What you hear |
|---|---|---|
| **Above systolic** | Shut all the time | Silence |
| **Just below systolic** | Forced open at each peak | **First tap = systolic** |
| **Between the two** | Opens and closes with each beat | Taps |
| **Below diastolic** | Open all the time | **Silence = diastolic** |

<figure class="learning-figure teaching-widget" data-widget="cuff-simulator" data-desc="sr"><figcaption>Cuff simulator</figcaption><p>A patient with BP 120/70 at 70 beats/min. Press Deflate, or drag the cuff gauge, to lower cuff pressure from 160 to 50 mmHg at about 2–3 mmHg per beat. A drawing shows the artery under the cuff shut, spurting open with each beat, or open. Taps play in time with each beat only between 120 and 70 (sound can be switched off). Markers drop at the first tap ("systolic: 120") and the last ("diastolic: 70"), with one line underneath saying which of the four stages you are in.</p></figure>

**These are not the heart sounds.** Korotkoff sounds are made **in the squeezed brachial artery**, not by heart valves. *(<a href="#/physiology/cvs/heart-sounds?section=1-why-does-the-heart-produce-sounds">→ Heart Sounds, §1</a>)*

## 8. How should BP actually be measured accurately?

1. **Rest first:** about five minutes, seated, back supported, feet flat, not talking.
2. **Right cuff, right place:** the correct cuff size on a bare upper arm, supported **at heart level**.
3. **Feel first:** inflate while feeling the radial pulse. Note where it disappears; that is roughly the systolic pressure.
4. **Then listen:** inflate about 20–30 mmHg above that point. Deflate **slowly**, about 2 mmHg per second, listening over the brachial artery.
5. **Record:** the first tap (systolic) and the point where the sounds disappear (diastolic).

**Why feel first?** In some people the taps fade out for a while between systolic and diastolic (an **auscultatory gap**). If you only listened, you might start below the real systolic pressure and miss it.

**Feeling alone gives systolic only.** The radial pulse returns when the cuff falls below systolic, but nothing you can feel marks diastolic.

**Common errors:**

| Error | Reading will be |
|---|---|
| **Cuff too small** for the arm | Falsely **high**: a narrow cuff needs extra pressure to squeeze the artery shut |
| **Cuff too large** | Falsely **low** |
| Arm **below** heart level | Falsely **high** |
| Arm **above** heart level | Falsely **low** |
| Talking, arm unsupported, just exercised | Usually falsely **high** |

Cuff size goes by **arm circumference**: large arms need large cuffs, and children need child-sized cuffs.

**Automatic machines** (oscillometric monitors) don't listen for <span data-term="korotkoff">Korotkoff sounds</span>. They sense pressure wobbles in the cuff and calculate the BP.

<aside class="source-note"><strong>Source note:</strong> The lecture covers auscultation, palpation, direct arterial measurement and cuff size. Resting time, deflation rate and the auscultatory gap are standard clinical guidance (American Heart Association).</aside>

## 9. Why does pressure decrease as blood travels through the circulation?

Pressure is used up as blood pushes through resistance, just as Q = ΔP ÷ R predicts. The **biggest drop is across the arterioles**, the main resistance vessels. *(<a href="#/physiology/cvs/hemodynamics?section=8-why-are-arterioles-the-main-controllable-resistance-vessels">→ Haemodynamics, §8</a>)*

<div class="bp-drop-strip" role="group" aria-label="Main locations of systemic pressure decrease"><span><strong>Aorta / arteries</strong><small>High pressure · strong pulses</small></span><b>→</b><span><strong>Arterioles</strong><small>Large pressure drop</small></span><b>→</b><span><strong>Capillaries / veins</strong><small>Lower pressure · damped pulses</small></span></div>

The **pulse also fades** along the way. The elastic arteries and the arteriolar resistance smooth out the beat-to-beat swings, so blood reaches the capillaries at a **low, steady** pressure. That protects the thin capillary walls.

Because the arterioles hold back so much pressure, tightening them does two things at once: it **lowers flow** to the tissue beyond and **raises pressure** in the arteries before them.

**Understanding Check: Sections 7–9**

<p><strong>1.</strong> As the cuff deflates, what causes the first Korotkoff tap?<span class="mcq-options"><span class="mcq-option" data-option="A">A. The aortic valve closing at the end of systole</span><span class="mcq-option" data-option="B">B. A spurt of blood forcing open the squeezed artery at the peak of the beat</span><span class="mcq-option" data-option="C">C. The cuff releasing air through its valve</span><span class="mcq-option" data-option="D">D. Blood flowing smoothly through a fully open artery</span></span></p>
<details class="mcq-answer" data-answer="B"><summary>Show answer and explanation</summary><p><em>Answer: B.</em> When cuff pressure falls just below systolic, each pressure peak forces the artery open, and the turbulent spurt makes a tap.</p></details>

<p><strong>2.</strong> Why do the sounds disappear once the cuff is below diastolic pressure?<span class="mcq-options"><span class="mcq-option" data-option="A">A. The artery is shut all the time, so no blood flows</span><span class="mcq-option" data-option="B">B. The heart's valves stop making noise</span><span class="mcq-option" data-option="C">C. The artery stays open all the time, so flow is smooth again</span><span class="mcq-option" data-option="D">D. The stethoscope can't hear pressures that low</span></span></p>
<details class="mcq-answer" data-answer="C"><summary>Show answer and explanation</summary><p><em>Answer: C.</em> Below diastolic, even the lowest pressure in each beat holds the artery open, so flow is no longer squeezed and turbulent.</p></details>

<p><strong>3.</strong> A large man's BP is taken with a standard cuff that is too small for his arm. How will the reading be affected?<span class="mcq-options"><span class="mcq-option" data-option="A">A. Falsely high, because extra pressure is needed to squeeze the artery shut</span><span class="mcq-option" data-option="B">B. Falsely low, because the narrow cuff can't occlude the artery</span><span class="mcq-option" data-option="C">C. Accurate, because cuff size only matters for children</span><span class="mcq-option" data-option="D">D. Accurate for systolic but falsely low for diastolic</span></span></p>
<details class="mcq-answer" data-answer="A"><summary>Show answer and explanation</summary><p><em>Answer: A.</em> A narrow cuff passes its pressure poorly to the artery, so a higher cuff pressure is needed to close it, and both readings come out too high.</p></details>

<p><strong>4.</strong> Why can feeling the radial pulse give systolic but not diastolic pressure?<span class="mcq-options"><span class="mcq-option" data-option="A">A. The radial pulse disappears completely at diastolic pressure</span><span class="mcq-option" data-option="B">B. The pulse returns at systolic, but nothing you can feel marks diastolic</span><span class="mcq-option" data-option="C">C. The radial artery is too small to carry a pulse below systolic</span><span class="mcq-option" data-option="D">D. Diastolic pressure can only be measured inside the artery</span></span></p>
<details class="mcq-answer" data-answer="B"><summary>Show answer and explanation</summary><p><em>Answer: B.</em> As the cuff falls below systolic, the pulse comes back, but it simply stays felt. There is no event at diastolic that you can feel.</p></details>

<p><strong>5.</strong> Where does mean blood pressure fall the most?<span class="mcq-options"><span class="mcq-option" data-option="A">A. Across the aorta and large arteries</span><span class="mcq-option" data-option="B">B. Across the arterioles</span><span class="mcq-option" data-option="C">C. Across the capillaries</span><span class="mcq-option" data-option="D">D. Across the veins</span></span></p>
<details class="mcq-answer" data-answer="B"><summary>Show answer and explanation</summary><p><em>Answer: B.</em> The arterioles are the main resistance vessels, so most of the pressure is used up there. This also smooths out the pulse before blood reaches the capillaries.</p></details>

## 10. Chapter Essentials

1. **Systolic** = the peak pressure in a beat; **diastolic** = the lowest, just before the next beat.
2. **Windkessel:** the aorta stretches in systole and recoils in diastole, keeping blood moving between beats. A stiff aorta raises systolic and widens pulse pressure.
3. **MAP ≈ CO × SVR.** BP depends on output and resistance, not heart rate alone. **Normal BP ≠ normal flow.**
4. **Pulse pressure** = SBP − DBP. It widens with a bigger stroke volume or a stiffer aorta.
5. **MAP ≈ DBP + ⅓ pulse pressure** (120/70 → about 87), closer to diastolic because diastole lasts longer.
6. **Gravity:** about 0.77 mmHg per cm. Measure with the cuff at heart level.
7. **Korotkoff:** silence (cuff above systolic) → **first tap = systolic** → taps → **silence = diastolic**.
8. **The taps** come from blood forcing through the squeezed brachial artery, not from the heart valves.
9. **Feel, then listen:** palpation gives systolic only and helps avoid the auscultatory gap.
10. **Cuff too small → reads high; too large → reads low.** Arm below the heart → reads high; above → reads low.
11. **Pressure falls most across the arterioles**, which also smooth out the pulse.
