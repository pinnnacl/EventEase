import Head from "next/head";
import PhotographerProfileView from "../../components/photographer/PhotographerProfileView";
import { requireAdmin } from "../../lib/supabaseAuth";
import { getVenueDetailByIdAnyStatus, getPublicVenueById } from "../../lib/vendors";

export default function PhotographerProfilePage({ vendor, showPendingPreviewBanner }) {
  if (!vendor) return null;

  const title = `${vendor.businessName} | Photography | THAALI`;
  const desc =
    vendor.description?.slice(0, 160)?.trim() ||
    `Book ${vendor.businessName} — portfolio, packages, and inquiries on THAALI.`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        {showPendingPreviewBanner ? <meta name="robots" content="noindex,nofollow" /> : null}
        <meta property="og:title" content={vendor.businessName} />
        <meta property="og:description" content={desc} />
        {vendor.profileImage ? <meta property="og:image" content={vendor.profileImage} /> : null}
      </Head>
      <PhotographerProfileView vendor={vendor} />
    </>
  );
}

export async function getServerSideProps({ params, query, req, res }) {
  const id = params?.id;
  if (!id || typeof id !== "string") {
    return { notFound: true };
  }

  const wantsAdminPreview = query.adminPreview === "1" || query.adminPreview === "true";

  let vendor = null;
  const pub = await getPublicVenueById(id);
  if (pub.error) {
    return { notFound: true };
  }
  if (pub.data) {
    vendor = pub.data;
  } else if (wantsAdminPreview) {
    const gate = await requireAdmin(req, res);
    if (!gate.ok) {
      return { notFound: true };
    }
    const preview = await getVenueDetailByIdAnyStatus(id);
    if (preview.error || !preview.data) {
      return { notFound: true };
    }
    vendor = preview.data;
  } else {
    return { notFound: true };
  }

  if (vendor.category === "Makeup") {
    const q = new URLSearchParams();
    if (wantsAdminPreview) {
      q.set("adminPreview", "1");
    }
    const dest = `/makeup/${id}${q.toString() ? `?${q.toString()}` : ""}`;
    return { redirect: { destination: dest, permanent: false } };
  }

  if (vendor.category !== "Photographer") {
    return {
      redirect: {
        destination: `/venue/${id}${typeof query.date === "string" ? `?date=${encodeURIComponent(query.date)}` : ""}`,
        permanent: false,
      },
    };
  }

  const showPendingPreviewBanner = wantsAdminPreview && vendor.status !== "approved";

  return {
    props: {
      vendor: JSON.parse(JSON.stringify(vendor)),
      showPendingPreviewBanner,
    },
  };
}
