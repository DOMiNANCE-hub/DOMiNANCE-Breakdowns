# Blood Flow and Hemodynamics

## 1. What propels blood around the circulation?

The heart supplies the energy that establishes a pressure gradient. Blood moves through **arteries → arterioles → capillaries → venules → veins → heart**.

Additional mechanisms include **elastic recoil** of large arteries, the **skeletal-muscle pump** compressing veins and the **respiratory pump** using changing intrathoracic pressures. These assist blood flow at different points; they do not replace the heart as its main pressure source.

**Why does flow continue during ventricular diastole?** Large elastic arteries stretch during systole, storing energy; their recoil helps sustain pressure and forward flow between ejections. One-way valves in many veins help prevent backward flow during muscle compression.

## 2. What actually determines flow?

The **effective perfusion pressure** is the difference between upstream and downstream vascular pressure. For the same resistance, a larger pressure difference produces greater flow.

<div class="equation-block"><span class="equation-label">Pressure, flow and resistance</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>Q</mi><mo>=</mo><mfrac><mrow><mi>Δ</mi><mi>P</mi></mrow><mi>R</mi></mfrac><mspace width="1em"/><mi>R</mi><mo>=</mo><mfrac><mrow><mi>Δ</mi><mi>P</mi></mrow><mi>Q</mi></mfrac></math><span class="equation-example">Q = blood volume per time; ΔP = upstream − downstream pressure; R = vascular resistance.</span></div>

**Example:** A pressure drop of 80 mmHg across a system whose resistance is 20 mmHg·min/L produces flow of **4 L/min**. This is an arithmetic illustration, not a specific organ's reference flow.

**Important:** High pressure at one point does not, by itself, guarantee high flow. Blood flow depends on the **pressure drop across the pathway** and its resistance.

## 3. Why do different vessels have different roles?

| Segment | Special structure | Primary role |
|---|---|---|
| **Large arteries** | Elastic walls | Store pressure energy in systole and recoil in diastole |
| **Arterioles** | Relatively abundant smooth muscle | Regulate resistance and organ perfusion |
| **Capillaries** | Very thin endothelial walls | Exchange gases, nutrients and fluid |
| **Veins** | Distensible thin walls, often valves | Store blood and support its return |

**Why are arterioles called resistance vessels?** Small muscular arterioles can change their radius rapidly. Even slight constriction can strongly increase resistance.

**Why are veins called capacitance vessels?** Their high compliance lets them accommodate substantial extra blood with a comparatively modest rise in pressure. Noradrenergic venoconstriction can shift blood from venous reservoirs towards the heart.

Key structures include capillary sphincters, endothelial gaps and fenestrations. **Careful correction:** microscopic gaps and fenestrations are not *millimetres* wide as the slide's unit suggests. Not every capillary has its own sphincter; local control varies with tissue. These details receive fuller treatment in the microcirculation chapter.

**Lymphatic overview:** Lymph vessels collect excess interstitial fluid and proteins, have valves and often traverse lymph nodes before large lymphatic ducts return fluid near the subclavian–internal jugular venous junctions. Detailed lymphatic physiology follows in its dedicated chapter.

## 4. Why is blood velocity lowest in capillaries?

**Volume flow (Q)** is the quantity of blood per unit time; **velocity (v)** is the distance travelled per unit time. They are different measurements.

<div class="equation-block"><span class="equation-label">Continuity relation</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>Q</mi><mo>=</mo><mi>v</mi><mi>A</mi><mspace width="1em"/><mi>v</mi><mo>=</mo><mfrac><mi>Q</mi><mi>A</mi></mfrac></math><span class="equation-example">A = total cross-sectional area of the vessels considered.</span></div>

**The crucial word is TOTAL.** Each capillary is narrow, but there are enormously many in parallel. Their combined cross-sectional area is far larger than that of the aorta.

Therefore, at comparable overall volume flow, mean velocity decreases as blood travels from the aorta towards capillary beds, then increases again towards larger veins as the total area falls. Slow capillary flow also permits more time for exchange.


## 5. Laminar flow, turbulence and Reynolds number

In ideal **laminar flow**, fluid travels in organised layers. The layer touching the vessel wall is slowest because of friction at the wall, while the centre moves faster. This gives the familiar smooth, approximately parabolic velocity profile in a straight tube.

