-- Admin-managed map coordinates for distance features (vendors do not edit these in-app).
alter table public.vendors
  add column if not exists latitude double precision;

alter table public.vendors
  add column if not exists longitude double precision;

comment on column public.vendors.latitude is 'WGS84 latitude; set by admin only';
comment on column public.vendors.longitude is 'WGS84 longitude; set by admin only';
