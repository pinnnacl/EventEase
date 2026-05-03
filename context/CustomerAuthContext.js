"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import PhoneLoginSignupModal from "../components/auth/PhoneLoginSignupModal";

/** @typedef {{ name: string; location?: string; phone_hint: string; sessionExpiresAtSec?: number } | null} CustomerUser */

const CustomerAuthContext = createContext(
  /** @type {{
   *   loading: boolean;
   *   loggedIn: boolean;
   *   legacyLogin: boolean;
   *   customer: CustomerUser;
   *   refreshSession: () => Promise<void>;
   *   openLoginModal: () => void;
   *   ensureAuthenticated: (after: () => void | Promise<void>) => Promise<void>;
   *   ensureCallbackAuth: (after: (callbackPass: string) => void | Promise<void>) => Promise<
   *     | { ok: true }
   *     | { ok: true; pendingModal: true }
   *     | { ok: false; error: string }
   *   >;
   * }} */ (null),
);

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return ctx;
}

export function CustomerAuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [legacyLogin, setLegacyLogin] = useState(false);
  /** @type {CustomerUser} */
  const [customer, setCustomer] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const afterAuthRef = useRef(/** @type {null | ((pass: string) => void | Promise<void>)} */ (null));

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/session", { credentials: "same-origin" });
      const data = await res.json().catch(() => ({}));
      setLoggedIn(Boolean(data.loggedIn));
      setLegacyLogin(Boolean(data.legacyLogin));
      setCustomer(data.customer && typeof data.customer === "object" ? data.customer : null);

      if (data.customer && typeof window !== "undefined") {
        try {
          const k = "ee_cust_sess_slide_ms";
          const cooldownMs = 12 * 60 * 60 * 1000;
          const last = parseInt(sessionStorage.getItem(k) || "0", 10);
          if (Date.now() - last >= cooldownMs) {
            sessionStorage.setItem(k, String(Date.now()));
            const slide = await fetch("/api/auth/refresh-session", {
              method: "POST",
              credentials: "same-origin",
            });
            if (!slide.ok) {
              sessionStorage.removeItem(k);
            }
          }
        } catch {
          /* private mode / blocked storage */
        }
      }
    } catch {
      setLoggedIn(false);
      setLegacyLogin(false);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const openLoginModal = useCallback(() => {
    afterAuthRef.current = null;
    setLoginOpen(true);
  }, []);

  const ensureCallbackAuth = useCallback(
    async (after) => {
      const res = await fetch("/api/session", { credentials: "same-origin" });
      const data = await res.json().catch(() => ({}));
      if (data.customer) {
        const p = await fetch("/api/auth/mint-callback-pass", {
          method: "POST",
          credentials: "same-origin",
        });
        const pd = await p.json().catch(() => ({}));
        if (pd.ok && typeof pd.callbackPass === "string" && pd.callbackPass) {
          await after(pd.callbackPass);
          await refreshSession();
          return { ok: true };
        }
        const fromApi = typeof pd.error === "string" && pd.error.trim() ? pd.error.trim() : "";
        const fallback =
          p.status === 401
            ? "Your session expired. Please sign in again."
            : "Could not prepare callback verification. Check server configuration or sign in again.";
        if (process.env.NODE_ENV === "development") {
          console.warn("[CustomerAuth] mint-callback-pass failed while session exists:", pd?.error, p.status);
        }
        return { ok: false, error: fromApi || fallback };
      }
      afterAuthRef.current = after;
      setLoginOpen(true);
      return { ok: true, pendingModal: true };
    },
    [refreshSession],
  );

  /** Opens the phone OTP modal when there is no `customer` session; runs `after` after successful verify. */
  const ensureAuthenticated = useCallback(async (after) => {
    const res = await fetch("/api/session", { credentials: "same-origin" });
    const data = await res.json().catch(() => ({}));
    if (data.customer) {
      await after();
      return;
    }
    afterAuthRef.current = async (_pass) => {
      await after();
    };
    setLoginOpen(true);
  }, []);

  const handleAuthenticated = useCallback(
    async (payload) => {
      const pass = typeof payload.callbackPass === "string" ? payload.callbackPass : "";
      const fn = afterAuthRef.current;
      afterAuthRef.current = null;
      await refreshSession();
      if (fn) {
        await fn(pass);
      }
    },
    [refreshSession],
  );

  const value = useMemo(
    () => ({
      loading,
      loggedIn,
      legacyLogin,
      customer,
      refreshSession,
      openLoginModal,
      ensureAuthenticated,
      ensureCallbackAuth,
    }),
    [loading, loggedIn, legacyLogin, customer, refreshSession, openLoginModal, ensureAuthenticated, ensureCallbackAuth],
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
      <PhoneLoginSignupModal
        open={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          afterAuthRef.current = null;
        }}
        onAuthenticated={handleAuthenticated}
      />
    </CustomerAuthContext.Provider>
  );
}
