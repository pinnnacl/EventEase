import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { VENUE_HERO_LAYOUT_TRANSITION } from "../../lib/venueHeroLayoutId";

/**
 * Fixed overlay: tile image flies from list card rect → detail hero rect.
 *
 * @param {{
 *   flight: { fromRect: { top: number, left: number, width: number, height: number }, src: string, srcSet?: string, sizes?: string } | null;
 *   toRect: { top: number, left: number, width: number, height: number } | null;
 *   onComplete: () => void;
 * }} props
 */
export default function VenueHeroTransitionOverlay({ flight, toRect, onComplete }) {
  const finishedRef = useRef(false);

  useEffect(() => {
    finishedRef.current = false;
  }, [flight, toRect]);

  if (!flight) return null;

  const from = flight.fromRect;
  const target = toRect || from;

  return (
    <motion.div
      className="pointer-events-none fixed z-[300] overflow-hidden bg-stone-200 shadow-lg"
      role="presentation"
      aria-hidden
      initial={{
        top: from.top,
        left: from.left,
        width: from.width,
        height: from.height,
        borderRadius: 16,
        opacity: 1,
      }}
      animate={{
        top: target.top,
        left: target.left,
        width: target.width,
        height: target.height,
        borderRadius: toRect ? 0 : 16,
        opacity: 1,
      }}
      transition={toRect ? VENUE_HERO_LAYOUT_TRANSITION : { duration: 0 }}
      onAnimationComplete={() => {
        if (!toRect || finishedRef.current) return;
        finishedRef.current = true;
        onComplete();
      }}
    >
      <img
        src={flight.src}
        srcSet={flight.srcSet}
        sizes={flight.sizes}
        alt=""
        className="h-full w-full object-cover object-center"
        decoding="async"
        draggable={false}
      />
    </motion.div>
  );
}
