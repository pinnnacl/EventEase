import Head from "next/head";
import PhotographerProfileView from "../../components/photographer/PhotographerProfileView";
import { DEMO_PHOTOGRAPHER } from "../../lib/photographerDemoData";

export default function PhotographerDemoPage() {
  return (
    <>
      <Head>
        <title>Demo photographer | THAALI</title>
        <meta
          name="description"
          content="Preview of the photographer marketing profile — sample content only."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <PhotographerProfileView vendor={DEMO_PHOTOGRAPHER} demo />
    </>
  );
}
