---
name: utsab-books-website
description: Conventions, architecture, and design rules for building and maintaining the UTSAB BOOKS AND PRINTERS website — a bilingual (Nepali/English) Next.js + Supabase site for a stationery, books, and printing shop. Use this skill for ANY work on this project: creating pages or components, writing Supabase queries or migrations, styling, i18n strings, the Look-for-Book feature, the admin panel, WhatsApp inquiry links, SEO, or deployment. Consult it before writing any code in this repo, even for small fixes, so output matches the established design system and data model.
---

# Utsab Books & Printers — Project Skill

Bilingual shop website for **Utsab Books and Printers**, a books/stationery/printing
shop in Ranibagiya, Sainamaina-1, Rupandehi, Nepal (Butwal area).
Core differentiator: **Look for Book** — live availability of school textbooks
(Nursery–12) with WhatsApp inquiry. Plus a dead-simple admin panel for the owner.

## Stack (fixed — do not substitute)

- **Next.js 15+ App Router**, TypeScript, deployed on **Vercel** (Hobby)
- **Supabase**: Postgres, Auth (admin only), Row Level Security
- **Tailwind CSS v4** with custom design tokens (see Design System)
- **next-intl** for i18n with locale prefix routing: `/en/...`, `/ne/...`
- No component library (no shadcn, no MUI, no DaisyUI). Hand-built components only —
  this is a deliberate anti-generic-look decision.
- No ORM. Use `@supabase/supabase-js` + typed helpers. Generate types with
  `supabase gen types typescript`.

## Repository layout

```
src/
  app/[locale]/            # public pages (en|ne)
    page.tsx               # home/hero
    services/page.tsx
    books/page.tsx         # Look for Book
    contact/page.tsx
  app/admin/               # NOT locale-prefixed; English-only UI, Nepali data ok
    (auth)/login/page.tsx
    books/ ... waiting/ ... settings/
  app/api/                 # route handlers (revalidate, csv-import, notify)
  components/              # PascalCase.tsx, one component per file
  lib/supabase/            # client.ts (browser), server.ts (RSC/route), admin.ts (service role)
  lib/i18n/                # next-intl config
  messages/en.json  messages/ne.json
  styles/
supabase/migrations/       # SQL migrations, numbered, committed to git
```

## Data model (authoritative)

```sql
schools   (id uuid pk, name_en text, name_ne text, slug text unique, active bool default true)
classes   (id smallint pk, name_en text, name_ne text, sort smallint)
          -- seed: Nursery, LKG, UKG, 1..12 (11/12 may have stream variants later)
books     (id uuid pk, school_id uuid fk, class_id smallint fk,
           subject text, title_en text, title_ne text, publisher text,
           price numeric null,                -- null = "ask"
           status text check (status in ('in_stock','out_of_stock','arriving')),
           units int default 0,
           expected_arrival date null,        -- only meaningful when status='arriving'
           updated_at timestamptz default now())
inquiries (id uuid pk, book_id uuid fk, phone text, created_at timestamptz,
           notified bool default false)       -- "notify me when available"
site_settings (key text pk, value jsonb)      -- banner, hours, closure_notice
print_quotes (id uuid pk, name text, phone text, description text,
              pages int null, color bool null, binding text null,
              created_at timestamptz, handled bool default false)
```

Multi-school is designed-in from day one (school_id on books, school picker in UI)
but launches with a single seeded school. Never hardcode the school.

**RLS policy summary:** public `SELECT` on schools/classes/books/site_settings;
`INSERT` only on inquiries and print_quotes for anon (rate-limit in route handler);
everything else requires authenticated admin. Admin auth = Supabase magic link,
single allowed email enforced via RLS/claim check.

## i18n rules

- Every user-facing string lives in `messages/{en,ne}.json`. **No hardcoded strings
  in components**, including aria-labels and alt text.
- Nepali is a first-class language, not a translation afterthought. When adding
  copy, write natural Nepali (Devanagari), not transliterated English. If unsure
  of phrasing, add a `// TODO(ne-review)` comment and flag it — never ship
  machine-translated Nepali silently.
- First visit: language choice screen (stored in cookie via next-intl), then a
  persistent EN/नेपाली toggle in the navbar that preserves the current path.
