-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  created_at timestamptz default now() not null
);

alter table public.users enable row level security;

create policy "Users can view own records"
  on public.users for select
  using (auth.uid() = user_id);

create policy "Users can insert own records"
  on public.users for insert
  with check (auth.uid() = user_id);
