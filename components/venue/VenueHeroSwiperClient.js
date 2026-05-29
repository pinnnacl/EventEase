import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import ResponsiveVendorImage from "../images/ResponsiveVendorImage";

import "swiper/css";
import "swiper/css/pagination";

/**
 * Client-only Swiper carousel for venue hero (loaded via next/dynamic, ssr: false).
 *
 * @param {{
 *   slides: { url: string; responsive?: { thumb: string; medium: string; large: string } | null }[];
 *   imageClassName?: string;
 * }} props
 */
export default function VenueHeroSwiperClient({ slides, imageClassName = "" }) {
  if (!slides?.length) return null;

  const showPagination = slides.length > 1;

  return (
    <Swiper
      modules={[Pagination]}
      slidesPerView={1}
      spaceBetween={0}
      speed={320}
      className="venue-hero-swiper h-full w-full"
      pagination={
        showPagination
          ? {
              clickable: true,
              bulletClass: "venue-hero-swiper-bullet",
              bulletActiveClass: "venue-hero-swiper-bullet-active",
            }
          : false
      }
    >
      {slides.map((slide, i) => (
        <SwiperSlide key={`${slide.url}-${i}`} className="!h-full">
          <ResponsiveVendorImage
            responsive={slide.responsive}
            src={slide.url}
            alt=""
            className={imageClassName}
            sizes="100vw"
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
