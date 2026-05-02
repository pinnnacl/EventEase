import { useEffect, useState } from "react";

function IconSparkles({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l.7 2.1L8 15l-2.3.9L5 18l-.7-2.1L2 15l2.3-.9L5 12z" />
    </svg>
  );
}

function IconSearch({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function IconIdea({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

const CHIPS = [
  {
    text: "Find beach wedding venues in Kerala",
    Icon: IconSearch,
  },
  {
    text: "Budget-friendly wedding planners",
    Icon: IconIdea,
  },
  {
    text: "Modern wedding photography ideas",
    Icon: IconSparkles,
  },
];

const chipBase =
  "inline-flex max-w-full min-h-[44px] cursor-pointer items-center gap-2 rounded-full border border-[#D7EAE8] bg-[#F6FBFB] px-4 py-2 text-left text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_18px_-18px_rgba(20,43,60,0.22)] backdrop-blur-sm transition-[opacity,transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[#B9DDD9] hover:bg-white hover:text-[#0F172A] hover:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_14px_24px_-18px_rgba(20,43,60,0.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2 active:translate-y-0 sm:min-h-0";

/**
 * Gemini-style suggestion chips below the hero AI search bar.
 * @param {{ onSelect: (text: string) => void }} props
 */
export default function SearchSuggestions({ onSelect }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-5 sm:gap-3"
      role="group"
      aria-label="Suggested searches"
    >
      {CHIPS.map(({ text, Icon }, i) => (
        <button
          key={text}
          type="button"
          onClick={() => onSelect(text)}
          className={`${chipBase} ${
            show ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
          }`}
          style={{ transitionDelay: show ? `${80 + i * 70}ms` : "0ms" }}
        >
          <Icon className="h-4 w-4 shrink-0 text-[#0F766E]/85" />
          <span className="min-w-0 leading-snug">{text}</span>
        </button>
      ))}
    </div>
  );
}
