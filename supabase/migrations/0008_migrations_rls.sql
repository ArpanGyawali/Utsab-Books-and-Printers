-- 0008_migrations_rls — lock the migration-tracking table away from the API.
--
-- _migrations is created by scripts/db-migrate.mjs in public, so PostgREST
-- exposes it and default grants let anon/authenticated read AND write it
-- (Supabase lint: rls_disabled_in_public). Nothing on the site uses it.
-- RLS with no policies denies the API roles; the postgres owner and the
-- service role bypass RLS, so db:migrate keeps working.

alter table public._migrations enable row level security;
revoke all on public._migrations from anon, authenticated;
