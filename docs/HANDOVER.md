# DOMiNANCE Breakdowns — handover for a new chat

Paste this whole note (or point the new chat at `docs/HANDOVER.md` in the repo) at the start of a fresh conversation.

## The project in one paragraph
DOMiNANCE Breakdowns (https://dominance-breakdowns.vercel.app) teaches cardiovascular physiology to KNUST preclinical students: 27 chapters, all rewritten, approved and live. Repo: GitHub `DOMiNANCE-hub/DOMiNANCE-Breakdowns`, deployed by Vercel (project `dominance-breakdowns`, team slug `graceledsystems-9619s-projects`). Claude's role: independent educational reviewer and active editor (see the project description). The owner makes final decisions.

## Standing rules (always)
- **Never merge or deploy without the owner's explicit "A and m"** (approve and merge). Work on a branch → tests → PR → Vercel preview → report → wait.
- Approved explanations are preserved word for word in the **master manuscript** (Claude Doc `NzPgCt1U43UJd2TahBHbzm`, https://claude.ai/artifact/NzPgCt1U43UJd2TahBHbzm). Any approved change to chapter text is made in both the chapter `.md` and the manuscript. No silent rewriting.
- **MCQ standard:** every option plausible and highly distracting, all of comparable length; the right answer never stands out (not the longest, no stem words echoed only in it, no clues in brackets, no "always/never/all of the above"); answers spread evenly over A–D.
- Plain, clear English; British spelling; every section must stand alone for students who jump straight to it.
- Reading experience must stay smooth, simple and premium on phones and desktop: no clutter, no internal notes visible to students, no text under 12px.
- Commits end with the attribution lines the session reminder gives; PR bodies end with the Claude Code line.

## How the site is built
- Chapter sources: `<slug>.md` in the repo root → `python3 build.py` → `content/` (hashed files), `content.js` (full bundle for tests only), `index.html`, `stats.html`, `sw.js`. Always run `python3 build.py` and commit its output.
- Tests (all must pass before a PR): `node tests/browser_smoke.js`, `node tests/perf_budget.js`, `node tests/api_test.js`, `python3 audit_quality.py`, `python3 -m unittest discover -s tests`. Playwright is preinstalled.
- Merge: `gh api -X PUT repos/DOMiNANCE-hub/DOMiNANCE-Breakdowns/pulls/<n>/merge -f merge_method=squash` (only after "A and m").

## Features already built
- Reading layer: Understanding Checks open in their own sheet on phones; explanations appear only after answering; videos open full screen on phones; compact video cards; tooltips on first use per section (not where the term is defined).
- **Lecture tests** (`lecture-tests/<lecture>.md` → test page `#/physiology/cvs/lecture/<lecture>/test`): Mark as you go / Submit at the end, Full or Quick 20, results by chapter, review, retry missed, resume, best score on the lecture page and at the end of the lecture's last chapter. **Live: Circulation 2 (60 questions).**
- **LAMLA (last-minute mode)** (`lamla/<lecture>.md` → `#/lamla`): pick time (30 min / 1 h / 2 h) and lecture → each chapter's Understanding Checks first → must-know points (★) and sheet parts → mistakes, night-before list, lecture test. **Live: Circulation 2.**
- Feedback + anonymous usage → Upstash Redis (connected). Private dashboard: `stats.html` (the owner has the bookmarked link with the key; the key is the Vercel env var `STATS_KEY`).

## What remains
1. **Lecture tests + LAMLA sheets for the other 4 lectures**: `circulation-1` (13 chapters), `circulation-3` (also covers Lecture 5), `lecture-6` (regional circulation), `lecture-7` (ECG). The owner gets drafts from ChatGPT using the briefs below, then sends them to Claude one lecture at a time.
2. **Videos for Chapters 7–10** (Cardiac Output, Measuring Cardiac Output, Haemodynamics, Blood Pressure): 1–2 per chapter, exact title, channel, link; place beside the concept; build turns the media block into a video card automatically.

## Recipe: adding a lecture's test and LAMLA sheet
1. Branch from `main`.
2. Test: save ChatGPT's file as `lecture-tests/<lecture-slug>.md` with this header, then the `### Q…` blocks:
   ```
   # Lecture test — <lecture name>

   Lecture: <PDF file name>
   Lecture slug: <lecture-slug>
   Chapters: <chapter-slug>, <chapter-slug>, …   (in teaching order; the last one shows the test card at its end)
   Status: …
   ```
   Run `python3 tools/check_lecture_test.py lecture-tests/<slug>.md` (structure, answer spread, length and wording giveaways, thin explanations). Then review every question against the approved chapters: fix facts, remove repeats (of each other and of the chapters' own Understanding Checks), fix giveaways, make explanations student-facing (no "approved notes"/"slides"), confirm every teaching slide is covered (`SLIDE_BY_SLIDE_AUDIT.csv`).
3. LAMLA: save the sheet as `lamla/<lecture-slug>.md` with the same `Lecture slug:` and `Chapters:` lines at the top, chapter headings `## Chapter N — <exact chapter title>`, and sections `### Must-know` (lines `- ★ …` for highest yield), `### Numbers to know`, `### Core chains`, `### Don't confuse`, `### Exam traps`. Check every line against the chapters (nothing beyond them, numbers consistent). Move ChatGPT's "CHECK:" notes into an `Editor notes` header line (not shown to students).
4. `python3 build.py`, run all tests, commit, PR, preview, report — then wait for "A and m".

## Briefs for ChatGPT (paste with the lecture PDF and that lecture's approved chapters)

### 1. Lecture test
```
Write a comprehensive lecture test for DOMiNANCE Breakdowns (KNUST cardiovascular physiology, preclinical medical students).

LECTURE: [name of lecture document]
CHAPTERS IT COVERS: [list chapters]
Use the attached lecture slides and our approved chapter notes as the only source of truth for scope and facts.

COVERAGE
- Cover every examinable point in the lecture. No question cap: write as many as needed to test the lecture fully, but no padding and no two questions testing the same point the same way.
- Prefer "why", "how", "what happens if…", applied/clinical scenarios, and interpreting graphs or ECG/pressure tracings over plain recall. Include recall only for facts students must know.
- Do not copy the chapter's existing Understanding Check questions.

QUALITY RULES (strict)
- Single best answer, exactly 4 options (A–D).
- All options must be plausible, highly distracting, and of the same or comparable length. The correct answer must never be the longest or the most detailed.
- No clues in brackets, no "always/never/all of the above/none of the above", no wording in the stem that is repeated only in the correct option, no grammatical mismatches that expose the answer.
- Each wrong option should reflect a real misconception students have.
- Spread correct answers evenly across A, B, C and D with no pattern.
- Plain, clear English; precise physiology.

EXPLANATIONS (detailed but not long)
- 1–3 sentences on why the correct answer is right: the mechanism, not just the fact.
- One short line for each wrong option explaining exactly why it is wrong.

FORMAT (use exactly this for every question)
### Q[number]
Chapter: [chapter name]
Section: [section number and title in that chapter]
Type: recall | mechanism | application | data-interpretation
Stem: [question]
A. [option]
B. [option]
C. [option]
D. [option]
Answer: [letter]
Why: [why the correct answer is right]
Not A: [why A is wrong]   (omit the line for the correct letter)
Not B: …
Not C: …
Not D: …
Slides: [slide numbers this question covers]
```

### 2. LAMLA High-yield sheet
```
Write LAMLA (last-minute mode) High-yield sheets for DOMiNANCE Breakdowns (KNUST cardiovascular physiology, preclinical medical students).

LECTURE: [name of lecture document]
CHAPTERS: [list the chapters in this lecture]
Use the attached lecture slides and our approved chapter notes as the only source of truth for scope and facts.

WHO IT IS FOR
A student with an exam soon who has NOT read the chapters. Every line must make sense on its own, with no "see above", no "each has a mechanism", no hinting. If something matters, state it fully.

WRITE ONE SHEET PER CHAPTER, IN EXACTLY THIS FORMAT

## [Chapter name]

### Must-know
- [One complete fact + its reason, in one line, ideally under 25 words. Use "because" or "→" to show cause and effect.]
- … (as many as the chapter genuinely needs to cover everything examinable; no padding, no repeats)
Mark the 3–5 most important lines with ★ at the start.

### Numbers to know
| Value | Number | Why it matters |
|---|---|---|
(Only numbers the lecture uses or that are routinely examined. Use the same values as our chapters.)

### Core chains
1. [Name of process]: [step] → [step] → [step] → [outcome]
(The 2–4 cause-and-effect sequences the chapter is really about, written out in full.)

### Don't confuse
| | [Thing A] | [Thing B] |
|---|---|---|
(Classic mix-ups students make, side by side.)

### Exam traps
- Trap: [the common wrong belief] → Truth: [the correct idea, with the reason]

RULES
- Plain, clear English; precise physiology; British spelling (oedema, haemorrhage).
- Never contradict our chapters. If the slides and chapters differ, follow the chapters and add a line at the end: "CHECK: [what differs]".
- Bold only the key term in each line, nothing else.

ALSO, AT THE END
Read the "Chapter Essentials" list of each chapter and list any line that only hints instead of stating the knowledge. For each one write:
- Chapter: … | Current line: "…" | Suggested replacement: "…"
```
(Claude accepts only the Essentials suggestions that genuinely add the missing how/why, and applies accepted ones to both the chapter and the master manuscript.)
