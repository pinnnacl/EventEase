import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import VenueSkeleton from "../../../components/VenueSkeleton";
import { getApprovedVenueIdsForStaticPaths, getPublicVenueById } from "../../../lib/vendors";

const VenueGalleryPageView = dynamic(() => import("../../../components/venue/VenueGalleryPageView"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full animate-pulse bg-stone-200" aria-hidden />
  ),
});

export default function VenuePhotosPage({ venue }) {
  const router = useRouter();

  if (router.isFallback) {
    return <VenueSkeleton />;
  }

  if (!venue) {
    return null;
  }

  const title = `Photos — ${venue.businessName} | THAALI`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <VenueGalleryPageView venue={venue} />
    </>
  );
}

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

export async function getStaticProps({ params }) {
  const id = params?.id;
  if (!id || typeof id !== "string") {
    return { notFound: true };
  }

  const pub = await getPublicVenueById(id);
  if (pub.error || !pub.data) {
    return { notFound: true };
  }

  const venue = pub.data;

  if (venue.category === "Photographer") {
    return { redirect: { destination: `/photography/${id}`, permanent: false } };
  }
  if (venue.category === "Makeup") {
    return { redirect: { destination: `/makeup/${id}`, permanent: false } };
  }

  return {
    props: {
      venue: JSON.parse(JSON.stringify(venue)),
    },
    revalidate: 60,
  };
}
