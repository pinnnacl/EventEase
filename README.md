# THAALI

Event planning platform powered by Next.js + Supabase.

## Weaviate Phase 1 (Foundation)

This repo includes a Phase 1 foundation for Weaviate:

- Server-only Weaviate client wrapper: `lib/weaviateClient.js`
- Idempotent schema init script: `scripts/weaviate/initSchema.mjs`
- Dev health endpoint: `GET /api/dev/weaviate-health`

### 1) Configure environment

Add these to `.env.local`:

- `WEAVIATE_URL` (e.g. `https://<cluster>.weaviate.cloud`)
- `WEAVIATE_API_KEY`
- optional: `WEAVIATE_CLASS_VENDOR_IMAGE` (defaults to `VendorImage`)

### 2) Initialize schema

Run:

```bash
npm run weaviate:init
```

This creates the `VendorImage` class if it does not exist.

### 3) Verify connectivity

Start dev server and hit:

```bash
GET /api/dev/weaviate-health
```

Expected response includes:

- `ok: true`
- `classFound: true`
- `metaVersion`

## Weaviate Phase 2 (Ingestion MVP)

Implemented:

- `lib/weaviateIngest.js` — rebuild vendor media objects in Weaviate
- `lib/embeddingClient.js` — deterministic `hash-v1` embedding fallback
- `lib/weaviateIndexLog.js` — indexing attempt logs to Supabase
- upload/update API hooks reindex media after profile/gallery changes
- dev diagnostics: `GET /api/dev/weaviate-ingest-check?vendorId=<id>`
- backfill script: `npm run weaviate:backfill`

### Apply migration

Run Supabase migration:

- `supabase/migrations/012_weaviate_media_index_logs.sql`

### Backfill existing approved vendors

```bash
npm run weaviate:backfill
```

### OpenAI embeddings (text retrieval first)

Add to `.env.local`:

- `EMBEDDING_PROVIDER=openai`
- `OPENAI_API_KEY=...`
- `OPENAI_EMBEDDING_MODEL=text-embedding-3-small`

Then reindex all objects:

```bash
npm run weaviate:backfill
```

Test semantic retrieval endpoint:

```bash
POST /api/ai/search/text
{
  "query": "traditional kerala wedding stage with warm lights",
  "limit": 12
}
```

### Gemini embeddings (alternative)

Add to `.env.local`:

- `EMBEDDING_PROVIDER=gemini`
- `GEMINI_API_KEY=...`
- `GEMINI_EMBEDDING_MODEL=text-embedding-004`

Then reindex:

```bash
npm run weaviate:backfill
```
