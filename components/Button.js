export default function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary:
      "bg-brand-500 text-white hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-lg focus-visible:ring-brand-500",
    secondary:
      "border border-brand-200 bg-white text-brand-700 hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-md focus-visible:ring-brand-500",
    gold:
      "bg-wedding-gold text-white hover:-translate-y-0.5 hover:bg-[#be9929] hover:shadow-lg focus-visible:ring-wedding-gold",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
