import { embedText } from "../../../../lib/embeddingClient";
import { getWeaviateConfig, isWeaviateConfigured, weaviateGraphql } from "../../../../lib/weaviateClient";
import { getApprovedVendors, getApprovedVendorsByIds } from "../../../../lib/vendors";
import { calculateDistance, isValidLatLng } from "../../../../utils/distance";
import { generateAnswer } from "../../../../lib/geminiClient";

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildQuery({ className, vector, limit, category }) {
  const nearVector = `nearVector: { vector: [${vector.join(",")}] }`;
  const where =
    category && category.trim()
      ? `, where: { path: ["category"], operator: Equal, valueText: "${esc(category.trim())}" }`
      : "";
  return `{
    Get {
      ${className}(${nearVector}, limit: ${limit}${where}) {
        mediaId
        vendorId
        businessName
        category
        city
        imageUrl
        _additional { id distance }
      }
    }
  }`;
}

function formatKm(km) {
  if (!Number.isFinite(km)) return null;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function queryHasBudgetIntent(query) {
  const q = normalizeText(query);
  if (!q) return false;
  return /\b(budget|below|under|within|upto|up to|price|pricing|lakh|lack|lac|lacs|crore|cr)\b/.test(q);
}

function queryLooksVenueSpecific(query) {
  const q = normalizeText(query);
  if (!q) return false;
  const tokens = [
    "venue",
    "venues",
    "auditorium",
    "hall",
    "beach wedding",
    "beach",
    "resort",
    "banquet",
    "wedding hall",
  ];
  return tokens.some((t) => q.includes(t));
}

function extractConstraintTokens(query) {
  const q = normalizeText(query);
  if (!q) return [];
  const stop = new Set([
    "find",
    "show",
    "list",
    "list out",
    "me",
    "the",
    "a",
    "an",
    "for",
    "in",
    "on",
    "at",
    "near",
    "from",
    "with",
    "and",
    "or",
    "to",
    "of",
    "is",
    "this",
    "that",
    "i",
    "need",
    "want",
    "wedding",
    "venue",
    "venues",
    "kerala",
    "budget",
    "below",
    "under",
    "within",
    "upto",
    "price",
    "pricing",
    "lakh",
    "lakhs",
    "lack",
    "lacs",
  ]);
  return q
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 4 && !stop.has(t));
}

