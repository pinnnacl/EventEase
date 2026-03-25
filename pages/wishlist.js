import Head from "next/head";
import Footer from "../components/Footer";
import WishlistMain from "../components/wishlist/WishlistPage";

export default function WishlistRoute() {
  return (
    <>
      <Head>
        <title>Your wishlist | EventEase Kerala</title>
        <meta name="description" content="Venues, photography, and services you have saved on EventEase Kerala." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex min-h-0 w-full max-w-none flex-1 flex-col">
        <WishlistMain />
        <div className="mt-auto shrink-0">
          <Footer variant="light" />
        </div>
      </div>
    </>
  );
}
