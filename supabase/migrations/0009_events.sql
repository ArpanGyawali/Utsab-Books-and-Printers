-- 0009_events — lightweight analytics events for the owner's monthly report
-- (book searches, inquire clicks, notify/quote submissions).
--
-- Written ONLY through server code with the service-role key: searches are
-- logged by the books page itself, submissions by their route handlers, and
-- inquire clicks arrive via the rate-limited /api/event handler. The API
-- roles get nothing — RLS on, no policies, grants revoked (as with 0008).

create table public.events (
  id bigint generated always as identity primary key,
  type text not null check (type in ('search', 'inquire_click', 'notify_submit', 'quote_submit')),
  locale text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index events_type_created_idx on public.events (type, created_at desc);

alter table public.events enable row level security;
revoke all on public.events from anon, authenticated;
