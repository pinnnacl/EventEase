import Head from "next/head";
import Footer from "../components/Footer";
import MarketingHeader from "../components/home/MarketingHeader";
import WishlistMain from "../components/wishlist/WishlistPage";

export default function WishlistRoute() {
  return (
    <>
      <Head>
        <title>Your wishlist | EventEase Kerala</title>
        <meta name="description" content="Venues, photography, and services you have saved on EventEase Kerala." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#faf8f5]">
        <MarketingHeader />
        <WishlistMain />
        <Footer variant="light" />
      </div>
    </>
  );
}
