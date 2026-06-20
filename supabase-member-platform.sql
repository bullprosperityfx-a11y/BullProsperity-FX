-- Einmal im Supabase SQL Editor ausführen.
create table if not exists public.member_state (
  email text primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.member_state enable row level security;

-- Es gibt bewusst keine öffentlichen Policies. Der Zugriff erfolgt ausschließlich
-- über /api/member-state mit dem serverseitigen SUPABASE_SERVICE_ROLE_KEY.

create index if not exists member_state_updated_at_idx
on public.member_state (updated_at desc);