<figure class="learning-figure hemo-flow-figure"><figcaption>Figure 01. Idealised laminar blood-flow profile</figcaption><svg viewBox="0 0 540 165" role="img" aria-label="An idealised vessel with multiple flow arrows, the longest arrows at the centre and shortest nearest the vessel wall."><rect x="40" y="34" width="465" height="99" rx="10" fill="#e9f1ff" stroke="#8caccb" stroke-width="2"/><g stroke="#2162be" stroke-width="4" stroke-linecap="round"><path d="M89 49H179m-10 -7 10 7 -10 7" fill="none"/><path d="M89 72H365m-10 -7 10 7 -10 7" fill="none"/><path d="M89 96H446m-10 -7 10 7 -10 7" fill="none"/><path d="M89 118H365m-10 -7 10 7 -10 7" fill="none"/></g><g fill="currentColor" font-size="12"><text x="41" y="22">Near the wall: slow</text><text x="299" y="22">Near centre: fast</text><text x="41" y="153">Original schematic — not a measured flow profile</text></g></svg><p>The ideal no-slip profile explains the lecturer's arrows. Actual blood contains cells and flowing vessels branch, pulse and deform, so the profile is not always exactly parabolic.</p></figure>

**Turbulent or disturbed flow** has changing local velocity directions, often generating audible sounds such as bruits or murmurs. It is made more likely by high velocity, sudden changes in vessel geometry and lower blood viscosity.

The lecture introduces the **Reynolds number (Re)** to describe this tendency:

<div class="equation-block"><span class="equation-label">Reynolds number</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>Re</mi><mo>=</mo><mfrac><mrow><mi>ρ</mi><mi>v</mi><mi>D</mi></mrow><mi>η</mi></mfrac></math><span class="equation-example">ρ = density; v = velocity; D = diameter; η = dynamic viscosity.</span></div>

Higher Reynolds number means a **greater likelihood** of turbulent flow, not a guarantee. The vessel's curvature, pulsatility, branching and stenoses also matter.

**Two different symbols:** **R** denotes vascular resistance in the flow law; **Re** denotes *Reynolds number*, which is dimensionless. The lecturer uses similar abbreviated labels for both, but they are not interchangeable.

**Anaemia:** Lower viscosity and a compensatory increase in flow can promote a systolic flow murmur without structural valve disease. **Local narrowing:** Velocity may accelerate through a stenosis, creating disturbed downstream flow and a vascular bruit.

## 6. Why is vessel radius such a powerful determinant of flow?

The lecturer derives the **Hagen–Poiseuille formula** for ideal steady laminar flow through a straight, rigid circular tube:

<div class="equation-block"><span class="equation-label">Hagen–Poiseuille equation</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>Q</mi><mo>=</mo><mfrac><mrow><mi>π</mi><mi>Δ</mi><mi>P</mi><msup><mi>r</mi><mn>4</mn></msup></mrow><mrow><mn>8</mn><mi>η</mi><mi>L</mi></mrow></mfrac></math><span class="equation-example">r = vessel radius; L = vessel length; η = viscosity.</span></div>

Combined with **R = ΔP/Q**, this gives:

<div class="equation-block"><span class="equation-label">Ideal tube resistance</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>R</mi><mo>=</mo><mfrac><mrow><mn>8</mn><mi>η</mi><mi>L</mi></mrow><mrow><mi>π</mi><msup><mi>r</mi><mn>4</mn></msup></mrow></mfrac></math></div>

The key relationship is **R ∝ 1/r⁴**. When radius decreases, resistance increases dramatically.

<div class="hemo-radius-impact" role="group" aria-label="Effect of radius on ideal vessel resistance"><div><strong>Radius halved</strong><span>Resistance ×16</span><small>At unchanged ΔP: flow falls to 1/16</small></div><div><strong>Radius doubled</strong><span>Resistance ÷16</span><small>At unchanged ΔP: flow increases sixteenfold</small></div></div>

**Worked mechanism:** If the radius changes from r to r/2, the new resistance is **2⁴ = 16** times larger, *provided length and viscosity remain unchanged*. With a fixed pressure difference, Q = ΔP/R means flow falls to one-sixteenth.

These relationships are **mathematical aids**, not exact universal predictions: blood is non-Newtonian, vessels are compliant rather than rigid, and vascular tone and pressures change in living people.

### Does a faster jet at a stenosis mean total blood flow increases?

**No.** At the narrowed throat, cross-sectional area decreases and velocity can rise locally, even while the stenosis increases resistance and reduces overall blood flow. A high *local speed* must not be confused with a high *volume flow rate*.

## 7. Viscosity, haematocrit and blood cells

**Viscosity** describes internal resistance to flow. Blood viscosity depends on **haematocrit, plasma proteins, temperature, and red-cell deformation or aggregation**.

The lecturer highlights:

