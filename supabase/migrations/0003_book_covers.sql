-- 0003_book_covers — optional front-cover image per book.
--
-- cover_path is a path inside the public `covers` storage bucket, set from
-- the admin panel (Phase 4). Null = the public UI shows a placeholder cover.

alter table books add column cover_path text;

-- Public bucket for cover images. Reads go through the public object URL
-- (no storage.objects SELECT policy needed for public buckets); writes happen
-- only in admin route handlers using the service-role key, which bypasses
-- RLS — so no storage policies are created here.
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;
