-- Marketing / profile JSON for Makeup category public pages (Velvet & Gilded layout).
alter table public.vendors
  add column if not exists makeup_profile jsonb default '{}'::jsonb;

comment on column public.vendors.makeup_profile is
  'JSON config for makeup artist public profile (specialty, stats, packages, testimonials, studio, urgency, whatsapp, beforeAfter, serviceBlurbs)';
