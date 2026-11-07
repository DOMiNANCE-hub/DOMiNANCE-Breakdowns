# Measuring Cardiac Output and the Work of the Heart

## 1. Why measure cardiac output instead of calculating it from heart rate alone?

CO = HR × <span data-term="stroke-volume">SV</span>, but at the bedside **stroke volume can't be seen or felt**. A pulse tells you the heart rate, not how much blood each beat pushes out. So we need a way to measure blood flow directly. The lecture's method is **<span data-term="fick">Fick's principle</span>**, which works out flow from how much oxygen the body uses. *(<a href="#/physiology/cvs/cardiac-output?section=1-what-is-cardiac-output-and-why-does-it-matter">→ Cardiac Output, §1</a>)*

## 2. Fick's principle: working out flow from oxygen use

**The idea, with a delivery van.** Vans carry parcels to a town. Each van arrives with 20 parcels and leaves with 15, so it drops off 5. The town takes in 250 parcels a minute. How many vans pass through each minute? 250 ÷ 5 = **50 vans a minute**.

Blood works the same way:

- **Oxygen used by the body each minute (V̇O₂)** is the parcels delivered.
- **Oxygen dropped off by each mL of blood (arterial − <span data-term="mixed-venous">mixed venous</span> content)** is the parcels per van.
- **Blood flow (cardiac output)** is the number of vans.

<div class="fick-process" role="group" aria-label="Fick oxygen extraction concept"><span><strong>Arterial O₂ content</strong><small>O₂ carried into tissues</small></span><b>−</b><span><strong>Mixed venous O₂ content</strong><small>O₂ remaining after tissues</small></span><b>→</b><span><strong>O₂ extracted</strong><small>Amount removed from each unit of blood</small></span></div>

<div class="equation-block"><span class="equation-label">Fick's oxygen principle</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>V̇O₂</mi><mo>=</mo><mi>CO</mi><mo>×</mo><mo>(</mo><mi>CₐO₂</mi><mo>−</mo><mi>CᵥO₂</mi><mo>)</mo></math></div>

<div class="equation-block"><span class="equation-label">Fick cardiac output</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>CO</mi><mo>=</mo><mfrac><mi>V̇O₂</mi><mrow><mo>(</mo><mi>CₐO₂</mi><mo>−</mo><mi>CᵥO₂</mi><mo>)</mo></mrow></mfrac></math></div>

**The lecture's example, in three steps:**

1. **Oxygen used:** 250 mL O₂/min
2. **Oxygen dropped off per mL of blood:** 0.20 − 0.15 = **0.05 mL O₂ per mL of blood**
3. **Flow:** 250 ÷ 0.05 = **5,000 mL blood/min = 5.0 L/min**

**Check the units:** (mL O₂/min) ÷ (mL O₂ per mL blood) = mL blood/min. The oxygen cancels and leaves blood flow.

<figure class="learning-figure teaching-widget" data-widget="fick-calculator" data-desc="sr"><figcaption>Fick calculator</figcaption><p>Three sliders: oxygen use (150–1,000 mL/min), arterial O₂ content (0.10–0.22 mL/mL) and mixed venous O₂ content (0.05–0.18 mL/mL; it cannot exceed arterial). The three steps update live, with the answer in L/min. A small bar shows the oxygen dropped off per mL. It starts at the lecture's 250, 0.20 and 0.15 → 5.0 L/min. One line notes the pattern: when tissues take more oxygen from each mL, the same oxygen use needs less flow.</p></figure>

**Content, not saturation.** Fick needs the **amount of oxygen in each mL of blood** (content). **Saturation** only tells you what percentage of haemoglobin is carrying oxygen. Someone with anaemia can be 98% saturated but carry much less oxygen per mL, because there is less haemoglobin. Using saturation in place of content gives the wrong answer.

## 3. Where do the oxygen measurements come from?

