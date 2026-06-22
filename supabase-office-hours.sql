create extension if not exists pgcrypto;

create table if not exists public.office_hour_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes between 15 and 180),
  capacity integer not null default 12 check (capacity between 1 and 100),
  topic text not null check (char_length(topic) between 3 and 120),
  discord_channel text not null default '#office-hours',
  status text not null default 'active' check (status in ('active','cancelled','completed')),
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.office_hour_bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.office_hour_slots(id) on delete cascade,
  email text not null,
  member_name text not null,
  discord_username text not null,
  question text not null,
  status text not null default 'confirmed' check (status in ('confirmed','cancelled','attended','no_show')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(slot_id, email)
);

create index if not exists office_hour_slots_starts_at_idx on public.office_hour_slots(starts_at);
create index if not exists office_hour_bookings_slot_idx on public.office_hour_bookings(slot_id, status);
create index if not exists office_hour_bookings_email_idx on public.office_hour_bookings(email);

alter table public.office_hour_slots enable row level security;
alter table public.office_hour_bookings enable row level security;

create or replace function public.book_office_hour(
  p_slot_id uuid,
  p_email text,
  p_member_name text,
  p_discord_username text,
  p_question text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_slot public.office_hour_slots%rowtype;
  existing_booking public.office_hour_bookings%rowtype;
  confirmed_count integer;
  booking_id uuid;
begin
  select * into selected_slot from public.office_hour_slots where id = p_slot_id for update;
  if not found or selected_slot.status <> 'active' or selected_slot.starts_at <= now() then
    raise exception 'Dieser Termin ist nicht mehr verfügbar.';
  end if;

  select * into existing_booking from public.office_hour_bookings
  where slot_id = p_slot_id and email = lower(trim(p_email));

  select count(*) into confirmed_count from public.office_hour_bookings
  where slot_id = p_slot_id and status = 'confirmed';

  if (existing_booking.id is null or existing_booking.status <> 'confirmed') and confirmed_count >= selected_slot.capacity then
    raise exception 'Dieser Termin ist bereits ausgebucht.';
  end if;

  insert into public.office_hour_bookings (slot_id, email, member_name, discord_username, question, status, updated_at)
  values (p_slot_id, lower(trim(p_email)), trim(p_member_name), trim(p_discord_username), trim(p_question), 'confirmed', now())
  on conflict (slot_id, email) do update set
    member_name = excluded.member_name,
    discord_username = excluded.discord_username,
    question = excluded.question,
    status = 'confirmed',
    updated_at = now()
  returning id into booking_id;

  return booking_id;
end;
$$;

revoke all on function public.book_office_hour(uuid,text,text,text,text) from public;
grant execute on function public.book_office_hour(uuid,text,text,text,text) to service_role;
