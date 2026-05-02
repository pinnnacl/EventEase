import { isValidYmd } from "../../../lib/eventDateYmd";
import { getVendorIdsUnavailableOnDate } from "../../../lib/vendorBookings";
import { getApprovedVendors } from "../../../lib/vendors";

/**
 * Public list of vendors. Only rows with status = 'approved' (enforced in getApprovedVendors).
 * GET /api/vendors/list?category=Venue|Photographer|…&date=YYYY-MM-DD
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const category =
    typeof req.query.category === "string" && req.query.category.trim()
      ? req.query.category.trim()
      : undefined;
  const dateRaw = typeof req.query.date === "string" ? req.query.date.trim().slice(0, 10) : "";
  const dateFilter = isValidYmd(dateRaw) ? dateRaw : null;

  try {
    const { data, error } = await getApprovedVendors({ category });
    if (error) {
      return res.status(500).json({ ok: false, error: error.message || "Could not load vendors" });
    }
    let unavailable = new Set();
    if (dateFilter && data?.length) {
      const ids = data.map((v) => v.id);
      const { ids: blocked, error: uErr } = await getVendorIdsUnavailableOnDate(dateFilter, ids);
      if (!uErr) unavailable = blocked;
    }
    const vendors = (data || []).map((v) => ({
      ...v,
      unavailableOnSelectedDate: unavailable.has(v.id),
    }));
    return res.status(200).json({ ok: true, vendors, selectedDate: dateFilter });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}

