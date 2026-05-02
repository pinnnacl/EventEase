import ResponsiveVendorImage from "../images/ResponsiveVendorImage";

/**
 * Responsive photo grid for venue gallery.
 */
export default function VenueGallery({ images, galleryResponsive, onImageClick }) {
  if (!images?.length) {
    return <p className="text-sm text-slate-500">No photos uploaded yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:gap-4">
      {images.map((src, i) => (
        <button
          key={`${src}-${i}`}
          type="button"
          onClick={() => onImageClick?.(src)}
          className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-100/80"
        >
          <ResponsiveVendorImage
            responsive={galleryResponsive?.[i]}
            src={src}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          />
        </button>
      ))}
    </div>
  );
}
