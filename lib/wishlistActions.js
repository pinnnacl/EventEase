import { isValidYmd, parseEventDateLabelToYmd } from "./eventDateYmd";

export function readStoredEventDateLabel() {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem("eventease_event_date");
    return v && v.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}

/** @param {string | null | undefined} label */
export function writeStoredEventDateLabel(label) {
  if (typeof window === "undefined") return;
  try {
    const t = label != null ? String(label).trim() : "";
    if (!t) {
      window.localStorage.removeItem("eventease_event_date");
      window.localStorage.removeItem("eventease_event_date_ymd");
    } else {
      window.localStorage.setItem("eventease_event_date", t);
      const ymd = parseEventDateLabelToYmd(t);
      if (ymd) window.localStorage.setItem("eventease_event_date_ymd", ymd);
      else window.localStorage.removeItem("eventease_event_date_ymd");
    }
  } catch {
    /* ignore */
  }
}

/** Canonical YYYY-MM-DD from storage when parseable, else null */
export function readStoredEventDateYmd() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("eventease_event_date_ymd");
    if (raw && isValidYmd(raw)) return raw.trim().slice(0, 10);
    const label = window.localStorage.getItem("eventease_event_date");
    return parseEventDateLabelToYmd(label || "") || null;
  } catch {
    return null;
  }
}
