-- Academia 365: schema seguro para Supabase
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_day integer not null default 1 check (current_day between 1 and 365),
  xp integer not null default 0,
  streak integer not null default 0,
  best_streak integer not null default 0,
  last_completed_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.completed_missions (
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id integer not null check (mission_id between 1 and 365),
  completed_at timestamptz not null default now(),
  reflection text,
  primary key (user_id, mission_id)
);

create table if not exists public.trophies (
  user_id uuid not null references auth.users(id) on delete cascade,
  trophy_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, trophy_id)
);

alter table public.user_progress enable row level security;
alter table public.completed_missions enable row level security;
alter table public.trophies enable row level security;

drop policy if exists "own progress select" on public.user_progress;
drop policy if exists "own progress insert" on public.user_progress;
drop policy if exists "own progress update" on public.user_progress;
create policy "own progress select" on public.user_progress for select using (auth.uid() = user_id);
create policy "own progress insert" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "own progress update" on public.user_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own missions select" on public.completed_missions;
drop policy if exists "own missions insert" on public.completed_missions;
drop policy if exists "own missions update" on public.completed_missions;
create policy "own missions select" on public.completed_missions for select using (auth.uid() = user_id);
create policy "own missions insert" on public.completed_missions for insert with check (auth.uid() = user_id);
create policy "own missions update" on public.completed_missions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own trophies select" on public.trophies;
drop policy if exists "own trophies insert" on public.trophies;
create policy "own trophies select" on public.trophies for select using (auth.uid() = user_id);
create policy "own trophies insert" on public.trophies for insert with check (auth.uid() = user_id);

create index if not exists completed_missions_user_idx on public.completed_missions(user_id);
create index if not exists trophies_user_idx on public.trophies(user_id);
