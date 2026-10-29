# OpenCode prompt — Batch 1.1 Figma alignment

Continue the existing HIMATKN frontend work on the current local branch. Do not restart or re-audit the whole project.

Before editing, read:
- `AGENTS.md`
- `progress.md`
- `HIMATKN_Public_Figma_Reference/README.md`
- `HIMATKN_Public_Figma_Reference/FIGMA_DESIGN_SPEC.md`
- `HIMATKN_Public_Figma_Reference/OPEN_CODE_ALIGNMENT_PROMPT.md` only if needed for this batch
- existing `HIMATKN_Public_Design_Reference/` and `HIMATKN_Admin_Panel_Design_Reference/` material as relevant

Visual sources of truth are the local desktop/mobile screenshots in `HIMATKN_Public_Figma_Reference/screenshots/` and alternate empty-state references in `HIMATKN_Public_Figma_Reference/states/`. Do not fetch or ingest the whole Figma document again. Inspect a specific Figma node only if a material detail is missing locally.

## Objective

Perform a focused **Batch 1.1 — Figma Alignment Pass** for the public homepage, keeping the current Next.js App Router + TypeScript + Tailwind v4 structure, existing API contract, and valid work from Batch 1.

Align the header and hero (including the original hero photo), palette/typography, About, Programs, Publications, Organization Structure, Join/contact, and footer with `FIGMA_DESIGN_SPEC.md`. Treat mobile as its own composition, not a scaled desktop layout. Reuse current components and assets before creating replacements.

### Important implementation requirements

- Inspect existing repository assets for the original hero photo/logo. Do not use the full-page screenshot or a crop of it as a production background asset. Do not reference temporary Figma asset URLs in production source. If the original photo or logo cannot be located/exported through the existing workflow, record a blocker and continue with work that can be completed safely.
- Keep data and design separate. Figma examples (including sample program names, lorem ipsum, dates, counts, and period text) are visual mock content, not approved live records.
- Do not read/render public program records until their public status/visibility policy has been confirmed.
- For publication data, use only the existing API. Preserve meaningful distinction among loading, valid empty response, and API/network failure. Handle blank or broken image URLs.
- Check every CTA/anchor against an actual section ID; do not add new route pages in this batch.
- Verify color contrast for normal text at WCAG AA (at least 4.5:1). Retain the designed palette, using accessible role-specific variants as needed.
- Avoid blanket global CSS changes. Scope public styles so the admin UI does not inherit public typography/colors inadvertently.
- Do not change backend FastAPI, database/schema/migrations, API contracts, auth/security backend, CORS/cookie security, rate limiting/Redis, environment secrets, or deployment.
- Do not commit, push, merge, rebase, reset, or deploy.

## Validation

Run these from `frontend/` and record actual outcomes:
- `npm run lint`
- `npm run build`
- `git diff --check`

Use screenshots or browser inspection at 360, 390, 768, and 1280 px. Capture the revised homepage at desktop/mobile widths and compare it with local Figma references. Check admin visual regressions after login if the local environment permits; otherwise clearly state that authentication prevented this check. Do not claim checks passed unless the commands ran and passed.

Update `progress.md` with a dated Batch 1.1 entry (scope, files, validation, blockers, residual risks, next steps). Stop after this alignment pass; do not start Batch 2.

## Final report

Summarize the visual differences corrected, changed/new files, exact lint/build/diff-check results, screenshot paths, asset/content blockers, admin-regression status, and remaining risks. Keep all changes local for review.
