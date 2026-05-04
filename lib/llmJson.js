/**
 * Strip markdown fences and parse JSON from an LLM response body.
 * @param {string} text
 * @returns {unknown|null}
 */
export function parseJsonFromLlmText(text) {
  let t = String(text || "").trim();
  if (!t) return null;
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  }
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}
