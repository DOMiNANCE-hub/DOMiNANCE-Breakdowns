# CVS Chapters 2–6 — figure and release QA register

This register distinguishes **source/markup checks** from **scientific visual verification**. A valid URL, alt text or attribution does not establish anatomical accuracy.

## Figure inventory (review branch)

| Chapter | Figure ID | Subject | Source/markup inventory | Scientific visual verification |
|---|---|---|---|---|
| 2 | cvs02-figure-01 | Cardiac muscle and intercalated discs | Figure, alt and credit present | Pending visual comparison with authoritative anatomy |
| 2 | cvs02-figure-02 | Action potential, refractory period and contraction | Figure, alt and credit present | Pending timing/curve comparison |
| 2 | cvs02-figure-03 | Calcium cycling and excitation–contraction coupling | Figure, alt and credit present | Pending channel, flux direction and label verification |
| 3 | cvs03-figure-01 | Conducting system | Figure, alt and credit present | Pending anatomy and pathway verification; avoid implying insulated internodal tracts |
| 3 | cvs03-figure-02 | Nodal versus ventricular action potentials | Figure, alt and credit present | Pending ionic phase and graph-label verification |
| 4 | cvs04-wiggers | Wiggers diagram | Figure, alt and credit present | Pending valve timing, pressure, ECG and volume alignment |
| 5 | cvs05-auscultation | Five cardiac auscultation areas including Erb's point | OpenRN/LibreTexts CC BY 4.0 figure now referenced in chapter and generated website content, with attribution | Confirm source image renders, includes all five labelled sites, and has correct patient-side orientation |
| 6 | ecg-einthoven | Einthoven triangle | Figure, alt and credit present | Pending limb lead polarity and orientation verification |
| 6 | ecg-precordial | Precordial electrode placement | Figure, alt and credit present | Pending V1–V6 surface landmark verification |
| 6 | ecg-normal-wave | ECG waves and intervals | Figure, alt and credit present | Pending wave/segment/interval label verification |

## Checks completed from chapter sources

- All ten figures have a source URL, descriptive alt text and attribution in their source markup.
- Each of Chapters 2–6 contains 12 explanation-reveal checks in its Markdown source.
- No unclosed `<figure>` tags were found in these five chapter files.
- The disputed Chapter 5 figure was replaced with an openly licensed five-site diagram in both `heart-sounds.md` and `content.js`; browser rendering remains unverified.
- These are **structural checks only**, not a claim that every figure is scientifically correct.

## Required release gates

1. Compare each diagram visually with a reliable clinical/anatomical or physiological reference; record orientation, labels, directions and any exceptions.
2. Verify equations, worked examples, physiological values and all Understanding Check answers.
3. Where a verified lecture-slide statement differs from accepted physiology, teach the accurate mechanism in the main narrative and include a brief, explicitly sourced lecture-specific note only where necessary.
4. Run `python build.py` from the root and compare generated `content.js` to the committed output; avoid relying on manual generated-file patches.
5. Test on a real narrow mobile viewport: equation wrapping, image sizing, captions, disclosure controls and navigation.
6. Confirm that any third-party image credit and reuse conditions remain accurate.
7. Only then mark Chapters 2–6 approved for merging. Apply the same release gates to the remaining chapters.

**Status:** Source-level structural audit completed; visual, clinical and browser verification remain open. Do not label the project fully validated.
