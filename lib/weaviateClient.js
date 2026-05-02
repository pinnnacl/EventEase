function trim(v) {
  return v == null ? "" : String(v).trim();
}

function normalizeBaseUrl(raw) {
  const v = trim(raw);
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v.replace(/\/+$/, "");
  return `https://${v.replace(/\/+$/, "")}`;
}

export function getWeaviateConfig() {
  return {
    baseUrl: normalizeBaseUrl(process.env.WEAVIATE_URL),
    apiKey: trim(process.env.WEAVIATE_API_KEY),
    className: trim(process.env.WEAVIATE_CLASS_VENDOR_IMAGE) || "VendorImage",
  };
}

export function isWeaviateConfigured() {
  const cfg = getWeaviateConfig();
  return Boolean(cfg.baseUrl && cfg.apiKey);
}

function buildHeaders(hasBody) {
  const cfg = getWeaviateConfig();
  const headers = {
    Authorization: `Bearer ${cfg.apiKey}`,
  };
  if (hasBody) headers["Content-Type"] = "application/json";
  return headers;
}

/**
 * @param {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} method
 * @param {string} path
 * @param {{ body?: object, timeoutMs?: number }} [options]
 */
export async function weaviateRequest(method, path, options = {}) {
  const cfg = getWeaviateConfig();
  if (!cfg.baseUrl || !cfg.apiKey) {
    throw new Error("Missing WEAVIATE_URL or WEAVIATE_API_KEY");
  }

  const timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : 15000;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);

  try {
    const hasBody = options.body != null;
    const res = await fetch(`${cfg.baseUrl}${path}`, {
      method,
      headers: buildHeaders(hasBody),
      body: hasBody ? JSON.stringify(options.body) : undefined,
      signal: ctl.signal,
    });
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    return { ok: res.ok, status: res.status, text, json };
  } finally {
    clearTimeout(t);
  }
}

export async function getWeaviateMeta() {
  return weaviateRequest("GET", "/v1/meta");
}

export async function getWeaviateSchema() {
  return weaviateRequest("GET", "/v1/schema");
}

/** @param {string} query */
export async function weaviateGraphql(query) {
  return weaviateRequest("POST", "/v1/graphql", { body: { query } });
}

export async function ensureWeaviateClass(classPayload) {
  const schema = await getWeaviateSchema();
  if (!schema.ok) {
    const msg = schema.json?.error?.[0]?.message || schema.text || `Schema read failed (${schema.status})`;
    throw new Error(msg);
  }

  const exists = Array.isArray(schema.json?.classes)
    ? schema.json.classes.some((c) => c.class === classPayload.class)
    : false;
  if (exists) {
    return { created: false, className: classPayload.class };
  }

  const created = await weaviateRequest("POST", "/v1/schema", { body: classPayload });
  if (!created.ok) {
    const msg = created.json?.error?.[0]?.message || created.text || `Class create failed (${created.status})`;
    throw new Error(msg);
  }
  return { created: true, className: classPayload.class };
}
