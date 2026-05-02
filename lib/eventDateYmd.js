const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @param {string | null | undefined} s
 */
export function isValidYmd(s) {
  if (!s || typeof s !== "string") return false;
  const t = s.trim().slice(0, 10);
  if (!YMD_RE.test(t)) return false;
  const [y, m, d] = t.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

/**
 * Best-effort parse from search bar text or ISO date string.
 * @param {string | null | undefined} label
 */
export function parseEventDateLabelToYmd(label) {
  if (!label || typeof label !== "string") return null;
  const t = label.trim().slice(0, 10);
  if (YMD_RE.test(t) && isValidYmd(t)) return t;
  const p = Date.parse(label.trim());
  if (Number.isNaN(p)) return null;
  const d = new Date(p);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const out = `${y}-${mo}-${day}`;
  return isValidYmd(out) ? out : null;
}
