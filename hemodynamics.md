# Blood Flow and Hemodynamics

**Lecture:** CIRCULATION 1(4).pdf, slides 55–75. **Supplementary clarifications:** realistic blood rheology, network resistance, and correct microscopic dimensions.

## 1. What propels blood around the circulation?

The heart supplies the energy that establishes a pressure gradient. Blood moves through **arteries → arterioles → capillaries → venules → veins → heart**.

The lecturer also names **elastic recoil** of large arteries, the **skeletal-muscle pump** compressing veins and the **respiratory pump** using changing intrathoracic pressures. These assist blood flow at different points; they do not replace the heart as its main pressure source.

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

The lecturer briefly describes capillary sphincters, endothelial gaps and fenestrations. **Careful correction:** microscopic gaps and fenestrations are not *millimetres* wide as the slide's unit suggests. Not every capillary has its own sphincter; local control varies with tissue. These details receive fuller treatment in the microcirculation chapter.

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

**Worked mechanism:** If the radius changes from r to r/2, the new resistance is \(2^4=16\) times larger, *provided length and viscosity remain unchanged*. With a fixed pressure difference, Q = ΔP/R means flow falls to one-sixteenth.

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
