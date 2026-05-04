import { embedText } from "../../../../lib/embeddingClient";
import { getWeaviateConfig, isWeaviateConfigured, weaviateGraphql } from "../../../../lib/weaviateClient";
import { getApprovedVendors, getApprovedVendorsByIds } from "../../../../lib/vendors";
import { calculateDistance, isValidLatLng } from "../../../../utils/distance";
import { generateAnswer } from "../../../../lib/geminiClient";
import { parseUserIntent } from "../../../../lib/parseUserIntent";
import { buildRuleBasedIntent } from "../../../../lib/ruleBasedIntent";
import { intentServiceCategories } from "../../../../lib/intentSchema";
import {
  buildAnswer,
  extractBudgetCapInr,
  extractOriginPlace,
  filterRelevantResults,
  geocodePlace,
  isBroadRegion,
  parseVendorPriceCapInr,
  extractRadiusKm,
} from "../../../../lib/aiSearchHeuristics";
import { filterRowsByGuestCount, filterRowsByIntentServices } from "../../../../lib/intentSearchFilters";
import { sortResultsByIntentScore, stripRankScores } from "../../../../lib/vendorIntentRanking";

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
  const retrievalLimit = Math.min(Math.max(limit * 8, 24), 200);
  const bodyCategory = typeof body?.category === "string" ? body.category.trim() : "";

  let intent;
  let intentSource = "rules";
  try {
    const parsed = await parseUserIntent(query);
    intent = parsed.intent;
    intentSource = parsed.source;
  } catch (e) {
    console.error("[ai-search] parseUserIntent:", e instanceof Error ? e.message : e);
    intent = buildRuleBasedIntent(query);
    intentSource = "rules";
  }

  const intentCats = intentServiceCategories(intent);
  let weaviateCategory = bodyCategory;
  if (!weaviateCategory && intentCats.length === 1) {
    weaviateCategory = intentCats[0];
  }

  try {
    const vector = await embedText(query);
    const className = getWeaviateConfig().className;
    const gql = await weaviateGraphql(buildQuery({ className, vector, limit: retrievalLimit, category: weaviateCategory }));
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
    const relevantResults = filterRelevantResults(query, results, intent);
    let finalResults = filterRowsByIntentServices(relevantResults, intent);
    finalResults = filterRowsByGuestCount(finalResults, intent);

    const radiusKm = extractRadiusKm(query);
    const originLabel = (() => {
      const fromQuery = extractOriginPlace(query);
      if (fromQuery) return fromQuery;
      const loc = typeof intent?.location === "string" ? intent.location.trim() : "";
      return loc && !isBroadRegion(loc) ? loc : "";
    })();

    let originCoord = null;
    if (radiusKm && originLabel && !isBroadRegion(originLabel)) {
      try {
        originCoord = await geocodePlace(originLabel);
        if (originCoord) {
          finalResults = finalResults.filter((r) => {
            const lat = Number(r?.vendor?.lat);
            const lng = Number(r?.vendor?.lng);
            if (!isValidLatLng(lat, lng)) return false;
            const km = calculateDistance(originCoord.lat, originCoord.lng, lat, lng);
            return Number.isFinite(km) && km <= radiusKm;
          });
        }
      } catch {
        // keep semantic results if geocoding/radius filtering cannot run.
      }
    }

    const budgetCapInr =
      Number.isFinite(Number(intent?.budget)) && Number(intent.budget) > 0
        ? Number(intent.budget)
        : extractBudgetCapInr(query);

    if (budgetCapInr) {
      finalResults = finalResults.filter((r) => {
        const cap = parseVendorPriceCapInr(r?.vendor);
        if (!Number.isFinite(cap)) return false;
        return cap <= budgetCapInr;
      });
    }

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

        fallback = filterRowsByIntentServices(fallback, intent);
        fallback = filterRowsByGuestCount(fallback, intent);

        if (radiusKm && originLabel && !isBroadRegion(originLabel)) {
          try {
            const fallbackOriginCoord = originCoord || (await geocodePlace(originLabel));
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

    if (!originCoord && originLabel && !isBroadRegion(originLabel)) {
      try {
        originCoord = await geocodePlace(originLabel);
      } catch {
        originCoord = null;
      }
    }

    const ranked = sortResultsByIntentScore(finalResults, intent, { originCoord });

    const llmEnabled = String(process.env.GEMINI_LLM_ENABLED || "").trim().toLowerCase() === "true";
    let answerText = "";
    if (llmEnabled) {
      try {
        answerText = await generateAnswer(query, ranked);
        if (answerText) {
          console.log("[ai-search] answer source: gemini-llm");
        }
      } catch (e) {
        console.error("[ai-search] Gemini LLM fallback:", e instanceof Error ? e.message : e);
      }
    }
    if (!answerText) {
      answerText = await buildAnswer(query, ranked);
      console.log("[ai-search] answer source: fallback-buildAnswer");
    }

    const enriched = ranked
      .map((r) => {
        if (!originCoord || !originLabel || isBroadRegion(originLabel)) return r;
        const lat = Number(r?.vendor?.lat);
        const lng = Number(r?.vendor?.lng);
        if (!isValidLatLng(lat, lng)) return r;
        const km = calculateDistance(originCoord.lat, originCoord.lng, lat, lng);
        if (!Number.isFinite(km)) return r;
        return {
          ...r,
          distanceKm: Number(km.toFixed(1)),
          distanceFrom: originLabel,
        };
      })
      .slice(0, limit);

    const resultsOut = stripRankScores(enriched);

    return res.status(200).json({
      ok: true,
      query,
      intent,
      intentSource,
      count: resultsOut.length,
      answer: answerText,
      results: resultsOut,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
