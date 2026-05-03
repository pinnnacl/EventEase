-- Remember which number each WhatsApp OTP was sent to (profile field can differ from DB until verified).
alter table public.vendor_whatsapp_otp_challenges
  add column if not exists destination_digits text;

alter table public.vendor_whatsapp_otp_challenges
  add column if not exists client_phone_input text;

comment on column public.vendor_whatsapp_otp_challenges.destination_digits is 'International digits only (no +) used as WhatsApp Cloud API `to` for this challenge.';
comment on column public.vendor_whatsapp_otp_challenges.client_phone_input is 'Raw phone string from vendor profile form to store on vendors.phone after successful verify.';
