"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * @param {{ value: string; onChange: (next: string) => void; disabled?: boolean }} props
 */
export default function SixDigitOtpInput({ value, onChange, disabled = false }) {
  const refs = useRef(/** @type {(HTMLInputElement | null)[]} */ ([]));

  const digits = String(value || "")
    .replace(/\D/g, "")
    .slice(0, 6)
    .split("");
  while (digits.length < 6) digits.push("");

  const setAt = useCallback(
    (index, char) => {
      const base = String(value || "").replace(/\D/g, "").slice(0, 6);
      const arr = base.split("");
      while (arr.length < 6) arr.push("");
      arr[index] = char;
      onChange(arr.join("").replace(/\D/g, "").slice(0, 6));
    },
    [onChange, value],
  );

  useEffect(() => {
    const len = String(value || "").replace(/\D/g, "").length;
    if (len < 6 && !disabled) {
      refs.current[len]?.focus();
    }
  }, [value, disabled]);

  function focusAt(i) {
    refs.current[i]?.focus();
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5" role="group" aria-label="One-time passcode">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={d}
          aria-label={`Digit ${i + 1}`}
          className="aspect-square h-12 w-12 shrink-0 rounded-lg border border-stone-200 bg-white text-center text-lg font-semibold tabular-nums text-stone-900 outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2 disabled:opacity-50 sm:h-14 sm:w-14"
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(-1);
            if (v) {
              setAt(i, v);
              if (i < 5) focusAt(i + 1);
            } else {
              setAt(i, "");
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              if (d) {
                setAt(i, "");
              } else if (i > 0) {
                focusAt(i - 1);
                setAt(i - 1, "");
              }
              e.preventDefault();
            }
            if (e.key === "ArrowLeft" && i > 0) {
              focusAt(i - 1);
              e.preventDefault();
            }
            if (e.key === "ArrowRight" && i < 5) {
              focusAt(i + 1);
              e.preventDefault();
            }
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (text.length > 0) {
              e.preventDefault();
              onChange(text);
              focusAt(Math.min(text.length, 5));
            }
          }}
        />
      ))}
    </div>
  );
}