- **Polycythaemia:** More red cells generally increase viscosity, raising viscous resistance and cardiac work.
- **Anaemia:** Viscosity is often lower, but reduced oxygen-carrying capacity can increase cardiac-output demand and produce a flow murmur.
- **Abnormal red-cell rigidity:** Conditions such as sickle-cell disease or hereditary spherocytosis can alter rheology.

In the very smallest vessels, the apparent viscosity differs from predictions for blood in large rigid tubes because cells change their distribution and deformation. Therefore, slide 71's suggestion that viscosity has little effect in all small vessels should be treated as a **context-dependent approximation**, not a universal statement.

## 8. Why are arterioles the main controllable resistance vessels?

The vascular network contains vessels **in series** (one after another) and **in parallel** (multiple paths serving different tissues).

With vessels in series, pressure drops add. With many open pathways in parallel, the overall resistance is lower than that of a single pathway alone.

This explains an apparent puzzle: each capillary has a tiny radius, but there are very many capillaries **in parallel**. Arterioles, with their active muscular control of diameter, account for a large part of the important pressure drop and resistance regulation.

**Physiological application:** Constricting arterioles reduces flow into a tissue at the same perfusion pressure. Dilation lowers local resistance and can increase flow.


## 9. How can blood flow be measured?

The lecturer lists three techniques on slide 62. Their underlying physical signals differ:

| Method | What it measures or detects | How it relates to flow |
|---|---|---|
| **Electromagnetic flowmeter** | Voltage induced by conducting blood in a magnetic field | Used to estimate blood movement through the field |
| **Doppler ultrasound flowmeter** | Frequency shift from moving blood cells | Estimates velocity along the ultrasound beam |
| **Plethysmography** | Changes in tissue or limb volume | Can estimate blood inflow with appropriate experimental conditions |

**Key distinction:** Doppler primarily estimates **velocity**, not volume flow on its own. To estimate total flow, an estimate of the vessel's area and the velocity profile is also required.

The lecture mentions a historical **arm-to-tongue circulation time around 15 seconds**. This is an illustrative transit-time estimate, not a fixed physiological constant for every person.

## 10. Why can veins hold more blood than arteries?

**Vascular compliance** describes how much volume a vessel can accommodate for a given pressure change.

<div class="equation-block"><span class="equation-label">Compliance</span><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>C</mi><mo>=</mo><mfrac><mrow><mi>Δ</mi><mi>V</mi></mrow><mrow><mi>Δ</mi><mi>P</mi></mrow></mfrac></math></div>

Large veins are more compliant than arteries. Their volume can rise considerably before venous pressure rises by the same amount. This is why veins are called **capacitance vessels**, whereas arterioles are commonly described as **resistance vessels**.

An approximate resting blood-volume distribution places a large share in the venous system. The listed percentages are **illustrative, not an exact complete partition**; their values do not add to 100% and vary with physiological conditions.

**Why does venoconstriction help cardiac output?** When the venous system becomes less distensible, stored blood can be redirected towards the heart. This can increase venous return, end-diastolic volume and stroke volume through the Frank–Starling mechanism.

## Understanding Check

**1. Why does blood keep moving through the arteries during ventricular diastole?**
<details><summary>Reveal explanation</summary><p>Large elastic arteries stretch during ventricular systole and store pressure energy. Their recoil during diastole sustains arterial pressure and the pressure gradient towards smaller vessels, so blood can keep moving between ventricular ejections.</p></details>

**2. An organ has an upstream-to-downstream pressure difference of 80 mmHg and a resistance of 20 mmHg·min/L. What is its flow?**
<details><summary>Reveal explanation</summary><p><strong>Q = ΔP/R = 80/20 = 4 L/min.</strong> The pressure difference must be measured across the pathway; pressure at one end by itself does not establish the flow rate. The numbers are for arithmetic practice, not a named organ.</p></details>

**3. Why is mean capillary blood velocity low despite each capillary having a narrow lumen?**
<details><summary>Reveal explanation</summary><p>The capillary system has an enormous number of vessels in <strong>parallel</strong>. Their <strong>combined</strong> cross-sectional area is much greater than that of the aorta. Because v = Q/A, the same overall volume flow moving through a much larger combined area has a lower average velocity.</p></details>

**4. Why does ideal laminar flow have a greater velocity in the centre than beside the wall?**
<details><summary>Reveal explanation</summary><p>Fluid in immediate contact with the vessel wall moves slowly because of viscous boundary effects. Adjacent layers drag on one another, forming a velocity gradient. Flow towards the centre is less constrained and therefore faster. Real blood can depart from the ideal profile because it contains cells.</p></details>

