-- Explicit city / state for listings (optional; falls back to parsing `location` when null)
alter table public.vendors
  add column if not exists city text;

alter table public.vendors
  add column if not exists state text;

comment on column public.vendors.city is 'Display city, e.g. Kochi';
comment on column public.vendors.state is 'Display state, e.g. Kerala';

-- Public bucket for vendor-uploaded images (uploads go through server API with service role)
insert into storage.buckets (id, name, public)
values ('vendor-media', 'vendor-media', true)
on conflict (id) do update set public = excluded.public;
