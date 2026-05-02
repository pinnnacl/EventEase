-- Outbound WhatsApp Cloud API sends (audit / debugging).
create table if not exists public.whatsapp_outbound_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  to_digits text not null,
  template_name text not null,
  status text not null check (status in ('sent', 'failed')),
  vendor_id uuid references public.vendors (id) on delete set null,
  message_id text,
  error_message text,
  attempts int,
  payload jsonb
);

create index if not exists whatsapp_outbound_logs_created_at_idx
  on public.whatsapp_outbound_logs (created_at desc);

comment on table public.whatsapp_outbound_logs is
  'Server-side WhatsApp Cloud API template sends from THAALI.';
