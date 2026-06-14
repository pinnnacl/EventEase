"use client";

import { Briefcase, Cake, Palette, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const GATHERING_FILTER_OPTIONS = [
  { key: "wedding", label: "Wedding", Icon: Sparkles },
  { key: "corporate", label: "Corporate Event", Icon: Briefcase },
  { key: "birthday", label: "Birthday Celebration", Icon: Cake },
  { key: "exhibition", label: "Exhibition / Public Event", Icon: Palette },
];

const cardBaseClass =
  "flex cursor-pointer flex-col items-start gap-3 rounded-xl border border-neutral-200 bg-white p-5 font-sans transition-all duration-300 hover:border-neutral-400 hover:shadow-sm";
const cardActiveClass =
  "border-[#0F766E] bg-[#F0FDFA] shadow-[0_4px_16px_-10px_rgba(15,118,110,0.35)] hover:border-[#0F766E] hover:shadow-[0_6px_20px_-10px_rgba(15,118,110,0.4)]";

/**
 * Desktop-only filter dropdown panel (render inside a `relative` header wrapper).
 * Backdrop is portaled; panel uses absolute positioning below the search row.
 *
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   selectedKey: string | null;
 *   onApply: (key: string | null) => void;
 * }} props
 */
export default function HomeDesktopFilterModal({
  open,
  onClose,
  selectedKey,
  onApply,
}) {
  const [mounted, setMounted] = useState(false);
  const [draftKey, setDraftKey] = useState(selectedKey);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setDraftKey(selectedKey);
  }, [open, selectedKey]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  function handleClear() {
    setDraftKey(null);
  }

  function handleApply() {
    onApply(draftKey);
    onClose();
  }

  function toggleOption(key) {
    setDraftKey((current) => (current === key ? null : key));
  }

  const backdrop =
    open &&
    createPortal(
      <div
        className="fixed inset-0 z-[55] hidden bg-black/20 lg:block"
        role="presentation"
        aria-hidden="true"
        onClick={onClose}
      />,
      document.body
    );

  if (!open) {
    return backdrop;
  }

  return (
    <>
      {backdrop}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-desktop-filter-title"
        className="absolute left-0 right-0 top-full z-[60] mx-auto mt-1.5 hidden w-full max-w-4xl rounded-2xl border border-neutral-100 bg-white px-10 py-8 font-sans shadow-xl lg:block"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="absolute right-5 top-5 inline-flex size-9 items-center justify-center rounded-full font-sans text-neutral-500 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
        >
          <X className="size-5" strokeWidth={1.75} aria-hidden />
        </button>

        <h3
          id="home-desktop-filter-title"
          className="mb-5 pr-10 font-sans text-lg font-bold tracking-tight text-neutral-800"
        >
          Let&apos;s match your style. What type of gathering is this?
        </h3>

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {GATHERING_FILTER_OPTIONS.map(({ key, label, Icon }) => {
            const isSelected = draftKey === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleOption(key)}
                className={`${cardBaseClass} ${isSelected ? cardActiveClass : ""}`}
              >
                <span
                  className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl font-sans transition-colors duration-300 ${
                    isSelected ? "bg-[#0F766E]/12 text-[#0F766E]" : "bg-neutral-50 text-neutral-500"
                  }`}
                  aria-hidden
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="font-sans text-base font-semibold text-neutral-800">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
          <button
            type="button"
            onClick={handleClear}
            className="font-sans text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-neutral-800"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center justify-center rounded-xl bg-[#0F766E] px-5 py-2.5 font-sans text-sm font-semibold tracking-wide text-white shadow-sm transition-opacity duration-200 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/40 focus-visible:ring-offset-2"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
