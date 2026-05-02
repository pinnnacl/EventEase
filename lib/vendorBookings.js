import { getSupabaseAdmin } from "./supabaseAdmin";

function mapRow(row) {
  if (!row) return null;
  const d = row.booking_date;
  const dateStr = typeof d === "string" ? d.slice(0, 10) : d instanceof Date ? d.toISOString().slice(0, 10) : String(d);
  return {
    id: row.id,
    date: dateStr,
    eventName: row.event_name ?? "",
    createdAt: row.created_at,
  };
}

/**
 * @param {string} vendorId
 */
export async function listBookingsByVendorId(vendorId) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("vendor_bookings")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("booking_date", { ascending: true });
  if (error) return { data: [], error };
  return { data: (data || []).map(mapRow), error: null };
}

/**
 * @param {string} vendorId
 * @param {{ date: string; eventName?: string | null }} payload — date as YYYY-MM-DD
 */
export async function createVendorBooking(vendorId, payload) {
  const admin = getSupabaseAdmin();
  const dateStr = typeof payload.date === "string" ? payload.date.trim().slice(0, 10) : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { data: null, error: new Error("Invalid date") };
  }
  const eventName = payload.eventName != null ? String(payload.eventName).trim() : "";
  const { data, error } = await admin
    .from("vendor_bookings")
    .insert({
      vendor_id: vendorId,
      booking_date: dateStr,
      event_name: eventName || null,
    })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505" || String(error.message || "").toLowerCase().includes("duplicate")) {
      return { data: null, error: new Error("You already have a booking on this date") };
    }
    return { data: null, error };
  }
  return { data: mapRow(data), error: null };
}

/**
 * @param {string} vendorId
 * @param {string} bookingId
 */
/**
 * @param {string} vendorId
 * @param {string} bookingId
 * @param {{ eventName?: string | null }} payload
 */
export async function updateVendorBooking(vendorId, bookingId, payload) {
  const admin = getSupabaseAdmin();
  const eventName = payload.eventName != null ? String(payload.eventName).trim() : "";
  const { data, error } = await admin
    .from("vendor_bookings")
    .update({ event_name: eventName || null })
    .eq("id", bookingId)
    .eq("vendor_id", vendorId)
    .select("*")
    .single();
  if (error) return { data: null, error };
  return { data: mapRow(data), error: null };
}

export async function deleteVendorBooking(vendorId, bookingId) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("vendor_bookings")
    .delete()
    .eq("id", bookingId)
    .eq("vendor_id", vendorId)
    .select("id")
    .maybeSingle();
  if (error) return { deleted: false, error };
  if (!data) return { deleted: false, error: new Error("Booking not found") };
  return { deleted: true, error: null };
}

/**
 * Vendor IDs that have a row in vendor_bookings for this calendar day (marked unavailable).
 * @param {string} ymd - YYYY-MM-DD
 * @param {string[] | null} vendorIds - when provided, restricts to these ids
 */
export async function getVendorIdsUnavailableOnDate(ymd, vendorIds = null) {
  const admin = getSupabaseAdmin();
  const dateStr = typeof ymd === "string" ? ymd.trim().slice(0, 10) : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { ids: new Set(), error: new Error("Invalid date") };
  }
  let q = admin.from("vendor_bookings").select("vendor_id").eq("booking_date", dateStr);
  if (Array.isArray(vendorIds) && vendorIds.length > 0) {
    q = q.in("vendor_id", vendorIds);
  }
  const { data, error } = await q;
  if (error) return { ids: new Set(), error };
  return { ids: new Set((data || []).map((r) => r.vendor_id)), error: null };
}
