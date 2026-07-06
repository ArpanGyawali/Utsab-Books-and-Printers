# UTSAB BOOKS AND PRINTERS — Implementation Plan

Bilingual (NE/EN) fullstack website. Stack: Next.js App Router + Supabase +
Tailwind, deployed on Vercel. Single school at launch, multi-school-ready schema.
Companion documents: `ASSETS.md` (what to gather) and `SKILL.md` (how to build —
load it in Claude Code for every session on this repo).

Guiding order of work: **design identity → data → the differentiator (Look for
Book) → admin → polish → launch**. Each phase ends in something deployed and
demoable to the owner — feedback early beats perfection late.

---

## Phase 0 — Groundwork (do in parallel with everything, start day 1)

- [x] Apply for `utsabbooks.com.np` at register.com.np (citizenship copy + cover
      letter; approval takes days–weeks — this is why it's first) — *applied 2026-07-06, account created; awaiting approval*
- [~] Create accounts: GitHub, Vercel, Supabase — *done; repo at
      github.com/ArpanGyawali/Utsab-Books-and-Printers, pushed 2026-07-06.
      Remaining: connect Vercel to repo; claim/create Google Business Profile*
- [~] Collect ASSETS.md Phase-1 items — *requested from client 2026-07-06 (photos,
      brand, sample book data); confirmed: name "Utsab Books and Printers",
      address Ranibagiya, Sainamaina-1, Rupandehi. Using placeholders until delivery.*
- [~] Give the owner the book-list spreadsheet template; he starts filling it
      (longest human task in the project — begins now, needed by Phase 3) —
      *2-sample-book template sent with asset request*

**Exit criteria:** domain application submitted; photo shoot done; spreadsheet in progress.

---

## Phase 1 — Foundation & Design System

Goal: an empty but *distinctive* shell. If Phase 1 looks generic, stop and fix —
everything else inherits from it.

> **Status (2026-07-06): ✅ DONE.** Built, pushed, and deployed:
> <https://utsab-books-and-printers.vercel.app> (auto-deploys from `main`).
> Next.js 16, Tailwind v4, next-intl via `src/proxy.ts`, tokens + `/dev/tokens`
> page, motifs, primitives, both locales verified. Placeholder
> photos/slogan/year/phone/hours are marked `TODO(assets)` — see ASSETS.md.
> Owner phone review pending (do alongside Phase 2).

1. **Scaffold**: `create-next-app` (TS, App Router, Tailwind). Repo → GitHub →
   Vercel connected. Deploy the blank app immediately (deployment pipeline proven
   on day one, not at the end).
2. **Design tokens** (`styles/tokens.css`): paper/ink palette matched to the real
   signboard color, spacing scale, radii. Load Mukta + Latin pairing via
   `next/font`. Build a throwaway `/dev/tokens` page showing all tokens, both
   scripts, all status badges — review it on a real phone.
3. **Texture & motifs**: subtle tileable paper background, ruled-line section
   divider (CSS), 2–3 small ink-accent SVGs, stamp-style logo lockup (EN + NE).
4. **i18n plumbing**: next-intl, `/en` + `/ne` routing, cookie persistence,
   first-visit language chooser (full-screen, two big buttons, shop logo),
   navbar toggle that preserves current path. `messages/en.json`, `messages/ne.json`.
5. **Layout primitives**: Navbar (logo, nav, language toggle, "open now" dot),
   Footer (hours, address, phone, socials), Container, SectionHeading, Button,
   Badge — all hand-built per SKILL.md design rules.

**Exit criteria:** deployed shell in both languages, owner has seen it on his
phone, Devanagari renders correctly, zero forbidden design elements.

## Phase 2 — Public Pages (static content)

1. **Hero/Home**: full-bleed shop photograph with ink-toned overlay, name lockup
   in active script, one-line owner tagline, two CTAs — "Look for Book" (primary)
   and "Our Services". Below the fold: seasonal **banner strip** (driven by
   `site_settings` later; hardcoded placeholder now), three-photo strip of the
   real shop, short "since 20XX" story in owner's words.
2. **Services page**: notebook index-tab layout (Stationery / Printing / Books /
   Other). Each tab: real photo, owner's one-liner, item list. Printing tab
   includes the **print quote form** UI (wired in Phase 4): name, phone,
   job description, pages, B/W-or-color, binding → stored + wa.me handoff.
3. **Contact page**: creative map treatment — embedded Google Map beside a
   "how locals find us" landmark description card (both languages), tap-to-call
   button, WhatsApp and Viber buttons, hours table with today highlighted,
   festival-closure notice slot.
4. SEO baseline: per-locale `generateMetadata`, hreflang alternates, LocalBusiness
   JSON-LD, sitemap, robots, OG images.

**Exit criteria:** all static pages complete in BOTH languages with real content
and photos; Lighthouse mobile ≥ 90; owner sign-off on copy.

## Phase 3 — Database & Look for Book (the differentiator)

1. **Supabase setup**: run migrations for full schema in SKILL.md (schools,
   classes, books, inquiries, site_settings, print_quotes). RLS policies:
   public read on catalog/settings, anon insert only on inquiries/print_quotes,
   everything else admin-only. Seed classes (Nursery→12) and the one launch school.
2. **Typed clients**: browser/server/service-role Supabase clients; generate TS
   types; `pg_trgm` extension + trigram index on a generated search column
   (title_en ∥ title_ne ∥ subject ∥ publisher).
3. **Import the real inventory**: build the CSV import as a script first (before
   the admin UI exists) and load the owner's completed spreadsheet. Validate:
   row counts per class vs. his expectation, spot-check Nepali titles.
4. **Books page UI** (`/books`):
   - Class chips (horizontal scroll on mobile) → subject filter → search bar
   - Result cards/rows: locale-aware title, publisher, price or "Ask",
     status badge (stamp-styled), units, expected arrival when `arriving`
   - **Inquire** → prefilled wa.me link (per-locale template from messages,
     built by `lib/inquiry.ts`); Viber as secondary
   - **Notify me** on out-of-stock: inline phone input (normalizes Devanagari
     numerals), inserts into `inquiries` via rate-limited route handler,
     confirmation message
   - Empty states in both languages ("Don't see your book? Ask us on WhatsApp"
     with a generic prefilled link — never a dead end)
5. Wire the home-page seasonal banner to `site_settings`.
6. Caching: RSC + tagged cache (`books`, `settings`).

**Exit criteria:** a parent can find any real book of the launch school in ≤3
taps, see true availability, and reach the owner's WhatsApp with one tap.
Test the full flow on a real phone with the owner's actual number.

## Phase 4 — Admin Panel

Built inside the same app at `/admin`. Mobile-first — the owner will use his phone.

1. **Auth**: Supabase magic-link login restricted to `ADMIN_EMAIL`. No passwords
   to forget. Session persistence so he logs in rarely.
2. **Books management**: searchable list (same search as public) → tap a book →
   edit sheet with three-segment status control, units stepper, date picker for
   arrival, price field. Add Book form. Delete with confirm.
3. **CSV import UI**: upload → dry-run diff preview (inserts/updates/errors) →
   commit. Reuses the Phase-3 script logic. Also an **export** button (backup).
4. **Waiting list**: inquiries grouped by book; when a book flips to in-stock,
   its waiters surface at top; each row = phone + prefilled wa.me "it's arrived"
   notify link + mark-as-notified. This closes the notify-me loop with zero
   infrastructure (no SMS gateway, no cost — owner messages via WhatsApp over data).
5. **Print quotes inbox**: list of submissions, tap-to-WhatsApp reply, mark handled.
6. **Settings**: banner text (EN + NE), hours, festival-closure toggle.
7. Every mutation revalidates the public cache tags.
8. **Owner onboarding session**: sit with him, update 5 books together, import a
   CSV, answer one waiting-list inquiry. Adjust UI where he hesitates — his
   hesitation is a bug.

**Exit criteria:** owner performs a status update + a notify-me reply unassisted
on his own phone.

## Phase 5 — Polish & Launch

1. Content freeze pass: every string reviewed by a native Nepali reader;
   alt text both locales; 404 page (on-theme: "page not found — but the book
   might be! Search here").
2. Accessibility pass: keyboard nav on tabs/filters, contrast on paper palette,
   focus states, form labels.
3. Performance pass: image sizes, font subsetting (Devanagari subset is large —
   verify `next/font` subsetting), bundle check, Lighthouse mobile ≥ 90 all pages.
4. Analytics: Vercel Analytics or Plausible. Events: book searches (query text),
   inquire clicks, notify-me submissions, print-quote submissions — this data
   drives the monthly report that keeps the owner engaged.
5. Domain: point `utsabbooks.com.np` DNS to Vercel; verify SSL; set canonical.
6. Search Console: verify, submit sitemap. Google Business Profile: add website
   link, matching hours/photos.
7. **Launch checklist**: real device test matrix (cheap Android + iPhone, Chrome +
   in-app browsers from Facebook/Messenger since much traffic will arrive there),
   WhatsApp/Viber links tested from both locales, admin flows re-tested,
   backup export taken, `.env` documented privately.
8. Announce: shop's Facebook page, QR code sticker for the counter linking to
   `/books` ("Check book availability here"), share in school parent groups if
   owner has access.

## Phase 6 — Post-launch: Maintenance & Growth

**Standing maintenance (low effort by design):**
- Vercel cron → `/api/ping` (trivial Supabase read) weekly: prevents free-tier
  pause after ~7 days idle
- Weekly automated books CSV export (GitHub Action → artifact or email)
- Monthly: skim analytics, send owner a 3-line report ("X searches, top wanted
  book was Y, Z notify-me signups") — this is what keeps stock data fresh
- Dependencies: update quarterly or before season prep only; pin versions;
  never update the week before new session
- **Season prep ritual (Chaitra, ~March):** bulk CSV re-import of new session
  lists, banner update, fresh photos of new sets, re-test everything

**Growth backlog (in rough priority order):**
1. Second school onboarding (schema is ready; needs school picker prominence,
   per-school book lists, per-school SEO pages `/books/[school-slug]`)
2. **AI chatbot** — scoped tight: one route handler; takes user message; runs the
   existing book search against Supabase; answers availability + hours/location/
   services from a small FAQ (collected per ASSETS.md); answers in the user's
   language; every answer ends with the wa.me escape hatch. Hard rules: never
   invent stock status (answers come only from DB rows), rate-limited, clearly
   labeled as automated. Ship only after Look-for-Book has proven search quality —
   the bot reuses that exact search.
3. Full book **sets** as a unit ("Class 4 complete set — inquire for all") with
   set-level availability roll-up
4. Nepali date (B.S.) display for expected arrivals
5. Stationery highlights section with photos (still inquiry-based, not e-commerce)
6. Online payment/reservation — ONLY if inquiry volume proves demand; eSewa/Khalti
   integration is a separate project, do not smuggle it in

**Explicit non-goals (v1):** shopping cart/checkout, user accounts, order
tracking, reviews system, multi-admin roles, native app.

---

## Risk register (watch these)

| Risk | Mitigation |
|---|---|
| Owner stops updating stock | Analytics report ritual; make status edit a 3-tap job; WhatsApp waiting-list gives him direct payoff |
| Inventory spreadsheet delayed | Started day 1 (Phase 0); Phase 1–2 don't depend on it |
| .com.np approval lag | Applied day 1; launch on `*.vercel.app` if needed, domain swap is trivial |
| Supabase free-tier pause | Weekly cron ping from day of Phase 3 deploy |
| Nepali copy reads machine-translated | Owner writes Nepali first; native review pass in Phase 5 |
| Site looks generic | Phase 1 exit criteria gate; SKILL.md forbidden-elements list enforced every task |
| Data loss | Weekly CSV export + Supabase PITR when/if on paid tier |

## Definition of "v1 done"

A parent in Sainamaina hears about the site in a Facebook group, opens it on a
mid-range Android in Nepali, finds their child's Class 3 English book in under
30 seconds, sees it's arriving Thursday, taps Notify Me — and on Thursday the
owner, from his phone, taps one WhatsApp link to tell them it's in.
