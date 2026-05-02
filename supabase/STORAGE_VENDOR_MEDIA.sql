-- Run in Supabase Dashboard → SQL Editor if uploads fail with "Bucket not found".
-- Same as supabase/migrations/004_vendor_city_state_and_storage.sql (storage section).

insert into storage.buckets (id, name, public)
values ('vendor-media', 'vendor-media', true)
on conflict (id) do update set public = excluded.public;

-- Optional: allow public read of objects (public bucket + public URLs).
-- If images still 403, add this policy (names may differ by project):
-- create policy "Public read vendor media"
--   on storage.objects for select
--   using (bucket_id = 'vendor-media');
