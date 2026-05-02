/**
 * Marketing-focused copy and defaults for photographer public profiles.
 * Merges real vendor fields with conversion-oriented placeholders until CMS fields exist.
 */

import { primaryImageUrl } from "./imageVariants";

/** Gallery / hero may store plain https URLs or JSON `{ thumb, medium, large }` — `<img>` needs a single URL. */
function toDisplayImageUrl(raw) {
  const u = primaryImageUrl(raw);
  if (u && /^https?:\/\//i.test(String(u).trim())) return String(u).trim();
  return "";
}

const DEFAULT_PACKAGES = [
  {
    name: "Heritage",
    price: "₹75,000",
    per: "/ day",
    highlight: false,
    features: ["1 lead photographer", "250+ edited photos", "Digital delivery"],
  },
  {
    name: "Royal Legacy",
    price: "₹1,25,000",
    per: "/ day",
    highlight: true,
    badge: "Most popular",
    features: [
      "2 photographers + 1 videographer",
      "500+ edited photos",
      "4K cinematic highlight reel",
      "Coffee table album",
    ],
  },
  {
    name: "Signature",
    price: "₹2,00,000",
    per: "/ day",
    highlight: false,
    features: [
      "Full squad (4 members)",
      "RAW + 700+ edited photos",
      "Long documentary film",
      "Luxury leather-bound album",
    ],
  },
];

const DEFAULT_OFFER = {
  badge: "Limited time",
  title: "Summer wedding special",
  body: "Complimentary 4K drone cinematic add-on with Royal Legacy bookings this month. Weddings through August.",
  primaryCta: "Claim offer",
  secondaryCta: "Limited availability",
};

const DEFAULT_DELIVERABLES = [
  { icon: "clock", label: "4–6 weeks delivery" },
  { icon: "photo", label: "400+ post-processed photos" },
  { icon: "raw", label: "RAW available (add-on)" },
  { icon: "video", label: "Cinematic 4K highlight reel" },
];

const DEFAULT_REVIEWS = [
  {
    author: "Anjali & Rahul",
    rating: 5,
    text: "Incredibly professional — our album still makes us emotional. Worth every rupee.",
    date: "Dec 2024",
    verified: true,
  },
  {
    author: "Meera K.",
    rating: 5,
    text: "Clear packages, no surprises. The team blended into the crowd and captured everything.",
    date: "Nov 2024",
    verified: true,
  },
  {
    author: "Vikram S.",
    rating: 4.5,
    text: "Fast delivery and beautiful colour grading. Guests still ask who shot our wedding.",
    date: "Oct 2024",
    verified: true,
  },
];

/** Allowed portfolio categories for photographer gallery (vendor UI + public filters). */
export const PHOTO_GALLERY_CATEGORIES = ["WEDDINGS", "PRE-WEDDING", "FASHION"];

const PORTFOLIO_TAGS = PHOTO_GALLERY_CATEGORIES;

/** Filter chips for portfolio section (must align with `PHOTO_GALLERY_CATEGORIES`). */
export const PHOTO_PORTFOLIO_FILTERS = ["ALL", ...PHOTO_GALLERY_CATEGORIES];

/** Parse rupee amount from number or strings like "₹75,000" / "75000". */
export function parsePhotographyPackagePrice(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  const digits = String(value).replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : null;
}

/** @param {number} n */
export function formatInrPrice(n) {
  if (n == null || !Number.isFinite(n)) return "";
  return `₹${n.toLocaleString("en-IN")}`;
}

/** @param {string} businessName */
export function displayNameShort(businessName) {
  const s = (businessName || "").trim();
  if (!s) return "Photographer";
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  const initial = last.length > 1 ? `${last[0]}.` : last;
  return `${parts[0]} ${initial}`;
}

/** @param {object} vendor - mapped vendor / venue detail row */
export function buildPhotographerMarketing(vendor) {
  const profile =
    vendor.photographerProfile && typeof vendor.photographerProfile === "object" ? vendor.photographerProfile : {};

  const profileLocations = Array.isArray(profile.locations)
    ? profile.locations.map((x) => String(x || "").trim()).filter(Boolean)
    : [];
  const location =
    profileLocations.join(", ") ||
    [vendor.place, vendor.city].filter(Boolean).join(", ") ||
    vendor.location?.split(",")[0]?.trim() ||
    "Kerala";
  const statePart = vendor.state?.trim();
  const locationLine = statePart && !location.includes(statePart) ? `${location}, ${statePart}` : location;

  const legacyStarting =
    String(profile.startingPrice || "").trim() || vendor.priceRange?.trim() || vendor.pricingRange?.trim() || "";
  const imgs = Array.isArray(vendor.galleryImages) ? vendor.galleryImages.filter(Boolean) : [];
  const profileGalleryRaws = Array.isArray(profile.gallery)
    ? profile.gallery.map((x) => String(x || "").trim())
    : [];
  const hasProfileGallery = profileGalleryRaws.some(Boolean);
  const tagsFromProfile = Array.isArray(profile.galleryTags)
    ? profile.galleryTags.map((t) => String(t || "").trim().toUpperCase())
    : [];

  /** @param {number} i */
  const tagAt = (i) => {
    const t = tagsFromProfile[i];
    return PORTFOLIO_TAGS.includes(t) ? t : PORTFOLIO_TAGS[i % PORTFOLIO_TAGS.length];
  };

  /** @type {{ raw: string, tag: string }[]} */
  let portfolioEntries = hasProfileGallery
    ? profileGalleryRaws.map((raw, i) => ({ raw, tag: tagAt(i) })).filter((e) => e.raw)
    : imgs.length
      ? imgs.map((raw, i) => ({ raw: String(raw).trim(), tag: tagAt(i) })).filter((e) => e.raw)
      : vendor.profileImage
        ? [{ raw: String(vendor.profileImage).trim(), tag: tagAt(0) }]
        : [];

  let portfolio = portfolioEntries
    .map(({ raw, tag }) => ({ src: toDisplayImageUrl(raw), tag }))
    .filter((x) => x.src);

  if (portfolio.length === 0) {
    portfolio = [
      {
        src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
        tag: PORTFOLIO_TAGS[0],
      },
      {
        src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&q=80",
        tag: PORTFOLIO_TAGS[1 % PORTFOLIO_TAGS.length],
      },
      {
        src: "https://images.unsplash.com/photo-1465495976277-438a4a4c0a27?w=1200&q=80",
        tag: PORTFOLIO_TAGS[2 % PORTFOLIO_TAGS.length],
      },
    ];
  } else if (portfolio.length < 6) {
    const pad = [...portfolio];
    let i = 0;
    while (pad.length < 6) {
      const ref = portfolio[i % portfolio.length];
      pad.push({ src: ref.src, tag: ref.tag });
      i++;
    }
    portfolio = pad;
  }

  const heroRaw =
    String(profile.heroImage || "").trim() || imgs[0] || vendor.profileImage || "";
  let hero = toDisplayImageUrl(heroRaw);
  if (!hero && portfolio.length) hero = portfolio[0].src;

  const tagged = portfolio;

  const about =
    String(profile.description || "").trim() ||
    vendor.description?.trim() ||
    "Documenting South Indian weddings with a cinematic, editorial eye — candid moments, rich colour, and timeless albums.";

  const ratingScore = Number(profile.ratingScore);
  const reviewCount = Number(profile.reviewCount);
  const rating = {
    score: Number.isFinite(ratingScore) && ratingScore > 0 ? Math.min(5, Math.max(1, ratingScore)) : 4.9,
    count: Number.isFinite(reviewCount) && reviewCount > 0 ? Math.floor(reviewCount) : 128,
  };

  const deliverables = Array.isArray(profile.deliverables)
    ? profile.deliverables
        .map((d) => {
          const label = String(d?.label || "").trim();
          const icon = String(d?.icon || "").trim();
          if (!label) return null;
          return { label, icon: ["clock", "photo", "raw", "video"].includes(icon) ? icon : "photo" };
        })
        .filter(Boolean)
    : [];

  const reviews = Array.isArray(profile.reviews)
    ? profile.reviews
        .map((r) => {
          const author = String(r?.author || "").trim();
          const text = String(r?.text || "").trim();
          const date = String(r?.date || "").trim();
          const rr = Number(r?.rating);
          if (!author || !text) return null;
          return {
            author,
            text,
            date: date || "Recent",
            rating: Number.isFinite(rr) && rr > 0 ? Math.min(5, Math.max(1, rr)) : 5,
            verified: Boolean(r?.verified),
          };
        })
        .filter(Boolean)
    : [];

  /** @type {Array<{ name: string, price: string, per: string, description: string, highlight: boolean, badge: string, features: string[], priceSort: number }>} */
  let packages = [];

  const rawPkgs = Array.isArray(profile.packages) ? profile.packages : [];
  if (rawPkgs.length) {
    packages = rawPkgs
      .map((p) => {
        const name = String(p?.name || "").trim();
        const priceNum = parsePhotographyPackagePrice(p?.price);
        if (!name || priceNum == null) return null;
        const duration = String(p?.duration ?? p?.per ?? "").trim() || "1 day";
        const description = String(p?.description || "").trim();
        const features = Array.isArray(p?.features)
          ? p.features.map((f) => String(f || "").trim()).filter(Boolean)
          : [];
        const recommended = Boolean(p?.recommended);
        const highlight = recommended || Boolean(p?.highlight);
        const badge = String(p?.badge || "").trim() || (recommended ? "Recommended" : "");
        return {
          name,
          price: formatInrPrice(priceNum),
          per: duration,
          description,
          highlight,
          badge,
          features: features.length ? features : ["Details on enquiry"],
          priceSort: priceNum,
        };
      })
      .filter(Boolean);
  }

  if (!packages.length && legacyStarting) {
    const n = parsePhotographyPackagePrice(legacyStarting);
    if (n != null) {
      packages = [
        {
          name: "Standard",
          price: formatInrPrice(n),
          per: "1 day",
          description: "",
          highlight: false,
          badge: "",
          features: ["See full details below"],
          priceSort: n,
        },
      ];
    }
  }

  packages.sort((a, b) => a.priceSort - b.priceSort);

  const lowest = packages.length ? packages[0].priceSort : null;
  const startingFromDisplay =
    lowest != null ? formatInrPrice(lowest) : legacyStarting || "Ask for quote";

  const offerOverride = profile.offer && typeof profile.offer === "object" ? profile.offer : {};
  const offer = {
    badge: String(offerOverride.badge || DEFAULT_OFFER.badge).trim() || DEFAULT_OFFER.badge,
    title: String(offerOverride.title || DEFAULT_OFFER.title).trim() || DEFAULT_OFFER.title,
    body: String(offerOverride.body || DEFAULT_OFFER.body).trim() || DEFAULT_OFFER.body,
    primaryCta: String(offerOverride.primaryCta || DEFAULT_OFFER.primaryCta).trim() || DEFAULT_OFFER.primaryCta,
    secondaryCta: String(offerOverride.secondaryCta || DEFAULT_OFFER.secondaryCta).trim() || DEFAULT_OFFER.secondaryCta,
  };

  return {
    locationLine,
    /** Hero line: lowest package or legacy / fallback */
    price: startingFromDisplay,
    startingFromPrice: startingFromDisplay,
    hero,
    portfolio: tagged,
    packages: packages.length
      ? packages
      : DEFAULT_PACKAGES.map((p) => ({
          ...p,
          description: "",
          priceSort: parsePhotographyPackagePrice(p.price) ?? 0,
        })),
    offer,
    deliverables: deliverables.length ? deliverables : DEFAULT_DELIVERABLES,
    reviews: reviews.length ? reviews : DEFAULT_REVIEWS,
    about,
    aboutHeadline: String(profile.tagline || "").trim() || "Cinematic & emotional storytelling",
    rating,
    trust: {
      verified: profile.trust?.verified ?? vendor.status === "approved",
      years: String(profile.trust?.years || "").trim() || "10+ years",
      events: String(profile.trust?.events || "").trim() || "500+ events",
    },
    offerPill: String(profile.offerPill || "").trim() || "15% off summer weddings",
  };
}
