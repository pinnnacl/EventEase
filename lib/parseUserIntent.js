import { parseUserIntentWithGemini } from "./geminiClient";
import { buildRuleBasedIntent, mergeIntentWithHeuristics } from "./ruleBasedIntent";

function trim(v) {
  return v == null ? "" : String(v).trim();
}

/**
 * LLM intent parsing with rule-based fallback (never throws).
 * @param {string} query
 * @returns {Promise<{ intent: import("./intentSchema").Intent; source: 'gemini' | 'rules' }>}
 */
export async function parseUserIntent(query) {
  const q = trim(query);
  if (!q) {
    return { intent: buildRuleBasedIntent(""), source: "rules" };
  }

  const ruleOnly = buildRuleBasedIntent(q);
  const parserOn = trim(process.env.GEMINI_INTENT_PARSER_ENABLED || "true").toLowerCase() !== "false";
  const hasKey = Boolean(trim(process.env.GEMINI_API_KEY));

  if (parserOn && hasKey) {
    try {
      const raw = await parseUserIntentWithGemini(q);
      if (raw && typeof raw === "object") {
        const merged = mergeIntentWithHeuristics(raw, q);
        return { intent: merged, source: "gemini" };
      }
    } catch (e) {
      console.error("[parseUserIntent] Gemini failed, using rules:", e instanceof Error ? e.message : e);
    }
  }

  return { intent: ruleOnly, source: "rules" };
}
