alter table public.vendors
  add column if not exists phone_verified_at timestamptz null,
  add column if not exists phone_verified_e164 text null;
