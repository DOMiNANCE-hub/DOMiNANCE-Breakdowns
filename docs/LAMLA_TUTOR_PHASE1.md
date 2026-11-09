# LAMLA AI Tutor — Phase 1 (Reasoning Coach)

## Why this exists
The existing LAMLA AI endpoint only proposes chapter order. Learning, quiz selection and marking use the same pre-reviewed local content with or without AI. This phase makes the difference visible and meaningful **without weakening the offline experience**.

When the student answers an approved MCQ, a new optional panel asks them to explain their reasoning. With AI configured, the model assesses their explanation against the **reviewed MCQ answer and explanation**, identifies a reasoning gap, and asks one targeted follow-up question. When the API is offline, disabled, or over its limit, the reviewed explanation remains on screen.

## What this is not
This phase does not yet provide a full adaptive teaching conversation, durable cross-device mastery tracking, or an independently verified model-generated question bank. Student answers are formative; the model can misinterpret reasoning and never overrides the reviewed answer.

## Configuration: Vercel
The existing Vercel deployment has Redis integration environment-variable names but no AI key was found at implementation time.

Configure privately in the Vercel dashboard for a preview environment:
- `OPENAI_API_KEY` — a provider key; never put it in the browser or repository
- `LAMLA_COACH_ENABLED=true` — explicit opt-in; **off by default**
- `KV_REST_API_URL` and `KV_REST_API_TOKEN` — Redis REST integration for per-IP daily throttling
- Optional `LAMLA_AI_MODEL` — defaults to `gpt-6-luna`

Set a restrictive provider-side billing cap and review logs before enabling production. The Redis guard allows up to 25 coaching requests per inferred IP/day (subject to shared networks); it is not a cost guarantee.

## Configuration: Cloudflare Pages
Bind Workers AI as `AI`. Bind a KV namespace as `LAMLA_COACH_LIMITS`. Set `LAMLA_COACH_ENABLED=true` explicitly. The default Workers AI model is `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, which supports structured JSON responses. The KV guard is **best-effort**, not atomic under concurrent requests. Pair it with Cloudflare-level rate limiting and an account usage cap before public rollout.

## User privacy and scope
AI coaching is opt-in per answer. It sends the question stem, four options, reviewed answer and explanation, chapter identifier, and the student's typed reasoning. It does **not** automatically attach a name, student ID, or entire study history; avoid typing personal details into free-text answers. The page tells students this before submission. Avoid putting sensitive personal information into the reasoning field.

## Tests and release
- `node tests/lamla_coach_test.mjs` — Cloudflare handler diagnostics, input bounds, limits and AI failures
- `node tests/browser_smoke.js` — UI reasoning panel and mocked AI feedback on phone/desktop
- `node tests/perf_budget.js` — preserve homepage performance
- After preview deploy, test `GET /api/lamla-coach`. An active provider returns `{"available":true,"mode":"ai-ready"}`; otherwise it explicitly returns built-in mode.
- Do not merge into production until CI is green and the hosting binding, cost limits, error handling, and academic feedback have been reviewed.

## Phase 2 — implemented in this draft
- `lamla-mastery.js` is lazy-loaded on LAMLA and lecture-test routes. A `dom:answer` result records the reviewed question, section, chapter, score history, and next review date in browser localStorage.
- LAMLA setup now shows a visible learning map, due/weak objectives, and a focused-practice launch button. The practice dynamically loads the approved lecture question files and selects questions from weak or overdue areas, with broad coverage for initial diagnosis.
- The tutor offers a second written turn: students can answer the AI's follow-up question and receive another assessment based on the reviewed explanation. This is formative; it is not a validated mastery score.
- Finishing a LAMLA session displays next recommended revision priorities.
- Browser coverage now includes retention across navigation, targeted retrieval, grounded explanations and the second AI exchange.

## Phase 3 — guided concept tutor (implemented in this draft)
- In accelerated learning, students can choose one statement from the approved lecture essentials and request a clear AI explanation.
- The model returns an understanding-check question, accepts a written answer, and provides corrective feedback grounded in those same approved statements.
- `functions/api/lamla-lesson.js` and `api/lamla-lesson.js` provide Cloudflare/Vercel counterparts. A Vercel AI chapter planner has also been added so connected and built-in routing behave consistently across hosts.
- The AI endpoints share the same conservative 25-request daily IP quota per host and remain disabled by default. An account-level spending cap is still required.
- The Vercel default model is `gpt-6-luna` because legacy GPT-4o Mini is deprecated; override with `LAMLA_AI_MODEL` only after checking compatibility. All model-generated explanations remain formative, not canonical sources.
- Tests include the Cloudflare lesson mock, the Vercel planner mock, and a phone/desktop guided teaching browser workflow.

## Still not implemented
- Cross-device or account-linked learning profiles; localStorage is device-local and may be cleared.
- Fully autonomous multi-chapter navigation and a formal pedagogical policy; the guided lesson interaction itself is implemented.
- Cost-safe authentication and classroom-scale AI quotas; current rate guards are conservative pre-launch controls, not guaranteed billing caps.
- Real-model end-to-end testing on both Vercel and Cloudflare. Services are intentionally disabled until credentials, usage caps and deployment bindings are verified.
- Curriculum-wide independent academic audit of every AI-generated feedback example.

## Next phase
Introduce a persistent authenticated learner profile, prerequisite-aware lesson routing and robust provider-level budget controls after preview evaluation. Do not assume that a successful mocked test establishes real AI availability.
