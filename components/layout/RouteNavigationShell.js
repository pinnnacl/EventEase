import { useRouter } from "next/router";
import { useEffect } from "react";
import { isVenueDetailPath, snapVenueDetailToTop } from "../../lib/venueDetailScroll";

/** Global route navigation shell — snaps venue detail pages to top on arrival. */
export default function RouteNavigationShell({ children }) {
  const router = useRouter();

  useEffect(() => {
    function onComplete(url) {
      if (isVenueDetailPath(url)) snapVenueDetailToTop();
    }
    router.events.on("routeChangeComplete", onComplete);
    return () => router.events.off("routeChangeComplete", onComplete);
  }, [router.events]);

  return children;
}
