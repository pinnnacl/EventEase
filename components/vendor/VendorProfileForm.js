import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { inputDisplayImageUrl, parseResponsiveImageField } from "../../lib/imageVariants";
import { ingestImageFromUrl, needsUrlIngestion } from "../../lib/vendorClientIngest";
import {
  PREDEFINED_VENUE_DETAIL_TITLES,
  buildPredefinedDescriptionMap,
  buildVenueDetailsPayload,
  extractCustomVenueDetails,
} from "../../lib/venueDetails";
import { SUITABLE_FOR_OPTIONS, VENUE_TYPE_OPTIONS } from "../../lib/venueHighlights";
import { resolveVendorFormVenueHighlights } from "../../lib/buildVenueMobileSummary";
import { DEFAULT_FACILITIES } from "../../lib/vendors";
import {
  PHOTO_GALLERY_CATEGORIES,
  parsePhotographyPackagePrice,
} from "../../lib/photographerProfileContent";
import { maskWhatsAppDestinationDigits, normalizeWhatsAppRecipientDigits } from "../../lib/whatsappPhone";
import { buildInitialMakeupProfile, makeupProfileToPayload } from "./makeupProfileFormState";
import MakeupVendorProfileSection from "./MakeupVendorProfileSection";

/**
 * @param {unknown[]} tags
 * @param {number} len
 * @returns {string[]}
 */
function alignGalleryTagsToLength(tags, len) {
  const out = [];
  for (let i = 0; i < len; i++) {
    const raw = typeof tags[i] === "string" ? tags[i].trim().toUpperCase() : "";
    out.push(
      PHOTO_GALLERY_CATEGORIES.includes(raw) ? raw : PHOTO_GALLERY_CATEGORIES[i % PHOTO_GALLERY_CATEGORIES.length],
    );
  }
  return out;
}

/** @param {object} vendor */
function buildInitialGalleryTags(vendor) {
  const p = vendor.photographerProfile && typeof vendor.photographerProfile === "object" ? vendor.photographerProfile : {};
  const imgs = Array.isArray(vendor.galleryImages) ? vendor.galleryImages.filter(Boolean) : [];
  const tags = Array.isArray(p.galleryTags) ? p.galleryTags : [];
  return alignGalleryTagsToLength(tags, imgs.length);
}

/**
 * @param {object} vendor
 * @returns {{ id: string, name: string, price: string, duration: string, description: string, featuresText: string, recommended: boolean }[]}
 */
function buildInitialPhotoPackageRows(vendor) {
  const p = vendor.photographerProfile && typeof vendor.photographerProfile === "object" ? vendor.photographerProfile : {};
  if (Array.isArray(p.packages) && p.packages.length) {
    return p.packages.map((pkg, i) => ({
      id: `pkg-${i}`,
      name: String(pkg.name || ""),
      price: pkg.price != null ? String(pkg.price) : "",
      duration: String(pkg.duration || pkg.per || "").trim() || "1 day",
      description: String(pkg.description || ""),
      featuresText: Array.isArray(pkg.features) ? pkg.features.join("\n") : "",
      recommended: Boolean(pkg.recommended ?? pkg.highlight),
    }));
  }
  const legacy = String(p.startingPrice || vendor.pricingRange || vendor.priceRange || "").trim();
  if (legacy) {
    const num = parsePhotographyPackagePrice(legacy);
    return [
      {
        id: "legacy-standard",
        name: "Standard",
        price: num != null ? String(num) : legacy.replace(/[^\d]/g, "") || legacy,
        duration: "1 day",
        description: "",
        featuresText: "",
        recommended: false,
      },
    ];
  }
  return [
    {
      id: "pkg-1",
      name: "",
      price: "",
      duration: "1 day",
      description: "",
      featuresText: "",
      recommended: false,
    },
  ];
}

const CATEGORIES = ["Photographer", "Makeup", "Venue"];

function normalizeDigits(raw) {
  let d = String(raw || "").replace(/\D/g, "");
  if (d.length === 10 && /^[6-9]/.test(d)) d = `91${d}`;
  if (d.length === 11 && d.startsWith("0")) d = `91${d.slice(1)}`;
  if (d.length < 10 || d.length > 15) return "";
  return d;
}

/**
 * @param {{ error?: string } | null} data
 * @param {number} status
 */
function messageFromVendorWhatsappOtpResponse(data, status) {
  if (data && typeof data.error === "string" && data.error.trim()) return data.error.trim();
  if (status === 429) return "Too many requests. Please wait and try again.";
  if (status >= 500) return "Server error. Try again later.";
  return "Could not complete WhatsApp verification.";
}

/**
 * @param {File} file
 */
async function uploadImageFile(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsDataURL(file);
  });
  const res = await fetch("/api/vendor/upload-media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ fileBase64: dataUrl }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (!data?.url && !data?.urls)) {
    throw new Error(data.error || "Upload failed");
  }
  if (data.urls?.thumb && data.urls?.medium && data.urls?.large) {
    return JSON.stringify({ thumb: data.urls.thumb, medium: data.urls.medium, large: data.urls.large });
  }
  return data.url;
}

/**
 * @param {{ vendor: object, onSaved?: (v: object) => void }} props
 */
