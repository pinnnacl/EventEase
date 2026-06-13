import bannerHero from "../../assets/banner4.png";

/**
 * Desktop home hero — full-width banner image (`hidden lg:block` parent scope).
 */
export default function HomeDesktopHero() {
  return (
    <section className="hidden w-full bg-white lg:block" aria-label="Hero">
      <div className="relative mx-auto h-[240px] w-full max-w-7xl overflow-hidden px-6">
        <div className="relative h-full w-full overflow-hidden rounded-none">
          <img
            src={bannerHero.src}
            alt=""
            className="h-full w-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
}
