-- Structured venue highlights for summary cards, filters, and badges.
alter table public.vendors
  add column if not exists venue_type text,
  add column if not exists years_in_business integer,
  add column if not exists guest_capacity integer,
  add column if not exists dining_capacity integer,
  add column if not exists parking_capacity integer,
  add column if not exists air_conditioned boolean not null default false,
  add column if not exists stage_available boolean not null default false,
  add column if not exists wheelchair_accessible boolean not null default false,
  add column if not exists featured_venue boolean not null default false,
  add column if not exists verified_venue boolean not null default false;

comment on column public.vendors.venue_type is 'Venue subtype: Auditorium, Wedding Hall, etc.';
comment on column public.vendors.years_in_business is 'Years hosting events; shown as "N+ Years Hosting Events"';
comment on column public.vendors.guest_capacity is 'Primary numeric guest capacity for listings and mobile summary';
comment on column public.vendors.dining_capacity is 'Numeric dining / seated meal capacity';
comment on column public.vendors.parking_capacity is 'Numeric car parking capacity';
comment on column public.vendors.air_conditioned is 'Venue is fully air conditioned';
comment on column public.vendors.stage_available is 'Stage available on premises';
comment on column public.vendors.wheelchair_accessible is 'Wheelchair accessible venue';
comment on column public.vendors.featured_venue is 'Admin: featured on marketplace surfaces';
comment on column public.vendors.verified_venue is 'Admin: verified badge on public profile';
