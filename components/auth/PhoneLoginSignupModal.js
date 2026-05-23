"use client";

import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { formatOtpPhoneSubtitle, isTenDigitIndiaMobile } from "../../lib/auth/customerPhoneUi";
import { getCallbackSmsFirebaseAuth } from "../../lib/auth/callbackSmsFirebase";
import { normalizeWhatsAppRecipientDigits } from "../../lib/whatsappPhone";
import SixDigitOtpInput from "./SixDigitOtpInput";

const RECAPTCHA_CONTAINER_ID = "ee-customer-phone-recaptcha";

function mapFirebasePhoneError(err) {
  const code = String(err?.code || "");
  if (code === "auth/too-many-requests") return "Too many attempts. Wait a few minutes and try again.";
  if (code === "auth/invalid-verification-code") return "Invalid OTP. Check the code and try again.";
  if (code === "auth/code-expired") return "OTP expired. Request a new code.";
  return String(err?.message || "SMS verification failed.");
}

/**
 * @param {{
 *   id: string;
 *   placeholder: string;
 *   value: string;
 *   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
 *   type?: string;
 *   inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
 *   autoComplete?: string;
 *   maxLength?: number;
 *   inputRef?: React.Ref<HTMLInputElement>;
 *   "aria-label"?: string;
 * }} props
 */
function AuthTextField({
  id,
  placeholder,
  value,
  onChange,
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
  inputRef,
  "aria-label": ariaLabel,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`rounded-xl border bg-white transition-[border-color,box-shadow] duration-200 ${
        focused ? "border-[#1A1A1A] shadow-[0_0_0_3px_rgba(26,26,26,0.06)]" : "border-[#DDDDDD]"
      }`}
    >
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        className="w-full min-h-[3rem] border-0 bg-transparent px-3.5 py-3 text-sm text-[#222222] outline-none ring-0 placeholder:text-[#AAAAAA] caret-[#0F766E]"
      />
    </div>
  );
}

/**
 * @param {{
 *   value: string;
 *   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
 *   inputRef?: React.Ref<HTMLInputElement>;
 * }} props
 */
function PhoneInputField({ value, onChange, inputRef }) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`flex items-stretch overflow-hidden rounded-xl border bg-white transition-[border-color,box-shadow] duration-200 ${
        focused ? "border-[#1A1A1A] shadow-[0_0_0_3px_rgba(26,26,26,0.06)]" : "border-[#DDDDDD]"
      }`}
    >
      <span className="flex shrink-0 items-center border-r border-[#DDDDDD] bg-[#FAFAFA] px-3.5 text-sm font-semibold tabular-nums text-[#222222]">
        +91
      </span>
      <input
        ref={inputRef}
        id="auth-phone"
        type="tel"
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={10}
        placeholder="Enter mobile number"
        aria-label="Mobile number"
        className="min-h-[3rem] min-w-0 flex-1 border-0 bg-transparent px-3.5 py-3 text-sm text-[#222222] outline-none ring-0 placeholder:text-[#AAAAAA] caret-[#0F766E]"
      />
    </div>
  );
}

/**
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
function AuthPrimaryButton({ className = "", children, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex w-full items-center justify-center rounded-xl bg-[#1A1A1A] px-5 py-3.5 text-sm font-semibold text-white transition duration-200 hover:bg-[#333333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   onAuthenticated: (payload: { user: object; callbackPass: string }) => void | Promise<void>;
 * }} props
 */
