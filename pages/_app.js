import { Inter, Playfair_Display } from "next/font/google";
import "../styles/globals.css";
import { WishlistProvider } from "../context/WishlistContext";

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
  return (
    <WishlistProvider>
      <div className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
    </WishlistProvider>
  );
}