**5. A vessel's radius falls to half its original value at unchanged ΔP, viscosity and length. Predict resistance and flow.**
<details><summary>Reveal explanation</summary><p>Hagen–Poiseuille gives <strong>R ∝ 1/r⁴</strong>. Halving the radius therefore increases the predicted resistance by <strong>16 times</strong>. With unchanged perfusion pressure and Q = ΔP/R, volume flow decreases to <strong>1/16</strong> of its previous value, under ideal-tube assumptions.</p></details>

**6. A stenosis produces a very high velocity at its narrowest point. Must total blood flow through the artery have increased?**
<details><summary>Reveal explanation</summary><p><strong>No.</strong> Local velocity is volume flow divided by local area, so speed can rise as the cross-sectional area narrows even if volume flow remains the same or decreases. The narrowing may also raise resistance and reduce total flow, depending on the pressure gradient.</p></details>

**7. Why may anaemia produce a systolic flow murmur even with normal valves?**
<details><summary>Reveal explanation</summary><p>Anaemia often reduces blood viscosity and increases cardiac output to compensate for reduced oxygen-carrying capacity. Higher flow velocity and reduced viscosity can increase the tendency towards disturbed flow, producing audible vibrations without a structurally abnormal valve.</p></details>

**8. Distinguish vascular resistance R from the Reynolds number Re.**
<details><summary>Reveal explanation</summary><p><strong>Resistance R</strong> relates the pressure difference across a pathway to the resulting volume flow. <strong>Reynolds number Re</strong> is dimensionless and compares effects of density, velocity, diameter and viscosity to assess the tendency towards turbulent flow. The two quantities are not equivalent.</p></details>

**9. Why are arterioles the main adjustable resistance vessels instead of capillaries?**
<details><summary>Reveal explanation</summary><p>Arterioles have smooth muscle capable of rapidly changing their radius and therefore flow resistance. Although individual capillaries are narrow, many operate in parallel and their overall equivalent resistance is reduced. Changing arteriolar tone strongly influences organ perfusion and systemic resistance.</p></details>

**10. What does Doppler ultrasound directly estimate, and what else would be needed to estimate volume flow?**
<details><summary>Reveal explanation</summary><p>Doppler detects frequency shifts from moving blood cells and estimates a component of <strong>velocity</strong>. Volume flow also depends on the cross-sectional area and the velocity profile across the vessel, so estimating Q requires more information than a single Doppler velocity reading.</p></details>

**11. Why do veins store more additional blood than arteries for a similar rise in pressure?**
<details><summary>Reveal explanation</summary><p>Veins have a greater <strong>compliance (C = ΔV/ΔP)</strong>. They accommodate a larger volume increase for a given pressure rise, acting as blood reservoirs. Arterioles instead use their muscular walls to regulate resistance.</p></details>

**12. Polycythaemia and anaemia may both increase cardiac workload. How do their mechanisms differ?**
<details><summary>Reveal explanation</summary><p>In <strong>polycythaemia</strong>, greater haematocrit usually increases viscosity and can raise flow resistance. In <strong>anaemia</strong>, reduced oxygen-carrying capacity often demands greater cardiac output to deliver enough oxygen, producing increased volume flow and workload even when viscosity is lower.</p></details>

## Chapter Essentials

1. **Flow:** Q = ΔP/R; a pressure *difference*, not isolated vessel pressure, drives net flow.
2. **Diastolic arterial flow:** Elastic recoil helps maintain forward flow between ventricular ejections.
3. **Vessel functions:** Elastic arteries, resistance arterioles, exchange capillaries and capacitance veins have distinct roles.
4. **Velocity versus flow:** Q = vA; the total cross-sectional area of parallel capillaries is enormous.
5. **Laminar flow:** Fastest near the centre and slowest by the wall in the ideal model.
6. **Reynolds number:** Re = ρvD/η, a dimensionless measure of turbulence tendency, not vascular resistance.
7. **Hagen–Poiseuille:** Q = πΔPr⁴/(8ηL) for ideal-tube flow; R = 8ηL/(πr⁴).
8. **Radius effect:** Halving radius increases ideal resistance sixteenfold at unchanged other factors.
9. **Arteriolar control:** Small changes in muscular-vessel radius substantially regulate blood flow.
10. **Viscosity:** Depends on haematocrit, plasma components and red-cell properties; blood is not an ideal fluid.
11. **Measurement:** Electromagnetic, Doppler and plethysmographic techniques detect different flow-related signals.
12. **Compliance:** C = ΔV/ΔP; veins accommodate large volume changes at comparatively low pressure.
13. **Small-vessel and lymphatic physiology:** Introduced here, developed in subsequent chapters.
