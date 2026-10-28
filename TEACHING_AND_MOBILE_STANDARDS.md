# DOMiNANCE Breakdowns — Teaching and Mobile Standards

Applies to **every chapter** in the CVS series and to future preclinical modules.

## Content quality

- Explain **what happens, why it happens, what triggers the next event**, and what changes if the mechanism is disrupted.
- Follow the lecturer's scope, explicitly marking supplementary explanations and any discrepancies with standard physiology.
- Preserve understanding: remove repetition and decorative spacing, never essential reasoning.
- Use compact visual forms only where they increase comprehension: pressure relationships, pathway steps, small comparison tables, equations with units, source-credited anatomical figures and animations.
- Do not repeat entire tables verbatim in adjacent prose.
- Keep Understanding Check answers hidden until requested; put ~8–12 numbered Chapter Essentials at the end.

## Mathematical presentation

- Use legible notation for subscripts and fractions; prefer native MathML for compound equations to avoid extra network dependencies.
- Include defined symbols and units; examples should show substitution and a final answer.
- Equations should not create a full-width oversized card when a compact line suffices.

## Mobile performance and layout

- Test **320px, 360px, 390px**, **768px** and desktop widths; support portrait and landscape.
- No sideways scrolling of the full page. Tables may scroll *within themselves*, with legible headers.
- Avoid oversized paragraphs, headings, empty gaps and unnecessarily stacked large cards.
- Buttons and controls should be touch-friendly; tooltips must also work by tap and keyboard.
- Detail-rich images may open at full resolution; keep in-page figures constrained to the viewport.
- **No autoplay.** Lazy-load images and only load video, audio or large animations on explicit user action.
- Provide complete text explanations so media is never a prerequisite; caption all figures and retain licences.
- Use no expensive animation or third-party JS frameworks for ordinary teaching blocks.

## Release checks

- Verify both a chapter's root Markdown file and its matching HTML / section index in `content.js`.
- Check glossary definitions for every inline `data-term`, and confirm referenced media filenames and rights.
- Ensure scripts parse, accordion answers match the chapter, figures have source credits and navigation anchors are valid.
- **Browser test** at listed viewport sizes, including tap-to-expand, section navigation and media controls, before claiming a release is visually verified.
- GitHub structural checks are not a substitute for Vercel production or live browser testing.

## Publication workflow

Draft the next chapter using lecture content, revise for accuracy and clarity, agree final content, then publish to the `DOMiNANCE-Breakdowns` repository. Never publish unreviewed chapter prose simply to increase the completion count.
