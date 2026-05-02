import { isValidYmd } from "../../../lib/eventDateYmd";
import { getVendorIdsUnavailableOnDate } from "../../../lib/vendorBookings";

const MAX_IDS = 48;

/**
 * GET /api/public/venues-availability?date=YYYY-MM-DD&ids=id1,id2,...
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const dateRaw = typeof req.query.date === "string" ? req.query.date.trim().slice(0, 10) : "";
  if (!isValidYmd(dateRaw)) {
    return res.status(400).json({ ok: false, error: "Invalid or missing date" });
  }

  const idsRaw = typeof req.query.ids === "string" ? req.query.ids : "";
  const vendorIds = idsRaw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, MAX_IDS);

  if (!vendorIds.length) {
    return res.status(200).json({ ok: true, date: dateRaw, unavailableIds: [] });
  }

  try {
    const { ids, error } = await getVendorIdsUnavailableOnDate(dateRaw, vendorIds);
    if (error) {
      return res.status(500).json({ ok: false, error: error.message || "Lookup failed" });
    }
    return res.status(200).json({
      ok: true,
      date: dateRaw,
      unavailableIds: [...ids].filter((id) => vendorIds.includes(id)),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
