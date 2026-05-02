import { ingestRemoteImageForVendor } from "../../../lib/vendorRemoteImageIngestServer";
import { shouldIngestRemoteImageUrl } from "../../../lib/vendorUrlIngestUtils";
import { requireVendor, vendorGateErrorMessage } from "../../../lib/supabaseAuth";
import { getVendorByUser } from "../../../lib/vendors";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "32kb",
    },
  },
};

/** Same-vendor URL dedupe (short TTL) */
const ingestCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_ENTRIES = 50;

function cacheKey(vendorId, url) {
  return `${vendorId}\n${url.trim().toLowerCase()}`;
}

function cacheGet(key) {
  const e = ingestCache.get(key);
  if (!e) return null;
  if (Date.now() - e.at > CACHE_TTL_MS) {
    ingestCache.delete(key);
    return null;
  }
  return e.value;
}

function cacheSet(key, value) {
  if (ingestCache.size >= CACHE_MAX_ENTRIES) {
    const first = ingestCache.keys().next().value;
    ingestCache.delete(first);
  }
  ingestCache.set(key, { value, at: Date.now() });
}

function shouldLog() {
  return process.env.NODE_ENV !== "production" || process.env.LOG_IMAGE_UPLOAD === "1";
}

/**
 * POST JSON { imageUrl: string }
 * Same pipeline as file upload: fetch → Sharp → WebP variants → Supabase.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid JSON" });
  }

  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";
  if (!imageUrl) {
    return res.status(400).json({ ok: false, error: "Missing imageUrl" });
  }

  if (!shouldIngestRemoteImageUrl(imageUrl)) {
    return res.status(400).json({
      ok: false,
      error: "URL is already optimized or not a remote image URL",
    });
  }

  try {
    const gate = await requireVendor(req, res);
    if (!gate.ok) {
      return res.status(gate.status).json({ ok: false, error: vendorGateErrorMessage(gate.status) });
    }

    const { data: vendor, error: vErr } = await getVendorByUser(gate.user.id);
    if (vErr || !vendor) {
      return res.status(404).json({ ok: false, error: "No vendor profile" });
    }

    const ck = cacheKey(vendor.id, imageUrl);
    const cached = cacheGet(ck);
    if (cached) {
      return res.status(200).json({
        ok: true,
        url: cached.urls.large,
        urls: cached.urls,
        sourceUrl: imageUrl,
        cached: true,
        stored: cached.stored,
      });
    }

    const { urls, meta } = await ingestRemoteImageForVendor(vendor.id, imageUrl);

    if (shouldLog()) {
      console.log("[ingest-image-url]", JSON.stringify({ meta, source: imageUrl.slice(0, 120) }));
    }

    const stored = {
      thumb: urls.thumb.split("/").pop(),
      medium: urls.medium.split("/").pop(),
      large: urls.large.split("/").pop(),
    };

    const payload = {
      ok: true,
      url: urls.large,
      urls,
      sourceUrl: imageUrl,
      stored,
      format: "webp",
      meta,
    };

    cacheSet(ck, { urls, stored });

    return res.status(200).json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg.includes("abort") || msg.includes("timeout")) {
      return res.status(408).json({ ok: false, error: "Download timed out" });
    }
    if (msg.includes("NEXT_PUBLIC_SUPABASE") || msg.includes("SUPABASE")) {
      return res.status(500).json({ ok: false, error: "Server configuration error" });
    }
    return res.status(400).json({ ok: false, error: msg });
  }
}
