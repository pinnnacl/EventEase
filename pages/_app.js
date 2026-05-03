import { Inter, Playfair_Display } from "next/font/google";
import "../styles/globals.css";
import { WishlistProvider } from "../context/WishlistContext";
import { CustomerAuthProvider } from "../context/CustomerAuthContext";
import SupabaseRecoveryRedirect from "../components/auth/SupabaseRecoveryRedirect";
import AppLayout from "../components/layout/AppLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export default function App({ Component, pageProps }) {
  const inner = <Component {...pageProps} />;
  const hideAppLayout = Component.hideAppLayout === true;

  return (
    <WishlistProvider>
      <CustomerAuthProvider>
        <SupabaseRecoveryRedirect />
        <div className={`page-wrapper bg-background ${inter.variable} ${playfair.variable} font-sans`}>
          {hideAppLayout ? inner : <AppLayout>{inner}</AppLayout>}
        </div>
      </CustomerAuthProvider>
    </WishlistProvider>
  );
}
