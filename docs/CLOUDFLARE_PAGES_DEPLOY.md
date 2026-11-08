# Cloudflare Pages deployment — DOMiNANCE Breakdowns

This is an **alternative hosting route for the existing Breakdowns site**, not the separate CVS Exam Preparation question-bank platform. It allows a release while Vercel's deployment quota is temporarily exhausted.

## Fast deployment (no Vercel access required)

1. Sign in to **Cloudflare Dashboard → Workers & Pages → Create application → Pages → Import an existing Git repository**.
2. Connect GitHub and authorize `DOMiNANCE-hub/DOMiNANCE-Breakdowns` (organization approval may be required).
3. Configure **Framework preset: None**, **Root directory: repository root (leave blank)**, **Build command: `node tools/cloudflare_export.mjs`**, **Build output directory: `dist`**. No build environment variables, framework, database, or package installation are required for the static frontend.
4. **Production branch:** To test this unmerged release branch immediately, select `deploy-cloudflare-pages`. After merging this PR to main, change the Cloudflare Pages production branch to `main` in **Settings → Builds → Branch control**. Alternatively, merge the PR first and select `main` from the beginning.
5. Deploy and open the `*.pages.dev` URL assigned by Cloudflare. Do not replace the old Vercel link until the site has been tested.

## What gets published

The export script copies the current prebuilt HTML/JS/CSS, all compiled chapter + lecture-test + LAMLA bundles from `content/`, and licensed teaching assets from `assets/`. It refuses to publish if any of the five expected lecture-test bundles are missing.

It **does not expose** the `api/` server source, raw Markdown teaching drafts, repository notes, tests, or GitHub files through Cloudflare's static assets. Cloudflare's Functions are bundled separately from `functions/`, not copied into `dist/`.

## Feedback and owner statistics

The original Breakdowns site uses Vercel's `/api/collect` and `/api/stats` endpoints backed by Upstash Redis. Those API files are not portable directly into Cloudflare's Workers runtime.

The new **Pages Functions** `functions/api/collect.js` and `functions/api/stats.js` act as narrow HTTPS bridges to the **existing production Vercel endpoints**. The private stats key is forwarded only to the fixed upstream `/api/stats` endpoint; it is never written into the frontend build or stored in Cloudflare. Both routes return an unavailable response if the old backend cannot be reached. The teaching site itself still loads.

**Important:** Feedback and analytics depend on the old Vercel backend remaining online. If that backend is unavailable, the chapter content, quizzes, interactive diagrams and offline reading remain usable, but feedback collection and the owner's dashboard may not work. Full backend independence would require a future Cloudflare-native API migration and separately configured Upstash secrets.

Cloudflare Functions are restricted to `/api/*` via `dist/_routes.json`, preserving static delivery of chapter and image files.

## Release verification checklist

- [ ] The Cloudflare deployment shows **Success** and its source commit equals the intended `main` SHA (`ab6bdcf954eed2a9b34e11277b3ecaea8a294207`) or this branch's tested descendant.
- [ ] The root `index.html` loads with correct CSS and navigation.
- [ ] Open the 27 chapters, test direct hash links, section navigation, search and Understanding Check answer reveals.
- [ ] Open all five full lecture tests, submit answers and restart an attempt.
- [ ] Test LAMLA, equations and diagrams at 320–390 px and desktop.
- [ ] Test offline chapter saving, service-worker updates, dark mode and font fallbacks.
- [ ] Test a voluntary feedback submission; check `/api/collect` responses. Test private owner dashboard only with the actual key, never publish the key.
- [ ] Test on at least one real Android and one real iPhone if available. GitHub CI's Chromium tests alone cannot certify Safari or all touch interactions.
- [ ] Release by sharing the verified Cloudflare `pages.dev` URL. Keep the current Vercel URL as a fallback until its quota recovers.

## Guardrails

- Do not merge PR #80 here; its mock exams belong in a separate project.
- GitHub CI checks the normal app plus the release export. A passed CI check is **not** proof that the Cloudflare URL is deployed or its backend works.
- The site's `#/physiology/cvs/...` navigation is hash-based and is compatible with Cloudflare's root-level domain; no GitHub Pages subdirectory rewrite is required.
