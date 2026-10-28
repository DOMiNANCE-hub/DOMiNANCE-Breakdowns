# DOMiNANCE Breakdowns — CVS review release

## Academic work completed in this revision

- Reviewed and inventoried all **277 slides** from six supplied PDFs, including the near-duplicate *Lecture 5 Homeostais in CVS* and *CIRCULATION 3 Homeostasis in CVS*. The page-by-page destinations and flags are in `SLIDE_BY_SLIDE_AUDIT.csv`.
- Strengthened all **27 teaching chapters** with source-specific explanations, corrected mechanisms and examples; **159 teaching subsections**, around **14,430 words** including the chapter headings and Q&A text.
- Flagged **48 high-impact slide-specific interpretations or corrections**, including the ejection sequence, Laplace equation, cerebral meninges, capillary pore units, venous pressure, the modern Starling model, coronary beta-1 physiology, raised intracranial pressure, blood loss and fetal haemoglobin.
- Included **11 independently authored educational figures and mechanism diagrams** in `figures.js`. Source lecture images have not been copied into the public project.
- Updated the reusable `content.js` from the edited Markdown chapters with `python build.py`.

## What this release DOES and DOES NOT mean

**Completed:** Slide inventory and topic mapping, main source-coverage analysis, educational explanation expansion, critical corrections and a functioning static website codebase prepared for deployment.

**Not represented as verified:** Pixel-level/rendered-site confirmation on mobile and desktop (browser navigation was blocked in the authoring environment); complete redrawing of every source diagram (77 figure-based pages were separately flagged and some images are simple illustrations); clinician-reviewed medical publishing; independently verified reproducibility of every lecturer reference value. The content is for learning, not individual care decisions.

## Content ownership and copyright

No full lecture PDFs or original third-party textbook figures are included in the repository bundle. `SLIDE_BY_SLIDE_AUDIT.csv` contains short slide headings and original review notes, not wholesale copied slide text. Keep institution-owned slides and any protected images outside a publicly distributed repository unless appropriately licensed.

## Fast publishing steps

1. Upload the **contents of this project folder** (not the ZIP wrapper folder) to a new GitHub repository.
2. Import the repository in Vercel. Choose a static site; the root contains `index.html`, so no frontend build command is needed.
3. Verify all topic pages, search, scroll navigation, reading-check reveals, the theme toggle and mobile layout on the deployed URL.
4. Recheck original figure labels against the lecture slides before calling the entire diagram collection exhaustive.

For editing, change `content/topics/<slug>.md` and run `python build.py` locally to regenerate `content.js` before committing.
