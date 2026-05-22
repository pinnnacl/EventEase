/**
 * Split listing price strings into a bold amount + quieter suffix for editorial cards.
 * @param {string | null | undefined} priceStr
 * @returns {{ amount: string | null; suffix: string }}
 */
export function formatListingPrice(priceStr) {
  const raw = String(priceStr || "").trim() || "Ask for quote";
  if (!raw || /^ask for quote$/i.test(raw)) {
    return { amount: null, suffix: raw };
  }

  const withoutLead = raw.replace(/^(from|starts from)\s+/i, "").trim();

  const perDay = withoutLead.match(/^(₹[\d,]+(?:\.\d+)?)\s*(?:\/\s*day|per\s+day)\s*$/i);
  if (perDay) {
    return { amount: perDay[1], suffix: " / day" };
  }

  const amountMatch = withoutLead.match(/(₹[\d,]+(?:\.\d+)?)/);
  if (amountMatch) {
    const amount = amountMatch[1];
    let rest = withoutLead.replace(amount, "").trim();
    rest = rest.replace(/^per\s+/i, "").trim();
    if (/^day$/i.test(rest)) rest = "/ day";
    else if (rest && !rest.startsWith("/")) rest = ` / ${rest}`;
    return { amount, suffix: rest || "" };
  }

  return { amount: null, suffix: raw };
}