- **Arterial content:** from any systemic artery, since arterial blood is the same everywhere.
- **Mixed venous content:** from the **pulmonary artery**, through a catheter.

**Why the pulmonary artery?** Veins from different organs carry very different amounts of oxygen. The kidney takes little oxygen out, while working muscle takes a lot. Their blood only becomes fully mixed after passing through the right heart. A sample from one arm vein shows only what the arm used.

**Why not use a finger pulse oximeter?** It measures arterial saturation only. It can't measure venous content or blood flow.

**Direct versus estimated Fick.** A true (direct) Fick measures oxygen use at the time. Some clinics use a predicted value instead, which adds error. Either way, the method assumes a **steady state**: oxygen use and flow must be stable while the samples are taken.

**Understanding Check: Sections 1–3**

<p><strong>1.</strong> Oxygen use is 250 mL/min. Arterial content is 0.20 and mixed venous content 0.15 mL O₂ per mL blood. What is the cardiac output?<span class="mcq-options"><span class="mcq-option" data-option="A">A. 1.25 L/min, from 250 × 0.05 ÷ 10</span><span class="mcq-option" data-option="B">B. 5.0 L/min, from 250 ÷ 0.05</span><span class="mcq-option" data-option="C">C. 12.5 L/min, from 250 ÷ 0.02</span><span class="mcq-option" data-option="D">D. 50.0 L/min, from 250 ÷ 0.005</span></span></p>
<details class="mcq-answer" data-answer="B"><summary>Show answer and explanation</summary><p><em>Answer: B.</em> 0.20 − 0.15 = 0.05 mL O₂ per mL blood. 250 ÷ 0.05 = 5,000 mL/min = 5.0 L/min.</p></details>

<p><strong>2.</strong> Why is mixed venous blood taken from the pulmonary artery, not an arm vein?<span class="mcq-options"><span class="mcq-option" data-option="A">A. Arm veins contain no measurable oxygen at all</span><span class="mcq-option" data-option="B">B. Pulmonary artery blood has been oxygenated by the lungs</span><span class="mcq-option" data-option="C">C. Blood from every organ has mixed by the time it reaches there</span><span class="mcq-option" data-option="D">D. The pulmonary artery is the easiest vessel to reach</span></span></p>
<details class="mcq-answer" data-answer="C"><summary>Show answer and explanation</summary><p><em>Answer: C.</em> Organs extract different amounts of oxygen. Only after the right heart is the venous blood from the whole body mixed. Pulmonary artery blood has <strong>not</strong> yet passed through the lungs.</p></details>

<p><strong>3.</strong> A patient with severe anaemia has 98% arterial saturation. Why can't 98% be used in the Fick formula?<span class="mcq-options"><span class="mcq-option" data-option="A">A. Saturation over 95% always makes the formula invalid</span><span class="mcq-option" data-option="B">B. Fick needs oxygen content, which is low when haemoglobin is low</span><span class="mcq-option" data-option="C">C. Anaemia stops oxygen from leaving the blood at the tissues</span><span class="mcq-option" data-option="D">D. Saturation is only measured in venous blood, not arterial</span></span></p>
<details class="mcq-answer" data-answer="B"><summary>Show answer and explanation</summary><p><em>Answer: B.</em> Saturation is a percentage of haemoglobin. With little haemoglobin, each mL carries less oxygen even at 98%.</p></details>

<p><strong>4.</strong> Oxygen use stays at 250 mL/min, but the tissues now take out 0.10 mL O₂ from each mL of blood instead of 0.05. What does this mean for cardiac output?<span class="mcq-options"><span class="mcq-option" data-option="A">A. It has doubled, to 10 L/min</span><span class="mcq-option" data-option="B">B. It is unchanged, at 5 L/min</span><span class="mcq-option" data-option="C">C. It has halved, to 2.5 L/min</span><span class="mcq-option" data-option="D">D. It cannot be worked out without heart rate</span></span></p>
<details class="mcq-answer" data-answer="C"><summary>Show answer and explanation</summary><p><em>Answer: C.</em> 250 ÷ 0.10 = 2,500 mL/min. When each mL gives up more oxygen, less flow is needed for the same oxygen use. This is what happens when cardiac output falls.</p></details>

