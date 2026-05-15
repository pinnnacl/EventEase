export default function SectionTitle({ id, title, description }) {
  return (
    <div id={id} className="mb-8 text-center">
      <h2 className="text-[36px] font-bold leading-tight text-brand-800">{title}</h2>
      <p className="mt-3 w-full max-w-none text-slate-600">{description}</p>
    </div>
  );
}
