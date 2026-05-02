/** Mean Earth radius in km (WGS84 approximation) */
const EARTH_RADIUS_KM = 6371;

/**
 * Haversine distance between two WGS84 points.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance in kilometers, rounded to 2 decimal places
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!isValidLatLng(lat1, lon1) || !isValidLatLng(lat2, lon2)) {
    return NaN;
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = EARTH_RADIUS_KM * c;
  // Two decimals so nearby venues (or small GPS drift) don’t collapse to the same tenth of a km.
  return Math.round(km * 100) / 100;
}

/**
 * @param {unknown} lat
 * @param {unknown} lng
 * @returns {boolean}
 */
export function isValidLatLng(lat, lng) {
  const la = typeof lat === "number" ? lat : Number(lat);
  const ln = typeof lng === "number" ? lng : Number(lng);
  return (
    Number.isFinite(la) &&
    Number.isFinite(ln) &&
    la >= -90 &&
    la <= 90 &&
    ln >= -180 &&
    ln <= 180
  );
}
