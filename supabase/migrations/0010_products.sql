-- 0010_products — stationery showcase.
--
-- A "pure showcase" of stationery items: photo + bilingual name + optional
-- price. No stock tracking (that changes too fast to keep honest) — instead a
-- `visible` flag lets the owner hide an item from the public grid at any time.
--
-- The public /stationery page reads this; the admin /admin/stationery panel is
-- the sole writer (server actions on the session client, storage on the
-- service-role client — same split as books, migration 0003).
--
-- NOTE: the `category` set is duplicated in src/lib/product-categories.ts and in
-- src/messages/{en,ne}.json. Changing it means editing the check constraint
-- (drop/add) AND those two places in lockstep.

create table products (
  id         uuid primary key default gen_random_uuid(),
  name_en    text not null,
  name_ne    text,                 -- optional; NE locale falls back to name_en
  category   text not null
             check (category in ('pens_pencils','copies_notebooks','art_craft',
                                 'files_office','school_gear','gifts','other')),
  price      numeric,              -- null = "Ask" (same convention as books.price)
  image_path text,                 -- object in the public `products` bucket; null = placeholder
  visible    boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The public grid queries by category over visible rows only.
create index products_visible_category_idx on products (category) where visible;

-- Reuses public.set_updated_at() from 0001.
create trigger products_set_updated_at
  before update on products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Deliberately deviates from the books `using (true)` public read: hidden
-- items must NOT be anon-readable. The two select policies OR together, so the
-- admin-all policy still lets /admin list hidden rows.
-- ---------------------------------------------------------------------------

alter table products enable row level security;

create policy "public read visible products" on products
  for select to anon, authenticated using (visible);

create policy "admin all products" on products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Public bucket for item photos. Reads go through the public object URL (no
-- storage.objects SELECT policy needed); writes happen only via the
-- service-role key in admin server actions, which bypasses RLS — so no storage
-- write policies here either (same rationale as 0003/0007).
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;
