export default function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary:
      "bg-[#0F766E] text-white hover:-translate-y-0.5 hover:bg-[#0E6A64] hover:shadow-[0_10px_24px_-14px_rgba(15,118,110,0.58)] focus-visible:ring-[#0F766E]",
    secondary:
      "border border-[#CFE8E5] bg-white text-[#115E59] hover:-translate-y-0.5 hover:bg-[#F2FBFA] hover:shadow-[0_8px_18px_-14px_rgba(15,118,110,0.42)] focus-visible:ring-[#0F766E]",
    gold:
      "bg-wedding-gold text-white hover:-translate-y-0.5 hover:bg-[#be9929] hover:shadow-lg focus-visible:ring-wedding-gold",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