function vendorSearchableText(vendor) {
  if (!vendor || typeof vendor !== "object") return "";
  return normalizeText(
    [
      vendor.businessName,
      vendor.category,
      vendor.city,
      vendor.state,
      vendor.place,
      vendor.description,
      vendor.pricingRange,
      vendor.capacity,
      ...(Array.isArray(vendor.facilities) ? vendor.facilities : []),
      ...(Array.isArray(vendor.venueDetails) ? vendor.venueDetails.map((d) => `${d?.title || ""} ${d?.description || ""}`) : []),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function isBroadRegion(label) {
  const t = normalizeText(label);
  return t === "kerala" || t === "india" || t === "south india";
}

function filterRelevantResults(query, rows) {
  const input = Array.isArray(rows) ? rows : [];
  if (input.length === 0) return [];
  const wantsVenue = queryLooksVenueSpecific(query);
  const hasExplicitLocation = Boolean(extractOriginPlace(query));
  const budgetIntent = queryHasBudgetIntent(query);
  const distanceThreshold = budgetIntent ? 0.5 : 0.36;
  const constraintTokens = extractConstraintTokens(query);
  return input.filter((r) => {
    const d = Number(r?.distance);
    // Conservative relevance threshold. Higher distance tends to mean semantic mismatch.
    if (!Number.isFinite(d) || d > distanceThreshold) return false;
    if (wantsVenue) {
      const category = String(r?.vendor?.category || "").toLowerCase();
      if (category !== "venue") return false;
    }
    if (constraintTokens.length > 0 && !hasExplicitLocation) {
      const text = vendorSearchableText(r?.vendor);
      if (!text) return false;
      const matchedAnyConstraint = constraintTokens.some((token) => text.includes(token));
      if (!matchedAnyConstraint) return false;
    }
    return true;
  });
}

function extractRadiusKm(query) {
  const q = String(query || "").toLowerCase();
  if (!q) return null;
  const m = q.match(/(\d+(?:\.\d+)?)\s*km\b/);
  if (m?.[1]) {
    const km = Number(m[1]);
    if (Number.isFinite(km) && km > 0) return Math.min(km, 200);
  }
  // Product rule: "near <place>" implies 5km radius by default.
  if (/\bnear\b/i.test(q)) return 5;
  return null;
}

function parseMoneyToInr(amount, unit) {
  const n = Number(String(amount || "").replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  const u = String(unit || "").toLowerCase().trim();
  if (!u) return Math.round(n);
  if (u === "k" || u === "thousand") return Math.round(n * 1_000);
  if (u === "lakh" || u === "lakhs" || u === "lack" || u === "lac" || u === "lacs") return Math.round(n * 100_000);
  if (u === "cr" || u === "crore" || u === "crores") return Math.round(n * 10_000_000);
  return Math.round(n);
}

function extractBudgetCapInr(query) {
  const q = String(query || "").toLowerCase();
  if (!q) return null;
  const patterns = [
    /(?:below|under|less than|within|up to|upto|max(?:imum)?)\s*₹?\s*([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lakhs|lack|lac|lacs|cr|crore|crores)?/i,
    /budget[^0-9]{0,20}([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lakhs|lack|lac|lacs|cr|crore|crores)?/i,
  ];
  for (const p of patterns) {
    const m = q.match(p);
    if (m?.[1]) {
      const inr = parseMoneyToInr(m[1], m[2]);
      if (Number.isFinite(inr) && inr > 0) return inr;
    }
  }
  return null;
}

function parseVendorPriceCapInr(vendor) {
  const raw = String(vendor?.pricingRange || vendor?.priceRange || "").toLowerCase();
  if (!raw) return null;
  const s = raw.replace(/[₹,\s]/g, "");
  const token = /(\d+(?:\.\d+)?)(crores?|cr|lakhs?|k|thousand)?/g;
  /** @type {number[]} */
  const vals = [];
  let m;
  while ((m = token.exec(s)) !== null) {
    const inr = parseMoneyToInr(m[1], m[2]);
    if (Number.isFinite(inr) && inr > 0) vals.push(inr);
  }
  if (vals.length === 0) return null;
  return Math.max(...vals);
}

function estimateDriveMinutes(km) {
  if (!Number.isFinite(km)) return null;
  // Rough estimate for mixed city/suburban roads.
  const roadKm = km * 1.28;
  const mins = Math.round((roadKm / 28) * 60);
  return Math.max(2, mins);
}

function toTitleCasePlace(s) {
  return String(s || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function extractOriginPlace(query) {
  const q = String(query || "").trim();
  if (!q) return "";
  const stopWords =
    "(?:with|under|below|within|upto|up\\s+to|budget|price|prize|cost|around|for|that|which|and)";
  const patterns = [
    new RegExp(`\\bfrom\\s+([a-zA-Z][a-zA-Z\\s.-]{1,60}?)(?=\\s+${stopWords}\\b|\\?|,|\\.|$)`, "i"),
    new RegExp(`\\bnear\\s+([a-zA-Z][a-zA-Z\\s.-]{1,60}?)(?=\\s+${stopWords}\\b|\\?|,|\\.|$)`, "i"),
    new RegExp(`\\bin\\s+([a-zA-Z][a-zA-Z\\s.-]{1,60}?)(?=\\s+${stopWords}\\b|\\?|,|\\.|$)`, "i"),
  ];
  for (const p of patterns) {
    const m = q.match(p);
    if (m?.[1]) return toTitleCasePlace(m[1]);
  }
  return "";
}

async function geocodePlace(place) {
  const q = String(place || "").trim();
  if (!q) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(
    `${q}, Kerala, India`
  )}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      // Required by Nominatim usage policy; keep generic app identifier.
      "User-Agent": "eventease-kerala/1.0",
    },
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => []);
  const first = Array.isArray(data) ? data[0] : null;
  const lat = Number(first?.lat);
  const lon = Number(first?.lon);
  if (!isValidLatLng(lat, lon)) return null;
  return { lat, lng: lon };
}

async function buildAnswer(query, results) {
  const trimmed = String(query || "").trim();
  if (!Array.isArray(results) || results.length === 0) {
    return `No matching vendor is available in the application for "${trimmed}" right now. Please try a different location/style or add more details.`;
  }

  const top = results.slice(0, 2);
  const names = top.map((r) => String(r?.vendor?.businessName || "").trim()).filter(Boolean);
  const nameText = names.length === 2 ? `${names[0]} and ${names[1]}` : names[0] || "the top venues";

  const origin = extractOriginPlace(trimmed);
  if (!origin) {
    return `Top matches for "${trimmed}" are ${nameText}. Add "from <place>" in your query if you want exact distance and travel-time estimates.`;
  }
  if (isBroadRegion(origin)) {
    return `I found ${nameText}, but I cannot provide meaningful point-to-point distance from a broad region like "${origin}". Please mention a specific town/locality (for example, "from Ambadimala").`;
  }

  let originCoord = null;
  try {
    originCoord = await geocodePlace(origin);
  } catch {
    originCoord = null;
  }
  if (!originCoord) {
    return `I found ${nameText}, but I could not resolve "${origin}" accurately to calculate distance. Try a nearby landmark or a fuller location name.`;
  }

  const withDistance = top
    .map((r) => {
      const v = r?.vendor;
      const lat = Number(v?.lat);
      const lng = Number(v?.lng);
      if (!isValidLatLng(lat, lng)) return null;
      const km = calculateDistance(originCoord.lat, originCoord.lng, lat, lng);
      if (!Number.isFinite(km)) return null;
      return { name: String(v?.businessName || "Venue"), km };
    })
    .filter(Boolean);

  if (withDistance.length === 0) {
    return `I found ${nameText}, but those vendors do not yet have map coordinates saved, so I cannot compute exact distance from ${origin}.`;
  }

  const primary = withDistance[0];
  const mins = estimateDriveMinutes(primary.km);
  const extra = withDistance[1]
    ? ` Another nearby option is ${withDistance[1].name} at about ${formatKm(withDistance[1].km)}.`
    : "";
  const minsText = mins ? ` and roughly ${mins} minutes by road` : "";
  return `${primary.name} is approximately ${formatKm(primary.km)} from ${origin}${minsText}.${extra}`;
}

/**
 * POST { query: string, limit?: number, category?: string }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!isWeaviateConfigured()) {
    return res.status(503).json({ ok: false, error: "Weaviate is not configured" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid JSON body" });
  }

  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (!query) {
    return res.status(400).json({ ok: false, error: "Missing query" });
  }
  const limit = Math.min(Math.max(Number(body?.limit) || 12, 1), 40);
  // Weaviate rows are media-level. Over-fetch so dedup-by-vendor still leaves enough unique vendors.
  const retrievalLimit = Math.min(Math.max(limit * 8, 24), 200);
  const category = typeof body?.category === "string" ? body.category : "";

  try {
    const vector = await embedText(query);
    const className = getWeaviateConfig().className;
    const gql = await weaviateGraphql(buildQuery({ className, vector, limit: retrievalLimit, category }));
    if (!gql.ok) {
      const msg = gql.json?.errors?.[0]?.message || gql.text || `Weaviate query failed (${gql.status})`;
      return res.status(502).json({ ok: false, error: msg });
    }

    const rows = Array.isArray(gql.json?.data?.Get?.[className]) ? gql.json.data.Get[className] : [];
    /** @type {Map<string, any>} */
    const bestByVendor = new Map();
    for (const row of rows) {
      const vendorId = String(row?.vendorId || "").trim();
      if (!vendorId) continue;
      const prev = bestByVendor.get(vendorId);
      const curDistance = Number.isFinite(Number(row?._additional?.distance)) ? Number(row._additional.distance) : Number.POSITIVE_INFINITY;
      const prevDistance = Number.isFinite(Number(prev?._additional?.distance))
        ? Number(prev._additional.distance)
        : Number.POSITIVE_INFINITY;
      if (!prev || curDistance < prevDistance) {
        bestByVendor.set(vendorId, row);
      }
    }
    const dedupedRows = Array.from(bestByVendor.values()).sort((a, b) => {
      const ad = Number.isFinite(Number(a?._additional?.distance)) ? Number(a._additional.distance) : Number.POSITIVE_INFINITY;
      const bd = Number.isFinite(Number(b?._additional?.distance)) ? Number(b._additional.distance) : Number.POSITIVE_INFINITY;
      return ad - bd;
    });
    const vendorIds = dedupedRows.map((r) => String(r.vendorId || "")).filter(Boolean);
    const { data: vendors, error: vErr } = await getApprovedVendorsByIds(vendorIds);
    if (vErr) {
      return res.status(500).json({ ok: false, error: vErr.message || "Could not load vendor details" });
    }

    const byVendor = Object.fromEntries((vendors || []).map((v) => [v.id, v]));
    const results = dedupedRows.map((r) => ({
      mediaId: r.mediaId || null,
      vendorId: r.vendorId || null,
      distance: r?._additional?.distance ?? null,
      imageUrl: r.imageUrl || null,
      vendor: r.vendorId ? byVendor[r.vendorId] || null : null,
    }));
    const relevantResults = filterRelevantResults(query, results);
    let finalResults = relevantResults;

    // If the user asks for a distance radius (e.g. "10km from Thiruvankulam"),
    // enforce true geo-distance filtering using vendor coordinates.
    const radiusKm = extractRadiusKm(query);
    const origin = extractOriginPlace(query);
    let originCoord = null;
    if (radiusKm && origin && !isBroadRegion(origin)) {
      try {
        originCoord = await geocodePlace(origin);
        if (originCoord) {
          finalResults = relevantResults.filter((r) => {
            const lat = Number(r?.vendor?.lat);
            const lng = Number(r?.vendor?.lng);
            if (!isValidLatLng(lat, lng)) return false;
            const km = calculateDistance(originCoord.lat, originCoord.lng, lat, lng);
            return Number.isFinite(km) && km <= radiusKm;
          });
        }
      } catch {
        // Keep semantic results if geocoding/radius filtering cannot run.
      }
    }

    const budgetCapInr = extractBudgetCapInr(query);
    if (budgetCapInr) {
      finalResults = finalResults.filter((r) => {
        const cap = parseVendorPriceCapInr(r?.vendor);
        if (!Number.isFinite(cap)) return false;
        return cap <= budgetCapInr;
      });
    }

    // Fallback path: if a clear budget intent exists but semantic retrieval is empty,
    // return approved venues that satisfy numeric constraints.
    if (finalResults.length === 0 && budgetCapInr) {
      const { data: approvedVenues, error: approvedErr } = await getApprovedVendors({ category: "Venue" });
      if (!approvedErr) {
        let fallback = (approvedVenues || [])
          .filter((v) => {
            const cap = parseVendorPriceCapInr(v);
            return Number.isFinite(cap) && cap <= budgetCapInr;
          })
          .map((v) => ({
            mediaId: null,
            vendorId: v.id || null,
            distance: null,
            imageUrl: v.profileImage || null,
            vendor: v,
          }));

        if (radiusKm && origin && !isBroadRegion(origin)) {
          try {
            const fallbackOriginCoord = originCoord || (await geocodePlace(origin));
            originCoord = fallbackOriginCoord || originCoord;
            if (fallbackOriginCoord) {
              fallback = fallback.filter((r) => {
                const lat = Number(r?.vendor?.lat);
                const lng = Number(r?.vendor?.lng);
                if (!isValidLatLng(lat, lng)) return false;
                const km = calculateDistance(fallbackOriginCoord.lat, fallbackOriginCoord.lng, lat, lng);
                return Number.isFinite(km) && km <= radiusKm;
              });
            }
          } catch {
            // keep numeric budget fallback even if geocoding fails
          }
        }

        fallback.sort((a, b) => {
          const ap = Number(parseVendorPriceCapInr(a?.vendor) || Number.POSITIVE_INFINITY);
          const bp = Number(parseVendorPriceCapInr(b?.vendor) || Number.POSITIVE_INFINITY);
          return ap - bp;
        });
        finalResults = fallback.slice(0, limit);
      }
    }

    const llmEnabled = String(process.env.GEMINI_LLM_ENABLED || "").trim().toLowerCase() === "true";
    console.log("[ai-search] llmEnabled:", llmEnabled);
    let answerText = "";
    if (llmEnabled) {
      try {
        answerText = await generateAnswer(query, finalResults);
        if (answerText) {
          console.log("[ai-search] answer source: gemini-llm");
        }
      } catch (e) {
        console.error("[ai-search] Gemini LLM fallback:", e instanceof Error ? e.message : e);
      }
    }
    if (!answerText) {
      answerText = await buildAnswer(query, finalResults);
      console.log("[ai-search] answer source: fallback-buildAnswer");
    }

    finalResults = finalResults
      .map((r) => {
        if (!originCoord || !origin || isBroadRegion(origin)) return r;
        const lat = Number(r?.vendor?.lat);
        const lng = Number(r?.vendor?.lng);
        if (!isValidLatLng(lat, lng)) return r;
        const km = calculateDistance(originCoord.lat, originCoord.lng, lat, lng);
        if (!Number.isFinite(km)) return r;
        return {
          ...r,
          distanceKm: Number(km.toFixed(1)),
          distanceFrom: origin,
        };
      })
      .slice(0, limit);

    return res.status(200).json({
      ok: true,
      query,
      count: finalResults.length,
      answer: answerText,
      results: finalResults,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
