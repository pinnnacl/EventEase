import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseJsonFromLlmText } from "./llmJson";

function trim(v) {
  return v == null ? "" : String(v).trim();
}

function modelCandidates() {
  const preferred = trim(process.env.GEMINI_LLM_MODEL) || "gemini-2.0-flash";
  return Array.from(
    new Set([preferred, "gemini-2.0-flash", "gemini-flash-latest", "gemini-1.5-flash-latest", "gemini-1.5-flash"])
  );
}

async function generateText(prompt) {
  const apiKey = trim(process.env.GEMINI_API_KEY);
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;
  for (const modelName of modelCandidates()) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = trim(result?.response?.text?.());
      if (text) return text;
    } catch (e) {
      lastError = e;
    }
  }
  if (lastError instanceof Error) throw lastError;
  throw new Error("Gemini LLM returned an empty response");
}

/**
 * LLM-only structured intent JSON (caller merges with heuristics / fallback).
 * @param {string} query
 * @returns {Promise<Record<string, unknown>|null>}
 */
export async function parseUserIntentWithGemini(query) {
  const q = String(query || "").trim();
  if (!q) return null;
  const prompt = [
    "You extract structured wedding planning intent for a Kerala (India) wedding marketplace app.",
    "Return JSON ONLY (no markdown, no prose) with exactly these keys:",
    'event_type (string), location (string, city/area in Kerala if mentioned else ""),',
    "guest_count (positive integer or null), budget (number, total INR budget cap if mentioned else null),",
    "services_needed (array of lowercase slugs from: venue, photography, makeup, catering, decor, planner),",
    "event_date (YYYY-MM-DD or null), preferences (array of short lowercase strings),",
    'indoor_outdoor (one of "indoor","outdoor","both" or null).',
    "Infer services_needed from the query; default to [\"venue\"] only if the user clearly wants a venue/hall/resort.",
    `User query: ${q}`,
  ].join("\n");
  const text = await generateText(prompt);
  const parsed = parseJsonFromLlmText(text);
  return parsed && typeof parsed === "object" ? /** @type {Record<string, unknown>} */ (parsed) : null;
}

/**
 * @param {import("./intentSchema").Intent} intent
 * @param {unknown[]} rankedVendors
 */
export async function generateWeddingPlanJson(intent, rankedVendors) {
  const rows = Array.isArray(rankedVendors) ? rankedVendors : [];
  const slim = rows.slice(0, 12).map((row) => {
    const v = row?.vendor || {};
    return {
      vendorId: row?.vendorId || v?.id || null,
      businessName: v?.businessName || null,
      category: v?.category || null,
      city: v?.city || v?.place || null,
      pricingRange: v?.pricingRange || null,
      capacity: v?.capacity || null,
      rankScore: Number.isFinite(Number(row?.rankScore)) ? Number(row.rankScore) : null,
    };
  });
  const prompt = [
    "You are a wedding planning assistant for Kerala, India. Generate a practical plan using ONLY the provided intent and vendor list.",
    "Return JSON ONLY (no markdown) with keys:",
    "overview (string, 2-4 sentences),",
    "recommended_vendors_by_category (object: keys are category names like Venue, Photographer, Makeup; values are arrays of { vendorId, businessName, note } using ONLY vendors from the list),",
    "estimated_budget_split (object: string keys for line items, number values in INR — rough estimates aligned with intent.budget if present),",
    "timeline (array of { phase: string, when: string, tasks: string[] }),",
    "checklist (array of short actionable strings).",
    "Do not invent vendor IDs or names not in the vendor list. If a category has no vendor in the list, use an empty array for that category.",
    "User intent (JSON):",
    JSON.stringify(intent || {}),
    "Ranked vendors (JSON):",
    JSON.stringify(slim),
  ].join("\n");
  const text = await generateText(prompt);
  const parsed = parseJsonFromLlmText(text);
  return parsed && typeof parsed === "object" ? /** @type {Record<string, unknown>} */ (parsed) : null;
}

function summarizeVendors(vendors) {
  const rows = Array.isArray(vendors) ? vendors : [];
  return rows.slice(0, 6).map((row) => {
    const v = row?.vendor || {};
    return {
      vendorId: row?.vendorId || v?.id || null,
      businessName: v?.businessName || null,
      category: v?.category || null,
      city: v?.city || v?.place || null,
      distanceScore: Number.isFinite(Number(row?.distance)) ? Number(row.distance) : null,
      priceRange: v?.pricingRange || null,
      capacity: v?.capacity || null,
    };
  });
}

export async function generateAnswer(query, vendors) {
  const apiKey = trim(process.env.GEMINI_API_KEY);
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const vendorSummary = summarizeVendors(vendors);

  const prompt = [
    "You are a helpful assistant for a wedding vendor discovery app in Kerala.",
    `User query: ${String(query || "").trim()}`,
    "Top matching vendors (JSON):",
    JSON.stringify(vendorSummary),
    "Write exactly one concise sentence summarizing what was found.",
    "Use only the provided vendor data. Do not invent facts.",
    "If there are no good matches, clearly say no matching vendor is currently available in the app.",
  ].join("\n");

  let lastError = null;
  for (const modelName of modelCandidates()) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = trim(result?.response?.text?.());
      if (text) return text;
    } catch (e) {
      lastError = e;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error("Gemini LLM returned an empty response");
}
