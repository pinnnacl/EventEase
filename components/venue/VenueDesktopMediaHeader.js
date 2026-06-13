import ResponsiveVendorImage from "../images/ResponsiveVendorImage";
import { VenueHeroGallery } from "./VenueGallery";

function IconStar({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

const DESKTOP_HERO_IMAGE_CLASS =
  "w-full h-auto object-contain object-center transition duration-500 ease-out";

/**
 * Desktop venue media collage + title (`hidden lg:block` parent).
 *
 * @param {{
 *   businessName: string;
 *   images: string[];
 *   galleryResponsive: object[];
 *   heroSlides: { url: string; responsive?: object }[];
 *   swiperEnabled: boolean;
 *   isLgViewport: boolean;
 *   onOpenGallery: () => void;
 * }} props
 */
export default function VenueDesktopMediaHeader({
  businessName,
  images,
  galleryResponsive,
  heroSlides,
  swiperEnabled,
  isLgViewport,
  onOpenGallery,
}) {
  const sideImages = images.slice(1, 3);
  const sideResponsive = galleryResponsive.slice(1, 3);

  return (
    <div>
      <div className="grid grid-cols-3 items-stretch gap-3">
        <div className="relative col-span-2 overflow-hidden rounded-2xl bg-zinc-50 shadow-sm">
          <VenueHeroGallery
            slides={heroSlides}
            swiperEnabled={swiperEnabled}
            active={isLgViewport}
            imageFit="contain"
            imageClassName={DESKTOP_HERO_IMAGE_CLASS}
            onOpenGallery={onOpenGallery}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-28 bg-gradient-to-t from-white via-white/75 to-transparent"
            aria-hidden
          />
          <div className="pointer-events-none absolute right-4 top-4 z-10">
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-100/80 bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
              <IconStar className="h-3.5 w-3.5 text-amber-500" aria-hidden />
              THAALI
            </span>
          </div>
          {images.length > 0 ? (
            <button
              type="button"
              onClick={onOpenGallery}
              className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/95 px-4 py-1.5 text-xs font-medium text-zinc-500 shadow-sm transition hover:bg-white"
            >
              {images.length} Photos
            </button>
          ) : null}
        </div>

        <div className="col-span-1 flex min-h-0 flex-col gap-3">
          {sideImages.length ? (
            sideImages.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={onOpenGallery}
                className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-zinc-100 shadow-sm"
                aria-label="View venue photos"
              >
                <ResponsiveVendorImage
                  responsive={sideResponsive[i]}
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  sizes="(max-width: 1280px) 20vw, 240px"
                  loading="lazy"
                />
              </button>
            ))
          ) : (
            <>
              <div className="flex-1 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50" />
              <div className="flex-1 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50" />
            </>
          )}
        </div>
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 lg:text-4xl">{businessName}</h1>
    </div>
  );
}
