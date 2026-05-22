import { formatListingPrice } from "../../lib/formatListingPrice";

/**
 * @param {{ price: string; className?: string; align?: 'left' | 'right' }} props
 */
export default function VenueListingPrice({ price, className = "", align = "left" }) {
  const { amount, suffix } = formatListingPrice(price);
  const alignCls = align === "right" ? "text-right" : "";

  if (!amount) {
    return (
      <p className={`text-xs font-medium text-[#717171] ${alignCls} ${className}`.trim()}>{suffix}</p>
    );
  }

  return (
    <p className={`whitespace-nowrap leading-none ${alignCls} ${className}`.trim()}>
      <span className="text-[0.9375rem] font-semibold tabular-nums tracking-tight text-[#222222]">{amount}</span>
      {suffix ? <span className="text-[0.6875rem] font-normal text-[#717171]">{suffix}</span> : null}
    </p>
  );
}
