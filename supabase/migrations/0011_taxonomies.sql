-- 0011_taxonomies — make the two taxonomies admin-managed.
--
-- Book "genre" (the Other-books shelf) and stationery "category" were fixed
-- sets, hardcoded in three places (a lib const array, a SQL check constraint,
-- and the messages files). The owner now manages them from /admin/lists, and
-- the public site reads the lists from these tables.
--
-- Design: the taxonomy tables are keyed by the SAME text `slug` the books /
-- products columns already store, and the columns become foreign keys to them.
-- So no existing row data changes (values already equal the seeded slugs), the
-- CSV upsert key `school_id,genre,title_en`, the `books_genre_xor_class` check,
-- and the generated `search` column all keep working untouched.
--
-- `on delete restrict` makes Postgres block deleting a genre/category that is
-- still used by any book/product — the "block delete when in use" rule, for
-- free. Bilingual labels (name_en + optional name_ne) live here, like schools.

-- ---------------------------------------------------------------------------
-- Lookup tables
-- ---------------------------------------------------------------------------

create table book_genres (
  slug       text primary key,
  name_en    text not null,
  name_ne    text,
  sort       int not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table stationery_categories (
  slug       text primary key,
  name_en    text not null,
  name_ne    text,
  sort       int not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- Seed the current values (slug = the value already stored on existing rows).
-- Labels carried over from lib/genres.ts + messages books.genres.* and
-- lib/product-categories.ts + messages stationery.categories.*.
insert into book_genres (slug, name_en, name_ne, sort) values
  ('religious', 'Religious (dharmik)', 'धार्मिक', 1),
  ('children',  'Children''s books',   'बालबालिकाका किताब', 2),
  ('novel',     'Novels & stories',    'उपन्यास र कथा', 3),
  ('other',     'Other',               'अन्य', 4);

insert into stationery_categories (slug, name_en, name_ne, sort) values
  ('pens_pencils',     'Pens & pencils',     'कलम र सिसाकलम', 1),
  ('copies_notebooks', 'Copies & notebooks', 'कापी र नोटबुक', 2),
  ('art_craft',        'Art & craft',        'कला तथा हस्तकला', 3),
  ('files_office',     'Files & office',     'फाइल र अफिस सामान', 4),
  ('school_gear',      'School gear',        'स्कुल सामग्री', 5),
  ('gifts',            'Gifts & extras',     'उपहार तथा अन्य', 6),
  ('other',            'Other',              'अन्य', 7);

-- ---------------------------------------------------------------------------
-- RLS — public read, admin write (same pair as schools/classes in 0001)
-- ---------------------------------------------------------------------------

alter table book_genres           enable row level security;
alter table stationery_categories enable row level security;

create policy "public read book_genres" on book_genres
  for select to anon, authenticated using (true);
create policy "admin all book_genres" on book_genres
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read stationery_categories" on stationery_categories
  for select to anon, authenticated using (true);
create policy "admin all stationery_categories" on stationery_categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Swap the fixed check constraints for foreign keys to the lookup tables.
-- ON UPDATE CASCADE is harmless (slugs are immutable in the UI); ON DELETE
-- RESTRICT enforces "block delete when a value is still in use".
-- ---------------------------------------------------------------------------

alter table books drop constraint if exists books_genre_check;
alter table books add constraint books_genre_fk
  foreign key (genre) references book_genres (slug)
  on update cascade on delete restrict;

alter table products drop constraint if exists products_category_check;
alter table products add constraint products_category_fk
  foreign key (category) references stationery_categories (slug)
  on update cascade on delete restrict;
