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
 * @property {(text: string) => void} handleSuggestionSelect
 * @property {import("react").RefObject<HTMLInputElement | null>} aiInputRef
 */

function useHomeAiSearchState() {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResults, setAiResults] = useState([]);
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSearched, setAiSearched] = useState(false);
  const aiInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));

  const reset = useCallback(() => {
    setAiPrompt("");
    setAiResults([]);
    setAiAnswer("");
    setAiPlan(null);
    setAiLoading(false);
    setAiError("");
    setAiSearched(false);
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
        setAiError(data?.error || "Could not run AI search right now.");
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
  }, [aiPrompt, aiLoading]);

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
