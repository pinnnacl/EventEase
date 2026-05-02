-- Tracks per-media indexing attempts into Weaviate for diagnostics/retry workflows.
create table if not exists public.weaviate_media_index_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  media_key text not null,
  image_url text not null,
  status text not null check (status in ('success', 'failed', 'skipped')),
  error_message text,
  vector_dim int
);

create index if not exists weaviate_media_index_logs_vendor_created_idx
  on public.weaviate_media_index_logs (vendor_id, created_at desc);

comment on table public.weaviate_media_index_logs is
  'Write-ahead log of Weaviate indexing attempts for vendor images.';
