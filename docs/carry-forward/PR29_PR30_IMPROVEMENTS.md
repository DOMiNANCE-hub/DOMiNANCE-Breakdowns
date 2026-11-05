# Carry-forward record: PRs #29 and #30

Purpose: keep the useful teaching work from two unmerged pull requests so it can be reused during the chapter-by-chapter redesign. Once this record is merged or otherwise kept safe, the PRs can be closed.

- **PR #29**: *Improve Chapter 1 physiology explanations*. Branch `codex/chapter-1-teaching-quality-audit`, head `8567a07`. Changes `cv-introduction.md` only.
- **PR #30**: *Improve CVS teaching quality across Chapters 2–6*. Branch `codex/cvs-chapters-2-6-teaching-refinements`, head `c17b57d`. Changes Chapters 2–6, plus its own QA script, workflow, documents and an image file.

Line numbers refer to the Markdown file **on the PR branch**. To view a change, open the branch on GitHub, or run `git show <head>:<file>`.

**Recommendation key**
- **Adopt:** accurate, clearer, and in line with the agreed principles; reuse with light editing.
- **Adapt:** a good idea that needs changes before reuse.
- **Verify:** depends on a fact, licence or figure not yet checked.
- **Do not reuse:** superseded, or would remove something valuable.

**Pattern to avoid in both PRs:** several new questions *replaced* existing "Supplementary" questions instead of being added. The replaced questions are listed below so nothing is lost. In the redesign, decide question by question which ones teach best. Neither the old nor the new version wins by default.

---

## Chapter 1: Introduction to the Heart and Circulation (PR #29)

| Line | Concept | What the PR changes | Recommendation |
|---|---|---|---|
| 5 | Why a circulation is needed | Adds the first-principles reason: most cells are too far from the lungs and gut for diffusion alone, so blood carries substances over long distances, and exchange happens across thin capillary walls. | **Adopt.** Exactly the prerequisite reasoning the lecture leaves out. |
| 32 | Circuits in series | Rephrases "in series" as a concrete route: RV → lungs → LV → body → RV, "two pumps along the same continuous route". | **Adopt.** |
| 34 | Matched ventricular outputs | Worked example: RV 6 L/min vs LV 5 L/min. Pulmonary volume and pressure would rise, so outputs must balance over time. | **Adopt.** A concrete number makes the principle stick. |
| 60 | Valves are passive | A favourable pressure difference pushes leaflets open, and a reversed difference closes them; valves don't pull themselves open. | **Adopt.** Sets up Chapter 4's pressure-gradient logic. |
| 118 | Electrical sequence | SA node → atria → AV nodal delay → ventricles. The delay lets the atria finish filling; disorganised timing reduces pumping efficiency. | **Adopt**, as a brief preview that links forward to Chapter 3. |
| 154–156 | Check: Supplementary 4 | **Replaces** "How would sustained inequality of ventricular output alter the pulmonary circulation?" with "Why might severe left ventricular failure cause breathlessness from lung fluid?" | **Adapt.** The new clinical question is good. The old one is now partly covered by the 6 vs 5 L/min example. Keep the clinical one. |
| 166–168 | Check: Supplementary 7 | **Replaces** "Why can the right ventricle pump a similar volume with less muscular wall thickness?" with a question on arteriolar narrowing and the pressure needed to keep flow constant. | **Do not reuse as a replacement.** The RV wall-thickness question is valuable and specific to this chapter. The resistance question belongs in Chapter 9 (Haemodynamics) or Chapter 10 (Blood Pressure). |

---

## Chapter 2: Cardiac Muscle Physiology (PR #30)

