# Measuring Cardiac Output and the Work of the Heart

## 1. Why measure cardiac output instead of calculating it from heart rate alone?

From Chapter 07, **cardiac output (CO) = heart rate × stroke volume**. If we know both factors, we can calculate output. But in clinical situations, **stroke volume often cannot be measured simply by counting a pulse**.

Therefore, we need an independent way to estimate the volume of blood passing through a circulation each minute. The lecturer introduces **Fick's principle**, which uses oxygen exchange as a way to infer blood flow.

The central idea is **conservation of matter**: oxygen used by a tissue must have been supplied by the blood entering it, minus the oxygen still present in blood leaving it.

## 2. Fick's principle — build the formula from the physical idea

Imagine one litre of arterial blood enters a group of tissues with a certain amount of oxygen. The venous blood leaves with less oxygen because cells have extracted some.

Two observations determine total oxygen use:

1. **How much oxygen is removed from each litre of blood?** This is the arterial–venous oxygen-content difference.
2. **How many litres of blood flow through the tissues each minute?** This is the blood flow rate, which equals systemic cardiac output in steady state.

The tissue oxygen-consumption rate must equal the product of these quantities.

<div class="fick-process" role="group" aria-label="Fick oxygen extraction concept"><span><strong>Arterial O₂ content</strong><small>O₂ carried into tissues</small></span><b>−</b><span><strong>Mixed venous O₂ content</strong><small>O₂ remaining after tissues</small></span><b>→</b><span><strong>O₂ extracted</strong><small>Amount removed from each unit of blood</small></span></div>

<div class="equation-block"><span class="equation-label">Fick's oxygen principle</span><span class="equation-formula" role="math" aria-label="Oxygen consumption equals cardiac output times the arterial minus mixed venous oxygen content">V̇O₂ = CO × (CₐO₂ − CᵥO₂)</span></div>

The relationship is easier to read in plain notation: **O₂ consumption/min = blood flow/min × (arterial O₂ content − mixed venous O₂ content)**.

Solving for flow gives the equation used to measure cardiac output:

<div class="equation-block"><span class="equation-label">Fick cardiac output</span><span class="equation-formula" role="math" aria-label="Cardiac output equals oxygen consumption divided by arterial minus mixed venous oxygen content">CO = V̇O₂ / (CₐO₂ − CᵥO₂)</span></div>

Here **V̇O₂** = systemic oxygen consumed per minute; **CaO₂** = arterial oxygen content per unit blood volume; and **CvO₂** = **mixed venous** oxygen content. Be careful: **oxygen content**, **oxygen saturation** and **partial pressure of oxygen** are different quantities.

### Worked example — the lecturer's diagram

Suppose the body consumes **250 mL O₂/min**. Arterial blood contains **0.20 mL O₂ per mL of blood** and mixed venous blood contains **0.15 mL O₂ per mL of blood**.

Arterial–venous difference:

**0.20 − 0.15 = 0.05 mL O₂ per mL blood**.

Then:

**CO = 250 mL O₂/min ÷ (0.05 mL O₂/mL blood) = 5,000 mL blood/min = 5.0 L/min.**

The units matter. *Millilitres of O₂* cancel, leaving **millilitres of blood per minute**.

### Why doesn't the answer use venous oxygen saturation alone?

Because Fick's equation needs the **quantity of oxygen present per volume of blood**, not merely the percentage of haemoglobin-binding sites occupied. Oxygen content depends on haemoglobin concentration, saturation and a smaller dissolved oxygen component. This is particularly important in anaemia.

## 3. Where do the oxygen measurements come from?

The lecturer notes two sampling sites:

- **Arterial oxygen content:** A sample of systemic arterial blood provides an estimate of oxygen-rich blood entering tissues.
- **Mixed venous oxygen content:** A blood sample from the **pulmonary artery**, before the blood passes through the lungs, reflects blood returning from multiple systemic tissues.

**Why the pulmonary artery for venous blood?** The right ventricle receives systemic venous return from different organs. By the time it reaches the pulmonary artery, this blood is relatively mixed, so it better represents the whole body's oxygen extraction than a sample from one arm vein.

**Why not simply measure a finger oxygen saturation?** Pulse oximetry estimates saturation; it does not measure mixed venous oxygen content or directly determine how many litres of blood the heart pumps each minute.

### Direct versus estimated Fick

A **direct Fick measurement** involves measuring actual oxygen consumption alongside arterial and mixed venous oxygen contents. Some clinical estimates use a predicted oxygen-consumption rate instead; this is a further assumption and can introduce error.

The Fick method is most reliable when measurements reflect a reasonably **steady physiological state**. Rapidly changing oxygen demand, significant shunts, sampling errors or inaccurate oxygen-consumption estimates can impair results.