export default function PhoneLoginSignupModal({ open, onClose, onAuthenticated }) {
  const router = useRouter();
  const titleId = useId();
  const phoneInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const nameInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const confirmationRef = useRef(null);
  const verifierRef = useRef(null);

  const [step, setStep] = useState("phone");
  const [name, setName] = useState("");
  const [phone10, setPhone10] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const clearVerifier = useCallback(() => {
    const v = verifierRef.current;
    if (v && typeof v.clear === "function") {
      try {
        v.clear();
      } catch {
        /* ignore */
      }
    }
    verifierRef.current = null;
    const el = document.getElementById(RECAPTCHA_CONTAINER_ID);
    if (el) el.innerHTML = "";
  }, []);

  useEffect(() => {
    if (!open) {
      setStep("phone");
      setName("");
      setPhone10("");
      setOtp("");
      setError("");
      setSending(false);
      setVerifying(false);
      confirmationRef.current = null;
      clearVerifier();
    }
  }, [open, clearVerifier]);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      if (step === "phone") phoneInputRef.current?.focus();
      if (step === "otp") nameInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, step]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, onClose]);

  const ensureVerifier = useCallback(async () => {
    clearVerifier();
    const container = document.getElementById(RECAPTCHA_CONTAINER_ID);
    if (!container) throw new Error("reCAPTCHA mount missing");
    container.innerHTML = "";
    const mountEl = document.createElement("div");
    mountEl.id = `ee-cb-recaptcha-${Date.now()}`;
    container.appendChild(mountEl);
    const auth = getCallbackSmsFirebaseAuth();
    if (process.env.NEXT_PUBLIC_FIREBASE_OTP_TEST_MODE === "true") {
      auth.settings.appVerificationDisabledForTesting = true;
    }
    const verifier = new RecaptchaVerifier(auth, mountEl, {
      size: "invisible",
      callback: () => {},
      "error-callback": () => {
        clearVerifier();
        setError("Captcha failed. Try again.");
      },
    });
    await verifier.render();
    verifierRef.current = verifier;
    return verifier;
  }, [clearVerifier]);

  const otpPhoneLine = formatOtpPhoneSubtitle(phone10);

  const onPhoneInput = useCallback((e) => {
    const next = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone10(next);
  }, []);

  const phoneValid = isTenDigitIndiaMobile(phone10);
  const tenDigitsEntered = phone10.length === 10;

  const sendOtp = useCallback(async () => {
    setError("");
    if (!isTenDigitIndiaMobile(phone10)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    const digits = normalizeWhatsAppRecipientDigits(phone10);
    if (!digits) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    const e164 = `+${digits}`;

    setSending(true);
    try {
      const verifier = await ensureVerifier();
      const auth = getCallbackSmsFirebaseAuth();
      const confirmation = await signInWithPhoneNumber(auth, e164, verifier);
      confirmationRef.current = confirmation;
      setOtp("");
      setStep("otp");
      clearVerifier();
    } catch (err) {
      clearVerifier();
      setError(mapFirebasePhoneError(err));
    } finally {
      setSending(false);
    }
  }, [phone10, ensureVerifier, clearVerifier]);

  const verify = useCallback(async () => {
    setError("");
    const code = otp.replace(/\D/g, "");
    if (code.length !== 6) {
      setError("Enter all 6 digits.");
      return;
    }
    const conf = confirmationRef.current;
    if (!conf) {
      setError("Request a code first.");
      return;
    }
    setVerifying(true);
    try {
      const cred = await conf.confirm(code);
      const idToken = await cred.user.getIdToken(true);
      const res = await fetch("/api/auth/complete-firebase-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          idToken,
          name: name.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not complete sign-in.");
        return;
      }
      await onAuthenticated({ user: data.user, callbackPass: String(data.callbackPass || "") });
      onClose();
    } catch (err) {
      setError(mapFirebasePhoneError(err));
    } finally {
      setVerifying(false);
    }
  }, [otp, name, onAuthenticated, onClose]);

  function goToVendorLogin() {
    onClose();
    void router.push("/vendor/login");
  }

  if (!open) return null;

  return (
    <div
      data-ee-modal="customer-firebase-phone"
      className="fixed inset-0 z-[130] flex items-end justify-center bg-black/45 backdrop-blur-[4px] lg:items-center lg:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="ee-auth-sheet flex max-h-[min(60vh,520px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[20px] bg-white shadow-[0_-16px_48px_-12px_rgba(15,23,42,0.2)] lg:max-h-[85vh] lg:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 justify-center pt-4 pb-2" aria-hidden>
          <div className="h-1 w-9 rounded-full bg-stone-300" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-1">
          {step === "phone" ? (
            <div key="phone" className="ee-auth-step-animate">
              <h2 id={titleId} className="text-[1.375rem] font-bold leading-tight tracking-tight text-[#222222]">
                Log in or sign up
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#717171]">
                We&apos;ll send a verification code to confirm your number.
              </p>

              <div className="mt-6">
                <PhoneInputField value={phone10} onChange={onPhoneInput} inputRef={phoneInputRef} />
              </div>

              <div id={RECAPTCHA_CONTAINER_ID} className="sr-only min-h-[1px]" aria-hidden />

              {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}

              <AuthPrimaryButton
                className="mt-5"
                disabled={!phoneValid || sending}
                onClick={() => void sendOtp()}
              >
                {sending ? "Sending…" : "Continue"}
              </AuthPrimaryButton>

              {tenDigitsEntered && !phoneValid ? (
                <p className="mt-2 text-center text-xs text-[#717171]">Use a valid Indian mobile (starts with 6–9).</p>
              ) : null}

              <p className="mt-4 text-center text-[0.6875rem] leading-relaxed text-[#717171]">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="font-medium text-[#222222] underline-offset-2 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-[#222222] underline-offset-2 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              <p className="mt-6 pb-1 text-center text-sm text-[#717171]">
                Own a business?{" "}
                <button
                  type="button"
                  className="font-semibold text-[#0F766E] underline decoration-[#0F766E]/40 underline-offset-[3px] hover:decoration-[#0F766E]"
                  onClick={goToVendorLogin}
                >
                  Sign in as a vendor
                </button>
              </p>
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
              <h2 id={titleId} className="text-[1.375rem] font-bold leading-tight tracking-tight text-[#222222]">
                Enter verification code
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#717171]">
                Sent to{" "}
                <span className="font-semibold tabular-nums text-[#222222]">{otpPhoneLine}</span>
              </p>

              <div className="mt-6">
                <SixDigitOtpInput value={otp} onChange={setOtp} disabled={verifying} />
              </div>

              <div className="mt-4">
                <AuthTextField
                  id="auth-name"
                  placeholder="What's your name?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  inputRef={nameInputRef}
                />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#717171]">
                Required for new accounts. Returning users can leave blank.
              </p>

              {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}

              <AuthPrimaryButton type="submit" className="mt-5" disabled={otp.replace(/\D/g, "").length !== 6 || verifying}>
                {verifying ? "Verifying…" : "Verify & continue"}
              </AuthPrimaryButton>

              <button
                type="button"
                disabled={verifying}
                onClick={() => {
                  confirmationRef.current = null;
                  clearVerifier();
                  setStep("phone");
                  setOtp("");
                  setError("");
                }}
                className="mt-4 w-full py-2 text-center text-sm font-medium text-[#717171] transition hover:text-[#222222] disabled:opacity-50"
              >
                Change phone number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
