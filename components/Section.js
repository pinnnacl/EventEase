export default function Section({ id, className = "", children }) {
  return (
    <section id={id} className={`fade-up py-14 sm:py-20 ${className}`}>
      <div className="container-default">{children}</div>
    </section>
  );
}
