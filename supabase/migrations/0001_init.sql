-- 0001_init — full schema per SKILL.md data model.
-- Applied via `npm run db:migrate` (scripts/db-migrate.mjs).

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table schools (
  id      uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ne text not null,
  slug    text not null unique,
  active  boolean not null default true
);

create table classes (
  id      smallint primary key,
  name_en text not null,
  name_ne text not null,
  sort    smallint not null
);

create table books (
  id               uuid primary key default gen_random_uuid(),
  school_id        uuid not null references schools (id),
  class_id         smallint not null references classes (id),
  subject          text not null,
  title_en         text not null,
  title_ne         text,
  publisher        text,
  price            numeric,          -- null = "Ask"
  status           text not null default 'in_stock'
                   check (status in ('in_stock', 'out_of_stock', 'arriving')),
  units            integer not null default 0,
  expected_arrival date,             -- only meaningful when status = 'arriving'
  updated_at       timestamptz not null default now(),
  -- Search column: matches across both titles, subject and publisher
  -- regardless of active locale (SKILL.md i18n rules).
  search           text generated always as (
                     coalesce(title_en, '') || ' ' || coalesce(title_ne, '') || ' '
                     || subject || ' ' || coalesce(publisher, '')
                   ) stored
);

-- Trigram index for fuzzy ilike search; btree for the common class listing.
create index books_search_trgm_idx on books using gin (search gin_trgm_ops);
create index books_school_class_idx on books (school_id, class_id);
-- CSV import upserts on this natural key.
create unique index books_natural_key on books (school_id, class_id, subject, title_en);

create table inquiries (
  id         uuid primary key default gen_random_uuid(),
  book_id    uuid not null references books (id) on delete cascade,
  phone      text not null,
  created_at timestamptz not null default now(),
  notified   boolean not null default false
);

create index inquiries_book_idx on inquiries (book_id) where not notified;

create table site_settings (
  key   text primary key,
  value jsonb not null
);

create table print_quotes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  description text not null,
  pages       integer,
  color       boolean,
  binding     text,
  created_at  timestamptz not null default now(),
  handled     boolean not null default false
);

-- Keep books.updated_at honest on any update path.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger books_set_updated_at
  before update on books
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Admin identity (Phase 4 uses this; created now so RLS is complete from day 1)
-- The `private` schema is NOT exposed through PostgREST. The allowed admin
-- email is inserted in a later migration / manually when ADMIN_EMAIL is fixed.
-- ---------------------------------------------------------------------------

create schema if not exists private;

create table private.admin_emails (
  email text primary key
);

grant usage on schema private to authenticated;
grant select on private.admin_emails to authenticated;

create function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from private.admin_emails
    where email = coalesce(auth.jwt() ->> 'email', '')
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public: read catalog + settings, insert-only on inquiries / print_quotes
-- (rate-limited in the route handler). Admin (matching email): everything.
-- Service role bypasses RLS (import script, admin server actions).
-- ---------------------------------------------------------------------------

alter table schools       enable row level security;
alter table classes       enable row level security;
alter table books         enable row level security;
alter table inquiries     enable row level security;
alter table site_settings enable row level security;
alter table print_quotes  enable row level security;

create policy "public read schools"  on schools       for select to anon, authenticated using (true);
create policy "public read classes"  on classes       for select to anon, authenticated using (true);
create policy "public read books"    on books         for select to anon, authenticated using (true);
create policy "public read settings" on site_settings for select to anon, authenticated using (true);

create policy "anon insert inquiries" on inquiries
  for insert to anon, authenticated with check (not notified);

create policy "anon insert print quotes" on print_quotes
  for insert to anon, authenticated with check (not handled);

-- Admin full access (select/update/delete where missing above).
create policy "admin all schools"   on schools       for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all classes"   on classes       for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all books"     on books         for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all inquiries" on inquiries     for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all settings"  on site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all quotes"    on print_quotes  for all to authenticated using (public.is_admin()) with check (public.is_admin());
