import Head from "next/head";
import VenueDetailView from "../../components/venue/VenueDetailView";
import { DEMO_SIMILAR, DEMO_VENUE } from "../../lib/venueDemoData";

export default function VenueDemoPage() {
  return (
    <>
      <Head>
        <title>Demo venue | THAALI</title>
        <meta
          name="description"
          content="Preview of the venue detail layout — sample content only."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <VenueDetailView venue={DEMO_VENUE} similar={DEMO_SIMILAR} demo />
    </>
  );
}
