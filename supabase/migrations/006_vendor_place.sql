-- Short public-facing locality (vendors edit; full address line optional in `location`).
alter table public.vendors
  add column if not exists place text;

comment on column public.vendors.place is 'Area/locality shown on listings (e.g. Thiruvankulam); optional longer address may stay in location for maps.';
