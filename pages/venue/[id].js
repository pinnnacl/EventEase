import Head from "next/head";
import VenueDetailView from "../../components/venue/VenueDetailView";
import { requireAdmin } from "../../lib/supabaseAuth";
import { isValidYmd } from "../../lib/eventDateYmd";
import { getVendorIdsUnavailableOnDate } from "../../lib/vendorBookings";
import {
  getPublicVenueById,
  getSimilarVenues,
  getVenueDetailByIdAnyStatus,
} from "../../lib/vendors";

export default function VenueDetailPage({ venue, similar, availability, showPendingPreviewBanner }) {
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

export async function getServerSideProps({ params, query, req, res }) {
  const id = params?.id;
  if (!id || typeof id !== "string") {
    return { notFound: true };
  }

  const wantsAdminPreview = query.adminPreview === "1" || query.adminPreview === "true";

  let venue = null;
  const pub = await getPublicVenueById(id);
  if (pub.error) {
    return { notFound: true };
  }
  if (pub.data) {
    venue = pub.data;
  } else if (wantsAdminPreview) {
    const gate = await requireAdmin(req, res);
    if (!gate.ok) {
      return { notFound: true };
    }
    const preview = await getVenueDetailByIdAnyStatus(id);
    if (preview.error || !preview.data) {
      return { notFound: true };
    }
    venue = preview.data;
  } else {
    return { notFound: true };
  }

  if (venue.category === "Photographer") {
    const q = new URLSearchParams();
    if (typeof query.date === "string" && query.date.trim()) {
      q.set("date", query.date.trim().slice(0, 10));
    }
    if (wantsAdminPreview) {
      q.set("adminPreview", "1");
    }
    const dest = `/photography/${id}${q.toString() ? `?${q.toString()}` : ""}`;
    return { redirect: { destination: dest, permanent: false } };
  }

  if (venue.category === "Makeup") {
    const q = new URLSearchParams();
    if (wantsAdminPreview) {
      q.set("adminPreview", "1");
    }
    const dest = `/makeup/${id}${q.toString() ? `?${q.toString()}` : ""}`;
    return { redirect: { destination: dest, permanent: false } };
  }

  let sim = [];
  if (venue.status === "approved") {
    const { data: similar } = await getSimilarVenues(venue.id, venue.category, 4);
    sim = similar || [];
  }

  const dateParam = typeof query.date === "string" ? query.date.trim().slice(0, 10) : null;
  const availabilityDate = dateParam && isValidYmd(dateParam) ? dateParam : null;

  let unavailableSelf = false;
  /** @type {string[]} */
  let similarUnavailableIds = [];
  if (availabilityDate) {
    const allIds = [venue.id, ...sim.map((s) => s.id)];
    const { ids, error: bookErr } = await getVendorIdsUnavailableOnDate(availabilityDate, allIds);
    if (!bookErr) {
      unavailableSelf = ids.has(venue.id);
      similarUnavailableIds = sim.filter((s) => ids.has(s.id)).map((s) => s.id);
    }
  }

  const showPendingPreviewBanner = wantsAdminPreview && venue.status !== "approved";

  return {
    props: {
      venue: JSON.parse(JSON.stringify(venue)),
      similar: JSON.parse(JSON.stringify(sim)),
      availability: {
        date: availabilityDate,
        unavailableSelf,
        similarUnavailableIds,
      },
      showPendingPreviewBanner,
    },
  };
}
