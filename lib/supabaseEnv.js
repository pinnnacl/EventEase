/**
 * Normalize values copied from Supabase dashboard / chat (BOM, quotes, whitespace).
 */
function normalizeEnvValue(v) {
  if (v == null) return "";
  let s = String(v).trim();
  // UTF-8 BOM often breaks JWT validation
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1).trim();
  // Wrapping quotes from copy-paste
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  // Common .env typo: KEY=eyJ...token"  (closing quote only — breaks JWT validation)
  if (s.endsWith('"') && !s.startsWith('"') && s.startsWith("eyJ")) {
    s = s.slice(0, -1).trim();
  }
  return s;
}

/**
 * Resolve Supabase env vars. Server/API code may use NEXT_PUBLIC_* or unprefixed names.
 * Client bundles still need NEXT_PUBLIC_* for values used in the browser.
 */
export function getSupabaseUrl() {
  return normalizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
  );
}

export function getSupabaseAnonKey() {
  return normalizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
  );
}

export function getSupabaseServiceRoleKey() {
  return normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY || "");
}

/**
 * Quick sanity checks for misconfiguration (safe to log — no secrets).
 */
export function getSupabaseEnvDiagnostics() {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  const sr = getSupabaseServiceRoleKey();
  let urlHttpsOk = false;
  let host = "";
  try {
    const u = new URL(url);
    urlHttpsOk = u.protocol === "https:" && Boolean(u.hostname);
    host = u.hostname || "";
  } catch {
    urlHttpsOk = false;
  }
  const urlLooksLikeDefaultSupabase = /\.supabase\.co$/i.test(host);
  return {
    urlPresent: Boolean(url),
    urlHttpsOk,
    urlHost: host || null,
    urlLooksLikeDefaultSupabase,
    anonKeyLength: anon.length,
    serviceRoleKeyLength: sr.length,
    anonLooksLikeJwt: anon.startsWith("eyJ"),
    serviceLooksLikeJwt: sr.startsWith("eyJ"),
    anonAndServiceAreIdentical: Boolean(anon && anon === sr),
  };
}
