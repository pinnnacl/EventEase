"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

export const GATHERING_FILTER_OPTIONS = [
  { key: "wedding", label: "Wedding" },
  { key: "corporate", label: "Corporate Event" },
  { key: "birthday", label: "Birthday Celebration" },
  { key: "exhibition", label: "Exhibition / Public Event" },
];

const badgeBaseClass =
  "flex cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50/80 px-6 py-3 text-center font-sans text-sm font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-100";
const badgeActiveClass =
  "border-[#0F766E] bg-[#F0FDFA] text-[#115E59] hover:border-[#0F766E] hover:bg-[#F0FDFA]";

/**
 * Desktop-only filter dropdown panel (render inside a `relative` header wrapper).
 * No dimming overlay — panel uses absolute positioning below the search row.
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
  const [currentStep, setCurrentStep] = useState(1);
  const [draftDestination, setDraftDestination] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setDraftKey(selectedKey);
    setCurrentStep(1);
    setDraftDestination("");
  }, [open, selectedKey]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  function handleSkip() {
    onClose();
  }

  function selectOption(key) {
    setDraftKey(key);
    setCurrentStep(2);
  }

  function handleBack() {
    setCurrentStep(1);
  }

  function handleApply() {
    onApply(draftKey);
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-desktop-filter-title"
      className="absolute left-0 right-0 top-full z-[60] mx-auto mt-1.5 hidden w-full rounded-2xl border border-neutral-100 bg-white px-10 py-8 font-sans shadow-xl lg:block lg:max-w-2xl lg:pb-10 lg:pt-12"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close filters"
        className="absolute right-5 top-5 inline-flex size-9 items-center justify-center rounded-full font-sans text-neutral-500 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
      >
        <X className="size-5" strokeWidth={1.75} aria-hidden />
      </button>

      <div className="lg:transition-opacity lg:duration-200 lg:ease-in-out">
        {currentStep === 1 ? (
          <>
            <h3
              id="home-desktop-filter-title"
              className="mb-6 font-sans text-lg font-bold tracking-tight text-neutral-800 md:mb-8 md:text-left lg:mx-auto lg:max-w-xl"
            >
              Let&apos;s match your style. What type of gathering is this?
            </h3>

            <div className="mb-8 grid grid-cols-1 gap-3 lg:mx-auto lg:mb-8 lg:max-w-xl lg:grid-cols-2">
              {GATHERING_FILTER_OPTIONS.map(({ key, label }) => {
                const isSelected = draftKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => selectOption(key)}
                    className={`${badgeBaseClass} ${isSelected ? badgeActiveClass : ""}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 lg:flex lg:justify-end lg:pt-4">
              <button
                type="button"
                onClick={handleSkip}
                className="lg:inline-flex lg:items-center lg:justify-center lg:font-sans lg:font-semibold lg:text-xs lg:tracking-wide lg:px-4 lg:py-2 lg:text-neutral-600 lg:bg-neutral-50 lg:hover:bg-neutral-100 lg:border lg:border-neutral-200/60 lg:rounded-lg lg:shadow-sm lg:transition-all lg:duration-200"
              >
                Skip
              </button>
            </div>
          </>
        ) : (
          <>
            <h3
              id="home-desktop-filter-title"
              className="mb-6 font-sans text-lg font-bold tracking-tight text-neutral-800 md:mb-6 md:text-left lg:mx-auto lg:max-w-xl"
            >
              Where are we heading? Choose your destination
            </h3>

            <div className="mb-8 lg:mx-auto lg:mb-8 lg:max-w-xl">
              <input
                type="text"
                value={draftDestination}
                onChange={(e) => setDraftDestination(e.target.value)}
                placeholder="Search or enter city, region, or venue name..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-5 py-4 font-sans text-sm font-medium text-neutral-800 transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:outline-none lg:rounded-xl lg:border lg:border-neutral-200 lg:bg-neutral-50/60 lg:px-5 lg:py-4 lg:font-sans lg:text-sm lg:font-medium lg:text-neutral-800 lg:transition-all lg:placeholder:text-neutral-400 lg:focus:border-neutral-400 lg:focus:bg-white lg:focus:outline-none"
                aria-label="Destination search"
              />
            </div>

            <div className="flex items-center justify-between border-t border-neutral-100 pt-4 lg:flex lg:items-center lg:justify-between lg:border-t lg:border-neutral-100 lg:pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="font-sans text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-800 lg:font-sans lg:text-xs lg:font-semibold lg:text-neutral-500 lg:transition-colors lg:hover:text-neutral-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="rounded-lg bg-[#042f2e] px-5 py-2.5 font-sans text-xs font-semibold tracking-wide text-white shadow-sm transition-all hover:opacity-95 lg:inline-flex lg:items-center lg:justify-center lg:rounded-lg lg:bg-[#042f2e] lg:px-5 lg:py-2.5 lg:font-sans lg:text-xs lg:font-semibold lg:tracking-wide lg:text-white lg:shadow-sm lg:transition-all lg:hover:opacity-95"
              >
                Apply Filters
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
