import { createHash } from "crypto";
import { embedText } from "./embeddingClient";
import { parseResponsiveImageField } from "./imageVariants";
import { insertWeaviateIndexLog } from "./weaviateIndexLog";
import { getWeaviateConfig, isWeaviateConfigured, weaviateGraphql, weaviateRequest } from "./weaviateClient";
import { getVendorById } from "./vendors";

function sha1(text) {
  return createHash("sha1").update(String(text)).digest("hex");
}

function hashToUuid(text) {
  const h = createHash("md5").update(String(text)).digest("hex"); // 32 hex
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * @param {ReturnType<typeof getVendorById> extends Promise<infer R> ? R["data"] : never} vendor
 */
export function extractVendorMediaEntries(vendor) {
  if (!vendor) return [];
  /** @type {{ mediaKey: string, imageUrl: string, raw: string, caption: string, tags: string[] }[]} */
  const out = [];

  const profileRaw = String(vendor.profileImageStored || vendor.profileImage || "").trim();
  if (profileRaw) {
    const p = parseResponsiveImageField(profileRaw);
    if (p?.large) {
      out.push({
        mediaKey: "profile",
        imageUrl: p.large,
        raw: profileRaw,
        caption: `${vendor.businessName || "Vendor"} ${vendor.category || "services"} profile image`,
        tags: [String(vendor.category || "").trim(), String(vendor.city || "").trim()].filter(Boolean),
      });
    }
  }

  const gallery = Array.isArray(vendor.galleryImages) ? vendor.galleryImages : [];
  for (const rawItem of gallery) {
    const raw = String(rawItem || "").trim();
    if (!raw) continue;
    const g = parseResponsiveImageField(raw);
    if (!g?.large) continue;
    out.push({
      mediaKey: `gallery-${sha1(raw).slice(0, 12)}`,
      imageUrl: g.large,
      raw,
      caption: `${vendor.businessName || "Vendor"} ${vendor.category || "services"} gallery image`,
      tags: [String(vendor.category || "").trim(), String(vendor.city || "").trim()].filter(Boolean),
    });
  }

  return out;
}

function buildSearchText(vendor, entry) {
  const parts = [
    vendor.businessName || "",
    vendor.category || "",
    vendor.city || "",
    vendor.state || "",
    vendor.place || "",
    entry.caption || "",
    ...(Array.isArray(entry.tags) ? entry.tags : []),
    entry.imageUrl || "",
  ].filter(Boolean);
  return parts.join(" | ");
}

function buildGraphqlByVendor(vendorId, className) {
  return `{
    Get {
      ${className}(where: { path: ["vendorId"], operator: Equal, valueText: "${esc(vendorId)}" }) {
        mediaId
        vendorId
        imageUrl
        _additional { id }
      }
    }
  }`;
}

/**
 * @param {string} vendorId
 */
export async function listWeaviateVendorObjects(vendorId) {
  const cfg = getWeaviateConfig();
  const q = buildGraphqlByVendor(vendorId, cfg.className);
  const gql = await weaviateGraphql(q);
  if (!gql.ok) {
    const msg = gql.json?.errors?.[0]?.message || gql.text || `GraphQL failed (${gql.status})`;
    throw new Error(msg);
  }
  const rows = gql.json?.data?.Get?.[cfg.className];
  return Array.isArray(rows) ? rows : [];
}

/**
 * @param {string} vendorId
 */
export async function reindexVendorMediaToWeaviate(vendorId) {
  if (!isWeaviateConfigured()) {
    return { ok: false, skipped: true, reason: "weaviate_not_configured", indexed: 0, failed: 0 };
  }

  const { data: vendor, error } = await getVendorById(vendorId);
  if (error || !vendor) {
    return { ok: false, skipped: true, reason: "vendor_not_found", indexed: 0, failed: 0 };
  }

  const cfg = getWeaviateConfig();
  const entries = extractVendorMediaEntries(vendor);

  // Remove previous objects for this vendor, then write fresh set.
  try {
    const existing = await listWeaviateVendorObjects(vendorId);
    for (const row of existing) {
      const id = row?._additional?.id;
      if (id) {
        await weaviateRequest("DELETE", `/v1/objects/${id}`);
      }
    }
  } catch (e) {
    console.error("[weaviate-ingest] purge failed:", e instanceof Error ? e.message : e);
  }

  let indexed = 0;
  let failed = 0;
  /** @type {{ mediaKey: string, error: string }[]} */
  const failures = [];

  for (const entry of entries) {
    const mediaId = `${vendorId}:${entry.mediaKey}`;
    const objectId = hashToUuid(mediaId);
    const text = buildSearchText(vendor, entry);

    try {
      const vector = await embedText(text);
      const payload = {
        id: objectId,
        class: cfg.className,
        vector,
        properties: {
          mediaId,
          vendorId: vendor.id,
          businessName: vendor.businessName || "",
          category: vendor.category || "",
          city: vendor.city || "",
          state: vendor.state || "",
          status: vendor.status || "",
          imageUrl: entry.imageUrl,
          caption: entry.caption || "",
          tags: Array.isArray(entry.tags) ? entry.tags : [],
          createdAt: new Date().toISOString(),
        },
      };

      const created = await weaviateRequest("POST", "/v1/objects", { body: payload });
      if (!created.ok) {
        const msg = created.json?.error?.[0]?.message || created.text || `create failed (${created.status})`;
        throw new Error(msg);
      }
      indexed += 1;
      await insertWeaviateIndexLog({
        vendorId: vendor.id,
        mediaKey: entry.mediaKey,
        imageUrl: entry.imageUrl,
        status: "success",
        vectorDim: Array.isArray(vector) ? vector.length : null,
      });
    } catch (e) {
      failed += 1;
      const msg = e instanceof Error ? e.message : String(e);
      failures.push({ mediaKey: entry.mediaKey, error: msg });
      await insertWeaviateIndexLog({
        vendorId: vendor.id,
        mediaKey: entry.mediaKey,
        imageUrl: entry.imageUrl,
        status: "failed",
        errorMessage: msg,
      });
    }
  }

  return {
    ok: failed === 0,
    skipped: false,
    vendorId,
    indexed,
    failed,
    total: entries.length,
    failures,
  };
}
