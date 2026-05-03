-- One active challenge per vendor user; service role only from API routes.
create table if not exists public.vendor_whatsapp_otp_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists vendor_whatsapp_otp_challenges_user_idx
  on public.vendor_whatsapp_otp_challenges (user_id, created_at desc);

comment on table public.vendor_whatsapp_otp_challenges is 'Stores hashed WhatsApp OTP codes for vendor profile verification (server-side only).';
