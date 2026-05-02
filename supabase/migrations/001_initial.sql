-- THAALI — Supabase schema for vendor marketplace
-- Run this in the Supabase SQL Editor (or via migration tooling).

-- Extensions
create extension if not exists "pgcrypto";

-- Profiles linked to Supabase Auth
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null check (role in ('user', 'vendor', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  business_name text not null,
  category text not null,
  location text not null,
  phone text,
  price_range text,
  capacity text,
  description text,
  profile_image text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  claimed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists vendors_status_idx on public.vendors (status);
create index if not exists vendors_category_idx on public.vendors (category);
create index if not exists leads_vendor_idx on public.leads (vendor_id);

alter table public.users enable row level security;
alter table public.vendors enable row level security;
alter table public.leads enable row level security;

-- RLS: authenticated users can read their own profile row
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

-- RLS: anyone (anon) can read approved vendors for public listings
create policy "vendors_select_approved"
  on public.vendors for select
  using (status = 'approved');

-- RLS: vendors can read their own row
create policy "vendors_select_own"
  on public.vendors for select
  using (auth.uid() = user_id);

-- RLS: vendors can insert their own vendor row
create policy "vendors_insert_own"
  on public.vendors for insert
  with check (auth.uid() = user_id);

-- RLS: vendors can update their own row
create policy "vendors_update_own"
  on public.vendors for update
  using (auth.uid() = user_id);

-- Leads: no policies for anon/authenticated yet; server-side API uses the service role (bypasses RLS).

-- Admin bootstrap (after creating the user in Authentication): insert their auth user id and email:
-- insert into public.users (id, email, role) values ('<uuid-from-auth.users>', 'you@domain.com', 'admin');

-- Note: the service role key bypasses RLS for server-side API routes.
