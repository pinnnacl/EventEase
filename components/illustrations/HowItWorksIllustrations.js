/**
 * Flat illustration set for "How it works" — unDraw / Storyset–inspired:
 * teal + gold + cream, friendly minimal shapes, consistent viewBox.
 */

const teal = "#0f766e";
const tealMuted = "#99f6e4";
const gold = "#d4af37";
const goldSoft = "#fef9e8";
const cream = "#ffffff";
const ink = "#334155";

const baseSvgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 360 220",
  className: "h-auto w-full max-h-[5.5rem] sm:max-h-[6.5rem]",
  fill: "none",
  role: "img",
};

/** Step 1: planning + form + calendar + budget */
export function IllustrationPlanning() {
  return (
    <svg {...baseSvgProps}>
      <title>Planning form and checklist</title>
      {/* soft ground */}
      <ellipse cx="180" cy="200" rx="140" ry="28" fill={tealMuted} opacity="0.35" />
      {/* laptop base */}
      <rect x="88" y="118" width="184" height="12" rx="4" fill={teal} opacity="0.85" />
      <path d="M100 118 L100 52 Q100 44 108 44 L252 44 Q260 44 260 52 L260 118" fill={cream} stroke={teal} strokeWidth="2.5" />
      {/* screen content — form lines */}
      <rect x="118" y="62" width="124" height="8" rx="2" fill={goldSoft} stroke={gold} strokeWidth="1.5" />
      <rect x="118" y="78" width="96" height="6" rx="2" fill="#e2e8f0" />
      <rect x="118" y="90" width="108" height="6" rx="2" fill="#e2e8f0" />
      <circle cx="128" cy="104" r="4" fill={gold} />
      <rect x="138" y="100" width="72" height="8" rx="2" fill={tealMuted} />
      {/* checklist floating */}
      <rect x="228" y="28" width="88" height="72" rx="8" fill="white" stroke={teal} strokeWidth="2" className="transition-transform duration-300 group-hover/illustration:-translate-y-1" />
      <path d="M242 48 L248 54 L262 40" stroke={gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="242" y="62" width="56" height="4" rx="1" fill={ink} opacity="0.25" />
      <rect x="242" y="74" width="48" height="4" rx="1" fill={ink} opacity="0.2" />
      <rect x="242" y="86" width="52" height="4" rx="1" fill={ink} opacity="0.2" />
      {/* calendar + budget chips */}
      <g className="transition-transform duration-300 group-hover/illustration:translate-x-0.5">
        <rect x="32" y="56" width="44" height="48" rx="6" fill="white" stroke={gold} strokeWidth="2" />
        <rect x="32" y="56" width="44" height="14" rx="6" fill={gold} />
        <circle cx="44" cy="88" r="3" fill={teal} opacity="0.4" />
        <circle cx="54" cy="88" r="3" fill={teal} opacity="0.4" />
        <circle cx="64" cy="88" r="3" fill={teal} opacity="0.4" />
        <circle cx="44" cy="98" r="3" fill={teal} opacity="0.25" />
        <circle cx="54" cy="98" r="3" fill={teal} opacity="0.25" />
      </g>
      <ellipse cx="58" cy="138" rx="22" ry="10" fill={goldSoft} stroke={gold} strokeWidth="1.5" className="transition-transform duration-300 group-hover/illustration:scale-105" />
      <text x="58" y="142" textAnchor="middle" fontSize="11" fontWeight="700" fill={teal} fontFamily="system-ui,sans-serif">
        ₹
      </text>
    </svg>
  );
}

/** Step 2: vendor cards + search / filters */
export function IllustrationDiscovery() {
  return (
    <svg {...baseSvgProps}>
      <title>Browsing and comparing vendors</title>
      <ellipse cx="180" cy="200" rx="140" ry="28" fill={tealMuted} opacity="0.35" />
      {/* search bar */}
      <rect x="72" y="32" width="216" height="36" rx="18" fill="white" stroke={teal} strokeWidth="2" />
      <circle cx="96" cy="50" r="10" stroke={gold} strokeWidth="2" />
      <path d="M102 56 L110 64" stroke={gold} strokeWidth="2" strokeLinecap="round" />
      <rect x="124" y="44" width="140" height="8" rx="2" fill="#e2e8f0" />
      {/* filter pills */}
      <rect x="88" y="82" width="52" height="22" rx="11" fill={goldSoft} stroke={gold} strokeWidth="1.5" className="transition-transform duration-300 group-hover/illustration:-translate-y-0.5" />
      <rect x="148" y="82" width="68" height="22" rx="11" fill={tealMuted} stroke={teal} strokeWidth="1.5" />
      <rect x="224" y="82" width="56" height="22" rx="11" fill={goldSoft} stroke={gold} strokeWidth="1.5" />
      {/* vendor cards */}
      <g className="transition-transform duration-300 group-hover/illustration:translate-y-[-4px]">
        <rect x="56" y="118" width="76" height="88" rx="10" fill="white" stroke={teal} strokeWidth="2" />
        <rect x="64" y="128" width="60" height="36" rx="6" fill={tealMuted} />
        <rect x="64" y="172" width="44" height="5" rx="2" fill={ink} opacity="0.2" />
        <rect x="64" y="182" width="36" height="5" rx="2" fill={ink} opacity="0.15" />
      </g>
      <g className="transition-transform duration-300 group-hover/illustration:translate-y-[-8px]">
        <rect x="142" y="108" width="76" height="98" rx="10" fill="white" stroke={gold} strokeWidth="2.5" />
        <rect x="150" y="118" width="60" height="40" rx="6" fill={goldSoft} />
        <path d="M162 138 L168 146 L180 132" stroke={teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="150" y="168" width="52" height="5" rx="2" fill={ink} opacity="0.25" />
        <rect x="150" y="178" width="40" height="5" rx="2" fill={ink} opacity="0.15" />
      </g>
      <g className="transition-transform duration-300 group-hover/illustration:translate-y-[-4px]">
        <rect x="228" y="118" width="76" height="88" rx="10" fill="white" stroke={teal} strokeWidth="2" />
        <rect x="236" y="128" width="60" height="36" rx="6" fill={tealMuted} />
        <rect x="236" y="172" width="44" height="5" rx="2" fill={ink} opacity="0.2" />
        <rect x="236" y="182" width="36" height="5" rx="2" fill={ink} opacity="0.15" />
      </g>
    </svg>
  );
}

/** Step 3: chat + booking confirmation */
export function IllustrationConnect() {
  return (
    <svg {...baseSvgProps}>
      <title>Chat and booking confirmation</title>
      <ellipse cx="180" cy="200" rx="140" ry="28" fill={tealMuted} opacity="0.35" />
      {/* chat bubbles */}
      <g className="transition-transform duration-300 group-hover/illustration:translate-x-1">
        <path
          d="M72 52 H200 Q208 52 208 60 V88 Q208 96 200 96 H92 L72 112 V60 Q72 52 80 52"
          fill="white"
          stroke={teal}
          strokeWidth="2"
        />
        <circle cx="100" cy="74" r="4" fill={gold} />
        <circle cx="118" cy="74" r="4" fill={teal} opacity="0.35" />
        <circle cx="136" cy="74" r="4" fill={teal} opacity="0.25" />
      </g>
      <g className="transition-transform duration-300 group-hover/illustration:-translate-x-1">
        <path
          d="M160 104 H288 Q296 104 296 112 V140 Q296 148 288 148 H180 L160 164 V112 Q160 104 168 104"
          fill={goldSoft}
          stroke={gold}
          strokeWidth="2"
        />
        <rect x="176" y="120" width="96" height="6" rx="2" fill={teal} opacity="0.35" />
        <rect x="176" y="132" width="72" height="6" rx="2" fill={teal} opacity="0.2" />
      </g>
      {/* confirmation badge */}
      <g className="transition-transform duration-300 group-hover/illustration:scale-105">
        <circle cx="268" cy="72" r="44" fill="white" stroke={teal} strokeWidth="2.5" />
        <circle cx="268" cy="72" r="36" fill={teal} opacity="0.12" />
        <path d="M252 72 L262 82 L286 58" stroke={gold} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* handshake simplified — two rounded arcs */}
      <path
        d="M108 168 Q140 148 172 168 Q204 188 236 168"
        stroke={teal}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
        className="transition-opacity duration-300 group-hover/illustration:opacity-80"
      />
      <rect x="124" y="176" width="112" height="28" rx="8" fill={teal} className="transition-transform duration-300 group-hover/illustration:scale-[1.02]" />
      <text x="180" y="194" textAnchor="middle" fontSize="10" fontWeight="700" fill="white" fontFamily="system-ui,sans-serif">
        Booked
      </text>
    </svg>
  );
}
