# DOMiNANCE Breakdowns — Milestone 02 (15-Chapter Content Review)

**Review date:** 28 October 2026  
**Scope:** KNUST HB2 Cardiovascular Physiology  
**Content roadmap:** 27 chapter entries  
**Content milestone:** 15/27 chapters updated and synchronised with website data (55.6% of planned chapters).

## New published chapters in this milestone

| Chapter | Title | Understanding Checks | Main lecturer source |
|---|---|---:|---|
| 11 | Arterial Pulse and Jugular Venous Pulse | 12 | Circulation 1 pp22–26 |
| 12 | Veins and Venous Return | 12 | Circulation 1 pp43–44, 73–75, 97–98 |
| 13 | Microcirculation and Capillary Exchange | 12 | Circulation 1 pp57–60, 84–89 |
| 14 | Formation of Oedema | 12 | Circulation 1 pp89–95 |
| 15 | Lymphatic Circulation | 12 | Circulation 1 pp60, 94–95; Regional Circulation pp47–48 |

The project now has **157 expandable Understanding Check explanations** across 15 chapters: 97 from Chapters 1–10 and 60 new questions across Chapters 11–15.

## Repository checks performed (all PASS)

- The five revised Markdown files match their generated chapter HTML entries in `content.js`.
- Exactly twelve explanatory check panels appear in both Markdown and site HTML for each of Chapters 11–15.
- All five include numbered Chapter Essentials.
- Every `sections[]` anchor for Chapters 11–15 resolves to a matching HTML ID.
- No unresolved glossary `data-term` references in the new five chapters.
- Nested figures, SVG, div, details, MathML, tables and lists passed structural balance checks.
- `app.js`, `media.js`, `glossary.js`, `figures.js` and `content.js` passed JavaScript syntax parsing.
- New compact mobile CSS rules cover waveforms, venous muscle pumping, capillary forces, oedema mechanism flows and lymphatic entry.
- The previous duplicated, oversized generic microcirculation figure was removed; inline teaching visuals remain.
- Prior ten chapters retained their chapter essentials and original count of Understanding Checks.

## Pedagogical changes and scientific cautions

- Arterial pulse propagation is distinguished from velocity of blood flow.
- JVP waveforms are mapped to right atrial/cardiac events; cannon a waves and prominent tricuspid-regurgitation v/cv waves are differentiated.
- Venous return is linked to right atrial filling, venous tone, one-way valves, breathing and the skeletal-muscle pump.
- Continuous, fenestrated and sinusoidal capillaries and different types of exchange are distinguished.
- The lecturer's **24 L/day, 85% reabsorption, 15% lymph** example is preserved as a *classic model*; the glycocalyx-based revised Starling principle is explicitly marked as supplementary scientific refinement.
- Oedema is explained through hydrostatic, oncotic, permeability, lymphatic and fluid-retention mechanisms.
- Lymphatics are connected to interstitial protein/fluid return, immune surveillance, intestinal lacteal/chylomicron transport and stages of lymphoedema.
- Early lymphoedema may pit; late fibrotic disease may become non-pitting.

## Chapter-level evidence notes

- `assets/chapter11/SOURCE_NOTES.md`
- `assets/chapter12/SOURCE_NOTES.md`
- `assets/chapter13/SOURCE_NOTES.md`
- `assets/chapter14/SOURCE_NOTES.md`
- `assets/chapter15/SOURCE_NOTES.md`

Cross-checks include Merck/JVP clinical examination; Levick and Michel's revised Starling principle; Physiological Reviews of lymphatic function; and NCBI Bookshelf lymphedema staging. All added explanation is distinguished from what the lecturer actually says.

## Explicit limitations / release gates remaining

- No authorised live Vercel deployment verification is available through the connected account.
- Actual rendered layouts on **320px, 360px, 390px, 768px and desktop** have not been inspected in an instrumented live browser.
- Real-device tap navigation, glossary, audio, image loading and MathML presentation are not proven by JavaScript syntax/HTML structural checks.
- No student usability or learning-outcome study has yet been completed.
- The project remains **15 chapters content-complete**, **not** a fully production-verified learning experience.

## Next content milestone: 20 / 27

16. Local Control of Blood Flow  
17. Neural and Hormonal Regulation  
18. Cardiovascular Reflexes and Cushing Response  
19. Gravity and Orthostatic Homeostasis  
20. Circulatory Shock

These names match the current `content.js` roadmap. All work should continue to be guided by the primary lecturer's actual slides, with independent additions labelled as supplementary.
