# DOMiNANCE Breakdowns — Milestone 03 Content Review

**Date:** 28 October 2026  
**Scope:** CVS chapters 16–20.  
**Status:** Five expanded source files and synchronized website data are complete on review branch; release verification remains open.

## Content expansion
| Chapter | Title | Understanding Checks |
|---|---|---:|
| 16 | Local Control of Blood Flow | 12 |
| 17 | Neural and Hormonal Regulation | 12 |
| 18 | Cardiovascular Reflexes and Cushing Response | 12 |
| 19 | Gravity and Orthostatic Homeostasis | 12 |
| 20 | Circulatory Shock | 12 |

The series has 27 topic entries and 224 expandable check explanations in the synchronized data file: 157 across the first fifteen topics and 60 newly drafted explanations in Chapters 16–20, with 7 existing checks in as-yet-unexpanded Chapters 21–27.

## Checks performed
- PASS: Markdown articles written and tracked in GitHub for all five chapters.
- PASS: Website `content.js` includes the revised full HTML content for Chapters 16–20; all 27 chapter entries remain present.
- PASS: Exactly 12 <details> answer panels in each of the five chapters; opening/closing panel counts agree.
- PASS: Every `sections[]` entry for the five chapters resolves to an HTML heading ID.
- PASS: All five contain Chapter Essentials and source/scope sections.
- PASS: `build.py` input paths repaired to match root-level `CVS_TOPIC_MAP.csv` and `*.md` files.

## Pedagogy / scientific distinctions
- Local regulation: pressure versus demand stimuli; Laplace tension versus wall stress; finite autoregulatory range.
- Neural and hormonal regulation: arteriolar versus venous constriction, receptor distribution, reflex versus renal time scales.
- Reflexes: sinus versus carotid body, CN IX versus CN X, Cushing stimulus versus secondary baroreflex bradycardia.
- Gravity: venous pooling, baroreflex, muscle pump, orthostatic hypotension versus vasovagal syncope.
- Shock: DO2 and pressure-versus-perfusion distinction; high SVR masking low CO, acute haemoglobin concentration lag, types of shock.

## Release gates not verified
- The exact lecturer source PDFs have **not** been inspected page by page during this work; slide coverage and wording require a primary-source audit before the material should be presented as lecturer-complete.
- The `content.js` updates were synchronized through a lightweight formatter, not the normal Python `build.py` execution. A fresh build and byte-for-byte generated artifact consistency check remain pending.
- JavaScript engine syntax check, rendered mobile viewport check (320, 360, 390, 768px, desktop), tap/keyboard testing, production Vercel deployment and actual device testing are **not verified**.
- Chapter 16–20 articles are educational drafts, not clinically validated protocols.

## Release decision
**CONTENT DRAFT MILESTONE: ACHIEVED — 20/27 chapters drafted or previously content-reviewed (74.1%).**
**PUBLISHED/PRODUCTION-VERIFIED MILESTONE: NOT YET ACHIEVED.**

Do not silently treat passed structural checks as proof of lecturer coverage, effective learning outcomes or deployed mobile usability.

## Finalization attempt — 28 October 2026

- Retrieved and reviewed the original regulation and homeostasis PDFs, including relevant local control, systemic control, reflexes, gravity and shock slides.
- Committed lecture-specific additions to each of the five source Markdown files.
- Added `.github/workflows/milestone03.yml` to run the canonical build, structural checks, JS syntax checks, and Chromium responsive smoke checks at 320/360/390/768/1280 pixels.
- GitHub Actions returned zero workflow runs when checked, so those checks are not reported as passed.
- The generated content.js was last synchronized **before** these final additions, and therefore is not yet a canonical fresh build. Publication and merge remain gated until the workflow executes successfully or an equivalent verified local build is run.
