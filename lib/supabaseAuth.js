import { getSupabaseUser, createSupabaseApiClient } from "./supabaseApiRoute";
import { getUserProfile } from "./vendors";

/** User-facing copy for vendor API routes (401/403). */
export function vendorGateErrorMessage(status) {
  if (status === 401) {
    return "Your session expired or you are not signed in. Open Vendor login and sign in again, then retry.";
  }
  if (status === 403) {
    return "This action requires a vendor account. Use Vendor login (not customer login). If you just signed up, complete onboarding first.";
  }
  return "Unauthorized";
}

export async function requireAuthUser(req, res) {
  const user = await getSupabaseUser(req, res);
  if (!user) return { ok: false, status: 401, user: null, profile: null };
  const { data: profile, error } = await getUserProfile(user.id);
  if (error) return { ok: false, status: 500, user: null, profile: null };
  return { ok: true, status: 200, user, profile };
}

export async function requireVendor(req, res) {
  const gate = await requireAuthUser(req, res);
  if (!gate.ok) return { ...gate, user: gate.user, profile: gate.profile };
  if (!gate.profile || gate.profile.role !== "vendor") {
    return { ok: false, status: 403, user: gate.user, profile: gate.profile };
  }
  return { ok: true, status: 200, user: gate.user, profile: gate.profile };
}

export async function requireAdmin(req, res) {
  const gate = await requireAuthUser(req, res);
  if (!gate.ok) return gate;
  if (!gate.profile || gate.profile.role !== "admin") {
    return { ok: false, status: 403, user: gate.user, profile: gate.profile };
  }
  return { ok: true, status: 200, user: gate.user, profile: gate.profile };
}

export { createSupabaseApiClient };