export default function VendorProfileForm({ vendor, onSaved }) {
  const initialPhotographer = useMemo(() => {
    const p = vendor.photographerProfile && typeof vendor.photographerProfile === "object" ? vendor.photographerProfile : {};
    const deliverables = Array.isArray(p.deliverables)
      ? p.deliverables.map((d) => String(d?.label || "").trim()).filter(Boolean).join("\n")
      : "";
    const locations = Array.isArray(p.locations) ? p.locations.map((x) => String(x || "").trim()).filter(Boolean).join(", ") : "";
    return {
      tagline: String(p.tagline || "").trim(),
      deliverables,
      locations,
      years: String(p.trust?.years || "").trim(),
      events: String(p.trust?.events || "").trim(),
      heroImage: String(p.heroImage || "").trim(),
      description: String(p.description || "").trim(),
    };
  }, [vendor.photographerProfile]);

  const [businessName, setBusinessName] = useState(vendor.businessName || "");
  const [category, setCategory] = useState(vendor.category || CATEGORIES[0]);
  const [city, setCity] = useState(vendor.city || "");
  const [state, setState] = useState(vendor.state || "Kerala");
  const [place, setPlace] = useState(vendor.place || "");
  const [location, setLocation] = useState(vendor.location || "");
  const [phone, setPhone] = useState(vendor.phone || "");
  const [description, setDescription] = useState(vendor.description || "");
  const [pricingRange, setPricingRange] = useState(vendor.pricingRange || vendor.priceRange || "");
  const [capacity, setCapacity] = useState(vendor.capacity || "");
  const [profileImage, setProfileImage] = useState(vendor.profileImageStored ?? vendor.profileImage ?? "");
  const [galleryImages, setGalleryImages] = useState(
    Array.isArray(vendor.galleryImages) && vendor.galleryImages.length ? [...vendor.galleryImages] : [],
  );
  const [galleryTags, setGalleryTags] = useState(() => buildInitialGalleryTags(vendor));
  const [makeupProfile, setMakeupProfile] = useState(() => buildInitialMakeupProfile(vendor));
  const [facilities, setFacilities] = useState(
    Array.isArray(vendor.facilities) && vendor.facilities.length ? [...vendor.facilities] : [...DEFAULT_FACILITIES],
  );
  const [venueDetailMap, setVenueDetailMap] = useState(() => buildPredefinedDescriptionMap(vendor.venueDetails));
  const [venueDetailCustom, setVenueDetailCustom] = useState(() => extractCustomVenueDetails(vendor.venueDetails));
  const initialVenueHighlights = useMemo(() => resolveVendorFormVenueHighlights(vendor), [vendor]);
  const [venueType, setVenueType] = useState(() => initialVenueHighlights.venueType);
  const [yearsInBusiness, setYearsInBusiness] = useState(() =>
    initialVenueHighlights.yearsInBusiness != null ? String(initialVenueHighlights.yearsInBusiness) : "",
  );
  const [guestCapacity, setGuestCapacity] = useState(() =>
    initialVenueHighlights.guestCapacity != null ? String(initialVenueHighlights.guestCapacity) : "",
  );
  const [diningCapacity, setDiningCapacity] = useState(() =>
    initialVenueHighlights.diningCapacity != null ? String(initialVenueHighlights.diningCapacity) : "",
  );
  const [parkingCapacity, setParkingCapacity] = useState(() =>
    initialVenueHighlights.parkingCapacity != null ? String(initialVenueHighlights.parkingCapacity) : "",
  );
  const [airConditioned, setAirConditioned] = useState(initialVenueHighlights.airConditioned);
  const [stageAvailable, setStageAvailable] = useState(initialVenueHighlights.stageAvailable);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(initialVenueHighlights.wheelchairAccessible);
  const [suitableFor, setSuitableFor] = useState(() => [...initialVenueHighlights.suitableFor]);
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [customFacilityLine, setCustomFacilityLine] = useState("");
  const [photoTagline, setPhotoTagline] = useState(initialPhotographer.tagline);
  const [photoPackages, setPhotoPackages] = useState(() => buildInitialPhotoPackageRows(vendor));
  const [photoDeliverables, setPhotoDeliverables] = useState(initialPhotographer.deliverables);
  const [photoLocations, setPhotoLocations] = useState(initialPhotographer.locations);
  const [photoYears, setPhotoYears] = useState(initialPhotographer.years);
  const [photoEvents, setPhotoEvents] = useState(initialPhotographer.events);
  const [photoHeroImage, setPhotoHeroImage] = useState(initialPhotographer.heroImage);
  const [photoDescription, setPhotoDescription] = useState(initialPhotographer.description);

  useEffect(() => {
    setVenueDetailMap(buildPredefinedDescriptionMap(vendor.venueDetails));
    setVenueDetailCustom(extractCustomVenueDetails(vendor.venueDetails));
    const highlights = resolveVendorFormVenueHighlights(vendor);
    setVenueType(highlights.venueType);
    setYearsInBusiness(highlights.yearsInBusiness != null ? String(highlights.yearsInBusiness) : "");
    setGuestCapacity(highlights.guestCapacity != null ? String(highlights.guestCapacity) : "");
    setDiningCapacity(highlights.diningCapacity != null ? String(highlights.diningCapacity) : "");
    setParkingCapacity(highlights.parkingCapacity != null ? String(highlights.parkingCapacity) : "");
    setAirConditioned(highlights.airConditioned);
    setStageAvailable(highlights.stageAvailable);
    setWheelchairAccessible(highlights.wheelchairAccessible);
    setSuitableFor([...highlights.suitableFor]);
  }, [
    vendor.id,
    JSON.stringify(vendor.venueDetails ?? null),
    vendor.venueType,
    vendor.yearsInBusiness,
    vendor.guestCapacity,
    vendor.diningCapacity,
    vendor.parkingCapacity,
    vendor.airConditioned,
    vendor.stageAvailable,
    vendor.wheelchairAccessible,
    JSON.stringify(vendor.suitableFor ?? null),
    vendor.capacity,
    JSON.stringify(vendor.facilities ?? null),
  ]);

  useEffect(() => {
    setPhotoPackages(buildInitialPhotoPackageRows(vendor));
  }, [vendor.id, JSON.stringify(vendor.photographerProfile ?? null), vendor.pricingRange, vendor.priceRange]);

  useEffect(() => {
    setGalleryImages(
      Array.isArray(vendor.galleryImages) && vendor.galleryImages.length ? [...vendor.galleryImages] : [],
    );
    setGalleryTags(buildInitialGalleryTags(vendor));
  }, [vendor.id, JSON.stringify(vendor.galleryImages ?? null), JSON.stringify(vendor.photographerProfile?.galleryTags ?? null)]);

  useEffect(() => {
    setMakeupProfile(buildInitialMakeupProfile(vendor));
  }, [vendor.id, JSON.stringify(vendor.makeupProfile ?? null), vendor.description]);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [warnMsg, setWarnMsg] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSentTo, setOtpSentTo] = useState("");
  const [otpMsg, setOtpMsg] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpDebug, setOtpDebug] = useState("");
  const [localPhoneVerifiedAt, setLocalPhoneVerifiedAt] = useState(vendor?.phoneVerifiedAt ?? null);
  const [localPhoneVerifiedE164, setLocalPhoneVerifiedE164] = useState(vendor?.phoneVerifiedE164 ?? null);
  const [otpCooldownSec, setOtpCooldownSec] = useState(0);
  const [otpLocalLockSec, setOtpLocalLockSec] = useState(0);
  const otpFailureCountRef = useRef(0);
  /** Short-lived token from POST /api/vendor/otp/whatsapp/verify — required for PATCH /api/vendor/update when enforcement is on. */
  const vendorOtpSessionRef = useRef("");

  const categoryOptions = useMemo(() => {
    const c = vendor?.category;
    if (c && !CATEGORIES.includes(c)) return [c, ...CATEGORIES];
    return CATEGORIES;
  }, [vendor?.category]);

  const facilitySet = useMemo(() => new Set(facilities.map((f) => f.trim()).filter(Boolean)), [facilities]);

  useEffect(() => {
    setLocalPhoneVerifiedAt(vendor?.phoneVerifiedAt ?? null);
    setLocalPhoneVerifiedE164(vendor?.phoneVerifiedE164 ?? null);
  }, [vendor?.id, vendor?.phoneVerifiedAt, vendor?.phoneVerifiedE164]);

  const phoneVerified = Boolean(localPhoneVerifiedAt);
  const phoneMatchesVerified =
    normalizeDigits(phone) &&
    localPhoneVerifiedE164 &&
    normalizeDigits(phone) === normalizeDigits(localPhoneVerifiedE164);
  const isWhatsAppVerified = phoneVerified && phoneMatchesVerified;

  useEffect(() => {
    setOtpError("");
    setOtpMsg("");
    setOtpDebug("");
    setOtpCode("");
    setOtpSentTo("");
  }, [phone]);

  useEffect(() => {
    vendorOtpSessionRef.current = "";
    setOtpCode("");
    setOtpSentTo("");
    setOtpMsg("");
    setOtpError("");
  }, [vendor.id]);

  useEffect(() => {
    if (otpCooldownSec <= 0) return;
    const t = setInterval(() => {
      setOtpCooldownSec((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [otpCooldownSec]);

  useEffect(() => {
    if (otpLocalLockSec <= 0) return;
    const t = setInterval(() => {
      setOtpLocalLockSec((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [otpLocalLockSec]);

  const sendVendorWhatsAppOtp = useCallback(async () => {
    if (otpLocalLockSec > 0) {
      setOtpError(`Please wait ${otpLocalLockSec}s before trying again.`);
      return;
    }
    if (otpCooldownSec > 0) {
      setOtpError(`Please wait ${otpCooldownSec}s before requesting another code.`);
      return;
    }
    setOtpError("");
    setOtpMsg("");
    setOtpSending(true);
    try {
      const res = await fetch("/api/vendor/otp/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setOtpError(messageFromVendorWhatsappOtpResponse(data, res.status));
        otpFailureCountRef.current += 1;
        setOtpCooldownSec(30);
        if (otpFailureCountRef.current >= 5) {
          setOtpLocalLockSec(300);
          setOtpError("Too many failed send attempts. Please wait 5 minutes before trying again.");
        }
        return;
      }
      const hint =
        typeof data.sentToHint === "string" && data.sentToHint.trim()
          ? data.sentToHint.trim()
          : maskWhatsAppDestinationDigits(normalizeWhatsAppRecipientDigits(phone.trim()));
      setOtpSentTo(hint || "this number");
      setOtpMsg(typeof data.message === "string" ? data.message : "Check WhatsApp for your code.");
      if (process.env.NODE_ENV !== "production" && data.messageId) {
        setOtpDebug(`message_id=${data.messageId}`);
      } else {
        setOtpDebug("");
      }
      otpFailureCountRef.current = 0;
      setOtpCooldownSec(60);
      vendorOtpSessionRef.current = "";
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setOtpSending(false);
    }
  }, [otpCooldownSec, otpLocalLockSec, phone]);

  const verifyVendorWhatsAppOtp = useCallback(async () => {
    if (!otpCode.trim()) {
      setOtpError("Enter the 6-digit code from WhatsApp.");
      return;
    }
    setOtpError("");
    setOtpMsg("");
    setOtpVerifying(true);
    try {
      const res = await fetch("/api/vendor/otp/whatsapp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ code: otpCode.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setOtpError(messageFromVendorWhatsappOtpResponse(data, res.status));
        otpFailureCountRef.current += 1;
        if (otpFailureCountRef.current >= 8) {
          setOtpLocalLockSec(180);
          setOtpError("Too many incorrect attempts. Wait 3 minutes or request a new WhatsApp code.");
        }
        return;
      }
      if (typeof data.vendorOtpSession === "string" && data.vendorOtpSession.trim()) {
        vendorOtpSessionRef.current = data.vendorOtpSession.trim();
      }
      setOtpCode("");
      setOtpSentTo("");
      setOtpMsg("");
      if (process.env.NODE_ENV !== "production" && data.sessionExpiresAt) {
        setOtpDebug(`session_exp=${data.sessionExpiresAt}`);
      } else {
        setOtpDebug("");
      }
      if (data?.vendor) {
        setLocalPhoneVerifiedAt(data.vendor.phoneVerifiedAt ?? new Date().toISOString());
        setLocalPhoneVerifiedE164(data.vendor.phoneVerifiedE164 ?? null);
        if (typeof onSaved === "function") onSaved(data.vendor);
      }
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setOtpVerifying(false);
    }
  }, [onSaved, otpCode]);

  const toggleFacility = useCallback((label) => {
    setFacilities((prev) => {
      const s = new Set(prev);
      if (s.has(label)) s.delete(label);
      else s.add(label);
      return [...s];
    });
  }, []);

  const addCustomFacilities = useCallback(() => {
    const extra = customFacilityLine
      .split(/[\n,]/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (!extra.length) return;
    setFacilities((prev) => [...new Set([...prev, ...extra])]);
    setCustomFacilityLine("");
  }, [customFacilityLine]);

  const addPhotoPackage = useCallback(() => {
    setPhotoPackages((prev) => [
      ...prev,
      {
        id: `pkg-${Date.now()}`,
        name: "",
        price: "",
        duration: "1 day",
        description: "",
        featuresText: "",
        recommended: false,
      },
    ]);
  }, []);

  const removePhotoPackage = useCallback((id) => {
    setPhotoPackages((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }, []);

  const updatePhotoPackage = useCallback((id, field, value) => {
    setPhotoPackages((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const addVenueDetailCustom = useCallback(() => {
    setVenueDetailCustom((prev) => [...prev, { title: "", description: "" }]);
  }, []);

  const updateVenueDetailCustom = useCallback((index, field, value) => {
    setVenueDetailCustom((prev) => {
      const next = [...prev];
      const row = { ...next[index], [field]: value };
      next[index] = row;
      return next;
    });
  }, []);

  const removeVenueDetailCustom = useCallback((index) => {
    setVenueDetailCustom((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addGalleryUrl = useCallback(async () => {
    const u = galleryUrlInput.trim();
    if (!u || galleryImages.length >= 12) return;
    setError("");
    setUploadingGallery(true);
    try {
      let toAdd = u;
      if (needsUrlIngestion(u)) {
        toAdd = await ingestImageFromUrl(u);
      }
      setGalleryImages((g) => {
        const next = [...g, toAdd].slice(0, 12);
        setGalleryTags((t) => alignGalleryTagsToLength([...t, PHOTO_GALLERY_CATEGORIES[t.length % PHOTO_GALLERY_CATEGORIES.length]], next.length));
        return next;
      });
      setGalleryUrlInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import image");
    } finally {
      setUploadingGallery(false);
    }
  }, [galleryUrlInput, galleryImages.length]);

  const onProfileUrlIngest = useCallback(async () => {
    const u = profileImage.trim();
    if (!u) {
      setError("Paste an image URL or use Upload.");
      return;
    }
    if (!needsUrlIngestion(u)) {
      if (u.startsWith("{")) {
        try {
          const o = JSON.parse(u);
          if (o?.thumb && o?.medium && o?.large) {
            setProfileImage(u);
            setError("");
            return;
          }
        } catch {
          /* fall through */
        }
      }
      if (/^https?:\/\//i.test(u)) {
        setProfileImage(u);
        setError("");
        return;
      }
      setError("Paste a valid http(s) image URL, or use Upload.");
      return;
    }
    setUploadingProfile(true);
    setError("");
    try {
      const json = await ingestImageFromUrl(u);
      setProfileImage(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setUploadingProfile(false);
    }
  }, [profileImage]);

  const onPhotoHeroUrlIngest = useCallback(async () => {
    const u = photoHeroImage.trim();
    if (!u) {
      setError("Paste a hero image URL or use Upload.");
      return;
    }
    if (!needsUrlIngestion(u)) {
      if (u.startsWith("{")) {
        try {
          const o = JSON.parse(u);
          if (o?.thumb && o?.medium && o?.large) {
            setPhotoHeroImage(u);
            setError("");
            return;
          }
        } catch {
          /* fall through */
        }
      }
      if (/^https?:\/\//i.test(u)) {
        setPhotoHeroImage(u);
        setError("");
        return;
      }
      setError("Paste a valid http(s) image URL, or use Upload.");
      return;
    }
    setUploadingProfile(true);
    setError("");
    try {
      const json = await ingestImageFromUrl(u);
      setPhotoHeroImage(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setUploadingProfile(false);
    }
  }, [photoHeroImage]);

  const onProfileFile = useCallback(async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !f.type.startsWith("image/")) return;
    setUploadingProfile(true);
    setError("");
    try {
      const url = await uploadImageFile(f);
      setProfileImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingProfile(false);
    }
  }, []);

  const onGalleryFiles = useCallback(
    async (e) => {
      const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
      e.target.value = "";
      if (!files.length) return;
      setUploadingGallery(true);
      setError("");
      try {
        const urls = [];
        let n = galleryImages.length;
        for (const f of files) {
          if (n >= 12) break;
          urls.push(await uploadImageFile(f));
          n++;
        }
        setGalleryImages((g) => {
          const next = [...g, ...urls].slice(0, 12);
          setGalleryTags((t) => {
            let extended = [...t];
            while (extended.length < next.length) {
              extended.push(
                PHOTO_GALLERY_CATEGORIES[extended.length % PHOTO_GALLERY_CATEGORIES.length],
              );
            }
            return alignGalleryTagsToLength(extended, next.length);
          });
          return next;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploadingGallery(false);
      }
    },
    [galleryImages],
  );

  const onPhotoHeroFile = useCallback(async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !f.type.startsWith("image/")) return;
    setUploadingProfile(true);
    setError("");
    try {
      const url = await uploadImageFile(f);
      setPhotoHeroImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingProfile(false);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOkMsg("");
    setWarnMsg("");
    if (description.trim().length < 20) {
      setError("Description should be at least 20 characters.");
      return;
    }
    if (!place.trim()) {
      setError("Please enter the place or area to show on your public listing (e.g. Thiruvankulam).");
      return;
    }
    if (category === "Venue") {
      if (!venueType.trim()) {
        setError("Please select a venue type under Venue Highlights.");
        return;
      }
      const guestNum = parseInt(String(guestCapacity).trim(), 10);
      if (!Number.isFinite(guestNum) || guestNum < 1) {
        setError("Please enter guest capacity (minimum 1) under Venue Highlights.");
        return;
      }
      for (const t of PREDEFINED_VENUE_DETAIL_TITLES) {
        if (!venueDetailMap[t]?.trim()) {
          setError(`Please fill in Venue Details — ${t}.`);
          return;
        }
      }
      for (const row of venueDetailCustom) {
        if (!row.title?.trim() || !row.description?.trim()) {
          setError("Each custom venue detail needs both title and description, or remove the row.");
          return;
        }
      }
    }
    const otpEnforcementOff =
      String(process.env.NEXT_PUBLIC_VENDOR_OTP_ENFORCE ?? "").trim() === "0";
    if (!otpEnforcementOff && !vendorOtpSessionRef.current?.trim() && !isWhatsAppVerified) {
      setError(
        "Verify your WhatsApp OTP before saving. Tap Send WhatsApp OTP, enter the code we send to your registered number, then save.",
      );
      return;
    }

    setSubmitting(true);
    try {
      let profileValue = profileImage.trim();
      if (profileValue && needsUrlIngestion(profileValue)) {
        profileValue = await ingestImageFromUrl(profileValue);
        setProfileImage(profileValue);
      }

      const nextGallery = [];
      for (let i = 0; i < galleryImages.length; i++) {
        const item = galleryImages[i];
        if (needsUrlIngestion(item)) {
          nextGallery.push(await ingestImageFromUrl(item));
        } else {
          nextGallery.push(item);
        }
      }
      if (nextGallery.length !== galleryImages.length || nextGallery.some((x, i) => x !== galleryImages[i])) {
        setGalleryImages(nextGallery);
      }
      let heroValue = photoHeroImage.trim();
      if (heroValue && needsUrlIngestion(heroValue)) {
        heroValue = await ingestImageFromUrl(heroValue);
        setPhotoHeroImage(heroValue);
      }

      const payload = {
        businessName: businessName.trim(),
        category: category.trim(),
        city: city.trim(),
        state: state.trim(),
        place: place.trim() || null,
        location: location.trim() || null,
        phone: phone.trim(),
        description: description.trim(),
        pricingRange: pricingRange.trim() || null,
        capacity: capacity.trim() || null,
        profileImage: profileValue || null,
        galleryImages: nextGallery,
      };
      if (category === "Photographer") {
        const lines = photoDeliverables
          .split(/\n+/)
          .map((x) => x.trim())
          .filter(Boolean)
          .slice(0, 8);
        const locations = photoLocations
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
          .slice(0, 6);
        const prevProfile =
          vendor.photographerProfile && typeof vendor.photographerProfile === "object"
            ? { ...vendor.photographerProfile }
            : {};
        delete prevProfile.startingPrice;

        /** @type {{ name: string, price: number, duration: string, description: string, features: string[], recommended: boolean }[]} */
        const cleanedPackages = [];
        for (const row of photoPackages) {
          const name = row.name.trim();
          const priceRaw = row.price.trim();
          if (!name && !priceRaw) continue;
          if (name && !priceRaw) {
            setError("Each package needs a price.");
            setSubmitting(false);
            return;
          }
          if (priceRaw && !name) {
            setError("Each package needs a name.");
            setSubmitting(false);
            return;
          }
          const priceNum = parsePhotographyPackagePrice(priceRaw);
          if (priceNum == null) {
            setError("Enter a valid price (numbers only) for each package.");
            setSubmitting(false);
            return;
          }
          cleanedPackages.push({
            name,
            price: priceNum,
            duration: row.duration.trim() || "1 day",
            description: row.description.trim(),
            features: row.featuresText
              .split(/\n/)
              .map((x) => x.trim())
              .filter(Boolean),
            recommended: row.recommended,
          });
        }

        const galleryTagsPayload = alignGalleryTagsToLength(galleryTags, nextGallery.length);

        payload.photographerProfile = {
          ...prevProfile,
          tagline: photoTagline.trim(),
          description: photoDescription.trim() || description.trim(),
          locations,
          packages: cleanedPackages,
          deliverables: lines.map((label, i) => ({
            label,
            icon: ["clock", "photo", "raw", "video"][i % 4],
          })),
          heroImage: heroValue || null,
          gallery: nextGallery,
          galleryTags: galleryTagsPayload,
          trust: {
            years: photoYears.trim(),
            events: photoEvents.trim(),
            verified: vendor.status === "approved",
          },
        };
      }
      if (category === "Makeup") {
        const prevMakeup =
          vendor.makeupProfile && typeof vendor.makeupProfile === "object" ? { ...vendor.makeupProfile } : {};
        try {
          payload.makeupProfile = {
            ...prevMakeup,
            ...makeupProfileToPayload(makeupProfile, nextGallery, description.trim()),
          };
        } catch (err) {
          setError(err instanceof Error ? err.message : "Invalid makeup profile data");
          setSubmitting(false);
          return;
        }
      }
      if (category === "Venue") {
        payload.venueHighlights = {
          venueType: venueType.trim(),
          yearsInBusiness: yearsInBusiness.trim() || null,
          guestCapacity: guestCapacity.trim(),
          diningCapacity: diningCapacity.trim() || null,
          parkingCapacity: parkingCapacity.trim() || null,
          airConditioned,
          stageAvailable,
          wheelchairAccessible,
          suitableFor,
        };
        payload.venueDetails = buildVenueDetailsPayload(venueDetailMap, venueDetailCustom);
        payload.facilities = [];
      } else if (category === "Photographer" || category === "Makeup") {
        payload.facilities = [];
      } else {
        payload.facilities = facilities;
      }

      const headers = { "Content-Type": "application/json" };
      const sess = vendorOtpSessionRef.current?.trim();
      if (sess) {
        headers["x-vendor-whatsapp-otp-session"] = sess;
      }
      const res = await fetch("/api/vendor/update", {
        method: "PATCH",
        headers,
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save profile");
        return;
      }
      setOkMsg("Profile saved.");
      if (typeof data.warning === "string" && data.warning.trim()) {
        setWarnMsg(data.warning.trim());
      }
      if (typeof onSaved === "function" && data.vendor) onSaved(data.vendor);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-brand-950">Business</h2>
        <div>
          <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-businessName">
            Business name
          </label>
          <input
            id="vp-businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-category">
            Category
          </label>
          <select
            id="vp-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </section>

      {category === "Photographer" ? (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-brand-950">Photography profile content</h2>
          <p className="text-sm text-stone-600">
            These fields control your public photography profile page text and hero section.
          </p>
          <div>
            <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-photo-tagline">
              Tagline
            </label>
            <input
              id="vp-photo-tagline"
              value={photoTagline}
              onChange={(e) => setPhotoTagline(e.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
              placeholder="Cinematic & emotional storytelling"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-photo-description">
              Public description
            </label>
            <textarea
              id="vp-photo-description"
              value={photoDescription}
              onChange={(e) => setPhotoDescription(e.target.value)}
              className="mt-2 min-h-[120px] w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
              placeholder="What makes your style unique for couples."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-photo-locations">
              Service areas (comma separated)
            </label>
            <input
              id="vp-photo-locations"
              value={photoLocations}
              onChange={(e) => setPhotoLocations(e.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
              placeholder="Kochi, Ernakulam, Thrissur"
            />
          </div>

          <div className="rounded-2xl border border-stone-200/90 bg-stone-50/50 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-base font-semibold text-brand-950">Packages</h3>
                <p className="mt-1 text-sm text-stone-600">
                  Add one row per package. The public page shows the lowest price in the hero and lists all packages
                  below. If you clear every row, the <strong className="font-semibold text-stone-700">Pricing range</strong>{" "}
                  field under Contact &amp; story is used as a fallback.
                </p>
              </div>
              <button
                type="button"
                onClick={addPhotoPackage}
                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-dashed border-brand-300 bg-white px-4 py-2.5 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
              >
                + Add package
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {photoPackages.map((row) => (
                <div key={row.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Package</p>
                    {photoPackages.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removePhotoPackage(row.id)}
                        className="text-sm font-medium text-red-700 hover:underline"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700" htmlFor={`vp-pkg-name-${row.id}`}>
                        Name
                      </label>
                      <input
                        id={`vp-pkg-name-${row.id}`}
                        value={row.name}
                        onChange={(e) => updatePhotoPackage(row.id, "name", e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
                        placeholder="Basic"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700" htmlFor={`vp-pkg-price-${row.id}`}>
                        Price (INR)
                      </label>
                      <input
                        id={`vp-pkg-price-${row.id}`}
                        inputMode="numeric"
                        value={row.price}
                        onChange={(e) => updatePhotoPackage(row.id, "price", e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
                        placeholder="50000"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-stone-700" htmlFor={`vp-pkg-dur-${row.id}`}>
                      Duration
                    </label>
                    <input
                      id={`vp-pkg-dur-${row.id}`}
                      value={row.duration}
                      onChange={(e) => updatePhotoPackage(row.id, "duration", e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
                      placeholder="1 day"
                    />
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-stone-700" htmlFor={`vp-pkg-desc-${row.id}`}>
                      Description <span className="font-normal text-stone-500">(optional)</span>
                    </label>
                    <textarea
                      id={`vp-pkg-desc-${row.id}`}
                      value={row.description}
                      onChange={(e) => updatePhotoPackage(row.id, "description", e.target.value)}
                      rows={2}
                      className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
                      placeholder="Ideal for intimate weddings…"
                    />
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-stone-700" htmlFor={`vp-pkg-feat-${row.id}`}>
                      Features (one per line)
                    </label>
                    <textarea
                      id={`vp-pkg-feat-${row.id}`}
                      value={row.featuresText}
                      onChange={(e) => updatePhotoPackage(row.id, "featuresText", e.target.value)}
                      rows={4}
                      className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
                      placeholder={"1 photographer\n300 edited photos\nOnline gallery"}
                    />
                  </div>
                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-stone-800">
                    <input
                      type="checkbox"
                      checked={row.recommended}
                      onChange={(e) => updatePhotoPackage(row.id, "recommended", e.target.checked)}
                      className="rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                    />
                    Recommended (highlighted on your public page)
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-photo-deliverables">
              Deliverables (one per line)
            </label>
            <textarea
              id="vp-photo-deliverables"
              value={photoDeliverables}
              onChange={(e) => setPhotoDeliverables(e.target.value)}
              className="mt-2 min-h-[110px] w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
              placeholder={"4–6 weeks delivery\n400+ edited photos\nRAW available"}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-photo-years">
                Experience text
              </label>
              <input
                id="vp-photo-years"
                value={photoYears}
                onChange={(e) => setPhotoYears(e.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                placeholder="10+ years"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-photo-events">
                Events completed text
              </label>
              <input
                id="vp-photo-events"
                value={photoEvents}
                onChange={(e) => setPhotoEvents(e.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                placeholder="500+ events"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-photo-hero-url">
              Hero image URL (optional if you upload)
            </label>
            <input
              id="vp-photo-hero-url"
              value={inputDisplayImageUrl(photoHeroImage)}
              onChange={(e) => setPhotoHeroImage(e.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
              placeholder="https://…"
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onPhotoHeroUrlIngest}
                disabled={uploadingProfile}
                className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-900 transition hover:bg-brand-100 disabled:opacity-50"
              >
                {uploadingProfile ? "Processing…" : "Import & optimize URL"}
              </button>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-50">
                {uploadingProfile ? "Uploading…" : "Upload hero image"}
                <input type="file" accept="image/*" className="sr-only" onChange={onPhotoHeroFile} disabled={uploadingProfile} />
              </label>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-brand-950">Location</h2>
        <p className="text-sm text-stone-600">
          <strong className="font-semibold text-stone-700">Place</strong> is what couples see on your venue card (e.g.
          neighbourhood or town). City and state help with search; an optional longer address is only used behind the
          scenes for maps if needed.
        </p>
        <div>
          <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-place">
            Place <span className="font-normal text-stone-500">(shown on your listing)</span>
          </label>
          <input
            id="vp-place"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
            placeholder="e.g. Thiruvankulam"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-city">
              City
            </label>
            <input
              id="vp-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
              placeholder="Kochi"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-state">
              State
            </label>
            <input
              id="vp-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
              placeholder="Kerala"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-location">
            Full address <span className="font-normal text-stone-500">(optional)</span>
          </label>
          <input
            id="vp-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
            placeholder="Only if you want a longer line for map search — not shown as the main location"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-brand-950">Contact & story</h2>
        <div>
          <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-phone">
            Phone
          </label>
          <input
            id="vp-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
            required
          />
          {isWhatsAppVerified ? (
            <p className="mt-2 text-xs text-stone-600">
              This number is verified for WhatsApp. You can save profile changes below. Change the number to re-verify.
            </p>
          ) : (
            <p className="mt-2 text-xs text-stone-600">
              WhatsApp OTP is sent to the <strong className="font-semibold text-stone-700">number in this field</strong>.
              Verify the code before saving your profile.
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {!isWhatsAppVerified ? (
              <button
                type="button"
                onClick={() => void sendVendorWhatsAppOtp()}
                disabled={otpSending || otpVerifying || otpCooldownSec > 0 || otpLocalLockSec > 0}
                className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 transition hover:bg-stone-50 disabled:opacity-60"
              >
                {otpSending
                  ? "Sending…"
                  : otpLocalLockSec > 0
                    ? `Try again in ${otpLocalLockSec}s`
                    : otpCooldownSec > 0
                      ? `Resend in ${otpCooldownSec}s`
                      : "Send WhatsApp OTP"}
              </button>
            ) : null}
            {isWhatsAppVerified ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                Verified
              </span>
            ) : null}
          </div>
          {!isWhatsAppVerified && otpCooldownSec > 0 ? (
            <p className="mt-2 text-xs text-stone-600">Please wait {otpCooldownSec}s before requesting another OTP.</p>
          ) : null}
          {!isWhatsAppVerified && otpLocalLockSec > 0 ? (
            <p className="mt-1 text-xs text-amber-700">Temporary safety lock active. Try again in {otpLocalLockSec}s.</p>
          ) : null}
          {!isWhatsAppVerified && otpSentTo ? (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void verifyVendorWhatsAppOtp();
                  }
                }}
                className="min-w-0 flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
                placeholder={`6-digit code (${otpSentTo})`}
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => void verifyVendorWhatsAppOtp()}
                disabled={otpVerifying}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {otpVerifying ? "Verifying…" : "Verify WhatsApp code"}
              </button>
            </div>
          ) : null}
          {!isWhatsAppVerified && otpMsg ? (
            <div className="mt-2 space-y-1.5">
              <p className="text-xs font-medium text-emerald-700">{otpMsg}</p>
              <p className="text-xs leading-relaxed text-stone-600">
                If nothing arrives: open WhatsApp on the number shown in the hint (same as the field above). Check your <strong className="font-semibold text-stone-700">primary</strong> device first. In Meta Business Suite → WhatsApp, confirm <em>delivery</em> for the message id in dev logs.
              </p>
            </div>
          ) : null}
          {isWhatsAppVerified ? (
            <p className="mt-2 text-xs font-medium text-emerald-700">WhatsApp verified</p>
          ) : null}
          {otpError ? <p className="mt-2 text-xs font-medium text-red-700">{otpError}</p> : null}
          {otpDebug && process.env.NODE_ENV !== "production" ? (
            <pre className="mt-2 overflow-x-auto rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] text-stone-700">
              {otpDebug}
            </pre>
          ) : null}
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-description">
            Description
          </label>
          <textarea
            id="vp-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 min-h-[160px] w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
            placeholder="What couples should know — style, spaces, packages…"
            required
          />
          <p className="mt-1 text-xs text-stone-500">At least 20 characters.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-pricing">
              Pricing range
            </label>
            <input
              id="vp-pricing"
              value={pricingRange}
              onChange={(e) => setPricingRange(e.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
              placeholder="e.g. Starts from ₹1,50,000"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-capacity">
              Capacity
            </label>
            <input
              id="vp-capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
              placeholder="e.g. 100–500 guests"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-brand-950">Images</h2>
        <p className="text-sm text-stone-600">
          Profile image is the main hero visual. Gallery photos appear on your public venue page (up to 12).
        </p>
        <div>
          <label className="block text-sm font-semibold text-stone-800" htmlFor="vp-profile-url">
            Profile image URL (optional if you upload)
          </label>
          <p className="mt-1 text-xs text-stone-500">
            External URLs are downloaded and converted to optimized WebP (thumb / medium / large) on save — or use
            Import now.
          </p>
          <input
            id="vp-profile-url"
            value={inputDisplayImageUrl(profileImage)}
            onChange={(e) => setProfileImage(e.target.value)}
            className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
            placeholder="https://…"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onProfileUrlIngest}
              disabled={uploadingProfile}
              className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-900 transition hover:bg-brand-100 disabled:opacity-50"
            >
              {uploadingProfile ? "Processing…" : "Import & optimize URL"}
            </button>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-50">
              {uploadingProfile ? "Uploading…" : "Upload profile image"}
              <input type="file" accept="image/*" className="sr-only" onChange={onProfileFile} disabled={uploadingProfile} />
            </label>
            {profileImage ? (
              <button
                type="button"
                className="text-sm font-medium text-red-700 hover:underline"
                onClick={() => setProfileImage("")}
              >
                Remove
              </button>
            ) : null}
          </div>
          {profileImage ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
              <img
                src={parseResponsiveImageField(profileImage)?.medium || profileImage}
                alt=""
                className="h-40 w-full object-cover"
              />
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-semibold text-stone-800">Gallery</p>
          <p className="mt-1 text-xs text-stone-500">
            Adding a URL fetches and optimizes it the same way as uploads.
            {category === "Photographer"
              ? " Set a category per image for your public portfolio filters (Weddings, Pre-wedding, Fashion)."
              : category === "Makeup"
                ? " These images power your public portfolio grid (Velvet & Gilded layout)."
                : ""}
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={galleryUrlInput}
              onChange={(e) => setGalleryUrlInput(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
              placeholder="Image URL"
            />
            <button
              type="button"
              onClick={() => void addGalleryUrl()}
              disabled={galleryImages.length >= 12 || uploadingGallery}
              className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-50"
            >
              {uploadingGallery ? "Importing…" : "Add URL"}
            </button>
          </div>
          <label className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-50">
            {uploadingGallery ? "Uploading…" : "Upload gallery photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={onGalleryFiles}
              disabled={uploadingGallery || galleryImages.length >= 12}
            />
          </label>
          <p className="mt-1 text-xs text-stone-500">{galleryImages.length} / 12 images</p>
          {galleryImages.length ? (
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {galleryImages.map((url, i) => (
                <li
                  key={`${url}-${i}`}
                  className="group overflow-hidden rounded-lg border border-stone-200 bg-stone-100"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200/60">
                    <img
                      src={parseResponsiveImageField(url)?.medium || url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                      onClick={() => {
                        setGalleryImages((g) => g.filter((_, j) => j !== i));
                        setGalleryTags((t) => t.filter((_, j) => j !== i));
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  {category === "Photographer" ? (
                    <label className="mt-2 block px-2 pb-2">
                      <span className="sr-only">Portfolio category</span>
                      <select
                        value={galleryTags[i] ?? PHOTO_GALLERY_CATEGORIES[i % PHOTO_GALLERY_CATEGORIES.length]}
                        onChange={(e) => {
                          const v = e.target.value;
                          setGalleryTags((t) => {
                            const next = alignGalleryTagsToLength(t, galleryImages.length);
                            next[i] = v;
                            return next;
                          });
                        }}
                        className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs font-medium text-stone-800 outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-2"
                      >
                        {PHOTO_GALLERY_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat === "PRE-WEDDING" ? "Pre-wedding" : cat.charAt(0) + cat.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {category === "Venue" ? (
        <section className="space-y-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-brand-950">Venue Highlights</h2>
            <p className="mt-1 text-sm text-stone-600">
              Structured summary data for your mobile profile card, search filters, and listing badges. Keep the
              detailed Venue Details section below for full specifications.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-stone-800" htmlFor="vh-venue-type">
                  Venue type <span className="text-red-600">*</span>
                </label>
                <select
                  id="vh-venue-type"
                  value={venueType}
                  onChange={(e) => setVenueType(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                >
                  <option value="">Select venue type…</option>
                  {VENUE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-800" htmlFor="vh-years">
                  Years in business
                </label>
                <input
                  id="vh-years"
                  type="number"
                  min={0}
                  value={yearsInBusiness}
                  onChange={(e) => setYearsInBusiness(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                  placeholder="e.g. 10"
                />
                <p className="mt-1 text-xs text-stone-500">Shown as “10+ Years Hosting Events” on your profile.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-800" htmlFor="vh-guest-capacity">
                  Guest capacity <span className="text-red-600">*</span>
                </label>
                <input
                  id="vh-guest-capacity"
                  type="number"
                  min={1}
                  required
                  value={guestCapacity}
                  onChange={(e) => setGuestCapacity(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                  placeholder="e.g. 800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-800" htmlFor="vh-dining-capacity">
                  Dining capacity
                </label>
                <input
                  id="vh-dining-capacity"
                  type="number"
                  min={0}
                  value={diningCapacity}
                  onChange={(e) => setDiningCapacity(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                  placeholder="e.g. 350"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-800" htmlFor="vh-parking-capacity">
                  Parking capacity
                </label>
                <input
                  id="vh-parking-capacity"
                  type="number"
                  min={0}
                  value={parkingCapacity}
                  onChange={(e) => setParkingCapacity(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                  placeholder="e.g. 80"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-sm font-medium text-stone-800">
                <input
                  type="checkbox"
                  checked={airConditioned}
                  onChange={(e) => setAirConditioned(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                />
                Fully AC
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-sm font-medium text-stone-800">
                <input
                  type="checkbox"
                  checked={stageAvailable}
                  onChange={(e) => setStageAvailable(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                />
                Stage available
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-sm font-medium text-stone-800">
                <input
                  type="checkbox"
                  checked={wheelchairAccessible}
                  onChange={(e) => setWheelchairAccessible(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                />
                Wheelchair accessible
              </label>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-stone-800">
                Suitable for <span className="text-red-600">*</span>
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Select every event type your venue is equipped to host. Leave none selected only if you are still
                defining your offering.
              </p>
              <div className="mt-3 flex flex-wrap justify-start gap-2">
                {SUITABLE_FOR_OPTIONS.map((option) => {
                  const active = suitableFor.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setSuitableFor((prev) => {
                          const next = new Set(prev);
                          if (next.has(option)) next.delete(option);
                          else next.add(option);
                          return SUITABLE_FOR_OPTIONS.filter((item) => next.has(item));
                        });
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
                        active
                          ? "border-brand-600 bg-brand-50 text-brand-900 ring-1 ring-brand-600/15"
                          : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300"
                      }`}
                    >
                      {active ? (
                        <svg
                          aria-hidden
                          className="h-3.5 w-3.5 shrink-0 text-brand-700"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 5.29a1 1 0 0 1 0 1.42l-7.25 7.25a1 1 0 0 1-1.42 0l-3.25-3.25a1 1 0 1 1 1.42-1.42l2.54 2.54 6.54-6.54a1 1 0 0 1 1.42 0Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : null}
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {category === "Venue" ? (
        <section className="space-y-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-brand-950">Venue Details</h2>
            <p className="mt-1 text-sm text-stone-600">
              Structured information shown on your public listing. All predefined fields are required; add optional rows
              for anything else couples should know.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/90 bg-stone-50/40 p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Required</p>
            <div className="mt-4 space-y-5">
              {PREDEFINED_VENUE_DETAIL_TITLES.map((title, ti) => (
                <div
                  key={title}
                  className="grid grid-cols-1 gap-2 border-b border-stone-200/80 pb-5 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(200px,260px)_1fr] sm:gap-6 sm:items-start"
                >
                  <label className="text-sm font-bold text-stone-900" htmlFor={`vd-pre-${ti}`}>
                    {title}
                  </label>
                  <textarea
                    id={`vd-pre-${ti}`}
                    value={venueDetailMap[title] ?? ""}
                    onChange={(e) =>
                      setVenueDetailMap((prev) => ({
                        ...prev,
                        [title]: e.target.value,
                      }))
                    }
                    required
                    rows={3}
                    className="min-h-[4.5rem] w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                    placeholder="Describe for couples…"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Additional details</p>
            <div className="mt-4 space-y-6">
              {venueDetailCustom.map((row, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-stone-200 bg-stone-50/50 p-4"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <div>
                      <label className="text-sm font-semibold text-stone-800" htmlFor={`vd-cust-title-${index}`}>
                        Title
                      </label>
                      <input
                        id={`vd-cust-title-${index}`}
                        value={row.title}
                        onChange={(e) => updateVenueDetailCustom(index, "title", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
                        placeholder="e.g. Flooring"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVenueDetailCustom(index)}
                      className="justify-self-start rounded-lg px-2 py-1 text-sm font-medium text-red-700 hover:underline sm:justify-self-end"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3">
                    <label className="text-sm font-semibold text-stone-800" htmlFor={`vd-cust-desc-${index}`}>
                      Description
                    </label>
                    <textarea
                      id={`vd-cust-desc-${index}`}
                      value={row.description}
                      onChange={(e) => updateVenueDetailCustom(index, "description", e.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
                      placeholder="Details…"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addVenueDetailCustom}
              className="mt-4 inline-flex items-center rounded-xl border border-dashed border-brand-300 bg-brand-50/50 px-4 py-2.5 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
            >
              + Add More Details
            </button>
          </div>
        </section>
      ) : category === "Makeup" ? (
        <MakeupVendorProfileSection makeup={makeupProfile} setMakeup={setMakeupProfile} />
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {okMsg ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900" role="status">
          {okMsg}
        </p>
      ) : null}
      {warnMsg ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950" role="status">
          {warnMsg}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
