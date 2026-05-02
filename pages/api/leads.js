import { getSupabaseAdmin } from "../../lib/supabaseAdmin";

/**
 * Public inquiry for a vendor (lead). Uses service role; validate inputs.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid JSON" });
  }

  const vendorId = typeof body?.vendorId === "string" ? body.vendorId.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const eventDate = typeof body?.eventDate === "string" ? body.eventDate.trim() : "";
  const guestCount = typeof body?.guestCount === "string" ? body.guestCount.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!vendorId || !name || !phone) {
    return res.status(400).json({ ok: false, error: "Name, phone, and vendor are required" });
  }

  const lines = [
    `Inquiry for listing`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    eventDate ? `Event date: ${eventDate}` : null,
    guestCount ? `Guest count: ${guestCount}` : null,
    message ? `Message: ${message}` : null,
  ].filter(Boolean);

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("leads").insert({
      vendor_id: vendorId,
      user_id: null,
      message: lines.join("\n"),
    });
    if (error) {
      return res.status(400).json({ ok: false, error: error.message || "Could not save inquiry" });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
