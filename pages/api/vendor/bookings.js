import { requireVendor } from "../../../lib/supabaseAuth";
import {
  createVendorBooking,
  deleteVendorBooking,
  listBookingsByVendorId,
  updateVendorBooking,
} from "../../../lib/vendorBookings";
import { getVendorByUser } from "../../../lib/vendors";

async function getApprovedVendorRecord(req, res) {
  const gate = await requireVendor(req, res);
  if (!gate.ok) return { gate, vendor: null, vendorError: null };
  const { data: vendor, error: vendorError } = await getVendorByUser(gate.user.id);
  if (vendorError) {
    return { gate: { ok: false, status: 500 }, vendor: null, vendorError };
  }
  if (!vendor || vendor.status !== "approved") {
    return { gate: { ok: false, status: 403 }, vendor: null, vendorError: null };
  }
  return { gate, vendor, vendorError: null };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { gate, vendor, vendorError } = await getApprovedVendorRecord(req, res);
      if (!gate.ok) {
        return res.status(gate.status).json({
          ok: false,
          error: vendorError ? vendorError.message || "Server error" : "Unauthorized",
        });
      }
      const { data, error } = await listBookingsByVendorId(vendor.id);
      if (error) {
        return res.status(500).json({ ok: false, error: error.message || "Could not load bookings" });
      }
      return res.status(200).json({ ok: true, bookings: data });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Server error";
      return res.status(500).json({ ok: false, error: msg });
    }
  }

  if (req.method === "POST") {
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid JSON" });
    }

    try {
      const { gate, vendor, vendorError } = await getApprovedVendorRecord(req, res);
      if (!gate.ok) {
        return res.status(gate.status).json({
          ok: false,
          error: vendorError ? vendorError.message || "Server error" : "Unauthorized",
        });
      }
      const { data, error } = await createVendorBooking(vendor.id, {
        date: body?.date,
        eventName: body?.eventName,
      });
      if (error) {
        const code = error.message?.includes("duplicate") || error.code === "23505" ? 409 : 400;
        return res.status(code).json({ ok: false, error: error.message || "Could not create booking" });
      }
      return res.status(200).json({ ok: true, booking: data });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Server error";
      return res.status(500).json({ ok: false, error: msg });
    }
  }

  if (req.method === "PATCH") {
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid JSON" });
    }
    const id = typeof body?.id === "string" ? body.id : null;
    if (!id) {
      return res.status(400).json({ ok: false, error: "Missing id" });
    }
    try {
      const { gate, vendor, vendorError } = await getApprovedVendorRecord(req, res);
      if (!gate.ok) {
        return res.status(gate.status).json({
          ok: false,
          error: vendorError ? vendorError.message || "Server error" : "Unauthorized",
        });
      }
      const { data, error } = await updateVendorBooking(vendor.id, id, { eventName: body?.eventName });
      if (error) {
        return res.status(400).json({ ok: false, error: error.message || "Could not update" });
      }
      return res.status(200).json({ ok: true, booking: data });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Server error";
      return res.status(500).json({ ok: false, error: msg });
    }
  }

  if (req.method === "DELETE") {
    const id = typeof req.query.id === "string" ? req.query.id : null;
    if (!id) {
      return res.status(400).json({ ok: false, error: "Missing id" });
    }
    try {
      const { gate, vendor, vendorError } = await getApprovedVendorRecord(req, res);
      if (!gate.ok) {
        return res.status(gate.status).json({
          ok: false,
          error: vendorError ? vendorError.message || "Server error" : "Unauthorized",
        });
      }
      const { deleted, error } = await deleteVendorBooking(vendor.id, id);
      if (error || !deleted) {
        return res.status(404).json({ ok: false, error: error?.message || "Not found" });
      }
      return res.status(200).json({ ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Server error";
      return res.status(500).json({ ok: false, error: msg });
    }
  }

  res.setHeader("Allow", "GET, POST, PATCH, DELETE");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