## 4. How does the indicator-dilution idea measure blood flow? (Supplementary)

Lecture slide 53 includes a **conservation-of-mass diagram**, which is the underlying logic of several flow-measurement techniques.

If a known quantity of a detectable indicator is introduced into a moving stream of blood, the downstream concentration changes as it becomes dispersed. When appropriately sampled, the amount injected and the time–concentration pattern can be used to infer the flow rate.

**Why?** In faster flow, a given indicator dose generally becomes more diluted and passes the sampling site more rapidly than in slower flow.

<div class="fick-process" role="group" aria-label="Indicator dilution sequence"><span><strong>Known indicator dose</strong><small>Introduced upstream</small></span><b>→</b><span><strong>Mixed into blood</strong><small>Carried downstream</small></span><b>→</b><span><strong>Concentration over time</strong><small>Flow inferred from first pass</small></span></div>

For a simple first-pass indicator dilution model, **flow is inversely related to the area under the indicator concentration–time curve** after a known bolus. Actual measurements require appropriate calibration and handling of recirculation.

### Thermodilution — using temperature as the indicator (Supplementary)

A clinical variation introduces a known bolus of saline at a known temperature via a pulmonary artery catheter's proximal port. A downstream **thermistor** detects how blood temperature changes over time.

The recorded temperature–time response can be used to estimate flow. It uses a related indicator-dilution principle, but the indicator is a **thermal change**, not a dye.

| Method | What is measured? | Important limitation |
|---|---|---|
| **Fick** | O₂ consumption and arterial–mixed venous O₂-content difference | Requires valid sampling and steady-state assumptions |
| **Dye indicator dilution** | Concentration of injected tracer over time | Injection/sampling and recirculation affect the curve |
| **Thermodilution** | Temperature change over time after injected saline | Catheter position, valve regurgitation and shunts may distort results |

These methods are **supplementary** to the three primary slides. Their purpose here is to show how the lecture's conservation principle extends to other cardiac-output measurements.

## 5. What does it mean for the heart to perform work?

The heart does more than move blood: it must move that blood **against pressure**.

In mechanics, work can be expressed as **force × distance**. Because pressure is force per area, moving a volume of fluid against pressure also requires work.

The lecture gives a simplified relationship for one ventricular beat:

<div class="equation-block"><span class="equation-label">Approximate external stroke work</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>SW</mi><mo>≈</mo><mi>SV</mi><mo>×</mo><mi>P</mi></math><span class="equation-example">P represents the relevant pressure generated against the outflow circulation, usually approximated from mean arterial pressure; external stroke work is more rigorously the ventricular pressure–volume loop area, so this product is only an estimate.</span></div>

In ordinary teaching examples, **stroke volume × mean arterial pressure** provides a practical approximation. More accurately, **external stroke work is the area within the ventricular pressure–volume loop**, accounting for the pressure throughout filling and ejection. The simple product is not an exact substitute for every loop shape.

### Why does the left ventricle perform more pressure work than the right?

The ventricles normally eject **approximately equal volumes per minute**, but the left ventricle ejects against much higher systemic arterial pressure. Therefore, its external pressure work is greater.

**Example (illustrative):** If SV = 70 mL and mean arterial pressure = 100 mmHg:

**SW ≈ 70 × 100 = 7,000 mmHg·mL per beat ≈ 0.93 J per beat.**

The value is an approximate measure of *external stroke work*, not the total chemical energy consumed by myocardium.

## 6. Visualising stroke work on a pressure–volume loop

