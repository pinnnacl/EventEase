-- Structured venue details (predefined + custom key-value rows) for vendor portal & public page.
alter table public.vendors
  add column if not exists venue_details jsonb default '[]'::jsonb;

comment on column public.vendors.venue_details is 'Array of { title, description, isCustom } for Venue Details section';