## 4. Other ways to measure flow: indicator dilution (supplementary)

The same "what goes in must come out" idea underlies other methods.

**Dye dilution.** Inject a known amount of dye into a vein, then measure its concentration downstream over time. **Fast flow dilutes the dye more and washes it past quickly**, so the concentration curve is low and short. Slow flow gives a higher, longer curve. From the dose and the curve, flow can be worked out.

**Thermodilution.** The same idea, using **cold** saline instead of dye. A pulmonary artery catheter injects it, and a temperature sensor (thermistor) downstream records how much and for how long the blood cools.

| Method | What is measured | Main pitfall |
|---|---|---|
| **Fick** | Oxygen use, and arterial and mixed venous oxygen content | Needs a steady state and good samples |
| **Dye dilution** | Dye concentration over time | Dye coming round a second time (recirculation) |
| **Thermodilution** | Blood temperature over time | Leaky valves and shunts distort the curve |

<aside class="source-note"><strong>Source note:</strong> The lecture covers Fick only. Dye dilution and thermodilution are standard supplementary methods that use the same mass-balance idea.</aside>

## 5. What does it mean for the heart to perform work?

The heart doesn't just move blood. It pushes it **against pressure**, and that takes work. The lecture's simple formula:

<div class="equation-block"><span class="equation-label">Approximate external stroke work</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>SW</mi><mo>≈</mo><mi>SV</mi><mo>×</mo><mi>P</mi></math><span class="equation-example">P is the pressure the ventricle pumps against, usually mean arterial pressure. This is an estimate: the exact value is the area of the pressure–volume loop.</span></div>

**Example:** SV = 70 mL, <span data-term="map">mean arterial pressure</span> = 100 mmHg → stroke work ≈ 70 × 100 = **7,000 mmHg·mL** (about **0.93 J**) per beat.

**Why does the left ventricle do more work than the right?** Both pump the **same volume**, but the left pumps against about **100 mmHg** (aorta) and the right against about **15 mmHg** (pulmonary artery). Same volume against higher pressure means more work. That is why the left ventricular wall is so much thicker. *(<a href="#/physiology/cvs/cv-introduction?section=4-why-is-the-left-ventricular-wall-thicker-than-the-right">→ Introduction, §4</a>)*

## 6. Visualising stroke work on a pressure–volume loop

<figure class="learning-figure work-pv-figure" id="cvs08-pv"><figcaption>Figure 1. Ventricular pressure–volume loop — enclosed area represents external stroke work</figcaption><svg viewBox="0 0 580 280" role="img" aria-label="Schematic left ventricular pressure-volume loop with end-systolic and end-diastolic volumes marked, filling at low pressure, isovolumetric contraction, ejection and relaxation, and interior stroke-work area shaded."><defs><marker id="workloop-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6z" fill="#2863dd"/></marker></defs><line x1="64" y1="17" x2="64" y2="240" stroke="currentColor" opacity=".5" stroke-width="2"/><line x1="64" y1="240" x2="557" y2="240" stroke="currentColor" opacity=".5" stroke-width="2"/><path d="M208 216 C270 226 374 228 441 216 L441 77 C389 35 314 43 208 86 Z" fill="#93c5fd" opacity=".28"/><path d="M208 216 C290 231 362 229 441 216" fill="none" stroke="#16a085" stroke-width="4"/><path d="M441 216 L441 77" fill="none" stroke="#2863dd" stroke-width="3.5" marker-end="url(#workloop-arrow)"/><path d="M441 77 C389 35 314 43 208 86" fill="none" stroke="#2863dd" stroke-width="4" marker-end="url(#workloop-arrow)"/><path d="M208 86 L208 216" fill="none" stroke="#2863dd" stroke-width="3.5" marker-end="url(#workloop-arrow)"/><g fill="currentColor" font-size="12"><text x="310" y="143" text-anchor="middle" font-weight="800">Stroke work</text><text x="310" y="159" text-anchor="middle">≈ loop area</text><text x="184" y="255">ESV</text><text x="431" y="270">EDV</text><text x="250" y="273">Ventricular volume →</text><text x="21" y="148" transform="rotate(-90,21,148)">Pressure</text><text x="458" y="135">Isovolumetric</text><text x="458" y="150">contraction</text><text x="100" y="121">Isovolumetric</text><text x="100" y="136">relaxation</text><text x="307" y="37">Ejection</text><text x="306" y="235">Filling</text></g></svg><p>Original teaching schematic, not measured patient data. The ventricle fills at low pressure, generates pressure with constant volume, ejects blood as volume falls, and then relaxes at approximately constant end-systolic volume.</p></figure>

