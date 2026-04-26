-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

create table if not exists public.workout_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  exercise_name text not null,
  sets integer not null check (sets > 0),
  reps integer not null check (reps > 0),
  weight numeric(7, 2) not null default 0 check (weight >= 0),
  unit text not null default 'lbs' check (unit in ('lbs', 'kg')),
  logged_at date not null default current_date,
  notes text,
  created_at timestamptz default now() not null
);

alter table public.workout_logs enable row level security;

create policy "Users can manage own workout logs"
  on public.workout_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index workout_logs_user_date_idx
  on public.workout_logs (user_id, logged_at desc);
