import Head from "next/head";
import { useRouter } from "next/router";
import VenueDetailView from "../../components/venue/VenueDetailView";
import VenueSkeleton from "../../components/VenueSkeleton";
import { isValidYmd } from "../../lib/eventDateYmd";
import { getApprovedVenueIdsForStaticPaths, getPublicVenueById, getSimilarVenues } from "../../lib/vendors";

export default function VenueDetailPage({ venue, similar, availability, showPendingPreviewBanner }) {
  const router = useRouter();

  // FILE 2 STEP C: ISR fallback — show skeleton while blocking path is generated
  if (router.isFallback) {
    return <VenueSkeleton />;
  }

  if (!venue) {
    return null;
  }

  const title = `${venue.businessName} | THAALI`;
  const isVenue = venue.category === "Venue";
  const desc =
    venue.description?.slice(0, 160)?.trim() ||
    (isVenue
      ? `View ${venue.businessName} in ${venue.city || venue.location}. Book premium wedding venues on THAALI.`
      : `View ${venue.businessName} (${venue.category}) on THAALI — packages, portfolio, and inquiries.`);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        {showPendingPreviewBanner ? <meta name="robots" content="noindex,nofollow" /> : null}
        <meta property="og:title" content={venue.businessName} />
        <meta property="og:description" content={desc} />
        {venue.profileImage ? <meta property="og:image" content={venue.profileImage} /> : null}
      </Head>
      <VenueDetailView
        venue={venue}
        similar={similar || []}
        availability={availability}
        showPendingPreviewBanner={Boolean(showPendingPreviewBanner)}
      />
    </>
  );
}

// FILE 2 STEP A: getStaticPaths — prebuild top 50 approved venues; rest via fallback: 'blocking'
export async function getStaticPaths() {
  const { data: ids, error } = await getApprovedVenueIdsForStaticPaths(50);
  if (error) {
    return { paths: [], fallback: "blocking" };
  }
  return {
    paths: ids.map((id) => ({ params: { id: String(id) } })),
    fallback: "blocking",
  };
}

// FILE 2 STEP A+B: ISR (revalidate 60s). Single vendors row fetch via getPublicVenueById (gallery_images, facilities on row).
// AUTH NOTE: requireAdmin(req,res) for ?adminPreview= removed from build-time fetch — admin preview of
// non-approved listings is not available at static generation time; approved venues preview normally.
// ?date= availability is resolved client-side in VenueDetailView (see /api/public/venues-availability).
export async function getStaticProps({ params }) {
  const id = params?.id;
  if (!id || typeof id !== "string") {
    return { notFound: true };
  }

  const pub = await getPublicVenueById(id);
  if (pub.error) {
    return { notFound: true };
  }
  if (!pub.data) {
    return { notFound: true };
  }

  const venue = pub.data;

  if (venue.category === "Photographer") {
    return {
      redirect: { destination: `/photography/${id}`, permanent: false },
    };
  }

  if (venue.category === "Makeup") {
    return {
      redirect: { destination: `/makeup/${id}`, permanent: false },
    };
  }

  let sim = [];
  if (venue.status === "approved") {
    const { data: similar } = await getSimilarVenues(venue.id, venue.category, 4);
    sim = similar || [];
  }

  return {
    props: {
      venue: JSON.parse(JSON.stringify(venue)),
      similar: JSON.parse(JSON.stringify(sim)),
      availability: {
        date: null,
        unavailableSelf: false,
        similarUnavailableIds: [],
      },
      showPendingPreviewBanner: false,
    },
    revalidate: 60,
  };
}
