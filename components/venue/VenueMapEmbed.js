import { MapPin } from "lucide-react";

/**
 * Reliable map embed with muted styling; falls back to “Open in Maps” when coords are missing.
 * @param {{
 *   lat?: number | null;
 *   lng?: number | null;
 *   mapQuery: string;
 *   placeLabel?: string;
 *   title?: string;
 * }} props
 */
export default function VenueMapEmbed({ lat, lng, mapQuery, placeLabel = "", title = "Venue location" }) {
  const hasCoords = lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  if (!hasCoords && !mapQuery) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-2 rounded-2xl bg-stone-100 text-stone-500 sm:h-[240px]">
        <MapPin className="h-8 w-8 opacity-40" strokeWidth={1.25} aria-hidden />
        <p className="text-sm">Map unavailable for this listing</p>
      </div>
    );
  }

  if (!hasCoords) {
    return (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-[200px] flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200/80 ring-1 ring-stone-200/90 transition hover:from-stone-50 sm:h-[240px]"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-lg">
          <MapPin className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        </span>
        <div className="text-center px-4">
          <p className="text-sm font-semibold text-stone-800">View on map</p>
          {placeLabel ? <p className="mt-1 text-xs text-stone-600">{placeLabel}</p> : null}
        </div>
      </a>
    );
  }

  const la = Number(lat);
  const ln = Number(lng);
  const pad = 0.012;
  const bbox = `${ln - pad},${la - pad},${ln + pad},${la + pad}`;
  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${la}%2C${ln}`;

  return (
    <div className="relative overflow-hidden rounded-2xl ring-1 ring-stone-200/90">
      <iframe
        title={title}
        className="venue-map-embed h-[200px] w-full sm:h-[240px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={embedSrc}
      />
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-md ring-1 ring-stone-200/80 transition hover:bg-white"
      >
        <MapPin className="h-3.5 w-3.5 text-[#0F766E]" strokeWidth={1.75} aria-hidden />
        Directions
      </a>
    </div>
  );
}
