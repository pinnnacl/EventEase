-- Allow admin-created vendor rows without a linked vendor auth user (bulk onboarding / listings first).
-- Real vendors still have unique user_id when present.

alter table public.vendors alter column user_id drop not null;

alter table public.vendors drop constraint if exists vendors_user_id_key;

create unique index if not exists vendors_user_id_unique_when_present
  on public.vendors (user_id)
  where user_id is not null;

comment on column public.vendors.user_id is
  'Auth user owning this vendor row; NULL when created by admin until a vendor claims/links an account.';
