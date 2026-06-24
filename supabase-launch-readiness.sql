-- Einmal im Supabase SQL Editor ausführen.
create table if not exists public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null,
  category text not null,
  message text not null,
  page text not null,
  user_agent text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists feedback_reports_created_at_idx
on public.feedback_reports (created_at desc);

create index if not exists feedback_reports_email_idx
on public.feedback_reports (email, created_at desc);

alter table public.feedback_reports enable row level security;

-- Keine öffentlichen Policies: Lesen und Schreiben erfolgt ausschließlich
-- über authentifizierte Vercel APIs mit dem Service-Role-Key.
