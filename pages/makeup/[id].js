import Head from "next/head";
import MakeupProfileView from "../../components/makeup/MakeupProfileView";
import { requireAdmin } from "../../lib/supabaseAuth";
import { getVenueDetailByIdAnyStatus, getPublicVenueById } from "../../lib/vendors";

export default function MakeupProfilePage({ vendor, showPendingPreviewBanner }) {
  if (!vendor) return null;

  const title = `${vendor.businessName} | Makeup | THAALI`;
  const desc =
    vendor.description?.slice(0, 160)?.trim() ||
    `Book ${vendor.businessName} — bridal makeup and trials on THAALI.`;

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
      <MakeupProfileView vendor={vendor} showPendingPreviewBanner={showPendingPreviewBanner} />
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

  if (vendor.category !== "Makeup") {
    return {
      redirect: {
        destination:
          vendor.category === "Photographer"
            ? `/photography/${id}`
            : `/venue/${id}`,
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
