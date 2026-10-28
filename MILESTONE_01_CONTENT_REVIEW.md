# DOMiNANCE Breakdowns — First 10-Chapter Milestone

**Review date:** 28 October 2026  
**Repository:** DOMiNANCE-hub/DOMiNANCE-Breakdowns  
**Project:** HB2 Cardiovascular Physiology, 27-topic roadmap  
**Content milestone:** 10 / 27 topics source-published and synchronised into website data.

## Chapters completed
1. Introduction to the Heart and Circulation
2. Cardiac Muscle Physiology
3. Cardiac Conduction and Automaticity
4. The Cardiac Cycle
5. Heart Sounds and Murmurs
6. Electrocardiography and Basic Rhythms
7. Cardiac Output and the Frank–Starling Law
8. Cardiac Output Measurement and Work
9. Blood Flow and Hemodynamics
10. Arterial Blood Pressure

## Automated repository checks (PASS)
- All ten chapters have matching updated Markdown sources and site HTML in `content.js`.
- **97** revealable Understanding Check explanations in total.
- All ten chapters contain numbered Chapter Essentials.
- All registered contents-section anchors appear in matching HTML.
- Every inline glossary `data-term` used by the first ten chapter HTML documents resolves to a glossary key.
- `content.js`, `app.js`, `media.js`, `glossary.js` and `figures.js` pass JavaScript syntax parsing.
- Tested a subset of embedded structural HTML tag nesting (div, figure, svg, details, math, table, list, MathML fractions); no unmatched or unclosed tags found in the first ten chapter documents.
- Compact responsive style rules are present for newly added ECG, cardiac-output, Fick, hemodynamics and BP teaching components.
- Heart-sound playback is on-demand with MP3 and OGG source choices; no audio is autoplayed by the chapter markup.

## Teaching-quality changes
- Explanations are organised around **what causes the next event**, not memorisation of phase lists.
- Equations use native MathML where mathematical structure matters and include worked units.
- Graphs are placed beside their explanations and oversized duplicated pre-chapter diagrams were removed.
- Understanding Checks include explanation of the causal mechanism and application consequences.
- Discrepancies between lecturer shorthand and fuller physiological concepts are distinguished in chapter-specific notes.
- Images and recordings sourced from external works carry attribution and licence information where appropriate.
- Chapter 07: `assets/chapter07/SOURCE_NOTES.md`
- Chapter 08: `assets/chapter08/SOURCE_NOTES.md`
- Chapter 09: `assets/chapter09/SOURCE_NOTES.md`
- Chapter 10: `assets/chapter10/SOURCE_NOTES.md`

## Explicitly NOT yet verified
- Current Vercel deployment state or whether all GitHub commits have been propagated to production. Earlier Vercel checks were blocked by missing project access/permissions.
- Actual visual rendering on devices of **320px, 360px, 390px, 768px and desktop widths**.
- Live media playback, source-network accessibility, user tap-to-reveal and touch navigation on actual devices.
- A student usability evaluation showing real comprehension improvement.

This is a **content and repository-integrity milestone**, not a declaration that all product or DOMiNANCE learning-experience goals are fully achieved.

## Next content milestone
Chapters 11–15: Arterial and jugular venous pulse; Veins and Venous Return; Microcirculation and Capillary Exchange; Lymphatic System; remaining topics according to the repository's `content.js` roadmap.

## Release gate to complete
Use an authorised deployment/browser environment to verify page layout, horizontal overflow, font readability, equation rendering, on-demand media, glossary popups, accordion operation and navigation. Record observed failures and revise before treating the mobile production release as verified.
