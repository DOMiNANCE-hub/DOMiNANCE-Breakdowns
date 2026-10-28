# Electrocardiography and Basic Rhythms

**Primary lecture:** Lecture 7 ECG 2.pdf, slides 1–14. **Supplementary foundations:** vector reasoning, accurate lead positions, basic rhythm assessment and AV block recognition.

## 1. What does an ECG actually record?

Every heartbeat is preceded by cardiac **electrical activation**. As myocardial cells depolarise and repolarise, electrical potential differences are produced and conducted through body tissues. Electrodes on the skin detect these differences. The **<span data-term="ecg">electrocardiogram (ECG, or EKG)</span>** is a recording of this electrical activity over time.

An ECG **does not directly measure** contraction strength, pressure, stroke volume or cardiac output. For example, a QRS complex signifies *ventricular depolarisation*, not the actual volume of blood being ejected. Electrical activity can be present without an effective pulse.

<div class="ecg-concept-line" aria-label="Electrical and mechanical sequence"><span>Electrical activation</span><b>→</b><span>Myocardial contraction</span><b>→</b><span>Pressure changes</span><b>→</b><span>Blood movement</span></div>

**Why does this distinction matter?** An ECG can show organised electrical complexes even if ventricular contraction produces little or no effective circulation.

## 2. Why can the tracing move upwards or downwards?

An **electrode** is a physical contact on the patient's skin. A **lead** is a particular electrical view calculated from electrode potentials. Different leads view the same heart from different directions, so the same heartbeat can produce different shapes across leads.

As activation spreads through the myocardium, we can represent its combined direction and magnitude by a changing electrical **<span data-term="ecg-vector">vector</span>**. The ECG lead detects the part of that vector directed along its positive recording direction.

| A depolarisation wave travels… | Recorded tendency |
|---|---|
| **Towards** a lead's positive direction | Positive (upward) deflection |
| **Away from** its positive direction | Negative (downward) deflection |
| Roughly **perpendicular** | Small or biphasic deflection |

For example, much of normal ventricular depolarisation is directed inferiorly and towards the patient's left. Since Lead II views the heart in that general direction, its QRS complex is often predominantly upright.

**Important:** These rules describe **depolarisation**. Repolarisation has a different electrical polarity: a repolarisation wave travelling towards a positive electrode tends to produce a negative deflection. The normal ventricular T wave can therefore be upright even though it represents repolarisation, because the spread and polarity of repolarisation differ from depolarisation.

An upward deflection is **not** a drawing of the heart moving upwards—it is the electrical signal's projection onto that lead.

## 3. Why can ten electrodes produce twelve ECG leads?

The standard **12-lead ECG** uses **10 physical electrodes**: four on the limbs and six on the chest. Their potentials are combined to produce twelve electrical views.

| Lead group | Views | Names |
|---|---:|---|
| Bipolar limb | 3 | I, II, III |
| Augmented limb | 3 | aVR, aVL, aVF |
| Precordial (chest) | 6 | V1–V6 |

The **right-leg (RL)** electrode mainly helps suppress electrical interference; it is not a thirteenth lead. The six limb leads observe the heart in the **frontal plane**, while the six chest leads add views in the **horizontal plane**.

### The three bipolar limb leads

| Lead | Negative electrode | Positive electrode |
|---|---|---|
| **I** | Right arm (RA) | Left arm (LA) |
| **II** | Right arm (RA) | Left leg (LL) |
| **III** | Left arm (LA) | Left leg (LL) |

These directions form **Einthoven's triangle** (lecturer slide 3). Their simultaneous voltages obey **Einthoven's law**:

<div class="equation-block"><span class="equation-label">Einthoven's law</span><math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>V</mi><mi>II</mi></msub><mo>=</mo><msub><mi>V</mi><mi>I</mi></msub><mo>+</mo><msub><mi>V</mi><mi>III</mi></msub></math></div>

For instance, if Lead I measures +0.5 mV and Lead III measures +0.3 mV at the same instant, Lead II should measure **+0.8 mV** (ignoring recording error).

