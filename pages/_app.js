import { Nunito_Sans } from "next/font/google";
import "../styles/globals.css";
import { WishlistProvider } from "../context/WishlistContext";
import { CustomerAuthProvider } from "../context/CustomerAuthContext";
import SupabaseRecoveryRedirect from "../components/auth/SupabaseRecoveryRedirect";
import AppLayout from "../components/layout/AppLayout";
import RouteNavigationShell from "../components/layout/RouteNavigationShell";
import { HomeAiSearchProvider } from "../context/HomeAiSearchContext";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export default function App({ Component, pageProps }) {
  const inner = <Component {...pageProps} />;
  const hideAppLayout = Component.hideAppLayout === true;

  return (
    <WishlistProvider>
      <CustomerAuthProvider>
        <SupabaseRecoveryRedirect />
        <div className={`page-wrapper bg-background ${nunitoSans.variable} font-sans`}>
          <RouteNavigationShell>
            {hideAppLayout ? (
              inner
            ) : (
              <HomeAiSearchProvider>
                <AppLayout>{inner}</AppLayout>
              </HomeAiSearchProvider>
            )}
          </RouteNavigationShell>
        </div>
      </CustomerAuthProvider>
    </WishlistProvider>
  );
}
