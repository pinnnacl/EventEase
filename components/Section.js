export default function Section({ id, className = "", children }) {
  return (
    <section id={id} className={`fade-up w-full py-[clamp(40px,6vw,120px)] ${className}`}>
      <div className="container-default w-full max-w-none">{children}</div>
    </section>
  );
}
