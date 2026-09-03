-- 0012_sports — one showcase, two kinds: stationery + sports.
--
-- The stationery showcase (0010) generalizes into a product showcase with a
-- `kind` discriminator. Sports items have exactly the same shape as stationery
-- ones (photo + bilingual name + optional price + visible flag), share the same
-- storage bucket, the same admin form and the same public grid — so a second
-- table would only have been this one, twice.
--
-- `stationery_categories` becomes `product_categories`, keyed by (kind, slug)
-- so each kind owns its own admin-managed list and both may have an 'other'.
-- `products.kind` joins the foreign key, which also makes it impossible to file
-- a football under "Pens & pencils".
--
-- Existing rows are all stationery — exactly what the column default backfills,
-- so no data is rewritten and every current category slug keeps working.

-- ---------------------------------------------------------------------------
-- product_categories: rename, add `kind`, re-key on (kind, slug)
-- ---------------------------------------------------------------------------

alter table stationery_categories rename to product_categories;

alter policy "public read stationery_categories" on product_categories
  rename to "public read product_categories";
alter policy "admin all stationery_categories" on product_categories
  rename to "admin all product_categories";

alter table product_categories
  add column kind text not null default 'stationery'
  check (kind in ('stationery', 'sports'));

-- The dependent FK has to go before the primary key it points at can change;
-- it is recreated as a composite below.
alter table products drop constraint products_category_fk;

alter table product_categories drop constraint stationery_categories_pkey;
alter table product_categories add primary key (kind, slug);

-- ---------------------------------------------------------------------------
-- products: add `kind`, re-point the FK and the public-grid index
-- ---------------------------------------------------------------------------

alter table products
  add column kind text not null default 'stationery'
  check (kind in ('stationery', 'sports'));

alter table products add constraint products_category_fk
  foreign key (kind, category) references product_categories (kind, slug)
  on update cascade on delete restrict;

-- The public grid filters by kind first, then category, over visible rows.
drop index products_visible_category_idx;
create index products_visible_kind_category_idx
  on products (kind, category) where visible;

-- ---------------------------------------------------------------------------
-- Seed the sports categories (the owner edits/adds/hides these in /admin/lists)
-- ---------------------------------------------------------------------------

insert into product_categories (kind, slug, name_en, name_ne, sort) values
  ('sports', 'cricket',      'Cricket',              'क्रिकेट', 1),
  ('sports', 'football',     'Football & volleyball', 'फुटबल र भलिबल', 2),
  ('sports', 'badminton',    'Badminton',            'ब्याडमिन्टन', 3),
  ('sports', 'indoor_games', 'Indoor games',         'घरभित्रका खेल', 4),
  ('sports', 'fitness',      'Fitness & exercise',   'व्यायाम सामग्री', 5),
  ('sports', 'sportswear',   'Sportswear & gear',    'खेल पोशाक तथा सामान', 6),
  ('sports', 'other',        'Other',                'अन्य', 7);