<figure class="learning-figure work-pv-figure" id="cvs08-pv"><figcaption>Figure 01. Ventricular pressure–volume loop — enclosed area represents external stroke work</figcaption><svg viewBox="0 0 580 280" role="img" aria-label="Schematic left ventricular pressure-volume loop with end-systolic and end-diastolic volumes marked, filling at low pressure, isovolumetric contraction, ejection and relaxation, and interior stroke-work area shaded."><defs><marker id="workloop-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6z" fill="#2863dd"/></marker></defs><line x1="64" y1="17" x2="64" y2="240" stroke="currentColor" opacity=".5" stroke-width="2"/><line x1="64" y1="240" x2="557" y2="240" stroke="currentColor" opacity=".5" stroke-width="2"/><path d="M208 216 C270 226 374 228 441 216 L441 77 C389 35 314 43 208 86 Z" fill="#93c5fd" opacity=".28"/><path d="M208 216 C290 231 362 229 441 216" fill="none" stroke="#16a085" stroke-width="4"/><path d="M441 216 L441 77" fill="none" stroke="#2863dd" stroke-width="3.5" marker-end="url(#workloop-arrow)"/><path d="M441 77 C389 35 314 43 208 86" fill="none" stroke="#2863dd" stroke-width="4" marker-end="url(#workloop-arrow)"/><path d="M208 86 L208 216" fill="none" stroke="#2863dd" stroke-width="3.5" marker-end="url(#workloop-arrow)"/><g fill="currentColor" font-size="12"><text x="310" y="143" text-anchor="middle" font-weight="800">Stroke work</text><text x="310" y="159" text-anchor="middle">≈ loop area</text><text x="184" y="255">ESV</text><text x="431" y="270">EDV</text><text x="250" y="273">Ventricular volume →</text><text x="21" y="148" transform="rotate(-90,21,148)">Pressure</text><text x="458" y="135">Isovolumetric</text><text x="458" y="150">contraction</text><text x="100" y="121">Isovolumetric</text><text x="100" y="136">relaxation</text><text x="307" y="37">Ejection</text><text x="306" y="235">Filling</text></g></svg><p>Original teaching schematic, not measured patient data. The ventricle fills at low pressure, generates pressure with constant volume, ejects blood as volume falls, and then relaxes at approximately constant end-systolic volume.</p></figure>

During **isovolumetric contraction**, pressure rises but ventricular volume does not change. During **ejection**, ventricular volume falls and the heart generates pressure to move blood into the artery. During **isovolumetric relaxation**, pressure falls while volume remains approximately at ESV.

The area inside this loop represents **external stroke work**. The myocardium also spends energy maintaining electrical activity, cycling Ca²⁺ and sustaining internal tension, so **stroke work is not identical to total myocardial oxygen consumption**.

## 7. Why does pressure loading increase the heart's oxygen demand?

The lecturer lists three major determinants of myocardial work and oxygen consumption:

- **Intramyocardial tension (wall stress).**
- **Contractile state** of the myocardium.
- **Heart rate.**

When pressure loading rises, the ventricular wall must develop greater tension to eject blood. Greater force development and more frequent contractions usually increase myocardial metabolic demand and oxygen consumption.

The lecturer states that **pressure work is more oxygen-demanding than volume work** and uses **aortic stenosis** (pressure loading) compared with **aortic incompetence / regurgitation** (volume loading) as examples.

**How to interpret this safely:** Pressure overload often increases wall stress and myocardial oxygen demand substantially, but it would be incorrect to assume that *all* patients with aortic stenosis have more angina than *all* patients with aortic regurgitation. Severity, coronary blood supply and other diseases matter.

### Why does the heart need increased coronary flow during exercise?

The myocardium extracts a large fraction of oxygen from coronary blood even at rest. When the heart works harder, it cannot increase oxygen supply sufficiently by extraction alone. **Coronary blood flow must increase** to deliver more oxygen.

This explains the connection between exertion, increased myocardial work and angina when the oxygen supply cannot match demand.

**Important:** The Fick calculation uses oxygen consumption by the **whole body** to measure systemic CO. Myocardial oxygen consumption is the heart's **own** metabolic demand; these are different quantities, even though both use oxygen-extraction principles.

## Understanding Check

**1. Why can the Fick method calculate CO without directly measuring stroke volume?**
<details><summary>Reveal explanation</summary><p>Fick's principle uses <strong>conservation of oxygen</strong>. Systemic oxygen consumed each minute equals blood flow each minute multiplied by the oxygen removed from each unit of blood. Therefore cardiac output can be found by dividing oxygen consumption by the arterial–mixed venous oxygen-content difference, without measuring SV beat by beat.</p></details>

**2. Oxygen consumption is 250 mL/min, arterial content 0.20 mL O₂/mL blood and mixed venous content 0.15 mL O₂/mL blood. Calculate CO.**
<details><summary>Reveal explanation</summary><p>The content difference is <strong>0.05 mL O₂/mL blood</strong>. CO = 250 ÷ 0.05 = <strong>5,000 mL blood/min = 5.0 L/min</strong>. The oxygen units cancel, leaving volume of blood per minute.</p></details>

**3. Why is mixed venous blood ideally sampled from the pulmonary artery rather than a peripheral vein?**
<details><summary>Reveal explanation</summary><p>The pulmonary artery contains venous return from many systemic organs after mixing in the right heart. A peripheral vein reflects extraction in a particular region and may not represent whole-body oxygen content. The Fick equation for total systemic flow needs a representative <strong>mixed venous</strong> sample.</p></details>

**4. A person has normal arterial oxygen saturation but very low haemoglobin. Can saturation alone be substituted for arterial oxygen content in the Fick formula?**
<details><summary>Reveal explanation</summary><p><strong>No.</strong> Saturation is a fraction of haemoglobin sites occupied by oxygen, whereas oxygen content is the <em>actual amount of oxygen per unit blood</em>. With low haemoglobin, oxygen content can be reduced despite high saturation, so substituting saturation alone makes the calculation invalid.</p></details>

