/**
 * Scroll target section with consistent spacing and heading.
 */
export default function SectionContainer({ id, title, eyebrow, children, className = "" }) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 sm:scroll-mt-32 ${className}`.trim()}
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0F766E]/90">{eyebrow}</p>
      ) : null}
      {title ? (
        <h2 id={id ? `${id}-heading` : undefined} className="font-sans text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h2>
      ) : null}
      <div className={title != null || eyebrow ? "mt-6 sm:mt-8" : undefined}>{children}</div>
    </section>
  );
}
