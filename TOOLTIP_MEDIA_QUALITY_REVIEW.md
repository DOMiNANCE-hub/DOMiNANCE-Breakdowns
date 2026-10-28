# DOMiNANCE Breakdowns — Tooltip and Media Quality Audit

## Tooltip review
The global glossary contains **28 term entries**, each intended as an instant clarification rather than a standalone lecture. Twenty entries were rewritten in this branch with clearer cause-and-effect wording, preservation of medical terminology, and shorter explanations. The remaining eight were retained after a plain-language review (their wording was already sufficiently concise for this use).

**Interface:** Tooltip triggers are keyboard-focusable buttons. In v2 the expanded state is exposed via `aria-expanded`; tooltip content remains text-only, so HTML from lecture content cannot execute inside tooltips. Escape and outside-pointer dismissal are already present. Browser tests should verify these actions on desktop/mobile.

**Editorial standard:** Explain what the term means in simple English. Include the crucial mechanism if omitting it would create confusion. No mandatory 'Why it matters' subdivision, no artificial rigid word limit and no filler.

## Embedded media inventory (source HTML)
| Topic | Asset type | Count | Assessment |
| --- | --- | ---: | --- |
| Introduction | heart and circulation diagrams | 2 | Useful anatomy/flow anchors; verify third-party licenses and that labels are readable on mobile |
| Cardiac muscle | structure, action potential, calcium coupling images; optional video | 4 | High teaching value; check small labels on phone, high-resolution zoom, and licensing |
| Conduction | pathway diagram, nodal comparison image; optional video | 3 | Strong mechanism relevance; journal-hosted MDPI PNG requires reuse-rights and URL stability review |
| Cardiac cycle | Wiggers diagram, GIF, optional video | 3 | GIF motion can distract or trigger vestibular sensitivity; default is click-to-play and reduced-motion block added |
| Heart sounds | auscultation figure, optional sound | 2 | Audio supports identifying S1/S2; ensure captions explain timing without sound |
| ECG | three placement/tracing diagrams | 3 | Relevant visual aids; test legibility and anatomical correctness on narrow devices |
| Other chapters | inline SVG and figures.js drawings | varies | Useful for specific mechanisms but require viewport-by-viewport label legibility review |

**Total external inline image files:** 12. **Optional media resources:** three YouTube videos, one GIF, one Wikimedia audio file. **Original SVG diagrams:** also exist in generated chapter HTML and `figures.js`, and should be checked for text contrast, accuracy and scaling.

## Changes implemented in quality v2
- Clarified glossary definitions and accessible expanded states.
- Added readable, compact Card Mode styling and keyboard navigation without changing default Continuous Reading.
- Added reduced-motion handling for on-demand GIF animation and accessible description for embedded video.
- Added CSS constraints for media, tables and long tooltip text on phones.

## Remaining external verifications
The code repository does **not** prove that external assets remain online or are licensed for use. Verify Wikimedia Commons file pages and the original MDPI image license before public promotion. Check YouTube availability/educational fit and audio content with live playback. Do not assume an existing media title proves scientific quality.

## Acceptance for production
Test keyboard, touch and screen readers; inspect every figure at 320/360/390 px and high text-scale; confirm video/audio fallback and reduced-motion; check source licensing; ensure no media auto-plays or creates unintended mobile data use. These are different from GitHub Actions syntactic checks.
