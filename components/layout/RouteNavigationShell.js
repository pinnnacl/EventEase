import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import VenueDetailPageSkeleton from "../venue/VenueDetailPageSkeleton";
import RouteProgressBar from "./RouteProgressBar";

function isVenueDetailRoute(url) {
  return typeof url === "string" && /^\/venue\/[^/]+/.test(url.split("?")[0]);
}

/**
 * Global route transition UI: progress bar + venue detail skeleton overlay.
 */
export default function RouteNavigationShell({ children }) {
  const router = useRouter();
  const [pendingVenueNav, setPendingVenueNav] = useState(false);

  useEffect(() => {
    function onStart(url) {
      setPendingVenueNav(isVenueDetailRoute(url));
    }
    function onEnd() {
      setPendingVenueNav(false);
    }

    router.events.on("routeChangeStart", onStart);
    router.events.on("routeChangeComplete", onEnd);
    router.events.on("routeChangeError", onEnd);
    return () => {
      router.events.off("routeChangeStart", onStart);
      router.events.off("routeChangeComplete", onEnd);
      router.events.off("routeChangeError", onEnd);
    };
  }, [router.events]);

  return (
    <>
      <RouteProgressBar />
      {pendingVenueNav ? (
        <div className="fixed inset-0 z-[150] overflow-y-auto bg-white lg:pt-0" aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading venue details</span>
          <VenueDetailPageSkeleton />
        </div>
      ) : null}
      {children}
    </>
  );
}
