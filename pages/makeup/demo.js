import Head from "next/head";
import MakeupProfileView from "../../components/makeup/MakeupProfileView";
import { getDemoMakeupVendor } from "../../lib/makeupDemoData";

function MakeupDemoPage() {
  return (
    <>
      <Head>
        <title>Makeup artist profile demo | THAALI</title>
        <meta
          name="description"
          content="Velvet & Gilded — premium bridal makeup artist profile demo. Sample content only."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <MakeupProfileView vendor={getDemoMakeupVendor()} demo />
    </>
  );
}

MakeupDemoPage.hideAppLayout = true;

export default MakeupDemoPage;
