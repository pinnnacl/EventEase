-- Structured "Suitable For" event types on venue highlights.
alter table public.vendors
  add column if not exists suitable_for text[] not null default '{}';

comment on column public.vendors.suitable_for is 'Event types the venue supports: Weddings, Receptions, etc.';
