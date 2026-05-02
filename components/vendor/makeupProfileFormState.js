import { parsePhotographyPackagePrice } from "../../lib/photographerProfileContent";

/**
 * @param {object} vendor
 */
export function buildInitialMakeupProfile(vendor) {
  const p = vendor.makeupProfile && typeof vendor.makeupProfile === "object" ? vendor.makeupProfile : {};
  const pkgs = Array.isArray(p.packages) && p.packages.length
    ? p.packages.map((pkg, i) => ({
        id: `mk-pkg-${i}`,
        name: String(pkg.name || ""),
        price: pkg.price != null ? String(pkg.price) : "",
        tag: String(pkg.tag || ""),
        featuresText: Array.isArray(pkg.features) ? pkg.features.join("\n") : "",
      }))
    : [
        {
          id: "mk-pkg-0",
          name: "",
          price: "",
          tag: "",
          featuresText: "",
        },
      ];
  const tests = Array.isArray(p.testimonials) && p.testimonials.length
    ? p.testimonials.map((t, i) => ({
        id: `mk-t-${i}`,
        author: String(t.author || t.name || ""),
        quote: String(t.quote || t.text || ""),
        date: String(t.date || ""),
      }))
    : [{ id: "mk-t-0", author: "", quote: "", date: "" }];

  return {
    tagline: String(p.tagline || "The Curated Atelier").trim(),
    specialty: String(p.specialty || "").trim(),
    bioTitle: String(p.bioTitle || "Bridal artistry, distilled.").trim(),
    bio: String(p.bio || vendor.description || "").trim(),
    ratingScore: p.ratingScore != null ? String(p.ratingScore) : "4.9",
    reviewCount: p.reviewCount != null ? String(p.reviewCount) : "0",
    statsExperience: String(p.stats?.experience || "").trim(),
    statsWeddings: String(p.stats?.weddings || "").trim(),
    statsLocation: String(p.stats?.location || "").trim(),
    urgencyLine: String(p.urgency?.line || "").trim(),
    urgencySub: String(p.urgency?.sub || "").trim(),
    whatsapp: String(p.whatsapp || "").replace(/\D/g, ""),
    beforeUrl: String(p.beforeAfter?.before || "").trim(),
    afterUrl: String(p.beforeAfter?.after || "").trim(),
    blurbBridal: String(p.serviceBlurbs?.bridal || "").trim(),
    blurbGroom: String(p.serviceBlurbs?.groom || "").trim(),
    blurbFamily: String(p.serviceBlurbs?.family || "").trim(),
    blurbAirbrush: String(p.serviceBlurbs?.airbrush || "").trim(),
    packages: pkgs,
    testimonials: tests,
    studioAddress: String(p.studio?.address || "").trim(),
    studioLat: p.studio?.lat != null ? String(p.studio.lat) : "",
    studioLon: p.studio?.lon != null ? String(p.studio.lon) : "",
    studioTitle: String(p.studio?.title || "Studio Location").trim(),
    aiTitle: String(p.aiWidget?.title || "").trim(),
    aiBody: String(p.aiWidget?.body || "").trim(),
    aiCta: String(p.aiWidget?.cta || "").trim(),
  };
}

/**
 * @param {ReturnType<typeof buildInitialMakeupProfile>} m
 * @param {string[]} nextGallery
 * @param {string} descriptionFallback
 */
export function makeupProfileToPayload(m, nextGallery, descriptionFallback) {
  const cleanedPackages = [];
  for (const row of m.packages) {
    const name = row.name.trim();
    const priceRaw = row.price.trim();
    if (!name && !priceRaw) continue;
    if (name && !priceRaw) {
      throw new Error("Each package needs a price.");
    }
    if (priceRaw && !name) {
      throw new Error("Each package needs a name.");
    }
    const priceNum = parsePhotographyPackagePrice(priceRaw);
    if (priceNum == null) {
      throw new Error("Enter a valid price (numbers only) for each package.");
    }
    cleanedPackages.push({
      name,
      price: priceNum,
      tag: row.tag.trim() || null,
      features: row.featuresText
        .split(/\n/)
        .map((x) => x.trim())
        .filter(Boolean),
    });
  }

  const testimonials = [];
  for (const row of m.testimonials) {
    const author = row.author.trim();
    const quote = row.quote.trim();
    if (!author && !quote) continue;
    if (author && !quote) throw new Error("Each testimonial needs a quote.");
    if (quote && !author) throw new Error("Each testimonial needs a name.");
    testimonials.push({
      author,
      quote,
      date: row.date.trim() || "Recent",
    });
  }

  const lat = parseFloat(m.studioLat);
  const lon = parseFloat(m.studioLon);

  return {
    tagline: m.tagline.trim(),
    specialty: m.specialty.trim(),
    bioTitle: m.bioTitle.trim(),
    bio: m.bio.trim() || descriptionFallback.trim(),
    ratingScore: m.ratingScore.trim() ? Number(m.ratingScore) : null,
    reviewCount: m.reviewCount.trim() ? Number(m.reviewCount) : 0,
    stats: {
      experience: m.statsExperience.trim(),
      weddings: m.statsWeddings.trim(),
      location: m.statsLocation.trim(),
    },
    urgency: {
      line: m.urgencyLine.trim(),
      sub: m.urgencySub.trim(),
    },
    whatsapp: m.whatsapp.replace(/\D/g, "") || null,
    beforeAfter: {
      before: m.beforeUrl.trim() || null,
      after: m.afterUrl.trim() || null,
    },
    serviceBlurbs: {
      bridal: m.blurbBridal.trim(),
      groom: m.blurbGroom.trim(),
      family: m.blurbFamily.trim(),
      airbrush: m.blurbAirbrush.trim(),
    },
    packages: cleanedPackages,
    testimonials,
    studio: {
      title: m.studioTitle.trim() || "Studio Location",
      address: m.studioAddress.trim(),
      lat: Number.isFinite(lat) ? lat : null,
      lon: Number.isFinite(lon) ? lon : null,
    },
    aiWidget: {
      title: m.aiTitle.trim(),
      body: m.aiBody.trim(),
      cta: m.aiCta.trim(),
    },
    gallery: nextGallery,
  };
}