- Numbers: keep Arabic numerals (1, 2, 3) in both locales — this matches how
  Nepali shops write prices. Dates in Nepali locale use B.S. label if provided
  by owner, otherwise A.D. with month names from messages file.
- Book titles: display `title_ne` in NE locale when present, falling back to
  `title_en`, and vice versa. Search must match across BOTH title fields
  regardless of active locale.

## Design system — the anti-"AI-made" rules (strict)

Theme: **paper & ink**. Cream paper background with a subtle texture, faint ruled
notebook lines as an occasional section motif, tiny hand-drawn ink accents,
stamp-style logo treatment.

- Palette (CSS custom properties, defined once in `styles/tokens.css`):
  - `--paper: #f7f3ea` (bg), `--paper-shade: #efe8d8`
  - `--ink: #1e2430` (text), `--ink-soft: #4a5160`
  - `--accent: deep red or ink blue — match the actual signboard; pick ONE`
  - `--stamp: accent at 85% for stamp/badge elements`
  - Status colors: in_stock `#2f7d4f`, arriving `#b07a1f`, out_of_stock `#9b3b3b`
    (muted, ink-like — never neon/pastel Tailwind defaults)
- **Forbidden:** purple/blue gradients, glassmorphism, emoji in headings or UI,
  default Tailwind palette colors (`bg-blue-500` etc.), stock illustration packs,
  card grids with icon+title+blurb ×3, "Empowering/Unleash/Elevate" copywriting,
  rounded-full pill buttons everywhere, drop shadows heavier than `0 1px 3px`.
- Typography: **Mukta** for Devanagari (weights 400/500/700). Latin pairing chosen
  in tokens step (characterful serif for headings, humanist sans for body).
  Never render Nepali in a Latin-only font stack — always test Devanagari rendering
  when touching font config.
- Real photos only (from ASSETS.md shoot list). Consistent warm grade. `next/image`
  with proper `sizes`. No stock photos, ever.
