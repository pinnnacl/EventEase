import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { parseResponsiveImageField } from "../../lib/imageVariants";

export default function AdminVendorsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [coordLat, setCoordLat] = useState("");
  const [coordLng, setCoordLng] = useState("");
  const [coordSaving, setCoordSaving] = useState(false);
  const [coordErr, setCoordErr] = useState("");
  const [coordOk, setCoordOk] = useState(false);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);
  const selectedVendorIdRef = useRef(null);
  const profileFileRef = useRef(null);
  const galleryFileRef = useRef(null);
  const [mediaErr, setMediaErr] = useState("");
  const [mediaBusy, setMediaBusy] = useState(/** @type {null | "profile" | "gallery"} */ (null));
  const [profileUrlDraft, setProfileUrlDraft] = useState("");
  const [galleryUrlDraft, setGalleryUrlDraft] = useState("");
  const [featuredVenue, setFeaturedVenue] = useState(false);
  const [verifiedVenue, setVerifiedVenue] = useState(false);
  const [venueFlagsSaving, setVenueFlagsSaving] = useState(false);
  const [venueFlagsErr, setVenueFlagsErr] = useState("");
  const [venueFlagsOk, setVenueFlagsOk] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/vendors");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        await router.replace("/admin/login");
        return;
      }
      setVendors(Array.isArray(data.vendors) ? data.vendors : []);
    } catch {
      setError("Could not load vendors");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setProfileUrlDraft("");
    setGalleryUrlDraft("");
  }, [selectedVendor?.id]);

  useEffect(() => {
    if (!selectedVendor) {
      selectedVendorIdRef.current = null;
      return;
    }
    const prevId = selectedVendorIdRef.current;
    const id = selectedVendor.id;
    setCoordLat(selectedVendor.lat != null ? String(selectedVendor.lat) : "");
    setCoordLng(selectedVendor.lng != null ? String(selectedVendor.lng) : "");
    setFeaturedVenue(Boolean(selectedVendor.featuredVenue));
    setVerifiedVenue(Boolean(selectedVendor.verifiedVenue));
    if (prevId !== id) {
      setCoordErr("");
      setCoordOk(false);
      setVenueFlagsErr("");
      setVenueFlagsOk(false);
    }
    selectedVendorIdRef.current = id;
  }, [selectedVendor]);

  useEffect(() => {
    if (!coordOk) return;
    const t = setTimeout(() => setCoordOk(false), 4500);
    return () => clearTimeout(t);
  }, [coordOk]);

  async function saveCoordinates() {
    if (!selectedVendor) return;
    setCoordSaving(true);
    setCoordErr("");
    setCoordOk(false);
    const latStr = coordLat.trim();
    const lngStr = coordLng.trim();
    let body;
    if (latStr === "" && lngStr === "") {
      body = { latitude: null, longitude: null };
    } else {
      const latitude = parseFloat(latStr);
      const longitude = parseFloat(lngStr);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        setCoordErr("Enter two valid decimal numbers, or leave both fields empty to clear saved coordinates.");
        setCoordSaving(false);
        return;
      }
      body = { latitude, longitude };
    }

    try {
      const res = await fetch(`/api/admin/vendor/${selectedVendor.id}/coordinates`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCoordErr(data.error || "Could not save coordinates");
        setCoordSaving(false);
        return;
      }
      if (data.vendor) {
        setSelectedVendor(data.vendor);
      }
      setCoordOk(true);
      await load();
    } catch {
      setCoordErr("Network error");
    } finally {
      setCoordSaving(false);
    }
  }

  async function patchStatus(id, action) {
    setActionLoading(true);
    const res = await fetch(`/api/admin/vendor/${id}/${action}`, { method: "PATCH" });
    const data = await res.json().catch(() => ({}));
    setActionLoading(false);
    if (!res.ok) return;
    if (selectedVendor?.id === id) {
      if (data.vendor) {
        setSelectedVendor(data.vendor);
      } else {
        setSelectedVendor((prev) => (prev ? { ...prev, status: action === "approve" ? "approved" : "rejected" } : prev));
      }
    }
    await load();
  }

  async function saveVenueFlags() {
    if (!selectedVendor || selectedVendor.category !== "Venue") return;
    setVenueFlagsSaving(true);
    setVenueFlagsErr("");
    setVenueFlagsOk(false);
    try {
      const res = await fetch(`/api/admin/vendor/${selectedVendor.id}/venue-flags`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featuredVenue, verifiedVenue }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setVenueFlagsErr(data.error || "Could not save venue flags");
        return;
      }
      if (data.vendor) setSelectedVendor(data.vendor);
      setVenueFlagsOk(true);
      await load();
    } catch {
      setVenueFlagsErr("Network error");
    } finally {
      setVenueFlagsSaving(false);
    }
  }

  async function deleteVendor(id, businessName) {
    const ok = window.confirm(`Delete "${businessName}"? This cannot be undone.`);
    if (!ok) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/vendor/${id}/delete`, { method: "DELETE" });
      if (!res.ok) return;
      if (selectedVendor?.id === id) {
        setIsPanelOpen(false);
        setSelectedVendor(null);
      }
      setVendors((prev) => prev.filter((v) => v.id !== id));
    } finally {
      setActionLoading(false);
    }
  }

  function galleryThumbSrc(item) {
    const s = String(item ?? "").trim();
    if (!s) return "";
    return parseResponsiveImageField(s)?.large || s;
  }

  async function fileToBase64DataUrl(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(/** @type {string} */ (r.result));
      r.onerror = () => reject(new Error("Could not read file"));
      r.readAsDataURL(file);
    });
  }

  async function uploadVendorImage(target) {
    const input = target === "profile" ? profileFileRef.current : galleryFileRef.current;
    const file = input?.files?.[0];
    if (!file || !selectedVendor) return;
    setMediaErr("");
    setMediaBusy(target);
    try {
      const fileBase64 = await fileToBase64DataUrl(file);
      const res = await fetch(`/api/admin/vendor/${selectedVendor.id}/upload-media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ fileBase64, target }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        await router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        setMediaErr(data.error || "Upload failed");
        return;
      }
      if (data.vendor) setSelectedVendor(data.vendor);
      await load();
    } catch {
      setMediaErr("Network error");
    } finally {
      setMediaBusy(null);
      if (input) input.value = "";
    }
  }

  async function removeGalleryImage(index) {
    if (!selectedVendor?.galleryImages?.length) return;
    const next = selectedVendor.galleryImages.filter((_, i) => i !== index);
    setMediaErr("");
    setMediaBusy("gallery");
    try {
      const res = await fetch(`/api/admin/vendor/${selectedVendor.id}/media`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ galleryImages: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        await router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        setMediaErr(data.error || "Could not update gallery");
        return;
      }
      if (data.vendor) setSelectedVendor(data.vendor);
      await load();
    } finally {
      setMediaBusy(null);
    }
  }

  async function importProfileFromUrl() {
    const url = profileUrlDraft.trim();
    if (!url || !selectedVendor) return;
    setMediaErr("");
    setMediaBusy("profile");
    try {
      const res = await fetch(`/api/admin/vendor/${selectedVendor.id}/ingest-image-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ imageUrl: url, target: "profile" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        await router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        setMediaErr(data.error || "Could not import from URL");
        return;
      }
      if (data.vendor) setSelectedVendor(data.vendor);
      await load();
      setProfileUrlDraft("");
    } catch {
      setMediaErr("Network error");
    } finally {
      setMediaBusy(null);
    }
  }

  async function importGalleryFromUrl() {
    const url = galleryUrlDraft.trim();
    if (!url || !selectedVendor) return;
    setMediaErr("");
    setMediaBusy("gallery");
    try {
      const res = await fetch(`/api/admin/vendor/${selectedVendor.id}/ingest-image-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ imageUrl: url, target: "gallery" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        await router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        setMediaErr(data.error || "Could not import from URL");
        return;
      }
      if (data.vendor) setSelectedVendor(data.vendor);
      await load();
      setGalleryUrlDraft("");
    } catch {
      setMediaErr("Network error");
    } finally {
      setMediaBusy(null);
    }
  }

  async function clearProfileImage() {
    if (!selectedVendor) return;
    if (!window.confirm("Remove this vendor’s profile image?")) return;
    setMediaErr("");
    setMediaBusy("profile");
    try {
      const res = await fetch(`/api/admin/vendor/${selectedVendor.id}/media`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ profileImage: null }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        await router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        setMediaErr(data.error || "Could not clear image");
        return;
      }
      if (data.vendor) setSelectedVendor(data.vendor);
      await load();
    } finally {
      setMediaBusy(null);
    }
  }

  useEffect(() => {
    if (!isPanelOpen) return;
    closeBtnRef.current?.focus();

    function onKeyDown(e) {
      if (e.key === "Escape") {
        setIsPanelOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPanelOpen]);

  function previewHref(v) {
    if (!v?.id) return "#";
    const q = "?adminPreview=1";
    if (v.category === "Photographer") return `/photography/${v.id}${q}`;
    if (v.category === "Makeup") return `/makeup/${v.id}${q}`;
    return `/venue/${v.id}${q}`;
  }

  const statusPillClass = (status) =>
    `rounded-full px-2.5 py-1 text-xs font-semibold ${
      status === "approved"
        ? "bg-emerald-100 text-emerald-700"
        : status === "rejected"
          ? "bg-rose-100 text-rose-700"
          : "bg-amber-100 text-amber-700"
    }`;

  return (
    <>
      <Head><title>Admin Vendors | THAALI</title></Head>
      <main className="container-default w-full max-w-none py-10 sm:py-14">
        <div className="mx-auto w-full max-w-6xl rounded-2xl border border-stone-200/70 bg-white p-6 shadow-[0_18px_60px_-34px_rgba(20,43,60,0.35)] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-brand-950 sm:text-3xl">Vendor moderation</h1>
              <p className="mt-2 text-sm text-stone-600">
                Approve or reject vendor profiles. Only approved vendors are publicly visible.
              </p>
            </div>
            <Link
              href="/admin/bulk-vendors"
              className="shrink-0 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-900 transition hover:bg-brand-100"
            >
              Bulk import vendors
            </Link>
          </div>
          {loading ? <p className="mt-6 text-sm text-stone-600">Loading…</p> : error ? <p className="mt-6 text-sm font-medium text-red-700">{error}</p> : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-stone-500">
                  <tr className="border-b border-stone-200">
                    <th className="py-3 pr-4">Business</th>
                    <th className="py-3 pr-4">Category</th>
                    <th className="py-3 pr-4">Owner</th>
                    <th className="py-3 pr-4">Location</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Details</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => (
                    <tr key={v.id} className="border-b border-stone-100">
                      <td className="py-3 pr-4 font-semibold text-stone-900">{v.businessName}</td>
                      <td className="py-3 pr-4 text-stone-700">{v.category}</td>
                      <td className="py-3 pr-4 text-stone-600">
                        {v.userId ? (
                          <span className="text-emerald-800">Linked</span>
                        ) : (
                          <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-700">
                            Unclaimed
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-stone-700">{v.city}, {v.state}</td>
                      <td className="py-3 pr-4">
                        <span className={statusPillClass(v.status)}>{v.status}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={previewHref(v)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25 focus-visible:ring-offset-2"
                            aria-label={`Open public preview for ${v.businessName}`}
                          >
                            View live page
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVendor(v);
                              setIsPanelOpen(true);
                            }}
                            className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25 focus-visible:ring-offset-2"
                            aria-label={`Quick details for ${v.businessName}`}
                          >
                            Quick details
                          </button>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => patchStatus(v.id, "approve")}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => patchStatus(v.id, "reject")}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => deleteVendor(v.id, v.businessName)}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <div
        className={`fixed inset-0 z-[70] transition duration-300 ${isPanelOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!isPanelOpen}
      >
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${isPanelOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsPanelOpen(false)}
        />

        <aside
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Vendor details"
          className={`absolute right-0 top-0 h-full w-full max-w-full overflow-y-auto border-l border-stone-200/70 bg-white shadow-[0_20px_50px_-30px_rgba(20,43,60,0.42)] transition-transform duration-300 sm:max-w-lg ${
            isPanelOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-stone-200/70 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-stone-900 sm:text-lg">Vendor details</h2>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => setIsPanelOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-700 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25 focus-visible:ring-offset-2"
              aria-label="Close details panel"
            >
              ✕
            </button>
          </div>

          {selectedVendor ? (
            <div className="space-y-6 px-5 py-5 sm:px-6">
              <section>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Business name</p>
                <p className="mt-1 text-base font-semibold text-stone-900">{selectedVendor.businessName}</p>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Category</p>
                  <p className="mt-1 text-sm text-stone-800">{selectedVendor.category}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Status</p>
                  <p className="mt-1"><span className={statusPillClass(selectedVendor.status)}>{selectedVendor.status}</span></p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Location</p>
                  <p className="mt-1 text-sm text-stone-800">{selectedVendor.city}, {selectedVendor.state}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Phone number</p>
                  <p className="mt-1 text-sm text-stone-800">{selectedVendor.phone || "Not provided"}</p>
                </div>
              </section>

              <section>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Description</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-700">{selectedVendor.description || "No description provided."}</p>
              </section>

              {selectedVendor.category === "Venue" ? (
                <section className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">Venue badges (admin only)</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600">
                    Controls featured and verified badges on the public mobile summary card. Vendors cannot edit these.
                  </p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-800">
                      <input
                        type="checkbox"
                        checked={featuredVenue}
                        onChange={(e) => setFeaturedVenue(e.target.checked)}
                        className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                      />
                      Featured Venue
                    </label>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-800">
                      <input
                        type="checkbox"
                        checked={verifiedVenue}
                        onChange={(e) => setVerifiedVenue(e.target.checked)}
                        className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                      />
                      Verified Venue
                    </label>
                  </div>
                  {venueFlagsErr ? <p className="mt-2 text-xs font-medium text-red-700">{venueFlagsErr}</p> : null}
                  <button
                    type="button"
                    disabled={venueFlagsSaving || actionLoading}
                    onClick={saveVenueFlags}
                    className="mt-3 rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {venueFlagsSaving ? "Saving…" : "Save venue badges"}
                  </button>
                  {venueFlagsOk ? (
                    <p className="mt-2 text-xs font-semibold text-emerald-800" role="status">
                      Venue badges saved
                    </p>
                  ) : null}
                </section>
              ) : null}

              <section className="rounded-xl border border-brand-200/60 bg-brand-50/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-800">Map coordinates (admin only)</p>
                <p className="mt-1 text-xs leading-relaxed text-stone-600">
                  WGS84 decimal degrees. Used for &quot;distance from you&quot; on listings. Vendors cannot edit this.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="admin-coord-lat" className="text-xs font-medium text-stone-700">
                      Latitude
                    </label>
                    <input
                      id="admin-coord-lat"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="e.g. 9.9312"
                      value={coordLat}
                      onChange={(e) => setCoordLat(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="admin-coord-lng" className="text-xs font-medium text-stone-700">
                      Longitude
                    </label>
                    <input
                      id="admin-coord-lng"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="e.g. 76.2673"
                      value={coordLng}
                      onChange={(e) => setCoordLng(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-2"
                    />
                  </div>
                </div>
                {coordErr ? <p className="mt-2 text-xs font-medium text-red-700">{coordErr}</p> : null}
                <button
                  type="button"
                  disabled={coordSaving}
                  onClick={saveCoordinates}
                  className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {coordSaving ? "Saving…" : "Save coordinates"}
                </button>
                {coordOk ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200/90 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-900 shadow-sm"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs text-white" aria-hidden>
                      ✓
                    </span>
                    Saved
                  </div>
                ) : null}
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Pricing</p>
                  <p className="mt-1 text-sm text-stone-800">{selectedVendor.pricingRange || "Not provided"}</p>
                </div>
              </section>

              <section className="rounded-xl border border-stone-200/90 bg-stone-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-600">Photos (admin)</p>
                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                  File uploads and <strong className="font-medium text-stone-600">Import from URL</strong> use the same
                  pipeline as the vendor profile: remote images are fetched, optimized to WebP, and stored in{" "}
                  <code className="text-[0.65rem]">vendor-media</code> when needed. You can also paste a direct HTTPS URL
                  to your bucket or responsive JSON <code className="text-[0.65rem]">{`{"thumb","medium","large"}`}</code>.
                  JPEG/PNG/WebP/GIF files, max ~6MB.
                </p>
                {mediaErr ? (
                  <p className="mt-2 text-xs font-medium text-red-700" role="alert">
                    {mediaErr}
                  </p>
                ) : null}

                <div className="mt-4 border-t border-stone-200/80 pt-4">
                  <p className="text-xs font-semibold text-stone-700">Profile image</p>
                  <div className="mt-2 flex flex-wrap items-end gap-3">
                    {selectedVendor.profileImage ? (
                      <img
                        src={selectedVendor.profileImage}
                        alt=""
                        className="h-20 w-20 rounded-xl border border-stone-200 object-cover"
                      />
                    ) : (
                      <span className="text-sm text-stone-500">None</span>
                    )}
                    <input
                      ref={profileFileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={() => uploadVendorImage("profile")}
                    />
                    <button
                      type="button"
                      disabled={mediaBusy !== null || actionLoading}
                      onClick={() => profileFileRef.current?.click()}
                      className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-50"
                    >
                      {mediaBusy === "profile" ? "Uploading…" : "Upload profile image"}
                    </button>
                    {selectedVendor.profileImage ? (
                      <button
                        type="button"
                        disabled={mediaBusy !== null || actionLoading}
                        onClick={clearProfileImage}
                        className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-3 max-w-lg space-y-1.5">
                    <label htmlFor="admin-profile-img-url" className="text-xs font-medium text-stone-700">
                      Or paste image URL
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        id="admin-profile-img-url"
                        type="url"
                        autoComplete="off"
                        value={profileUrlDraft}
                        onChange={(e) => setProfileUrlDraft(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-2"
                      />
                      <button
                        type="button"
                        disabled={mediaBusy !== null || actionLoading || !profileUrlDraft.trim()}
                        onClick={importProfileFromUrl}
                        className="shrink-0 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-900 hover:bg-brand-100 disabled:opacity-50"
                      >
                        {mediaBusy === "profile" ? "Importing…" : "Import from URL"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-stone-200/80 pt-4">
                  <p className="text-xs font-semibold text-stone-700">Gallery ({selectedVendor.galleryImages?.length ?? 0} / 12)</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selectedVendor.galleryImages || []).map((item, idx) => {
                      const src = galleryThumbSrc(item);
                      return (
                        <div key={`${src}-${idx}`} className="relative h-16 w-16 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
                          {src ? (
                            <img src={src} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full items-center justify-center text-[0.65rem] text-stone-400">?</span>
                          )}
                          <button
                            type="button"
                            disabled={mediaBusy !== null || actionLoading}
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded bg-black/60 text-[0.65rem] font-bold text-white hover:bg-black/80 disabled:opacity-50"
                            aria-label={`Remove gallery image ${idx + 1}`}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <input
                    ref={galleryFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={() => uploadVendorImage("gallery")}
                  />
                  <button
                    type="button"
                    disabled={
                      mediaBusy !== null || actionLoading || (selectedVendor.galleryImages?.length ?? 0) >= 12
                    }
                    onClick={() => galleryFileRef.current?.click()}
                    className="mt-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-50"
                  >
                    {mediaBusy === "gallery" ? "Uploading…" : "Add gallery image"}
                  </button>
                  <div className="mt-3 max-w-lg space-y-1.5">
                    <label htmlFor="admin-gallery-img-url" className="text-xs font-medium text-stone-700">
                      Or paste image URL to add
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        id="admin-gallery-img-url"
                        type="url"
                        autoComplete="off"
                        value={galleryUrlDraft}
                        onChange={(e) => setGalleryUrlDraft(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-2"
                      />
                      <button
                        type="button"
                        disabled={
                          mediaBusy !== null ||
                          actionLoading ||
                          !galleryUrlDraft.trim() ||
                          (selectedVendor.galleryImages?.length ?? 0) >= 12
                        }
                        onClick={importGalleryFromUrl}
                        className="shrink-0 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-900 hover:bg-brand-100 disabled:opacity-50"
                      >
                        {mediaBusy === "gallery" ? "Importing…" : "Import from URL"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex flex-wrap gap-2 border-t border-stone-200/70 pt-4">
                <button
                  type="button"
                  disabled={coordSaving || actionLoading}
                  onClick={() => saveCoordinates()}
                  className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
                  title="Save latitude and longitude (map coordinates)"
                >
                  {coordSaving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => patchStatus(selectedVendor.id, "approve")}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => patchStatus(selectedVendor.id, "reject")}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => deleteVendor(selectedVendor.id, selectedVendor.businessName)}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete
                </button>
              </section>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}