| Line | Concept | What the PR changes | Recommendation |
|---|---|---|---|
| 55 | Plateau (phase 2) and refractoriness | Spells out Ca²⁺ in via L-type channels against K⁺ out, so voltage falls slowly. Explains why the long refractory period prevents a sustained, fused contraction (fast Na⁺ channels haven't recovered). Notes that entering Ca²⁺ triggers the larger release. | **Adopt.** Links the plateau to its purpose. |
| 72 | Calcium-induced calcium release (CICR) amplification | Entering Ca²⁺ is a *small trigger*, and the sarcoplasmic reticulum supplies the *larger signal*; "without this amplification, normal force cannot develop". | **Adopt.** |
| 122 | Sympathetic (β₁) effects | Frames PKA effects as two linked jobs: raise Ca²⁺ more strongly to contract, and remove it faster to relax before the next beat. | **Adopt.** Makes the link between stronger contraction (inotropy) and faster relaxation (lusitropy) explicit. |

---

## Chapter 3: Cardiac Conduction and Automaticity (PR #30)

| Line | Concept | What the PR changes | Recommendation |
|---|---|---|---|
| 56 | SA node dominance / overdrive | "Two clocks" analogy: the faster SA impulse resets the slower pacemaker before it reaches its own firing point; the slower region hasn't lost automaticity. | **Adopt.** |
| 102 | Autonomic control of rate | Phase 4 as "a climb towards a trigger point": a steeper climb gives a faster rate; a slower climb, or a more negative starting point, gives a slower one. | **Adopt.** |
| 161–163 | Check: Supplementary 3 | **Replaces** "Why is the SA nodal upstroke slower than the ventricular upstroke?" (Ca²⁺-driven vs Na⁺-driven phase 0) with "Why does slowed bundle-branch conduction reduce coordination?" (wide QRS). | **Keep both.** The nodal upstroke question is core lecture content; the bundle-branch question is good application. |
| 165–167 | Check: Supplementary 4 | **Replaces** "How does acetylcholine slow SA discharge?" (M2 receptors, ↓cAMP, ↑K⁺ conductance, more negative maximum diastolic potential) with "Complete AV block: why a pulse, yet dizziness?" (escape rhythm, lost AV coordination). | **Keep both.** The acetylcholine mechanism is core, and the AV-block question is strong clinical reasoning. |

---

## Chapter 4: The Cardiac Cycle (PR #30)

Relevant to the Chapter 4 blueprint being prepared separately.

| Line | Concept | What the PR changes | Recommendation |
|---|---|---|---|
| 29 | Passive filling vs atrial kick | Ties passive filling explicitly to *ventricular* diastole, and the atrial kick to the end of ventricular diastole. | **Adopt.** Prevents the common confusion between atrial and ventricular diastole. |
| 33, 45, 112 | Example values | Replaces "the lecturer's example" with "illustrative example". | **Adapt.** Under the lecture-first principle, saying where a value comes from can help. Decide one convention for referring to the lecturer in the chapter specification. |
| 55 | Ejection phases | Flags that the slide's "slow then rapid" ejection differs from the conventional *rapid then reduced* ejection. | **Adopt the approach:** teach the accepted mechanism and add a short note on the slide's version. **Verify** against the actual slide. |
| 65 | Protodiastole | The aortic valve may still be open and some forward ejection continue; isovolumetric relaxation starts only once the aortic valve closes. | **Adopt.** More precise than the current text. |
| 112 | Ejection fraction (EF) limits | "EF is a percentage, not a volume": a small, poorly filled ventricle can have a normal EF but a low stroke volume, so read EF with EDV and SV. | **Adopt.** Links to heart failure with preserved EF (Chapter 21). |
| 196–198 | Check: Supplementary 3 | **Replaces** "Why can pressure rise with no change in volume?" (isovolumetric contraction) with "If aortic diastolic pressure rises, what happens before ejection?" (a longer isovolumetric contraction, so ejection starts later). | **Adopt the new question.** The old one repeats main check 1 (isovolumetric contraction). |

---

## Chapter 5: Heart Sounds and Murmurs (PR #30)

| Line | Concept | What the PR changes | Recommendation |
|---|---|---|---|
| 38 | Physiological splitting of S2 | Explains cause and effect: longer RV ejection makes P2 occur later than A2, so the gap widens and S2 may sound split. | **Adopt.** |
| 42 | Scope note | Removes "beyond this lecturer's primary scope"; refers to clinical cardiology instead. | **Adopt.** |
| 85 | Predicting murmur timing | Three-question method: is the ventricle contracting or filling? Should the valve be open or closed then? Is blood forced through a narrowing or leaking backwards? | **Adopt.** Replaces memorised lists with reasoning, as the principles require. |
| 128–131 | Auscultation figure and orientation | Replaces the current Wikimedia figure (*Heart_sounds_auscultation_areas.svg*, credited as public domain) with an OpenRN/LibreTexts five-site figure including Erb's point (credited CC BY 4.0), linked from `med.libretexts.org`. Adds an "orientation check": these are the **patient's** sides, and the tricuspid area is at the patient's lower left sternal border. | **Adopt the orientation note** (the anatomy is correct). **Verify the figure:** PR #30's commit history says the current figure's tricuspid marking is misleading, which nobody has checked yet. The new image's licence, labels and reliability also need checking (linked from another site, outside the standard credit box), and it should be self-hosted. Decide through the media registry. |
| 190–192 | Check: Supplementary 2 | **Replaces** "Why can a stiff ventricle produce S4, but not in atrial fibrillation?" with "Why can't a loud A2 alone indicate aortic valve disease severity?" | **Keep both.** The S4 and atrial fibrillation question tests a core mechanism (S4 needs organised atrial contraction); the A2 question is good clinical reasoning. |
| — | Layout bug | PR #30 **still contains the stray `</div>`** that PR #31 fixes. | **Do not reuse** this file's markup as it stands; take only the wording above. |

The PR does not change the existing audio-licence contradiction (CC BY-SA 3.0 vs CC0 for the heart-sound recording). It still needs verifying.

---

## Chapter 6: Electrocardiography and Basic Rhythms (PR #30)

| Line | Concept | What the PR changes | Recommendation |
|---|---|---|---|
| 27 | Why the T wave is upright | Two reversals: repolarisation has opposite polarity, and in many regions it spreads in a different direction from depolarisation, so the T wave and the main QRS are often both upright. An upright T wave is not a second depolarisation. | **Adopt.** Directly targets a common misconception. |
| 127 | U wave | Calls the "remnant of repolarisation" description introductory teaching and keeps "its source is still debated". | **Adopt.** |
| 131 | QT and heart rate | QT shortens as rate rises and lengthens as it falls; no single fixed QT range fits every rate; introduces QTc. | **Adopt.** Removes the misleading fixed range of 0.2–0.4 s. |
| 177 | Slide 14's irregular tracing | Notes that 1500 ÷ 22 gives the rate for *that interval*, not the average of an irregular strip. | **Adopt**, as a short note on the slide's tracing. **Verify** against slide 14. |
| 181 | Average rate in irregular rhythm | At 25 mm/s, a six-second strip is 30 large squares; count QRS complexes and multiply by 10. | **Adopt.** The arithmetic is correct. |
| 99, 109, 151, 169, 191 | Wording | Removes "the lecturer quotes / standard" phrasing. | **Adapt** with the convention chosen for Chapter 4. |
| 241 | Check 11: AV block | Extends "PR 0.24 s, what pattern?" to compare first-degree AV block (delay, every P conducted) with second-degree AV block (some P waves not conducted). | **Adopt.** Tests telling the two apart, not just recall. |

---

## Non-content parts of PR #30

| Item | Status | Recommendation |
|---|---|---|
| `scripts/check_content.py` and `.github/workflows/cvs-content-validation.yml` | Superseded by PR #31: `audit_quality.py`, the browser suite and `ci.yml`. It also enforces exactly 12 checks in Chapters 2–6, which the agreed principles drop. | **Do not reuse.** |
| `docs/CHAPTERS_2_6_FIGURE_QA.md` | Lists **10 figures in Chapters 2–6** whose scientific accuracy has not been checked: intercalated discs, the action potential and twitch, calcium cycling, the conducting system (avoid implying insulated internodal tracts), nodal vs ventricular action potentials, the Wiggers diagram, auscultation sites, the Einthoven triangle, precordial lead placement, and the labelling of ECG waves and intervals. | **Adopt as a checklist** for the media registry. Each item becomes part of that chapter's visual check. |
| `assets/cardiac-auscultation-verified-schematic.svg` | An original five-site diagram (patient's right on image left). **Not used** by any chapter. | **Verify.** It could serve as a self-hosted alternative for Chapter 5 if its anatomy checks out. |
| README edits | Root-path fix (already done in PR #31) and a note about the Chapter 5 figure. | **Do not reuse.** |

---

## Before closing PRs #29 and #30
1. This record is on GitHub (branch `claude/pr29-pr30-carry-forward`) and has been reviewed.
2. The branch heads above (`8567a07`, `c17b57d`) stay readable. Closing a PR doesn't delete its branch, so keep both branches until Chapters 1–6 are rebuilt.
