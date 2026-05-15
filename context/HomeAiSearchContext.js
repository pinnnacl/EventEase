import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

/** @typedef {import("react").ReactNode} ReactNode */

const HomeAiSearchContext = createContext(/** @type {null | HomeAiSearchValue} */ (null));

/**
 * @typedef {Object} HomeAiSearchValue
 * @property {string} aiPrompt
 * @property {(v: string) => void} setAiPrompt
 * @property {() => Promise<void>} runAiSearch
 * @property {boolean} aiLoading
 * @property {unknown[]} aiResults
 * @property {string} aiAnswer
 * @property {unknown} aiPlan
 * @property {string} aiError
 * @property {boolean} aiSearched
 * @property {boolean} aiUnavailable
 * @property {(text: string) => void} handleSuggestionSelect
 * @property {import("react").RefObject<HTMLInputElement | null>} aiInputRef
 */

// --------------------------------------------------------------------------
// Helper: classify a backend response that means "AI search is not wired up"
// --------------------------------------------------------------------------
// The backend (pages/api/ai/search/text.js) returns 503 with
// `{ ok: false, error: "Weaviate is not configured" }` when WEAVIATE_URL /
// WEAVIATE_API_KEY env vars are missing. We do NOT want to surface that as a
// scary red error to end users — it's an operator-side setup gap. Instead the
// UI flips into a graceful "AI search in setup" state via `aiUnavailable`.
function isAiUnavailableResponse(status, payload) {
  if (status === 503) return true;
  const msg = typeof payload?.error === "string" ? payload.error.toLowerCase() : "";
  return /weaviate|not configured|ai_search_disabled/.test(msg);
}

function useHomeAiSearchState() {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResults, setAiResults] = useState([]);
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSearched, setAiSearched] = useState(false);
  // `aiUnavailable` is sticky once detected — avoids re-hitting the API on
  // every keystroke / suggestion click when we already know the backend is
  // returning 503 because Weaviate isn't configured for this environment.
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const aiInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));

  const reset = useCallback(() => {
    setAiPrompt("");
    setAiResults([]);
    setAiAnswer("");
    setAiPlan(null);
    setAiLoading(false);
    setAiError("");
    setAiSearched(false);
    setAiUnavailable(false);
  }, []);

  const handleSuggestionSelect = useCallback((text) => {
    setAiPrompt(text);
    requestAnimationFrame(() => {
      const mobile = aiInputRef.current;
      const desktop =
        typeof document !== "undefined" ? document.getElementById("home-ai-desktop-search-input") : null;
      const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
      const el = narrow ? mobile || desktop : desktop || mobile;
      el?.focus();
      try {
        el?.setSelectionRange(text.length, text.length);
      } catch {
        /* not all inputs support setSelectionRange */
      }
    });
  }, []);

  const runAiSearch = useCallback(async () => {
    const q = aiPrompt.trim();
    if (!q || aiLoading) return;
    // If we've already learned this environment doesn't have Weaviate wired
    // up, skip the network round-trip and just surface the friendly state.
    if (aiUnavailable) {
      setAiSearched(true);
      return;
    }
    setAiLoading(true);
    setAiError("");
    setAiAnswer("");
    setAiPlan(null);
    setAiSearched(true);
    try {
      const res = await fetch("/api/ai/search/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ query: q, limit: 6 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setAiResults([]);
        setAiAnswer("");
        setAiPlan(null);
        // Operator-side setup gap → graceful disabled state. Otherwise show
        // the (possibly user-facing) error message returned by the API.
        if (isAiUnavailableResponse(res.status, data)) {
          setAiUnavailable(true);
          setAiError("");
        } else {
          setAiError(data?.error || "Could not run AI search right now.");
        }
        return;
      }
      const rows = Array.isArray(data.results) ? data.results : [];
      setAiResults(rows);
      setAiAnswer(typeof data.answer === "string" ? data.answer : "");

      if (rows.length > 0 && data.intent) {
        try {
          const pr = await fetch("/api/ai/plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ intent: data.intent, results: rows }),
          });
          const pd = await pr.json().catch(() => ({}));
          if (pr.ok && pd?.ok && pd.plan && typeof pd.plan === "object") {
            setAiPlan(pd.plan);
          } else {
            setAiPlan(null);
          }
        } catch {
          setAiPlan(null);
        }
      } else {
        setAiPlan(null);
      }
    } catch {
      setAiResults([]);
      setAiAnswer("");
      setAiPlan(null);
      setAiError("Network error while running AI search.");
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, aiLoading, aiUnavailable]);

  return useMemo(
    () => ({
      aiPrompt,
      setAiPrompt,
      runAiSearch,
      aiLoading,
      aiResults,
      aiAnswer,
      aiPlan,
      aiError,
      aiSearched,
      aiUnavailable,
      handleSuggestionSelect,
      aiInputRef,
      reset,
    }),
    [
      aiPrompt,
      runAiSearch,
      aiLoading,
      aiResults,
      aiAnswer,
      aiPlan,
      aiError,
      aiSearched,
      aiUnavailable,
      handleSuggestionSelect,
      aiInputRef,
      reset,
    ]
  );
}

/**
 * @param {{ children: ReactNode }} props
 */
export function HomeAiSearchProvider({ children }) {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const state = useHomeAiSearchState();

  useEffect(() => {
    if (!isHome) state.reset();
  }, [isHome, state.reset]);

  const value = isHome ? state : null;

  return <HomeAiSearchContext.Provider value={value}>{children}</HomeAiSearchContext.Provider>;
}

export function useHomeAiSearch() {
  return useContext(HomeAiSearchContext);
}
