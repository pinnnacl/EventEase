import { getPublicVenueDetailRows } from "./venueDetails";

/**
 * @param {string} line
 * @returns {{ label: string; value: string } | null}
 */
function parseProximityLine(line) {
  const trimmed = line.trim().replace(/^[-•*]\s*/, "");
  if (!trimmed || trimmed.length < 4) return null;
  if (!/\d|km|hour|minute|airport|junction|drive|away/i.test(trimmed)) return null;

  const colon = trimmed.match(/^([^:–—-]{2,60})[:–—-]\s*(.+)$/);
  if (colon) {
    return { label: colon[1].trim(), value: colon[2].trim() };
  }

  const fromMatch = trimmed.match(/^(.+?)\s+from\s+(.+)$/i);
  if (fromMatch) {
    return { label: fromMatch[2].trim(), value: fromMatch[1].trim() };
  }

  return { label: trimmed, value: "" };
}

/**
 * Scannable proximity bullets from description + custom venue detail rows.
 * @param {{ description?: string; venueDetails?: unknown }} venue
 */
export function parseVenueProximityPoints(venue) {
  /** @type {{ label: string; value: string }[]} */
  const out = [];
  const seen = new Set();

  function push(item) {
    if (!item) return;
    const key = `${item.label}|${item.value}`.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(item);
  }

  const rows = getPublicVenueDetailRows(venue?.venueDetails);
  for (const row of rows) {
    if (row.description === "Not specified") continue;
    const title = row.title.toLowerCase();
    if (
      /proximity|connectivity|distance|travel|airport|junction|landmark|how to reach|getting here/i.test(
        row.title,
      )
    ) {
      row.description
        .split(/\n|;/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((line) => push(parseProximityLine(line)));
    }
  }

  const desc = venue?.description?.trim() || "";
  if (desc) {
    desc.split(/\n+/).forEach((para) => {
      if (!/\d\s*km|hour|minute|airport|junction|drive|away|from\s+/i.test(para)) return;
      para
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((line) => push(parseProximityLine(line)));
    });
  }

  return out.slice(0, 8);
}
