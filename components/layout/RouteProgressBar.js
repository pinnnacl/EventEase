import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/**
 * Slim top progress bar during client-side route transitions (YouTube/GitHub style).
 */
export default function RouteProgressBar() {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    let trickleTimer = 0;

    function start() {
      setActive(true);
      setProgress(12);
      if (trickleTimer) window.clearInterval(trickleTimer);
      trickleTimer = window.setInterval(() => {
        setProgress((p) => (p >= 88 ? p : p + Math.random() * 10));
      }, 180);
    }

    function end() {
      if (trickleTimer) window.clearInterval(trickleTimer);
      setProgress(100);
      window.setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 220);
    }

    const onStart = () => {
      cancelAnimationFrame(raf);
      start();
    };
    const onDone = () => end();
    const onError = () => end();

    router.events.on("routeChangeStart", onStart);
    router.events.on("routeChangeComplete", onDone);
    router.events.on("routeChangeError", onError);

    return () => {
      cancelAnimationFrame(raf);
      if (trickleTimer) window.clearInterval(trickleTimer);
      router.events.off("routeChangeStart", onStart);
      router.events.off("routeChangeComplete", onDone);
      router.events.off("routeChangeError", onError);
    };
  }, [router.events]);

  if (!active && progress === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px] bg-transparent"
      role="progressbar"
      aria-hidden
    >
      <div
        className="h-full bg-[#1A1A1A] shadow-[0_0_12px_rgba(26,26,26,0.35)] transition-[width] duration-200 ease-out"
        style={{ width: `${Math.min(100, progress)}%` }}
      />
    </div>
  );
}
