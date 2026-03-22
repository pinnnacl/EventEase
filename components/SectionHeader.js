export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
      <h2 className="text-3xl font-bold tracking-tight text-wedding-ink sm:text-4xl lg:text-5xl">{title}</h2>
      {subtitle ? <p className="mt-4 text-base leading-7 text-slate-600">{subtitle}</p> : null}
    </div>
  );
}
