# HIMATKN Public Website — Figma Design Specification

**Scope:** public-facing website only. The admin UI has its own existing design reference and must not inherit the public site's visual system accidentally.

**Source of truth:** the desktop/mobile screenshots in `screenshots/` and the Figma frames listed in `README.md`. When a detail cannot be determined from these local materials, inspect only the specific Figma node needed; do not ingest the entire Figma file again.

## Design character

Editorial, institutional, calm, and restrained. Deep forest green, warm off-white/cream, muted gold, thin borders, compact radius, generous spacing, and clear typography hierarchy. Avoid neon colors, generic SaaS gradients, excessive rounding, heavy drop shadows, or an overly card-based UI.

## Color tokens sampled from Figma

| Token / role | Value |
|---|---|
| Main page / light surface | `#f6f4ec` |
| Main deep-green section | `#0e2018` |
| Alternate deep-green surface | `#06261b` |
| Gold accent / button | `#c79a3e` |
| Brighter gold on dark surfaces | `#e4be66` |
| Text on dark surfaces | `#f1eee1` |
| Muted text on dark surfaces | `#9aaa97` |
| Main text on light surfaces | `#16261d` |
| Secondary text on light surfaces | `#58614f` |
| Border / divider on light surfaces | `#d6d0b8` |
| Very light badge surface (where needed) | `#f3f8f5` |

Use semantic tokens rather than scattered literal color values. Gold used as a small text label on a light background may fail WCAG AA contrast. Check actual foreground/background pairs; use a darker accessible gold/ink variant for small text on cream while retaining the original gold for buttons, borders, and accents where appropriate. Aim for at least 4.5:1 for normal text and 3:1 for large text.

## Typography

Figma mixes several families for distinct roles. Reuse the corresponding fonts already available in the project or load them intentionally; do not substitute one font for every role.

- **Playfair Display Bold:** major section headings and editorial display text; especially the hero and large section titles.
- **Space Grotesk:** body copy, navigation, controls, descriptive text, and strong UI labels.
- **JetBrains Mono:** compact eyebrow labels, category labels, metadata, and small utility text.
- **Inter:** selected eyebrow/annotation labels and small supporting text.
- **Crimson Text Bold:** publication/program item titles where that treatment appears in the Figma design.

Use responsive sizes and natural wrapping rather than fixed absolute coordinates. Preserve readable line-height and avoid tiny text just because the Figma screenshot is scaled down.

## Layout and responsive rules

- The desktop frame uses a wide, centered content container (roughly 1120–1180 px at the desktop design width) with meaningful horizontal margins.
- The mobile frame is a separate composition, not merely a scaled desktop canvas. Stack content vertically, keep navigation compact, keep touch targets accessible, and preserve section rhythm.
- Use CSS grid/flex and the existing Next.js/Tailwind project conventions. Do not reproduce the Figma artboard as one giant image or hard-code all content with absolute positioning.
- Prefer thin dividers and restrained borders over floating cards everywhere. Buttons have small corner radii (around 3 px in the reference).

## Section-by-section target

### 1. Header and hero

- Compact brand/logo at the left and primary navigation at the right on desktop.
- Hero is full-width with the **original group photo** as its background, dark forest-green overlay, centered large serif heading, a short Cabinet Nexus tagline, and two compact CTA actions.
- Main heading: “HIMPUNAN MAHASISWA TEKNOKIMIA NUKLIR”. Tagline: “Kabinet Nexus — Beyond Chemistry Into Energy”.
- Primary CTA points to the program section; secondary CTA points to the organization/leadership section. Ensure the IDs actually exist.
- Mobile uses a compact menu trigger and a vertically balanced centered hero. Keep the overlay strong enough for readable text.
- Screenshot crops are references only, not usable production image assets. Find the original hero photo and logo in local assets or report an asset blocker.

### 2. About

- Light cream background.
- Editorial eyebrow and prominent heading, followed by a short introduction.
- Three concise focus areas: Akademik, Riset, and Komunitas.
- Desktop uses a restrained three-column layout with fine dividers. Mobile stacks the three items with horizontal separators.
- Treat copy in Figma as reference content that may need owner verification before public release.

### 3. Programs / program kerja

- Deep forest-green section with light typography and gold accents.
- Heading “Agenda Kabinet Nexus 2026” in the reference.
- Desktop uses a low-noise list of horizontal rows with status badge, program title, short description, and small source/period metadata. Avoid generic rounded cards.
- Mobile stacks the entries in the same visual style.
- The alternate empty-state layouts are stored in `states/`. Show an empty state only when the API response legitimately contains no publishable entries.
- **Data rule:** do not fetch or render the public programs endpoint until the status/visibility policy is confirmed. Never copy “PODCAST”, partner examples, placeholder descriptions, or status values from the mock design as real program records.

### 4. Publications

- Warm cream background with a clear editorial title and thin horizontal separators.
- Desktop shows horizontal publication rows: thumbnail at the left, title and summary in the middle, date/metadata and a right-aligned “Baca Selengkapnya” action.
- Mobile uses a comfortable single-column list with a locally proportioned thumbnail, title, brief summary, date, and reading link.
- Use only real API data. Do not treat lorem ipsum, mock dates, or duplicated sample stories in Figma as published content.
- Use the matching alternate empty state from `states/` when there are no records. A network/API failure must remain distinguishable from a legitimate empty list and offer retry behavior.
- Normalize empty/whitespace image URLs and handle broken image loads without breaking layout. Resolve relative media paths using the API-origin helper already added in Batch 1.

### 5. Organization structure

- Light cream section, editorial title, and a thin-bordered grid.
- The desktop layout has a full-width BPH row followed by paired division cells; preserve the open, table-like layout and subtle dividers.
- Mobile collapses into a concise, readable summary rather than squeezing the desktop grid.
- Figma uses a “7 divisi” and “2026 / periode Nexus” summary. These are content claims, not merely styling: verify the information before making it live. Do not invent member names, office holders, counts, or active-period information.

### 6. Join/contact and footer

- Deep-green background with a small gold eyebrow, editorial invitation heading, short supporting text, and two compact CTA buttons.
- Contact row includes email, secretariat, and map link; desktop lays these out in columns, while mobile stacks them.
- Desktop reference includes a map preview with a location card, followed by a restrained footer/legal line.
- Verify contact/address/map URL with the organization owner before publishing. Do not embed a fake/static map screenshot as an interactive map. A real map embed or an intentional link may be used if approved and safe.

## Content and API constraints

- This is a visual spec, not authorization to invent or publish content.
- Do not fabricate news, program records, organization metadata, member details, counts, date/period, achievements, or contact facts.
- Keep the existing API contract. No backend, database, migration, auth/security, CORS, cookies, rate limit, Redis, or deployment changes are in scope.
- Keep loading, empty, and error states distinct. Do not represent an API error as “no data”.
- Do not create new route pages in this alignment pass; anchor CTAs must point to existing section IDs. Detailed public pages belong to a later batch.

## Definition of done for visual alignment

1. Review desktop and mobile screenshots side by side with the local Figma images.
2. Hero image, font roles, color palette, section order, publication row pattern, structure grid, and contact/footer composition visibly align with the references.
3. No program/news/organization mock data is presented as real.
4. Responsive checks at 360, 390, 768, and 1280 px show no unintended horizontal overflow and usable controls.
5. `npm run lint`, `npm run build`, and `git diff --check` have actually been run and their true results recorded.
6. Inspect admin pages after login if possible; public visual tokens must not unintentionally change admin colors/layout.
7. Update `progress.md`; stop after the alignment pass without starting Batch 2.
