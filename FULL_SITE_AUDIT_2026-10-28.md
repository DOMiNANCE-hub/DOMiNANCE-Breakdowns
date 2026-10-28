# DOMiNANCE Breakdowns — Whole-Site Release Audit

**Audit date:** 28 October 2026  
**Scope:** All 27 Cardiovascular Physiology topic files, generated site bundle, release assumptions and mobile quality gates.  
**Status:** IN PROGRESS — **not** yet production-certified.

## Confirmed inventory from the main branch

- 27 chapter Markdown sources and 27 corresponding topic records in `content.js`.
- **301** expandable Understanding Check panels in the generated bundle (not 324).
- Chapters 1–8 have **5, 7, 7, 9, 10, 12, 12, 11** respectively. Chapters 9–27 have **12 each**.
- No unresolved inline `data-term` references were found using a preliminary glossary string cross-check.
- The generated chapter HTML contains 12 `img` elements and 9 inline `svg` elements across the entire 27-topic bundle. Final chapters 21–27 contain no in-article images/SVG.
- Chapters 21–27 are roughly **614–982 words each** before this audit's corrections, compared with several earlier major chapters above 2,000 words. Length alone does not determine quality, but this is an important coverage risk.

## Release-blocking findings

### AUD-001 — Incomplete pedagogical consistency (High)
**Evidence:** Chapters 1–8 do not all follow the established 12-check standard. Total checks 301, whereas 12 per chapter would be 324.

**Action:** Examine assessment coverage, not merely add filler. Extend only where recall/application/clinical reasoning remains underassessed, with balanced conceptual difficulty. Do not report a uniformly 12-question design until actually achieved.

### AUD-002 — Orphaned historical questions in final seven (High, corrected in audit branch)
**Evidence:** A previous content-replacement step removed the answer panels attached to legacy `**Check:**` prompts in Chapters 21–27 while leaving the questions in place. The automatic count check only verified 12 new panels, not completeness of all prompts.

**Action:** Restore explicit explanatory prose in the seven sites where a bare prompt remained; committed on this audit branch. Regenerate canonical website bundle and test.

### AUD-003 — Final-seven content depth and teaching visuals (High)
**Evidence:** Major physiological subjects (cerebral circulation and CSF, coronary perfusion, West zones, fetal shunts) currently have notably shorter teaching articles and no in-article visuals in Chapters 21–27.

**Action:** Audit each source slide, chapter mechanism and clinically important exception. Add compact, medically accurate original teaching diagrams where a diagram materially improves comprehension. Avoid padded prose and giant decorative figures.

### AUD-004 — Automated browser smoke tests are not complete interaction tests (High)
**Evidence:** Existing release workflows check JavaScript parsing, catalog presence, absence of page errors and page-wide overflow at 320/360/390/768/1280 px. These checks do not prove that topic opening, breadcrumbs, subnav, answer reveal, theme, search, keyboard control or deep links all work.

**Action:** Add actual click/key/tap assertions, check multiple representative chapters and browsers, and test a real Android/iPhone device before production certification.

### AUD-005 — Live deployment and device checks unverified (High)
**Evidence:** Merge and GitHub Actions results do not establish which commit Vercel is serving or whether phone-specific browser behavior is correct.

**Action:** Verify live deployment SHA, mobile networking/loading and direct route behavior. Do not claim production readiness prematurely.

## Additional quality checks required

- Review `ACADEMIC_QA.md` flags across all 27 chapters and map to exact source slides, including Laplace, Starling, QTc, coronary beta-1, Cushing, Hb/Hct and meningeal spaces.
- Validate all media filenames, image attribution and permitted publication rights.
- Audit semantic headings, captions, alt text, mobile table overflow, keyboard focus and reduced-motion behavior.
- Review science and pedagogy of every check explanation; identical counts are not evidence of good distractors or transfer of learning.
- Regenerate `content.js` exclusively via `python build.py`, check structural references and rerun all CI tests.

## Release decision

**NO-GO for claiming fully production-audited DOMiNANCE Breakdowns at this checkpoint.** Main remains intact. The seven orphaned prompts are corrected in a separate branch, but a comprehensive pedagogical and deployment verification is still necessary.

This document distinguishes findings directly measured in the repo from checks not yet executed; no unverifiable test is marked passed.
