import { getWeaviateConfig, getWeaviateMeta, getWeaviateSchema, isWeaviateConfigured } from "../../../lib/weaviateClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const cfg = getWeaviateConfig();
  if (!isWeaviateConfigured()) {
    return res.status(503).json({
      ok: false,
      configured: false,
      error: "Missing WEAVIATE_URL or WEAVIATE_API_KEY",
      className: cfg.className,
    });
  }

  try {
    const [meta, schema] = await Promise.all([getWeaviateMeta(), getWeaviateSchema()]);

    const classFound = schema.ok && Array.isArray(schema.json?.classes)
      ? schema.json.classes.some((c) => c.class === cfg.className)
      : false;

    const healthy = meta.ok && schema.ok;
    const message = healthy ? "Weaviate reachable" : "Weaviate request failed";

    return res.status(healthy ? 200 : 502).json({
      ok: healthy,
      configured: true,
      message,
      baseUrl: cfg.baseUrl,
      className: cfg.className,
      classFound,
      metaStatus: meta.status,
      schemaStatus: schema.status,
      metaVersion: meta.json?.version || null,
      errors: [
        ...(meta.ok ? [] : [meta.json?.error?.[0]?.message || meta.text || `meta ${meta.status}`]),
        ...(schema.ok ? [] : [schema.json?.error?.[0]?.message || schema.text || `schema ${schema.status}`]),
      ],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({
      ok: false,
      configured: true,
      error: msg,
      baseUrl: cfg.baseUrl,
      className: cfg.className,
    });
  }
}
