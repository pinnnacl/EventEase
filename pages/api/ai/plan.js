import { generateWeddingPlanJson } from "../../../lib/geminiClient";
import { normalizeIntent } from "../../../lib/intentSchema";

function trim(v) {
  return v == null ? "" : String(v).trim();
}

/**
 * Normalize plan JSON from LLM into a safe client shape.
 * @param {unknown} raw
 */
function normalizePlan(raw) {
  if (!raw || typeof raw !== "object") return null;
  const o = /** @type {Record<string, unknown>} */ (raw);
  const overview = typeof o.overview === "string" ? o.overview.trim() : "";
  const recommended = o.recommended_vendors_by_category && typeof o.recommended_vendors_by_category === "object"
    ? o.recommended_vendors_by_category
    : {};
  const budgetSplit =
    o.estimated_budget_split && typeof o.estimated_budget_split === "object" ? o.estimated_budget_split : {};
  const timeline = Array.isArray(o.timeline) ? o.timeline : [];
  const checklist = Array.isArray(o.checklist) ? o.checklist.map((x) => String(x || "").trim()).filter(Boolean) : [];
  const hasVendorPick = Object.values(recommended).some((v) => Array.isArray(v) && v.length > 0);
  if (!overview && !checklist.length && !Object.keys(budgetSplit).length && !timeline.length && !hasVendorPick) {
    return null;
  }
  return {
    overview: overview || "Your personalized wedding plan is ready. Review vendors and checklist below.",
    recommended_vendors_by_category: recommended,
    estimated_budget_split: budgetSplit,
    timeline,
    checklist,
  };
}

/**
 * POST { intent: object, results: array }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const planOn = trim(process.env.GEMINI_PLAN_ENABLED || "true").toLowerCase() !== "false";
  if (!planOn || !trim(process.env.GEMINI_API_KEY)) {
    return res.status(200).json({ ok: true, plan: null, skipped: true });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid JSON body" });
  }

  const intent = normalizeIntent(body?.intent);
  const results = Array.isArray(body?.results) ? body.results : [];

  if (results.length === 0) {
    return res.status(200).json({ ok: true, plan: null, skipped: true });
  }

  try {
    const raw = await generateWeddingPlanJson(intent, results);
    const plan = normalizePlan(raw);
    if (!plan) {
      return res.status(200).json({ ok: true, plan: null, skipped: true });
    }
    return res.status(200).json({ ok: true, plan });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Plan generation failed";
    console.error("[ai-plan]", msg);
    return res.status(200).json({ ok: true, plan: null, error: msg });
  }
}
