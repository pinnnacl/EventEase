"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatOtpDestinationLine, isTenDigitIndiaMobile } from "../../lib/auth/customerPhoneUi";
import Button from "../Button";
import SixDigitOtpInput from "./SixDigitOtpInput";

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   onAuthenticated: (payload: { user: object; callbackPass: string }) => void | Promise<void>;
 * }} props
 */
export default function PhoneLoginSignupModal({ open, onClose, onAuthenticated }) {
  const nameInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const [step, setStep] = useState("form");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [phone10, setPhone10] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setStep("form");
      setName("");
      setLocation("");
      setPhone10("");
      setOtp("");
      setError("");
      setSending(false);
      setVerifying(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || step !== "form") return;
    const id = window.requestAnimationFrame(() => {
      nameInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, step]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose]);

  const otpDestinationLine = formatOtpDestinationLine(phone10);

  const onPhoneInput = useCallback((e) => {
    const next = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone10(next);
  }, []);

  const phoneValid = isTenDigitIndiaMobile(phone10);
  const tenDigitsEntered = phone10.length === 10;
  const getOtpDisabled = !name.trim() || !phoneValid || sending;

  const sendOtp = useCallback(async () => {
    setError("");
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!isTenDigitIndiaMobile(phone10)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: name.trim(),
          location: location.trim() || undefined,
          phone_number: phone10,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not send OTP. Try again.");
        return;
      }
      setOtp("");
      setStep("otp");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSending(false);
    }
  }, [name, location, phone10]);

  const verify = useCallback(async () => {
    setError("");
    const code = otp.replace(/\D/g, "");
    if (code.length !== 6) {
      setError("Enter all 6 digits.");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          phone_number: phone10,
          otp: code,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Verification failed.");
        return;
      }
      await onAuthenticated({ user: data.user, callbackPass: String(data.callbackPass || "") });
      onClose();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setVerifying(false);
    }
  }, [otp, phone10, onAuthenticated, onClose]);

  if (!open) return null;

  return (
    <div
      data-ee-modal="customer-sms-login"
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md min-h-[22rem] overflow-y-auto rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_24px_64px_-24px_rgba(15,23,42,0.35)] transition-all duration-300 ease-out sm:min-h-[24rem]"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "form" ? (
          <div key="form" className="ee-auth-step-animate">
            <h2 id="auth-modal-title" className="text-xl font-bold tracking-tight text-stone-900">
              Login or Signup to Continue
            </h2>
            <p className="mt-1.5 text-sm text-stone-600">We’ll text you a one-time code (SMS only).</p>

            <label className="mt-5 block text-sm font-semibold text-stone-800" htmlFor="auth-name">
              Full name
            </label>
            <input
              ref={nameInputRef}
              id="auth-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
              placeholder="Your full name"
              autoComplete="name"
            />

            <label className="mt-4 block text-sm font-semibold text-stone-800" htmlFor="auth-location">
              Location <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <input
              id="auth-location"
              value={location}
              onChange={(e) => setLocation(e.target.value.slice(0, 200))}
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
              placeholder="City or area"
              autoComplete="address-level2"
            />

            <label className="mt-4 block text-sm font-semibold text-stone-800" htmlFor="auth-phone">
              Phone number <span className="text-rose-600">*</span>
            </label>
            <div className="mt-1.5 flex items-stretch gap-2 rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-0.5 ring-brand-500/25 focus-within:border-brand-500 focus-within:ring-2">
              <span className="flex shrink-0 items-center text-sm font-semibold tabular-nums text-stone-600">
                +91
              </span>
              <input
                id="auth-phone"
                value={phone10}
                onChange={onPhoneInput}
                className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-sm tabular-nums outline-none ring-0"
                placeholder="9876543210"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
              />
            </div>

            <p className="mt-3 text-xs leading-relaxed text-stone-500">
              By proceeding, you agree to our{" "}
              <Link href="/privacy" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
                Terms of Use
              </Link>
              .
            </p>

            {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}

            <div className="mt-6 flex min-h-[2.75rem] flex-wrap items-center justify-end gap-2">
              {tenDigitsEntered ? (
                <Button
                  type="button"
                  className="rounded-xl px-5 transition-opacity duration-200 disabled:pointer-events-none disabled:opacity-40"
                  disabled={getOtpDisabled}
                  onClick={() => void sendOtp()}
                >
                  {sending ? "Sending…" : "Get OTP"}
                </Button>
              ) : null}
            </div>
            {tenDigitsEntered && !phoneValid ? (
              <p className="mt-2 text-xs text-stone-500">Use a valid Indian mobile (starts with 6–9).</p>
            ) : tenDigitsEntered && phoneValid && !name.trim() ? (
              <p className="mt-2 text-xs text-stone-500">Enter your full name to enable Get OTP.</p>
            ) : null}
          </div>
        ) : (
          <form
            key="otp"
            className="ee-auth-step-animate"
            onSubmit={(e) => {
              e.preventDefault();
              void verify();
            }}
          >
            <h2 id="auth-modal-title" className="text-xl font-bold tracking-tight text-stone-900">
              Enter OTP
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Enter OTP sent to{" "}
              <span className="font-semibold tabular-nums text-stone-800">{otpDestinationLine}</span>
            </p>

            <div className="mt-6">
              <SixDigitOtpInput value={otp} onChange={setOtp} disabled={verifying} />
            </div>

            {error ? <p className="mt-4 text-sm font-medium text-rose-700">{error}</p> : null}

            <div className="mt-6 flex w-full flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                disabled={verifying}
                onClick={() => {
                  setStep("form");
                  setOtp("");
                  setError("");
                }}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-50"
              >
                Back
              </button>
              <Button
                type="submit"
                className="rounded-xl px-5 disabled:pointer-events-none disabled:opacity-40"
                disabled={otp.replace(/\D/g, "").length !== 6 || verifying}
              >
                {verifying ? "Verifying…" : "Verify"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
