-- 0006_other_books — non-school books (religious, children's, novels…).
--
-- An "other book" is a books row with class_id NULL and a genre tag instead;
-- school textbooks keep class_id and stay genre-less. One check constraint
-- makes the two shapes mutually exclusive, so every row is exactly one kind.
-- subject stays NOT NULL (it feeds the generated search column): other books
-- store '' there.
--
-- Other books get their own natural key on (school_id, genre, title_en) for
-- the CSV import/export round-trip. The index is deliberately NOT partial:
-- textbooks carry genre NULL, so they never collide on it (NULLs are
-- distinct), and PostgREST upserts can only target plain column lists.

alter table books alter column class_id drop not null;

alter table books add column genre text
  check (genre in ('religious', 'children', 'novel', 'other'));

alter table books add constraint books_genre_xor_class
  check ((class_id is null) = (genre is not null));

create unique index books_other_natural_key
  on books (school_id, genre, title_en);
