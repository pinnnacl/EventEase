/**
 * Turn raw vendor price strings into premium display copy.
 * @param {string | null | undefined} priceRange
 */
export function formatVenuePriceDisplay(priceRange) {
  const raw = priceRange?.trim();
  if (!raw) {
    return { headline: "Rates on request", subline: "Speak with the host for a tailored quote", amount: null };
  }
  if (/^(ask|contact|enquir)/i.test(raw)) {
    return { headline: "Rates on request", subline: "Speak with the host for a tailored quote", amount: null };
  }

  const normalized = raw.replace(/\s+/g, " ");
  const rangeMatch = normalized.match(
    /(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(?:-|–|to)\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)/i,
  );
  const singleMatch = normalized.match(/(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)/i);

  function toInr(n) {
    const num = Number(String(n).replace(/,/g, ""));
    if (!Number.isFinite(num) || num <= 0) return null;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  }

  if (rangeMatch) {
    const low = toInr(rangeMatch[1]);
    const high = toInr(rangeMatch[2]);
    if (low && high) {
      return {
        headline: `Rates from ${low}`,
        subline: `Packages up to ${high} / day`,
        amount: low,
      };
    }
  }

  if (singleMatch) {
    const amt = toInr(singleMatch[1]);
    if (amt) {
      return {
        headline: `Rates starting from ${amt}`,
        subline: "/ day · packages tailored to your event",
        amount: amt,
      };
    }
  }

  const cleaned = normalized.replace(/^starts?\s*from\s*/i, "").trim();
  return {
    headline: cleaned.toLowerCase().startsWith("rate") ? cleaned : `Rates starting from ${cleaned}`,
    subline: "/ day · packages tailored to your event",
    amount: null,
  };
}