**5. A dye bolus is introduced into a blood stream. Why does the downstream concentration–time pattern contain information about flow?**
<details><summary>Reveal explanation</summary><p>The injected dye represents a known amount of indicator. Its concentration is diluted and transported by moving blood. With suitable sampling and a first-pass analysis, the indicator's total time–concentration exposure is inversely related to flow. Recirculation must be recognised rather than included as if it were the original pass.</p></details>

**6. What is the principal measurable signal in thermodilution?**
<details><summary>Reveal explanation</summary><p><strong>Temperature change over time.</strong> A known bolus of saline mixes with blood, and a downstream thermistor measures the resulting thermal signal. The measured pattern is used to estimate cardiac output using indicator-dilution principles. It does not directly count ventricular contractions or measure SV.</p></details>

**7. Two ventricles eject equal stroke volumes, but one ejects against much higher mean arterial pressure. Which performs more external pressure work?**
<details><summary>Reveal explanation</summary><p>The ventricle pumping against <strong>higher pressure</strong> performs more approximate external stroke work: SW ≈ SV × mean ejection pressure. This is why the left ventricle normally performs more pressure work than the right despite similar long-term flow.</p></details>

**8. A ventricle ejects 70 mL against an approximate mean arterial pressure of 100 mmHg. Estimate external stroke work.**
<details><summary>Reveal explanation</summary><p>SW ≈ 70 × 100 = <strong>7,000 mmHg·mL per beat</strong>, which is approximately <strong>0.93 J per beat</strong>. This is an external-work approximation; the myocardium consumes additional metabolic energy for processes not captured by this product.</p></details>

**9. Why does the pressure–volume loop have an area even though both isovolumetric phases involve no change in volume?**
<details><summary>Reveal explanation</summary><p>The isovolumetric phases change pressure at almost constant volume. Between them, <strong>ejection and filling</strong> occur at different pressures. The enclosed area between those pressure–volume paths represents the external mechanical work associated with one cardiac cycle.</p></details>

**10. Why must coronary blood flow increase when myocardial work rises substantially?**
<details><summary>Reveal explanation</summary><p>Cardiac muscle already extracts a high proportion of the oxygen delivered by coronary blood at rest. When heart rate, force or wall tension increases, myocardial oxygen demand rises. Further extraction alone cannot meet the increase, so <strong>coronary flow must rise</strong> to sustain oxygen delivery.</p></details>

**11. Does a greater external stroke work always imply the same proportional increase in myocardial oxygen consumption?**
<details><summary>Reveal explanation</summary><p><strong>No.</strong> External work is only part of total myocardial energetic demand. Intracellular Ca²⁺ cycling, cross-bridge activation, basal metabolism, wall stress and contractile state also consume energy. The relation between external work and oxygen consumption therefore depends on cardiac conditions.</p></details>


### Additional application and mechanism checks

**Supplementary 1. How would an erroneously small arterial–venous oxygen-content difference affect a calculated Fick cardiac output at fixed oxygen consumption?**

<details><summary>Reveal explanation</summary><p>CO equals oxygen consumption divided by the arterial–mixed venous content difference. Underestimating the denominator overestimates calculated output, so accurate content measurement is essential.</p></details>

## Chapter Essentials

1. **Fick's principle:** Whole-body oxygen consumption equals blood flow × arterial–mixed venous oxygen-content difference.
2. **Fick cardiac output:** CO = V̇O₂ ÷ (CaO₂ − CvO₂), with consistent units.
3. **Sampling:** Systemic arterial blood supplies arterial content; pulmonary artery blood supplies mixed venous content.
4. **Content versus saturation:** Oxygen content depends on haemoglobin and saturation; they are not interchangeable.
5. **Steady state:** Accuracy is limited when oxygen use, mixing or sampling assumptions are invalid.
6. **Indicator dilution (supplementary):** Known injected marker and concentration–time trace can estimate flow.
7. **Thermodilution (supplementary):** Uses a temperature–time response after injected saline.
8. **External stroke work:** Approximately SV × mean arterial pressure; more accurately the enclosed pressure–volume loop area.
9. **Left versus right ventricular work:** Similar blood volume ejected, but left side faces much higher pressure.
10. **Myocardial O₂ demand:** Strongly influenced by wall tension, contractility and heart rate.
11. **Pressure loading:** Often increases myocardial demand markedly; clinical comparisons need context.
12. **Coronary flow:** Increased myocardial oxygen demand usually requires increased coronary blood flow.
