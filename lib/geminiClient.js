import { GoogleGenerativeAI } from "@google/generative-ai";

function trim(v) {
  return v == null ? "" : String(v).trim();
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

  const preferred = trim(process.env.GEMINI_LLM_MODEL) || "gemini-2.0-flash";
  const modelCandidates = Array.from(
    new Set([preferred, "gemini-2.0-flash", "gemini-flash-latest", "gemini-1.5-flash-latest", "gemini-1.5-flash"])
  );

  let lastError = null;
  for (const modelName of modelCandidates) {
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
