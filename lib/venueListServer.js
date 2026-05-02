import { isValidYmd } from "./eventDateYmd";
import { getVendorIdsUnavailableOnDate } from "./vendorBookings";
import { getApprovedVendors } from "./vendors";

/**
 * Load approved vendors for public venue listings (server-only).
 * @param {{ category?: string, selectedDateYmd?: string | null }} [options]
 */
export async function loadApprovedVenuesForListing(options = {}) {
  const category = options.category ?? "Venue";
  const selectedDateYmd =
    options.selectedDateYmd && isValidYmd(options.selectedDateYmd) ? options.selectedDateYmd : null;

  try {
    const { data, error } = await getApprovedVendors({ category });
    if (error) {
      return { venues: [], error: error.message || "Could not load venues" };
    }
    let list = data || [];
    if (selectedDateYmd && list.length > 0) {
      const ids = list.map((v) => v.id);
      const { ids: blocked, error: uErr } = await getVendorIdsUnavailableOnDate(selectedDateYmd, ids);
      if (!uErr) {
        list = list.map((v) => ({ ...v, unavailableOnSelectedDate: blocked.has(v.id) }));
      } else {
        list = list.map((v) => ({ ...v, unavailableOnSelectedDate: false }));
      }
    } else {
      list = list.map((v) => ({ ...v, unavailableOnSelectedDate: false }));
    }
    return { venues: list, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not load venues";
    return { venues: [], error: msg };
  }
}
