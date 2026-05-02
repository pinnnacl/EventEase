import { getApprovedVendors } from "../../../lib/vendors";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const category = typeof req.query.category === "string" ? req.query.category : undefined;

  try {
    const { data, error } = await getApprovedVendors({ category });
    if (error) {
      return res.status(500).json({ ok: false, error: error.message || "Could not load vendors" });
    }

    return res.status(200).json({ ok: true, vendors: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
