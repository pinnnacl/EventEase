/** @type {Map<string, { at: number; data: unknown }>} */
const cache = new Map();
/** @type {Map<string, Promise<unknown>>} */
const inflight = new Map();

/**
 * @param {string} url
 * @param {{ ttlMs?: number }} [options]
 * @returns {unknown | null}
 */
export function getCachedJson(url, { ttlMs = 120_000 } = {}) {
  const hit = cache.get(url);
  if (!hit) return null;
  if (Date.now() - hit.at > ttlMs) {
    cache.delete(url);
    return null;
  }
  return hit.data;
}

/**
 * @param {string} url
 */
export function invalidateCachedJson(url) {
  cache.delete(url);
  inflight.delete(url);
}

/**
 * Deduped in-memory JSON fetch (avoids repeat network round-trips on the same page).
 *
 * @param {string} url
 * @param {{ ttlMs?: number; init?: RequestInit; force?: boolean }} [options]
 */
export async function fetchJsonCached(url, { ttlMs = 120_000, init, force = false } = {}) {
  if (!force) {
    const cached = getCachedJson(url, { ttlMs });
    if (cached != null) return cached;
  } else {
    invalidateCachedJson(url);
  }

  const pending = inflight.get(url);
  if (pending) return pending;

  const promise = fetch(url, { credentials: "same-origin", ...init })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        cache.set(url, { at: Date.now(), data });
      }
      return data;
    })
    .finally(() => {
      inflight.delete(url);
    });

  inflight.set(url, promise);
  return promise;
}