<figure class="teaching-illustration ecg-figure-small" id="ecg-einthoven">
<a href="https://upload.wikimedia.org/wikipedia/commons/e/eb/ECG-Einthoven-triangle.svg" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="https://upload.wikimedia.org/wikipedia/commons/e/eb/ECG-Einthoven-triangle.svg" alt="Diagram of Einthoven triangle connecting arm and leg lead positions with bipolar Leads I, II and III." width="992" height="744"></a>
<figcaption><strong>Figure 01. Bipolar limb-lead directions.</strong> Relate the positive and negative recording directions to the three limb leads. <span class="figure-credit">Kychot · <a href="https://commons.wikimedia.org/wiki/File:ECG-Einthoven-triangle.svg" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a> · unmodified.</span></figcaption>
</figure>

### The augmented limb leads

**aVR** views towards the right arm, **aVL** towards the left arm and **aVF** towards the left leg/foot (lecturer slide 4). Each uses one positive limb electrode and a reference derived from the other limb electrodes. The normal mean ventricular depolarisation vector usually moves away from aVR, so its QRS complex is commonly predominantly negative.

### The six chest leads

| Electrode | Standard position |
|---|---|
| **V1** | Fourth right intercostal space, right sternal border |
| **V2** | Fourth left intercostal space, left sternal border |
| **V3** | Midway between V2 and V4 |
| **V4** | Fifth left intercostal space, midclavicular line |
| **V5** | Anterior axillary line, horizontal with V4 |
| **V6** | Midaxillary line, horizontal with V4 |

For accurate placement, locate **V4 before V3**, then put V3 midway between V2 and V4. Incorrect placement can alter the tracing and create misleading findings.

<figure class="teaching-illustration ecg-figure-small" id="ecg-precordial">
<a href="https://upload.wikimedia.org/wikipedia/commons/c/c4/Precordial_Leads_3.svg" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="https://upload.wikimedia.org/wikipedia/commons/c/c4/Precordial_Leads_3.svg" alt="Anterior torso and rib cage with six labelled ECG chest electrodes V1 to V6 in their correct anatomical positions." width="287" height="252"></a>
<figcaption><strong>Figure 02. V1–V6 chest electrode positions.</strong> The diagram shows where electrodes go; the table adds intercostal-space landmarks. <span class="figure-credit">Jmarchn · <a href="https://commons.wikimedia.org/wiki/File:Precordial_Leads_3.svg" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a> · unmodified.</span></figcaption>
</figure>

## 4. Waves, segments and intervals: what is the difference?

The ECG tracing is made up of **waves**, **segments** and **intervals**. These words are not interchangeable:

- **Wave:** A deflection associated with a change in the heart's summed electrical activity (e.g. P or T).
- **Segment:** The part **between** specified waves (e.g. PR segment or ST segment).
- **Interval:** A measured span including **one or more waves** and often a segment (e.g. PR or QT interval).

<figure class="teaching-illustration ecg-figure-signal" id="ecg-normal-wave">
<a href="https://upload.wikimedia.org/wikipedia/commons/9/9e/SinusRhythmLabels.svg" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="https://upload.wikimedia.org/wikipedia/commons/9/9e/SinusRhythmLabels.svg" alt="Labeled normal ECG with P wave, QRS complex, T wave, PR segment and interval, ST segment and QT interval." width="512" height="512"></a>
<figcaption><strong>Figure 03. Normal ECG waves and intervals.</strong> Compare the <em>PR segment</em> (end of P to start of QRS) with the <em>PR interval</em> (start of P to start of QRS). Open to enlarge. <span class="figure-credit">Agateller (Anthony Atkielski), SVG conversion by atom · <a href="https://commons.wikimedia.org/wiki/File:SinusRhythmLabels.svg" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> · public domain.</span></figcaption>
</figure>

### P wave — Atrial depolarisation

The SA node initiates an impulse, which spreads through atrial myocardium. The **P wave represents atrial myocardial depolarisation**, not merely the firing of the tiny SA node. Atrial contraction follows. The lecturer gives an illustrative normal P-wave duration of **0.08–0.10 seconds**.

### PR interval — Time from atrial to ventricular depolarisation

The **PR interval** starts at the **beginning of the P wave** and ends at the **beginning of QRS**. It is normally about **0.12–0.20 seconds**. It includes atrial depolarisation and conduction through the AV node and His–Purkinje system up to the start of ventricular activation. **The whole PR interval is not simply the AV nodal delay.**

In contrast, the **PR segment** runs from the **end** of P to the **start** of QRS. Keep the starting points distinct when answering exam questions.

### QRS complex — Ventricular depolarisation

The **QRS complex** represents ventricular depolarisation. Ventricular muscle mass is much greater than atrial mass, so its summed signal is typically larger than the P wave. The lecturer quotes a QRS duration of approximately **0.06–0.10 seconds**; a duration **under 0.12 seconds** is a common broad normal clinical criterion.

