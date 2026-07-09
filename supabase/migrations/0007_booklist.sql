-- 0007_booklist — the school/college's official book list, shown from
-- Look for Book.
--
-- Content lives in site_settings key 'booklist':
--   { text, file_path, file_type ('image'|'pdf'), file_w, file_h, updated_at }
-- The owner types the list and/or uploads one photo or PDF of it. Files go
-- in this public bucket; as with covers (0003), writes happen only through
-- admin server actions using the service-role key, so no storage policies.

insert into storage.buckets (id, name, public)
values ('booklists', 'booklists', true)
on conflict (id) do nothing;