- Motion: sparing. No scroll-jacking, no floating particles, no typing animations,
  no animation libraries. The system lives in `src/styles/motion.css` — ALL timing
  tokens and motion CSS go there, nowhere else:
  - Tokens: `--dur-micro` (280ms hovers/presses), `--dur-reveal` (1150ms scroll
    reveals), `--ease-out-soft`, `--ease-stamp` (overshoot for stamp/pop
    entrances), `--reveal-stagger`, `--reveal-shift` (directional slide),
    `--word-stagger`. Micro ≤320ms, reveals ≤1200ms. Motion is deliberately
    slow and unhurried so each move is easy to read — tweak timings by editing
    these tokens only.
  - Animate **transform/opacity only** (plus color fades). Shadow ceiling still
    applies: hover lift uses `--shadow-lift` (darker, not bigger).
  - Every animation/hover-transform sits inside
    `@media (prefers-reduced-motion: no-preference)`; JSX transform motion uses
    `motion-safe:`; hover effects gate behind `@media (hover: hover)`.
  - Reveals via `<Reveal>` / `useReveal` (`components/motion/`): hidden states
    exist only under `html.js` (inline gate script in the locale layout) with a
    CSS failsafe that force-shows content after `--reveal-failsafe` — content
    must never be able to stay invisible. `<Reveal from="left|right">` slides in
    from the side (reuses the same gate/failsafe). Split headings via
    `<SplitWords>`: split on SPACES only (Devanagari-safe), never
    characters/graphemes.
  - Reusable primitives in `motion.css` (add here, don't reinvent): `.hero-cascade`
    (load-time child stagger), `.stamp-in`/`.pop-in` (stamped/scaled entrances),
    `.draw-in` (ink underline pens itself when its Reveal enters), `.panel-in` /
    `.panel-in-stagger` (content-swap entrance, e.g. tab panels — key-remount to
    replay), `.photo-in` (framed print lays onto the page; composes with a
    Tailwind `rotate-*` tilt), `.ruled-draw` (view-timeline divider), `.star-twinkle`,
    `.dot-pulse` (open-now ping), `.shake-x` (inline error), `.nav-in` (navbar
    drop-in). Hero photo slowly settles then breathes (`hero-settle`/`hero-breathe`).
  - Intro splash (`IntroLoader`) is once per tab session, returning visitors
    only, ≤1.6s, `pointer-events: none`, fully CSS-driven. Async waits use
    `LogoSpinner` (e.g. `books/loading.tsx`).
- Services page: **notebook index-tab layout** — four tabs styled like dividers
  (Stationery / Printing / Books / Other). Tab switch reveals a photo + owner's
  one-liner + item list. Keyboard accessible (roving tabindex, arrow keys).

## Feature conventions

### Look for Book (`/[locale]/books`)
- Filter-first UI: Class picker (chips, Nursery→12) → optional subject filter →
  results table/cards. Search bar matches `title_en`, `title_ne`, `subject`,
  `publisher` via Postgres `ilike` on a generated search column; add `pg_trgm`
  index for fuzziness.
- Each row: title (locale-aware), publisher, price (or "सोध्नुहोस् / Ask"),
  status badge, units when in stock, expected arrival date when arriving.
- **Inquire button** → wa.me deep link, never an on-site chat:
  `https://wa.me/{SHOP_PHONE}?text={encoded}` where text template lives in
  messages file per locale, interpolating book title + class. Secondary Viber
  link: `viber://chat?number=%2B977...`. Build both via `lib/inquiry.ts` helper —
  single source of truth for the phone number (env var `NEXT_PUBLIC_SHOP_WA`).
- Out-of-stock rows additionally show **"Notify me"** → small inline form
  (phone only, Nepali-numeral tolerant validation: normalize ०-९ → 0-9) →
  inserts into `inquiries`. Rate-limit by IP in the route handler. Confirmation
  copy sets expectation: "We'll message you on WhatsApp when it arrives."

### Admin (`/admin`)
- Mobile-first: the owner uses a phone. Minimum tap target 44px. Big obvious
  status toggles (three-segment control), numeric stepper for units, native
  date input for arrival.
- Screens: Books (searchable list → edit sheet), Add Book, Waiting List
  (inquiries grouped by book, each row has prefilled wa.me "notify" link +
  mark-notified checkbox), Print Quotes inbox, Settings (banner text EN+NE,
  hours, closure notice toggle).
- **CSV import**: accepts the exact spreadsheet template from ASSETS.md; parse
  with PapaParse server-side; dry-run preview (show what will insert/update)
  before commit; upsert on (school_id, class_id, subject, title_en).
- After any admin mutation, call `revalidateTag('books')` / `('settings')` so the
  public ISR pages update immediately.

### Public data fetching
- Public pages are RSC with `fetch`/supabase server client, cached with tags
  (`books`, `settings`) and revalidated on admin writes. No client-side data
  fetching on public pages except the books filter interactions (which may use
  a route handler returning JSON).

## SEO

- Per-locale metadata via `generateMetadata`; `hreflang` alternates for en/ne.
- JSON-LD: `LocalBusiness` (with geo, openingHours) on home; `Product`-lite or
  `ItemList` on books page is optional — do NOT fake aggregate ratings.
- Semantic HTML: single `h1` per page, landmarks, alt text in both locales.
- `sitemap.ts` + `robots.ts` in app dir. OG image per locale.
- Target phrases naturally in copy: "school books Sainamaina", "bookshop Butwal
  Rupandehi", "class {n} books", Nepali equivalents. No keyword stuffing.

## Environment & secrets

```
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # server only, never in client bundles
NEXT_PUBLIC_SHOP_WA=9779XXXXXXXX # digits only, country code, no +
ADMIN_EMAIL                      # single allowed admin login
```
Never commit `.env*`. Service role key only in route handlers / server actions.

## Quality bar / definition of done for any task

1. Works in both locales (check `/ne/...` route, Devanagari renders, no fallback tofu)
2. Mobile 360px width first, then desktop — most visitors are on phones
3. Lighthouse: perf ≥ 90 mobile on public pages; images sized & lazy
4. No forbidden design elements (see list above)
5. RLS verified for any new table/column (try the query as anon)
6. Strings in messages files, types regenerated if schema changed,
   migration file committed
7. `npm run build` passes with zero TS errors before considering done

## Maintenance notes

- Weekly keep-alive: Vercel cron hits a `/api/ping` route that does a trivial
  Supabase read (free tier pauses after ~7 days idle).
- Weekly automated CSV export of `books` to a private GitHub artifact or email —
  the inventory data is the crown jewel; never rely on a single DB copy.
- Season prep (Chaitra/Baishakh): expect a bulk CSV re-import and banner update.