**Q** is the first negative deflection before a positive R; **R** is a positive deflection; **S** is a negative deflection after an R. A particular lead need not show all three letters.

**Why don't we see atrial repolarisation separately?** It usually overlaps with ventricular depolarisation, and its smaller signal is masked by QRS—not absent.

### ST segment — A nearly flat line during continued ventricular electrical activity

The **ST segment** extends from the **end of QRS (J point)** to the **beginning of the T wave**. During much of this interval, ventricular myocardial cells are in relatively similar depolarised states, so the lead often detects little net voltage difference.

**Flat does not mean inactive.** The ST segment roughly corresponds to the ventricular action-potential plateau, not to a period when the cells have returned to rest. ST elevation and depression can have clinical importance, including myocardial ischaemia, but require appropriate context.

### T wave — Ventricular repolarisation

The **T wave** reflects the spread of ventricular repolarisation. Repolarisation is not instantaneous and may give a broader waveform than QRS. The normal T-wave direction reflects both the spatial sequence of recovery and the polarity of repolarisation.

### U wave — Sometimes present, origin uncertain

A small **U wave** may follow the T wave. The lecture calls it the final remnants of ventricular repolarisation; this is a traditional teaching description. **Its precise source is still debated**, so we should not present a specific proposed mechanism as settled fact.

### QT interval — Ventricular activation through recovery

The **QT interval** extends from the **start of QRS to the end of the T wave**. It includes ventricular depolarisation and repolarisation. The lecturer gives an illustrative range of **0.2–0.4 seconds**, noting that QT varies with heart rate. Its duration shortens or lengthens with heart rate, so a single fixed normal QT value is misleading.

**Supplementary: heart-rate correction.** Bazett's formula is a commonly taught approximation, although it is less reliable at unusually low or high heart rates.

<div class="equation-block"><span class="equation-label">Bazett's QT correction</span><math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>QT</mi><mi>c</mi></msub><mo>=</mo><mfrac><mi>QT</mi><msqrt><mi>RR</mi></msqrt></mfrac></math><span class="equation-example">Use QT and RR measurements in seconds; interpret the result in clinical context.</span></div>

## 5. Connect the ECG to mechanical events

| ECG feature | Electrical event | Mechanical connection |
|---|---|---|
| P wave | Atrial depolarisation | Atrial contraction follows |
| PR interval | Atrial-to-ventricular activation time | Includes the AV delay that supports final filling |
| QRS complex | Ventricular depolarisation | Ventricular contraction follows |
| ST segment | Much ventricular myocardium remains depolarised | Sustained ventricular contraction/ejection |
| T wave | Ventricular repolarisation | Mechanical relaxation develops, but not instantaneously |

This connects directly with Chapter 04's Wiggers diagram: **the ECG measures the electrical changes; the Wiggers diagram also shows pressure, volume and valve events**. The electrical and mechanical curves are connected but are not interchangeable.

## 6. How do ECG paper squares represent time and voltage?

The lecturer's standard settings are **25 mm/s** (paper speed) and **10 mm/mV** (voltage gain).

<div class="ecg-calibration-mini" role="group" aria-label="ECG paper calibration"><div class="ecg-paper-sample" aria-hidden="true"></div><div><strong>At 25 mm/s</strong><p>1 small 1-mm horizontal square = <strong>0.04 s</strong><br>1 large 5-mm horizontal square = <strong>0.20 s</strong></p><p><strong>At 10 mm/mV:</strong> 1 small vertical square = <strong>0.1 mV</strong>; 1 large vertical square = <strong>0.5 mV</strong>.</p></div></div>

**Why is this true?** At 25 mm/s, the paper moves 25 mm in one second. Each 1-mm horizontal square therefore spans **1 ÷ 25 = 0.04 s**; five such squares span **0.20 s**.

**Do not confuse axes:** Horizontal spacing measures time; vertical height measures voltage. A taller QRS does not mean a longer QRS duration.

## 7. Calculate heart rate from the tracing

For a **regular rhythm**, measure the R–R interval. Since 60 seconds make one minute:

<div class="equation-block"><span class="equation-label">General relationship</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>HR</mi><mo>=</mo><mfrac><mn>60</mn><mrow><mi>RR</mi><mo> </mo><mtext>in seconds</mtext></mrow></mfrac></math></div>

