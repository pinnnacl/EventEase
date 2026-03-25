export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-10 w-full text-center sm:mb-12">
      <h2 className="text-fluid-section-title font-bold tracking-tight text-wedding-ink">{title}</h2>
      {subtitle ? <p className="text-fluid-body mt-4 text-slate-600">{subtitle}</p> : null}
    </div>
  );
}
