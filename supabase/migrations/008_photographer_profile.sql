-- Marketing-focused configurable fields for Photographer public profile pages.
alter table public.vendors
  add column if not exists photographer_profile jsonb default '{}'::jsonb;

comment on column public.vendors.photographer_profile is
  'JSON config for photographer public profile (tagline, heroImage, locations, startingPrice, deliverables, gallery, ratings, reviews, offer, packages, trust)';
