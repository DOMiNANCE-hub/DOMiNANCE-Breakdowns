# DOMiNANCE Breakdowns — Cardiovascular Physiology

A bright, premium, lightweight reading site with **27 slide-audited CVS topics**, responsive cards, topic switching, search, saved reviewed status, section navigation and light/dark mode.

**This is a content-expanded educational beta, not a literal reproduction of the source PDFs.** The 277-slide mapping and corrections are documented in `docs/SLIDE_COVERAGE_REVIEW.md`; figure-by-figure equivalence and actual browser rendering still require pre-release visual verification. The Chapter 5 auscultation illustration was removed from the Chapters 2–6 review branch after a suspected left–right tricuspid marker error; it must not be restored without verifying its anatomical orientation.

## Launch
Open `index.html` in a browser. No install or network required except optional Google Fonts, which fall back to system fonts. To test over HTTP: `python -m http.server 8000` and open `http://localhost:8000`.

## Edit a topic
Edit `<slug>.md` in the repository root and run `python build.py` (Python package `mistune` used only at build time). This regenerates `content.js`. The website itself is static and has no runtime dependencies.

## Deploy
Create a GitHub repo containing these files. Import it into Vercel as a static site with output directory root, no build command required (or use `python build.py` locally before pushing).

## Content coverage & accuracy
- `docs/CVS_TOPIC_MAP.csv`: each topic's lecture file and slide page mapping.
- `docs/ACADEMIC_QA.md`: important errors, ambiguities and corrections.
- `docs/SLIDE_BY_SLIDE_AUDIT.csv`: 277 entries documenting slide titles, topic destinations and correction flags.
- `docs/SLIDE_COVERAGE_REVIEW.md`: the slide-review summary with 48 high-impact interpretation/correction notes.
- `docs/REVIEW_RELEASE_NOTES.md`: what was completed, what remains unverified, and publishing steps.
- `docs/CLAUDE_HANDOFF.md`: one-shot handoff prompt for content expansion and testing.

## Branding
The text wordmark is a placeholder until the approved DOMiNANCE asset is available. Do not replace the gold lowercase i with an emoji or an invented Caduceus.
