-- Einmal im Supabase SQL Editor ausführen.
-- Die Tabellen bleiben hinter RLS; Inserts erfolgen nur über die serverseitige API.
create extension if not exists pgcrypto;

create table if not exists public.trade_results (
  id uuid primary key default gen_random_uuid(),
  source_trade_id text not null,
  member_email text not null,
  account_id text,
  symbol text not null,
  direction text not null,
  volume numeric,
  entry_price numeric,
  exit_price numeric,
  stop_loss numeric,
  take_profit numeric,
  profit numeric not null,
  currency text not null default 'USD',
  opened_at timestamptz,
  closed_at timestamptz not null default now(),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.trade_results add column if not exists source_trade_id text;
alter table public.trade_results add column if not exists member_email text;
alter table public.trade_results add column if not exists account_id text;
alter table public.trade_results add column if not exists symbol text;
alter table public.trade_results add column if not exists direction text;
alter table public.trade_results add column if not exists volume numeric;
alter table public.trade_results add column if not exists entry_price numeric;
alter table public.trade_results add column if not exists exit_price numeric;
alter table public.trade_results add column if not exists stop_loss numeric;
alter table public.trade_results add column if not exists take_profit numeric;
alter table public.trade_results add column if not exists profit numeric;
alter table public.trade_results add column if not exists currency text default 'USD';
alter table public.trade_results add column if not exists opened_at timestamptz;
alter table public.trade_results add column if not exists closed_at timestamptz default now();
alter table public.trade_results add column if not exists raw_payload jsonb default '{}'::jsonb;
alter table public.trade_results add column if not exists created_at timestamptz default now();

create unique index if not exists trade_results_source_trade_id_idx
on public.trade_results (source_trade_id);
create index if not exists trade_results_member_email_idx
on public.trade_results (member_email, closed_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null default 'SYSTEM',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notifications add column if not exists title text;
alter table public.notifications add column if not exists message text;
alter table public.notifications add column if not exists type text default 'SYSTEM';
alter table public.notifications add column if not exists is_active boolean default true;
alter table public.notifications add column if not exists created_at timestamptz default now();
alter table public.notifications add column if not exists updated_at timestamptz default now();

alter table public.trade_results enable row level security;
alter table public.notifications enable row level security;

revoke all on table public.trade_results from anon, authenticated;
grant select on table public.trade_results to service_role;
grant insert, update on table public.trade_results to service_role;

drop policy if exists "active_notifications_are_readable" on public.notifications;
create policy "active_notifications_are_readable"
on public.notifications for select
to anon, authenticated
using (is_active = true);

create or replace function public.ingest_trade_result(
  p_source_trade_id text,
  p_member_email text,
  p_account_id text,
  p_symbol text,
  p_direction text,
  p_volume numeric,
  p_entry_price numeric,
  p_exit_price numeric,
  p_stop_loss numeric,
  p_take_profit numeric,
  p_profit numeric,
  p_currency text,
  p_opened_at timestamptz,
  p_closed_at timestamptz,
  p_raw_payload jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_trade_id text;
  did_insert boolean := false;
begin
  if nullif(trim(p_source_trade_id), '') is null then
    raise exception 'source_trade_id fehlt';
  end if;

  insert into public.trade_results (
    source_trade_id, member_email, account_id, symbol, direction, volume,
    entry_price, exit_price, stop_loss, take_profit, profit, currency,
    opened_at, closed_at, raw_payload
  ) values (
    trim(p_source_trade_id), lower(trim(p_member_email)), nullif(trim(p_account_id), ''),
    upper(trim(p_symbol)), lower(trim(p_direction)), p_volume,
    p_entry_price, p_exit_price, p_stop_loss, p_take_profit, p_profit,
    coalesce(nullif(upper(trim(p_currency)), ''), 'USD'), p_opened_at,
    coalesce(p_closed_at, now()), coalesce(p_raw_payload, '{}'::jsonb)
  )
  on conflict (source_trade_id) do nothing
  returning source_trade_id into stored_trade_id;

  if stored_trade_id is null then
    return jsonb_build_object(
      'inserted', false,
      'source_trade_id', trim(p_source_trade_id),
      'notification_created', false
    );
  end if;

  did_insert := true;

  insert into public.notifications (title, message, type, is_active, created_at, updated_at)
  values (
    'Neues Trade-Ergebnis',
    upper(trim(p_symbol)) || ' · ' || initcap(lower(trim(p_direction))) ||
      ' · ' || p_profit::text || ' ' || coalesce(nullif(upper(trim(p_currency)), ''), 'USD'),
    'TRADE_RESULT',
    true,
    now(),
    now()
  );

  return jsonb_build_object(
    'inserted', did_insert,
    'source_trade_id', stored_trade_id,
    'notification_created', true
  );
end;
$$;

revoke all on function public.ingest_trade_result(text,text,text,text,text,numeric,numeric,numeric,numeric,numeric,numeric,text,timestamptz,timestamptz,jsonb) from public, anon, authenticated;
grant execute on function public.ingest_trade_result(text,text,text,text,text,numeric,numeric,numeric,numeric,numeric,numeric,text,timestamptz,timestamptz,jsonb) to service_role;
