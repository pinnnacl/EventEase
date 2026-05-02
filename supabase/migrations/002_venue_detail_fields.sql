-- Optional rich fields for venue detail pages (gallery + facilities JSON)
alter table public.vendors
  add column if not exists gallery_images jsonb default '[]'::jsonb;

alter table public.vendors
  add column if not exists facilities jsonb default '[]'::jsonb;

comment on column public.vendors.gallery_images is 'JSON array of image URLs, e.g. ["https://..."]';
comment on column public.vendors.facilities is 'JSON array of facility labels, e.g. ["Parking","Stage"]';