Follow the loop round:

- **Bottom:** the ventricle fills at low pressure (volume rises).
- **Right side:** it contracts with all valves shut, so pressure rises at constant volume.
- **Top:** it ejects (volume falls at high pressure).
- **Left side:** it relaxes with all valves shut, so pressure falls at constant volume.

**The area inside the loop is the <span data-term="stroke-work">stroke work</span>.** A taller loop (higher pressure) or a wider loop (bigger SV) means more work. *(<a href="#/physiology/cvs/cardiac-cycle?section=8-the-whole-cycle-on-one-map">→ Cardiac Cycle, §8</a>)*

The loop shows only the **outside work** of pushing blood. The muscle also uses energy to pump calcium, keep ion gradients and hold tension, so **stroke work is not the same as the heart's total oxygen use**.

## 7. Why does pressure loading increase the heart's oxygen demand?

The lecture lists three main things that set how much oxygen the heart muscle uses:

1. **Wall tension**, which rises with the pressure the ventricle must develop
2. **Contractility:** a stronger beat costs more energy
3. **Heart rate:** more beats per minute

**Pressure work costs more oxygen than volume work.** Raising pressure means building and holding high wall tension, which is expensive. Pumping more volume at the same pressure costs less. The lecture's examples:

- **Aortic stenosis (pressure load):** the ventricle must generate very high pressure to force blood through a narrow valve, so oxygen demand is high.
- **Aortic regurgitation (volume load):** the ventricle pumps a bigger volume each beat, but at near-normal pressure, so oxygen demand rises less.

These are general patterns. Individual patients vary with severity and coronary supply.

**Why must coronary flow rise in exercise?** Even at rest, the heart muscle extracts most of the oxygen from its blood (about 70%). There is little left to take, so when demand rises, **the only way to get more oxygen is more coronary flow**. If narrowed coronaries can't deliver it, the muscle runs short of oxygen and chest pain (<span data-term="angina">angina</span>) results. *(<a href="#/physiology/cvs/coronary">→ Coronary Circulation</a>)*

**Careful:** Fick uses the **whole body's** oxygen use to measure cardiac output. The heart's **own** oxygen use is a separate, much smaller quantity.

**Understanding Check: Sections 4–7**

<p><strong>1.</strong> In dye dilution, what does a low, short concentration curve downstream tell you?<span class="mcq-options"><span class="mcq-option" data-option="A">A. Flow is fast, so the dye is diluted and washed past quickly</span><span class="mcq-option" data-option="B">B. Flow is slow, so the dye stays in the vessel for longer</span><span class="mcq-option" data-option="C">C. The dye was injected into the wrong vessel entirely</span><span class="mcq-option" data-option="D">D. The heart rate is too slow for the method to work</span></span></p>
<details class="mcq-answer" data-answer="A"><summary>Show answer and explanation</summary><p><em>Answer: A.</em> Fast flow spreads the same dose through more blood and carries it past quickly, giving a lower, shorter curve.</p></details>

