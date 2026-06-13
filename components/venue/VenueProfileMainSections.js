import SectionContainer from "./SectionContainer";
import VenueDetailsMobileAccordion from "./VenueDetailsMobileAccordion";
import VenueDetailsRows from "./VenueDetailsRows";
import VenueExperienceCollapsibleDescription from "./VenueExperienceCollapsibleDescription";
import VenueGallery from "./VenueGallery";
import VenueMapEmbed from "./VenueMapEmbed";
import VenuePricingPremium from "./VenuePricingPremium";
import VenueProximityList from "./VenueProximityList";
import AmenityChips from "./AmenityChips";
import ReviewList from "./ReviewList";

function IconCheck({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconLines({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

/**
 * Shared scroll sections for venue / vendor profile pages.
 */
export default function VenueProfileMainSections({
  isVenue,
  experienceDescription,
  highlights,
  proximityPoints,
  mapQuery,
  primaryPlaceLabel,
  locationLabel,
  venue,
  amenityItems,
  activeTag,
  setActiveTag,
  inquire,
  demo,
  inquireSending,
  images,
  galleryResponsive,
  setLightbox,
  priceDisplay,
  pricingBullets,
  reviewItems,
}) {
  return (
    <>
      <SectionContainer
        id="venue-section-about"
        title={
          <span className="font-display text-2xl font-semibold tracking-tight text-zinc-900 sm:text-[1.65rem]">
            {isVenue ? "The experience" : "About"}
          </span>
        }
      >
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">
          <div className="space-y-8">
            {isVenue ? (
              <>
                <div className="md:hidden">
                  <VenueExperienceCollapsibleDescription text={experienceDescription} />
                </div>
                <p className="hidden whitespace-pre-line text-base leading-relaxed text-zinc-600 md:block">
                  {experienceDescription}
                </p>
              </>
            ) : (
              <p className="whitespace-pre-line text-base leading-relaxed text-zinc-600">{experienceDescription}</p>
            )}
            {highlights.length ? (
              <ul className={`space-y-3${isVenue ? " max-md:hidden" : ""}`}>
                {highlights.map((h) => (
                  <li key={h} className="flex items-center gap-3 text-sm font-medium text-zinc-800">
                    <IconCheck className="h-4 w-4 shrink-0 text-[#0F766E]" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            ) : null}
            {proximityPoints.length ? <VenueProximityList points={proximityPoints} /> : null}
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-zinc-900">Where you&apos;ll celebrate</h3>
            <div className="mt-4">
              <VenueMapEmbed
                lat={venue.lat}
                lng={venue.lng}
                mapQuery={mapQuery}
                placeLabel={primaryPlaceLabel || locationLabel}
                title={isVenue ? "Venue location" : "Service area"}
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              {primaryPlaceLabel || <span className="text-zinc-400">Area not listed</span>}
            </p>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer
        id="venue-section-venue-details"
        className={
          isVenue
            ? "[&_#venue-section-venue-details-heading]:hidden md:[&_#venue-section-venue-details-heading]:block [&>div:last-child]:!mt-0 md:[&>div:last-child]:!mt-8"
            : ""
        }
        title={
          isVenue ? (
            <span className="hidden md:contents">
              <span className="flex items-center gap-2">
                <IconLines className="h-6 w-6 shrink-0 text-[#0F766E]" aria-hidden />
                Venue Details
              </span>
            </span>
          ) : (
            "Highlights"
          )
        }
      >
        {isVenue ? (
          <>
            <div className="md:hidden">
              <VenueDetailsMobileAccordion
                venueDetails={venue.venueDetails}
                onContact={inquire}
                contactDisabled={demo || inquireSending}
              />
            </div>
            <div className="hidden md:block">
              <VenueDetailsRows venueDetails={venue.venueDetails} />
            </div>
          </>
        ) : (
          <AmenityChips items={amenityItems} activeIndex={activeTag} onSelect={setActiveTag} />
        )}
      </SectionContainer>

      {isVenue ? (
        <div className="hidden md:block">
          <SectionContainer
            id="venue-section-photos"
            title={
              <span className="font-display text-2xl font-semibold tracking-tight text-zinc-900">Gallery</span>
            }
          >
            <VenueGallery
              images={images}
              galleryResponsive={galleryResponsive}
              onImageClick={(src) => setLightbox(src)}
            />
          </SectionContainer>
        </div>
      ) : (
        <SectionContainer
          id="venue-section-photos"
          title={
            <span className="font-display text-2xl font-semibold tracking-tight text-zinc-900">Gallery</span>
          }
        >
          <VenueGallery
            images={images}
            galleryResponsive={galleryResponsive}
            onImageClick={(src) => setLightbox(src)}
          />
        </SectionContainer>
      )}

      <SectionContainer
        id="venue-section-pricing"
        title={
          <span className="font-display text-2xl font-semibold tracking-tight text-zinc-900">
            Packages &amp; rates
          </span>
        }
      >
        <VenuePricingPremium
          priceRange={priceDisplay}
          bullets={pricingBullets}
          capacity={venue.capacity}
          facilities={venue.facilities}
        />
      </SectionContainer>

      <SectionContainer
        id="venue-section-reviews"
        title={
          <span className="font-display text-2xl font-semibold tracking-tight text-zinc-900">Guest stories</span>
        }
      >
        <ReviewList reviews={reviewItems} venueName={venue.businessName} onInquire={inquire} demo={demo} />
      </SectionContainer>
    </>
  );
}