At 25 mm/s, the common shortcuts follow from 1500 small or 300 large squares passing per minute:

<div class="equation-block"><span class="equation-label">25 mm/s · regular rhythm</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>HR</mi><mo>=</mo><mfrac><mn>1500</mn><msub><mi>N</mi><mtext>small squares</mtext></msub></mfrac></math><span class="equation-example">Or 300 ÷ number of large squares between consecutive R waves.</span></div>

### Worked example: the lecturer's 22 small squares

If an R–R interval spans **22 small squares**:

**RR duration = 22 × 0.04 s = 0.88 s**

**Heart rate = 60 ÷ 0.88 ≈ 68 beats/min**, equivalently 1500 ÷ 22 ≈ 68.

**Important observation about slide 14:** Not all its R–R intervals appear equal. The calculation **1500 ÷ 22** gives the rate represented by *that particular interval*. It should not automatically be called the average rate for the whole irregular tracing.

### What changes if the rhythm is irregular?

When R–R intervals vary, a single pair of R waves is insufficient to estimate the average. One simple method is to count ventricular complexes in a **6-second strip** and multiply by **10** (supplementary).

*Example:* 8 QRS complexes in 6 seconds → approximate average **80 beats/min**.

### What if paper speed is 50 mm/s?

Each small horizontal square then represents **0.02 s**, so the shortcuts become **3000 ÷ small squares** or **600 ÷ large squares**. Always check the paper speed before using a shortcut.

## 8. Basic rhythm assessment (supplementary)

The lecture's central focus is ECG fundamentals, not a full arrhythmia course. Still, an initial rhythm assessment connects the tracing to its purpose.

Ask four questions: **Is the ventricular rate appropriate? Are the R–R intervals regular? Are consistent P waves present before QRS? Is conduction through PR and QRS appropriate?**

A normal sinus rhythm generally shows P waves of consistent shape, with an appropriate relationship between each P and the following QRS and a reasonably regular rhythm. For healthy adults at rest, **60–100 beats/min** is a common reference range, though slower rates can be normal in particular circumstances.

### Recognition of AV conduction disturbance

| Pattern | Interpretation |
|---|---|
| **PR >0.20 s**, every P followed by QRS | First-degree AV block |
| Some P waves **not followed by QRS** | Second-degree AV block |
| P waves and QRS complexes follow **independent rhythms** | Complete (third-degree) AV block |

**Mechanism:** These patterns concern how the atrial impulse is delayed or fails to reach ventricular myocardium. Their detailed subtypes are supplementary and require additional ECG practice.

A normal-looking ECG cannot guarantee effective cardiac output: **electrical activity does not prove adequate mechanical pumping**.

## Understanding Check

**1. How can skin electrodes record activity generated inside the heart?**
<details><summary>Reveal explanation</summary><p>Cardiac depolarisation and repolarisation produce electrical potential differences that are conducted through body tissues. Electrodes detect differences between skin locations, so the ECG can record the combined electrical activity without touching the myocardium. It records electricity, not the strength of contraction.</p></details>

**2. Why do ten electrodes produce twelve ECG leads?**
<details><summary>Reveal explanation</summary><p><strong>Electrodes are recording contacts; leads are calculated electrical views.</strong> Four limb electrodes and six precordial electrodes provide three bipolar limb views, three augmented limb views and six chest views. The right-leg electrode helps reduce interference rather than producing another lead.</p></details>

**3. If a depolarisation vector moves away from the positive direction of Lead II, what deflection is expected?**
<details><summary>Reveal explanation</summary><p><strong>Predominantly negative (downward).</strong> A lead displays the projection of the heart's electrical vector onto its positive recording direction. Depolarisation moving away from that direction generates a negative deflection; moving towards it produces a positive one.</p></details>

**4. Explain what Einthoven's law means if Leads I and III measure +0.5 and +0.3 mV at the same instant.**
<details><summary>Reveal explanation</summary><p><strong>Lead II = +0.8 mV</strong>, because V<sub>II</sub> = V<sub>I</sub> + V<sub>III</sub>. This relationship follows from how the three bipolar limb leads use the right-arm, left-arm and left-leg electrode potentials. The values must be compared at the same instant.</p></details>

**5. The QRS complex is larger than the P wave. Which electrical event does each represent, and why is the difference expected?**
<details><summary>Reveal explanation</summary><p><strong>QRS is ventricular depolarisation; P is atrial depolarisation.</strong> The ventricles have greater muscle mass, so the summed surface electrical signal during ventricular activation is usually much larger. The small atrial repolarisation signal is normally hidden within QRS.</p></details>

