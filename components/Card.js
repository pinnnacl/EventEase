export default function Card({ className = "", children }) {
  return (
    <article
      className={`rounded-2xl bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-premium ${className}`}
    >
      {children}
    </article>
  );
}