<p><strong>2.</strong> The two ventricles eject the same volume. Why does the left do more work?<span class="mcq-options"><span class="mcq-option" data-option="A">A. It ejects blood more slowly than the right does</span><span class="mcq-option" data-option="B">B. It pumps against a much higher pressure</span><span class="mcq-option" data-option="C">C. It has to pump blood through the lungs</span><span class="mcq-option" data-option="D">D. Its valves are smaller, so it ejects less</span></span></p>
<details class="mcq-answer" data-answer="B"><summary>Show answer and explanation</summary><p><em>Answer: B.</em> Stroke work ≈ SV × pressure. The same SV against about 100 mmHg instead of about 15 mmHg means far more work.</p></details>

<p><strong>3.</strong> On a pressure–volume loop, what does the enclosed area represent?<span class="mcq-options"><span class="mcq-option" data-option="A">A. The heart's total oxygen use</span><span class="mcq-option" data-option="B">B. The stroke volume</span><span class="mcq-option" data-option="C">C. The external stroke work of one beat</span><span class="mcq-option" data-option="D">D. The time for one cardiac cycle</span></span></p>
<details class="mcq-answer" data-answer="C"><summary>Show answer and explanation</summary><p><em>Answer: C.</em> The area is the outside work of pushing blood against pressure. Total oxygen use is larger, and SV is the loop's width.</p></details>

<p><strong>4.</strong> Which places the greatest oxygen demand on the left ventricle?<span class="mcq-options"><span class="mcq-option" data-option="A">A. Pumping a larger volume at normal pressure</span><span class="mcq-option" data-option="B">B. A slower heart rate with normal pressure</span><span class="mcq-option" data-option="C">C. A smaller stroke volume at normal pressure</span><span class="mcq-option" data-option="D">D. Pumping a normal volume against a very high pressure</span></span></p>
<details class="mcq-answer" data-answer="D"><summary>Show answer and explanation</summary><p><em>Answer: D.</em> High pressure means high wall tension, the most oxygen-expensive kind of work. That is why aortic stenosis raises demand more than regurgitation.</p></details>

<p><strong>5.</strong> Why must coronary blood flow rise when the heart works harder?<span class="mcq-options"><span class="mcq-option" data-option="A">A. Heart muscle already takes out most of the oxygen it receives</span><span class="mcq-option" data-option="B">B. Coronary arteries narrow during exercise</span><span class="mcq-option" data-option="C">C. Blood carries less oxygen during exercise</span><span class="mcq-option" data-option="D">D. Heart rate falls, so each beat needs more flow</span></span></p>
<details class="mcq-answer" data-answer="A"><summary>Show answer and explanation</summary><p><em>Answer: A.</em> With extraction already near its maximum, the only way to get more oxygen is to deliver more blood.</p></details>

## 8. Chapter Essentials

1. **Fick's principle:** oxygen used per minute = blood flow × oxygen dropped off per mL. So **CO = V̇O₂ ÷ (CaO₂ − CvO₂)**.
2. **The lecture's example:** 250 ÷ (0.20 − 0.15) = 5,000 mL/min = 5.0 L/min.
3. **Use content, not saturation**: content depends on haemoglobin.
4. **Samples:** arterial from any artery; **mixed venous from the pulmonary artery**.
5. **Fick needs a steady state** and accurate samples.
6. **Indicator dilution (supplementary):** a known dose of dye or cold saline, measured downstream. Faster flow gives a lower, shorter curve.
7. **Stroke work ≈ SV × pressure.** On a pressure–volume loop it is the area inside.
8. **The left ventricle does more work** than the right: same volume, higher pressure.
9. **Heart muscle oxygen demand** rises with wall tension, contractility and heart rate. **Pressure work costs more than volume work.**
10. **The heart already extracts most of its oxygen**, so more demand needs **more coronary flow**.
