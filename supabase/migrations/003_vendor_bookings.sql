-- Vendor availability: each row is a date the vendor is NOT available (blocked).
-- Dates with no row are treated as available. (Internal until you expose this publicly.)
create table if not exists public.vendor_bookings (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  booking_date date not null,
  event_name text,
  created_at timestamptz not null default now(),
  unique (vendor_id, booking_date)
);

create index if not exists vendor_bookings_vendor_idx on public.vendor_bookings (vendor_id);
create index if not exists vendor_bookings_date_idx on public.vendor_bookings (booking_date);

alter table public.vendor_bookings enable row level security;
-- APIs use the Supabase service role and enforce vendor ownership in application code.
