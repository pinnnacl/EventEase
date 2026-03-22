export default function SectionTitle({ id, title, description }) {
  return (
    <div id={id} className="mb-8 text-center">
      <h2 className="text-3xl font-bold text-brand-800 sm:text-4xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-slate-600">{description}</p>
    </div>
  );
}
