-- Nari: initial schema. DO NOT run without asking the team (see CLAUDE.md).
-- Four tables, each locked with row-level security so a user only ever
-- sees their own rows.

-- 1. profiles: one row per user (created automatically on sign-up)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  cycle_length int not null default 28 check (cycle_length between 15 and 60),
  period_length int not null default 5 check (period_length between 1 and 14),
  last_period_start date,
  day_offset int not null default 0,          -- demo "skip to tomorrow"
  quiz_nosebleeds boolean,                    -- bleeding story quiz (null = unanswered)
  quiz_bruising boolean,
  quiz_procedures boolean,
  quiz_family boolean,
  created_at timestamptz not null default now()
);

-- 2. day_logs: one row per user per day (period day + check-in numbers).
--    Bleeding is NOT stored: it is computed from that day's pad_logs.
create table public.day_logs (
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  is_period boolean not null default false,
  energy smallint check (energy between 1 and 5),
  discomfort smallint check (discomfort between 1 and 5),
  mood smallint check (mood between 1 and 5),
  activities text[] not null default '{}',
  primary key (user_id, date)
);

-- 3. pad_logs: one row per pad. Never a photo.
create table public.pad_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  logged_at timestamptz not null default now(),
  soak text not null check (soak in ('light', 'moderate', 'full')),
  clot text not null default 'none' check (clot in ('none', 'small', 'large')),
  leaked boolean not null default false,
  points int not null,
  ai_soak text check (ai_soak in ('light', 'moderate', 'full')),
  ai_clot text check (ai_clot in ('none', 'small', 'large'))
);
create index pad_logs_user_date on public.pad_logs (user_id, date);

-- 4. messages: chat history with nari
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  app_date date not null,
  sender text not null check (sender in ('nari', 'user')),
  kind text not null,
  body text not null default '',
  card jsonb,
  created_at timestamptz not null default now()
);
create index messages_user_created on public.messages (user_id, created_at);
-- scheduled messages appear once per day, even if the page is refreshed
create unique index messages_one_scheduled_per_day
  on public.messages (user_id, app_date, kind)
  where kind in ('checkin', 'heads-up', 'did-it-come');

-- Row-level security: users only see and edit their own rows
alter table public.profiles enable row level security;
alter table public.day_logs enable row level security;
alter table public.pad_logs enable row level security;
alter table public.messages enable row level security;

create policy "own profile" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "own day logs" on public.day_logs
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own pad logs" on public.pad_logs
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own messages" on public.messages
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Create a profile automatically when someone signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