**6. A student measures the PR segment and calls it the PR interval. What is missing?**
<details><summary>Reveal explanation</summary><p><strong>The P wave itself.</strong> The PR segment starts at the end of P and ends at the beginning of QRS; the PR interval starts at the <em>beginning</em> of P. Therefore the PR interval includes atrial depolarisation plus subsequent conduction time, not just AV nodal delay.</p></details>

**7. Why can the ST segment lie near the baseline while most ventricular cells remain depolarised?**
<details><summary>Reveal explanation</summary><p>During much of the ST segment, ventricular regions are in relatively similar depolarised states. The lead therefore detects only a small net electrical potential difference. A flat segment does <strong>not</strong> indicate that the ventricle has become electrically inactive.</p></details>

**8. At 25 mm/s, two R waves are separated by 22 small squares. Calculate the rate.**
<details><summary>Reveal explanation</summary><p>Each small horizontal square lasts 0.04 s. The RR interval is 22 × 0.04 = <strong>0.88 s</strong>. Rate = 60 ÷ 0.88 ≈ <strong>68 beats/min</strong> (also 1500 ÷ 22). If other R–R intervals differ, this is only the beat-to-beat rate for the chosen interval.</p></details>

**9. Why does the 1500 rule need adjustment at a paper speed of 50 mm/s?**
<details><summary>Reveal explanation</summary><p>The paper travels twice as far per second, so each small square lasts 0.02 s rather than 0.04 s. There are now 3000 small squares per minute; the corresponding regular-rhythm shortcut is <strong>3000 ÷ small squares</strong> (or 600 ÷ large squares).</p></details>

**10. An irregular ECG has eight QRS complexes in six seconds. Estimate its average ventricular rate.**
<details><summary>Reveal explanation</summary><p><strong>Approximately 80 beats/min.</strong> Eight beats in six seconds correspond to 8 × (60 ÷ 6) = 80 beats/min. For an irregular rhythm, counting complexes over a longer interval is more representative than applying the 1500 rule to one R–R interval.</p></details>

**11. Each P wave is followed by QRS, but the PR interval is 0.24 seconds. What pattern does this suggest?**
<details><summary>Reveal explanation</summary><p><strong>First-degree AV block.</strong> PR is prolonged beyond 0.20 s, yet each atrial impulse still conducts to the ventricles. The finding indicates delayed AV transmission, not dropped beats or complete AV dissociation.</p></details>

**12. Can a regular ECG tracing prove that the ventricles are pumping enough blood?**
<details><summary>Reveal explanation</summary><p><strong>No.</strong> An ECG measures electrical activity. Electrical impulses may occur without effective myocardial contraction or sufficient stroke volume, so perfusion requires assessment of the pulse, blood pressure and clinical state.</p></details>

## Chapter Essentials

1. **ECG:** Records electrical potential differences detected at the body surface, not blood pressure or contraction.
2. **Twelve leads, ten electrodes:** Three bipolar limb, three augmented limb and six chest leads.
3. **Vector rule:** Depolarisation towards a positive lead produces a positive deflection; away produces a negative deflection.
4. **Lead placement:** I, II and III use limb-electrode differences; V1–V6 have specific chest landmarks.
5. **P wave:** Atrial myocardial depolarisation; **QRS:** ventricular depolarisation; **T wave:** ventricular repolarisation.
6. **PR interval:** Start of P to start of QRS, normally about 0.12–0.20 s; do not confuse with PR segment or pure AV nodal delay.
7. **QRS duration:** About 0.06–0.10 s in the lecturer's examples; often less than 0.12 s clinically.
8. **ST segment:** Ventricular myocardium remains largely depolarised; a flat tracing does not mean inactivity.
9. **QT interval:** Start of QRS to end of T; varies with heart rate. U-wave origin remains unsettled.
10. **Calibration at 25 mm/s and 10 mm/mV:** Small square 0.04 s horizontally and 0.1 mV vertically; large square 0.20 s.
11. **Heart rate:** Regular rhythm HR = 1500 ÷ small squares or 300 ÷ large squares at 25 mm/s; use longer strips to estimate irregular rhythms.
12. **Basic rhythm assessment:** Rate, regularity, P waves, PR and QRS; ECG electrical activity does not guarantee cardiac output.
