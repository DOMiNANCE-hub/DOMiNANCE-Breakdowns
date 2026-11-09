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
- Optional `LAMLA_AI_MODEL` — defaults to `gpt-4o-mini`

Set a restrictive provider-side billing cap and review logs before enabling production. The Redis guard allows up to 25 coaching requests per inferred IP/day (subject to shared networks); it is not a cost guarantee.

## Configuration: Cloudflare Pages
Bind Workers AI as `AI`. Bind a KV namespace as `LAMLA_COACH_LIMITS`. Set `LAMLA_COACH_ENABLED=true` explicitly. The KV guard is **best-effort**, not atomic under concurrent requests. Pair it with Cloudflare-level rate limiting and an account usage cap before public rollout.

## User privacy and scope
AI coaching is opt-in per answer. It sends the question stem, four options, reviewed answer and explanation, chapter identifier, and the student's typed reasoning. It does **not** send a name, student ID, or entire study history. The page tells students this before submission. Avoid putting sensitive personal information into the reasoning field.

## Tests and release
- `node tests/lamla_coach_test.mjs` — Cloudflare handler diagnostics, input bounds, limits and AI failures
- `node tests/browser_smoke.js` — UI reasoning panel and mocked AI feedback on phone/desktop
- `node tests/perf_budget.js` — preserve homepage performance
- After preview deploy, test `GET /api/lamla-coach`. An active provider returns `{"available":true,"mode":"ai-ready"}`; otherwise it explicitly returns built-in mode.
- Do not merge into production until CI is green and the hosting binding, cost limits, error handling, and academic feedback have been reviewed.

## Next phase
Move from per-question AI commentary to a structured teaching dialogue, track mastery per learning objective, and use prior misses to choose remediation and spaced practice. Build from approved content; do not ask the model to manufacture the canonical exam bank.
