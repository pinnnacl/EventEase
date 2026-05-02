function trim(v) {
  return v == null ? "" : String(v).trim();
}

function normalizeBaseUrl(raw) {
  const v = trim(raw);
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v.replace(/\/+$/, "");
  return `https://${v.replace(/\/+$/, "")}`;
}

const cfg = {
  baseUrl: normalizeBaseUrl(process.env.WEAVIATE_URL),
  apiKey: trim(process.env.WEAVIATE_API_KEY),
  className: trim(process.env.WEAVIATE_CLASS_VENDOR_IMAGE) || "VendorImage",
};

if (!cfg.baseUrl || !cfg.apiKey) {
  console.error("Missing WEAVIATE_URL or WEAVIATE_API_KEY in environment.");
  process.exit(1);
}

function headers(hasBody) {
  const h = { Authorization: `Bearer ${cfg.apiKey}` };
  if (hasBody) h["Content-Type"] = "application/json";
  return h;
}

async function request(method, path, body) {
  const res = await fetch(`${cfg.baseUrl}${path}`, {
    method,
    headers: headers(Boolean(body)),
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

const vendorImageClass = {
  class: cfg.className,
  description: "Vendor media indexed for AI retrieval (phase 1 foundation)",
  vectorizer: "none",
  properties: [
    { name: "mediaId", dataType: ["text"], description: "Internal media id" },
    { name: "vendorId", dataType: ["text"], description: "Vendor id" },
    { name: "businessName", dataType: ["text"], description: "Vendor business name" },
    { name: "category", dataType: ["text"], description: "Venue/Photographer/Makeup/etc" },
    { name: "city", dataType: ["text"], description: "City" },
    { name: "state", dataType: ["text"], description: "State" },
    { name: "status", dataType: ["text"], description: "Approval status" },
    { name: "imageUrl", dataType: ["text"], description: "Canonical image URL" },
    { name: "caption", dataType: ["text"], description: "AI-generated or manual caption" },
    { name: "tags", dataType: ["text[]"], description: "Keyword tags" },
    { name: "createdAt", dataType: ["date"], description: "Object creation timestamp" },
  ],
};

async function run() {
  console.log(`[weaviate] base URL: ${cfg.baseUrl}`);
  console.log(`[weaviate] class: ${cfg.className}`);

  const meta = await request("GET", "/v1/meta");
  if (!meta.ok) {
    throw new Error(meta.json?.error?.[0]?.message || meta.text || `Meta check failed (${meta.status})`);
  }

  const schema = await request("GET", "/v1/schema");
  if (!schema.ok) {
    throw new Error(schema.json?.error?.[0]?.message || schema.text || `Schema read failed (${schema.status})`);
  }

  const exists = Array.isArray(schema.json?.classes)
    ? schema.json.classes.some((c) => c.class === vendorImageClass.class)
    : false;

  if (exists) {
    console.log(`[weaviate] class ${vendorImageClass.class} already exists`);
    return;
  }

  const created = await request("POST", "/v1/schema", vendorImageClass);
  if (!created.ok) {
    throw new Error(created.json?.error?.[0]?.message || created.text || `Class create failed (${created.status})`);
  }
  console.log(`[weaviate] created class ${vendorImageClass.class}`);
}

run()
  .then(() => console.log("[weaviate] schema init complete"))
  .catch((err) => {
    console.error("[weaviate] init failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
