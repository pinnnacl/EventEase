import { createHash } from "crypto";

const DEFAULT_DIM = 256;

function textToHash(text) {
  return createHash("sha256").update(String(text || "")).digest();
}

/**
 * Deterministic fallback embedding so indexing works without external providers.
 * Not semantically strong; replace with a real provider in the next phase.
 * @param {string} text
 * @param {number} [dim]
 */
export function hashTextEmbedding(text, dim = DEFAULT_DIM) {
  const out = new Array(dim).fill(0);
  for (let i = 0; i < dim; i++) {
    const seed = textToHash(`${i}|${text}`);
    const n = seed.readUInt16BE(0) / 65535; // 0..1
    out[i] = n * 2 - 1; // -1..1
  }
  return out;
}

/**
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embedText(text) {
  const provider = String(process.env.EMBEDDING_PROVIDER || "hash-v1").trim().toLowerCase();
  if (provider === "hash-v1" || !provider) {
    return hashTextEmbedding(text);
  }
  if (provider === "gemini") {
    const apiKey = String(process.env.GEMINI_API_KEY || "").trim();
    const model = String(process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004").trim();
    const outputDimensionality = Number(process.env.GEMINI_EMBEDDING_DIMENSIONS || 0);
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:embedContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${model}`,
          content: {
            parts: [{ text: String(text || "").slice(0, 12000) }],
          },
          taskType: "RETRIEVAL_DOCUMENT",
          ...(Number.isFinite(outputDimensionality) && outputDimensionality > 0
            ? { outputDimensionality }
            : {}),
        }),
      },
    );
    const raw = await res.text();
    let json = null;
    try {
      json = raw ? JSON.parse(raw) : null;
    } catch {
      json = null;
    }
    if (!res.ok) {
      const msg = json?.error?.message || raw || `Gemini embeddings failed (${res.status})`;
      throw new Error(msg);
    }
    const emb = json?.embedding?.values;
    if (!Array.isArray(emb) || emb.length === 0) {
      throw new Error("Gemini embeddings response missing vector");
    }
    return emb.map((n) => Number(n));
  }
  if (provider === "openai") {
    const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
    const model = String(process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small").trim();
    const dimensions = Number(process.env.OPENAI_EMBEDDING_DIMENSIONS || 0);
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is missing");
    }

    const body = {
      model,
      input: String(text || "").slice(0, 8000),
      ...(Number.isFinite(dimensions) && dimensions > 0 ? { dimensions } : {}),
    };

    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const raw = await res.text();
    let json = null;
    try {
      json = raw ? JSON.parse(raw) : null;
    } catch {
      json = null;
    }
    if (!res.ok) {
      const msg = json?.error?.message || raw || `OpenAI embeddings failed (${res.status})`;
      throw new Error(msg);
    }
    const emb = json?.data?.[0]?.embedding;
    if (!Array.isArray(emb) || emb.length === 0) {
      throw new Error("OpenAI embeddings response missing vector");
    }
    return emb.map((n) => Number(n));
  }

  return hashTextEmbedding(text);
}
