import { useRouter } from "next/router";
import { useEffect } from "react";
import { isVenueDetailPath, snapVenueDetailToTop } from "../../lib/venueDetailScroll";
import RouteProgressBar from "./RouteProgressBar";

/**
 * Global route transition UI: progress bar only.
 * Full-page venue skeleton is disabled so framer-motion shared layout (list tile → hero) stays visible.
 */
export default function RouteNavigationShell({ children }) {
  const router = useRouter();

  useEffect(() => {
    function onComplete(url) {
      if (isVenueDetailPath(url)) snapVenueDetailToTop();
    }
    router.events.on("routeChangeComplete", onComplete);
    return () => router.events.off("routeChangeComplete", onComplete);
  }, [router.events]);

  return (
    <>
      <RouteProgressBar />
      {children}
    </>
  );
}
