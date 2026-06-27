/**
 * Minimal line-art landmark icons for popular cities (desktop location picker).
 *
 * @param {{ cityId: string; className?: string }} props
 */
export default function CityLandmarkIcon({ cityId, className = "size-10" }) {
  const stroke = "currentColor";
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 1.4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (cityId) {
    case "mumbai":
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden>
          <path {...common} d="M8 30V14l12-6 12 6v16" />
          <path {...common} d="M14 30V18h4v12M22 30V18h4v12" />
          <path {...common} d="M20 8v4" />
        </svg>
      );
    case "delhi":
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden>
          <path {...common} d="M10 30V14h20v16" />
          <path {...common} d="M14 14V10h12v4M16 30V22h8v8" />
          <path {...common} d="M20 6v4" />
        </svg>
      );
    case "bengaluru":
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden>
          <path {...common} d="M8 30h24M10 30V16l10-6 10 6v14" />
          <path {...common} d="M16 22h8M16 18h8M16 14h8" />
        </svg>
      );
    case "hyderabad":
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden>
          <path {...common} d="M20 8c-4 0-7 3-7 7v15h14V15c0-4-3-7-7-7z" />
          <path {...common} d="M13 30h14M16 18h8M16 22h8" />
        </svg>
      );
    case "chandigarh":
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden>
          <path {...common} d="M20 8v24M12 16h16M12 24h16" />
          <circle {...common} cx="20" cy="20" r="10" />
        </svg>
      );
    case "ahmedabad":
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden>
          <path {...common} d="M10 30V12h20v18" />
          <path {...common} d="M14 12c0-3 12-3 12 0M16 22c2 2 6 2 8 0" />
        </svg>
      );
    case "pune":
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden>
          <path {...common} d="M8 30h24M12 30V18l8-8 8 8v12" />
          <path {...common} d="M16 22h8v8" />
        </svg>
      );
    case "chennai":
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden>
          <path {...common} d="M20 8l-8 6v16h16V14l-8-6z" />
          <path {...common} d="M16 20h8M16 24h8M20 14v16" />
        </svg>
      );
    case "kolkata":
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden>
          <path {...common} d="M10 30V16c0-4 8-6 10-6s10 2 10 6v14" />
          <path {...common} d="M14 30V22h12v8M18 16h4" />
        </svg>
      );
    case "kochi":
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden>
          <path {...common} d="M8 26c4-6 8-8 12-8s8 2 12 8" />
          <path {...common} d="M10 28h20M14 24l4-8 4 8" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden>
          <path {...common} d="M20 8c-5 0-9 4-9 9 0 7 9 15 9 15s9-8 9-15c0-5-4-9-9-9z" />
          <circle {...common} cx="20" cy="17" r="3" />
        </svg>
      );
  }
}
