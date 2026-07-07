# UTSAB BOOKS AND PRINTERS — Asset Collection Checklist

Everything needed from **our side** (owner + you) before and during development.
Gather Phase-1 items before writing any code — design decisions depend on them.

> **Status log**
> - **2026-07-06** — Asset request sent to client (photos ×6, logo/year/tagline,
>   2 sample books in template format, class 11/12 stream question). Delivery
>   expected via Drive/email/WhatsApp. We shoot exterior + owner photo ourselves.
> - **2026-07-06** — `.com.np` domain applied for; register.com.np account created.
> - **Confirmed facts:** name **Utsab Books and Printers**; address
>   **Ranibagiya, Sainamaina-1, Rupandehi**; Maps link:
>   <https://share.google/PpisejsuDEO8yVQ5L>
> - Site is being built with **placeholders** (photos, book data, slogan,
>   established year) — swap in real assets as they arrive.

---

## 1. Photography (the single most important anti-"AI-look" asset)

Shoot on a phone in daylight. Landscape orientation unless noted. No filters —
we'll color-grade consistently in code/editing.

### Must-have (Phase 1 — hero & identity)
- [ ] **Shop front exterior**, straight-on, signboard clearly readable (hero candidate)
- [ ] **Interior wide shot** — shelves of books/stationery from the entrance
- [ ] **Owner at the counter** (or family/staff) — natural pose, mid-shot

### Services section (one strong photo per service)
- [ ] Stationery shelves close-up (pens/copies/geometry boxes — colorful section)
- [ ] Printer/photocopier in action (paper coming out, hands on machine)
- [ ] Book stacks — school textbook bundles/sets (ideally labelled by class)
- [ ] "Other services" — lamination, binding, passport photos, whatever applies

### Nice-to-have (Phase 2–3)
- [ ] Vertical (portrait) crop of shop front for mobile hero

**Specs:** original resolution, no WhatsApp compression — transfer via email/Drive/USB.
Aim for at least 2000px on the long edge.

---

## 2. Brand & Identity

- [x] **Exact business name** (EN): **Utsab Books and Printers** (confirmed)
- [ ] Nepali script name: e.g. `उत्सव बुक्स एण्ड प्रिन्टर्स` — **confirm spelling with owner** (उत्सव vs उत्सब)
- [ ] Logo, if one exists (signboard/bill pad version is fine — we can redraw/vectorize).
      If none exists: decide we design a simple **stamp-style text mark** (fits paper/ink theme)
- [ ] Establishment year (for "Serving since 20XX")
- [ ] Any tagline the owner already uses on bills/signboard

## 3. Written Content (owner's own words — no generic copy)

- [ ] 3–5 sentences from the owner: history of the shop, who runs it, what they're
      known for. In **Nepali first**, then we translate to English (not the reverse —
      the Nepali should read native, not translated)
- [ ] One-line description of each service, owner's phrasing

## 4. Business Facts

- [x] Full address: **Ranibagiya, Sainamaina-1, Rupandehi** (confirmed)
- [ ] Local landmark directions ("50m from ___ Chowk, opposite ___") in both
      languages — this powers the creative map section
- [x] Google Maps pin/share link: <https://share.google/PpisejsuDEO8yVQ5L>
- [x] **Primary phone number**: **+977 9851017951** (WhatsApp + calls; Viber unconfirmed)
- [x] Secondary phone: **+977 9841254514**
- [ ] Opening hours, per day + Saturday schedule
- [ ] Typical festival closures (Dashain/Tihar pattern) for the closure-notice feature
- [ ] Email address (create one if none: e.g. utsabbooks@gmail.com)
- [ ] Social profiles if any (Facebook page is likely; link it)

## 5. Book Inventory Data (the real work — start early, Phase 2 blocker)

- [ ] **The school**: name (EN + NE) of the one school we launch with
- [ ] Class list confirmation: Nursery, LKG, UKG, 1–12 (confirm class 11–12 streams
      if applicable: Science/Management/etc.)
- [ ] **Full book list** in the spreadsheet template (we provide the template):
      `class | subject | title_en | title_ne | publisher | price | status | units | expected_arrival`
      - status one of: `in_stock` / `out_of_stock` / `arriving`
      - price optional per book (owner may prefer not to publish prices — decide)
- [ ] Decide: show prices publicly? (Recommendation: show for books, hide for
      print jobs which are quoted)
- [ ] Stationery: only category-level descriptions needed (no per-item inventory in v1)

## 6. Accounts & Access (free — create with owner's email where sensible)

- [ ] GitHub account (yours; repo lives here)
- [ ] Vercel account (free Hobby tier) — connect to GitHub
- [ ] Supabase account (free tier) — one project
- [ ] Google account for the business → **Google Business Profile** claim/creation
      (huge for local SEO; link website once live)
- [ ] Google Search Console (verify domain after launch)
- [x] **.com.np domain registration** via register.com.np — applied 2026-07-06,
      account created; **awaiting approval** (days–weeks). Target: `utsabbooks.com.np`
- [ ] Owner's admin login email + a password he can remember (or set up magic-link
      login — no password at all; decide in Phase 2)

## 7. Fonts & Design Materials (our side, free)

- [ ] Devanagari webfont: **Mukta** (Google Fonts) — supports Nepali well
- [ ] Latin pairing: characterful serif or grotesque (e.g. Fraunces / Source Serif /
      IBM Plex) — final pick during design tokens step
- [ ] Paper texture: subtle, tileable, light (create or source CC0 — verify license)
- [ ] Ink-splatter SVG accents: 2–3 small hand-drawn-style marks (make in Figma/Inkscape —
      do NOT use obvious stock splatter clip-art)
- [ ] Notebook ruled-line pattern as CSS/SVG (built in code, no asset needed)
- [ ] Favicon + OG share image (built from logo once ready)

## 8. Later Phases (collect when reached)

- [ ] Print-job price reference sheet (per page B/W, color, binding types) for the
      quote form's guidance text
- [ ] FAQ list (10–15 real questions customers ask) — powers the future chatbot
- [ ] 2–4 customer testimonials with permission + names (optional; only if real)

---

**Blocking dependencies:** Phase 1 needs sections 1 (must-haves), 2, 3, 4.
Phase 2 needs section 5 complete and section 6 accounts created.
Domain (6) should be applied for in week 1 due to approval lag.
