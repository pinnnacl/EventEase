const { createClient } = require("@supabase/supabase-js");
const { createHash } = require("crypto");

function trim(v) {
  return v == null ? "" : String(v).trim();
}

function normalizeBaseUrl(raw) {
  const v = trim(raw);
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v.replace(/\/+$/, "");
  return `https://${v.replace(/\/+$/, "")}`;
}

function parseResponsive(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (s.startsWith("{")) {
    try {
      const o = JSON.parse(s);
      const large = o.large || o.medium || o.thumb;
      const medium = o.medium || o.large || o.thumb;
      const thumb = o.thumb || o.medium || o.large;
      if (large) return { thumb, medium, large };
    } catch {
      return null;
    }
  }
  return { thumb: s, medium: s, large: s };
}

function sha1(text) {
  return createHash("sha1").update(String(text)).digest("hex");
}

function hashToUuid(text) {
  const h = createHash("md5").update(String(text)).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

function hashTextEmbedding(text, dim = 256) {
  const out = new Array(dim).fill(0);
  for (let i = 0; i < dim; i++) {
    const seed = createHash("sha256").update(`${i}|${text}`).digest();
    const n = seed.readUInt16BE(0) / 65535;
    out[i] = n * 2 - 1;
  }
  return out;
}

async function openaiEmbedding(text) {
  const apiKey = trim(process.env.OPENAI_API_KEY);
  const model = trim(process.env.OPENAI_EMBEDDING_MODEL) || "text-embedding-3-small";
  const dims = Number(process.env.OPENAI_EMBEDDING_DIMENSIONS || 0);
  if (!apiKey) throw new Error("OPENAI_API_KEY missing for EMBEDDING_PROVIDER=openai");

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: String(text || "").slice(0, 8000),
      ...(Number.isFinite(dims) && dims > 0 ? { dimensions: dims } : {}),
    }),
  });
  const raw = await res.text();
  let json = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }
  if (!res.ok) throw new Error(json?.error?.message || raw || `OpenAI failed (${res.status})`);
  const emb = json?.data?.[0]?.embedding;
  if (!Array.isArray(emb) || emb.length === 0) throw new Error("Embedding missing");
  return emb.map((n) => Number(n));
}

async function geminiEmbedding(text) {
  const apiKey = trim(process.env.GEMINI_API_KEY);
  const model = trim(process.env.GEMINI_EMBEDDING_MODEL) || "text-embedding-004";
  const outputDimensionality = Number(process.env.GEMINI_EMBEDDING_DIMENSIONS || 0);
  if (!apiKey) throw new Error("GEMINI_API_KEY missing for EMBEDDING_PROVIDER=gemini");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:embedContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${model}`,
        content: {
          parts: [{ text: String(text || "").slice(0, 12000) }],
        },
        taskType: "RETRIEVAL_DOCUMENT",
        ...(Number.isFinite(outputDimensionality) && outputDimensionality > 0
          ? { outputDimensionality }
          : {}),
      }),
    },
  );
  const raw = await res.text();
  let json = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }
  if (!res.ok) throw new Error(json?.error?.message || raw || `Gemini failed (${res.status})`);
  const emb = json?.embedding?.values;
  if (!Array.isArray(emb) || emb.length === 0) throw new Error("Embedding missing");
  return emb.map((n) => Number(n));
}

async function weaviateRequest(baseUrl, apiKey, method, path, body) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, text, json };
}

function buildEntries(v) {
  const out = [];
  const profileRaw = trim(v.profile_image);
  if (profileRaw) {
    const p = parseResponsive(profileRaw);
    if (p && p.large) {
      out.push({ mediaKey: "profile", imageUrl: p.large, caption: `${v.business_name || "Vendor"} profile image` });
    }
  }
  const gallery = Array.isArray(v.gallery_images) ? v.gallery_images : [];
  for (const gRaw of gallery) {
    const raw = trim(gRaw);
    if (!raw) continue;
    const g = parseResponsive(raw);
    if (!g || !g.large) continue;
    out.push({
      mediaKey: `gallery-${sha1(raw).slice(0, 12)}`,
      imageUrl: g.large,
      caption: `${v.business_name || "Vendor"} gallery image`,
    });
  }
  return out;
}

async function main() {
  const supabaseUrl = trim(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
  const serviceRoleKey = trim(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const baseUrl = normalizeBaseUrl(process.env.WEAVIATE_URL);
  const apiKey = trim(process.env.WEAVIATE_API_KEY);
  const className = trim(process.env.WEAVIATE_CLASS_VENDOR_IMAGE) || "VendorImage";
  const provider = trim(process.env.EMBEDDING_PROVIDER || "hash-v1").toLowerCase();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!baseUrl || !apiKey) {
    throw new Error("Missing WEAVIATE_URL or WEAVIATE_API_KEY");
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: vendors, error } = await admin
    .from("vendors")
    .select("id,business_name,category,city,state,place,status,profile_image,gallery_images")
    .eq("status", "approved");

  if (error) throw new Error(error.message || "Could not load vendors");

  let total = 0;
  let ok = 0;
  let fail = 0;

  for (const v of vendors || []) {
    const entries = buildEntries(v);
    for (const e of entries) {
      total += 1;
      const mediaId = `${v.id}:${e.mediaKey}`;
      const objectId = hashToUuid(mediaId);
      const text = [
        v.business_name || "",
        v.category || "",
        v.city || "",
        v.state || "",
        v.place || "",
        e.caption || "",
        e.imageUrl || "",
      ]
        .filter(Boolean)
        .join(" | ");
      const vector =
        provider === "openai"
          ? await openaiEmbedding(text)
          : provider === "gemini"
            ? await geminiEmbedding(text)
            : hashTextEmbedding(text);

      const payload = {
        id: objectId,
        class: className,
        vector,
        properties: {
          mediaId,
          vendorId: v.id,
          businessName: v.business_name || "",
          category: v.category || "",
          city: v.city || "",
          state: v.state || "",
          status: v.status || "",
          imageUrl: e.imageUrl,
          caption: e.caption || "",
          tags: [v.category, v.city].filter(Boolean),
          createdAt: new Date().toISOString(),
        },
      };

      await weaviateRequest(baseUrl, apiKey, "DELETE", `/v1/objects/${objectId}`);
      const created = await weaviateRequest(baseUrl, apiKey, "POST", "/v1/objects", payload);
      if (created.ok) ok += 1;
      else {
        fail += 1;
        console.error(`[backfill] ${v.id} ${e.mediaKey} failed:`, created.text || created.status);
      }
    }
  }

  console.log(`[backfill] done total=${total} ok=${ok} failed=${fail}`);
}

main().catch((e) => {
  console.error("[backfill] error:", e instanceof Error ? e.message : e);
  process.exit(1);
});
