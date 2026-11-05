# DOMiNANCE Breakdowns — Cardiovascular Physiology

A bright, premium, lightweight reading site with **27 slide-audited CVS topics**, responsive cards, topic switching, search, saved reviewed status, section navigation and light/dark mode.

**This is a content-expanded educational beta, not a literal reproduction of the source PDFs.** The 277-slide mapping and corrections are documented in `SLIDE_COVERAGE_REVIEW.md`; figure-by-figure equivalence and actual browser rendering still require pre-release visual verification.

## Launch
Open `index.html` in a browser. No install or network required except optional Google Fonts, which fall back to system fonts. To test over HTTP: `python -m http.server 8000` and open `http://localhost:8000`.

## Edit a topic
Each chapter is a Markdown file in the repository root (`<slug>.md`, listed in order in `CVS_TOPIC_MAP.csv`). After editing, regenerate `content.js` with `python build.py` (install the pinned build dependency once with `pip install -r requirements.txt`) and commit both files. The website itself is static and has no runtime dependencies.

## Automated checks
Every pull request and every push to `main` runs `.github/workflows/ci.yml` on GitHub. No local setup is needed. It:
- rebuilds `content.js` and fails if the committed file is out of date;
- runs `audit_quality.py` (markup nesting, Understanding Check completeness, anchors, alt text, figure credits, student-facing wording, and the regression guards in `tests/content_guards.json`) and its self-tests in `tests/test_audit_quality.py`;
- syntax-checks every script;
- runs `tests/browser_smoke.js` in Chromium: all 27 chapters at 320, 360, 390, 768 and 1280 px plus phone emulation, reading modes, equations, lecture pages, search, theme, reviewed status, glossary, media players, the figure viewer, and blocked or corrupted browser storage.

The workflow only reads the repository; it never commits or deploys.

## Deploy
Create a GitHub repo containing these files. Import it into Vercel as a static site with output directory root, no build command required (or use `python build.py` locally before pushing).

## Content coverage & accuracy
- `CVS_TOPIC_MAP.csv`: each topic's lecture file and slide page mapping.
- `ACADEMIC_QA.md`: important errors, ambiguities and corrections.
- `SLIDE_BY_SLIDE_AUDIT.csv`: 277 entries documenting slide titles, topic destinations and correction flags.
- `SLIDE_COVERAGE_REVIEW.md`: the slide-review summary with 48 high-impact interpretation/correction notes.
- `REVIEW_RELEASE_NOTES.md`: what was completed, what remains unverified, and publishing steps.
- `CLAUDE_HANDOFF.md`: one-shot handoff prompt for content expansion and testing.

## Branding
The text wordmark is a placeholder until the approved DOMiNANCE asset is available. Do not replace the gold lowercase i with an emoji or an invented Caduceus.
