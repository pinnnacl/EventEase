import { useMemo, useState } from "react";
import { buildVenueGalleryItems } from "../../lib/venueGallery";
import VenueCollageGallery from "./VenueCollageGallery";

/**
 * Dedicated full-page venue photo gallery (category chips + collage only).
 *
 * @param {{ venue: object }} props
 */
export default function VenueGalleryPageView({ venue }) {
  const items = useMemo(() => buildVenueGalleryItems(venue), [venue]);
  const [lightbox, setLightbox] = useState(null);

  return (
    <>
      <VenueCollageGallery items={items} onImageClick={(url) => setLightbox(url)} />

      {lightbox ? (
        <button
          type="button"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
          aria-label="Close image"
        >
          <img src={lightbox} alt="" className="max-h-[90vh] max-w-full rounded-lg object-contain" />
        </button>
      ) : null}
    </>
  );
}
