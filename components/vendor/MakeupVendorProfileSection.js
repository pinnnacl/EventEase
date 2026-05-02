/**
 * Makeup artist marketing fields — Velvet & Gilded public profile (stored in `makeup_profile`).
 * @param {{
 *   makeup: import("./makeupProfileFormState").buildInitialMakeupProfile extends () => infer R ? R : never;
 *   setMakeup: (fn: (prev: any) => any) => void;
 * }} props
 */
export default function MakeupVendorProfileSection({ makeup, setMakeup }) {
  const addPackage = () => {
    setMakeup((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        {
          id: `mk-pkg-${Date.now()}`,
          name: "",
          price: "",
          tag: "",
          featuresText: "",
        },
      ],
    }));
  };

  const removePackage = (id) => {
    setMakeup((prev) => ({
      ...prev,
      packages: prev.packages.length <= 1 ? prev.packages : prev.packages.filter((r) => r.id !== id),
    }));
  };

  const updatePackage = (id, field, value) => {
    setMakeup((prev) => ({
      ...prev,
      packages: prev.packages.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    }));
  };

  const addTestimonial = () => {
    setMakeup((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, { id: `mk-t-${Date.now()}`, author: "", quote: "", date: "" }],
    }));
  };

  const removeTestimonial = (id) => {
    setMakeup((prev) => ({
      ...prev,
      testimonials: prev.testimonials.length <= 1 ? prev.testimonials : prev.testimonials.filter((r) => r.id !== id),
    }));
  };

  const updateTestimonial = (id, field, value) => {
    setMakeup((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    }));
  };

  const input =
    "mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none ring-brand-500/20 focus:border-[#8C4B55] focus:ring-2";
  const label = "block text-sm font-semibold text-stone-800";
  const sectionTitle = "font-display text-lg font-semibold text-[#8C4B55]";
  const subtle = "mt-1 text-xs text-stone-500";

  return (
    <div className="space-y-10 rounded-[1.75rem] border border-[#D4A373]/25 bg-[#FAF9F6]/90 p-5 sm:p-8">
      <div>
        <h2 className={sectionTitle}>Velvet &amp; Gilded profile</h2>
        <p className="mt-1 text-sm text-stone-600">
          This content powers your public makeup artist page (portfolio-first layout, packages, reviews, map). Use the
          gallery in &ldquo;Images&rdquo; above for portfolio photos.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="mk-tagline">
            Eyebrow line
          </label>
          <p className={subtle}>Small caps line above your name (e.g. The Curated Atelier).</p>
          <input
            id="mk-tagline"
            value={makeup.tagline}
            onChange={(e) => setMakeup((p) => ({ ...p, tagline: e.target.value }))}
            className={input}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="mk-specialty">
            Specialty headline
          </label>
          <input
            id="mk-specialty"
            value={makeup.specialty}
            onChange={(e) => setMakeup((p) => ({ ...p, specialty: e.target.value }))}
            className={input}
            placeholder="Bridal Artistry Specialist"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="mk-bio-title">
            Bio section title
          </label>
          <input
            id="mk-bio-title"
            value={makeup.bioTitle}
            onChange={(e) => setMakeup((p) => ({ ...p, bioTitle: e.target.value }))}
            className={input}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="mk-bio">
            Bio story (public page)
          </label>
          <p className={subtle}>Shown in the glass card; falls back to your business description if empty.</p>
          <textarea
            id="mk-bio"
            rows={4}
            value={makeup.bio}
            onChange={(e) => setMakeup((p) => ({ ...p, bio: e.target.value }))}
            className={input}
            placeholder="Editorial technique with on-the-day calm…"
          />
        </div>
        <div>
          <label className={label} htmlFor="mk-rating">
            Display rating (1–5)
          </label>
          <input
            id="mk-rating"
            inputMode="decimal"
            value={makeup.ratingScore}
            onChange={(e) => setMakeup((p) => ({ ...p, ratingScore: e.target.value }))}
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="mk-rc">
            Review count
          </label>
          <input
            id="mk-rc"
            inputMode="numeric"
            value={makeup.reviewCount}
            onChange={(e) => setMakeup((p) => ({ ...p, reviewCount: e.target.value }))}
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="mk-exp">
            Stats — experience
          </label>
          <input
            id="mk-exp"
            value={makeup.statsExperience}
            onChange={(e) => setMakeup((p) => ({ ...p, statsExperience: e.target.value }))}
            className={input}
            placeholder="8+ Years"
          />
        </div>
        <div>
          <label className={label} htmlFor="mk-wed">
            Stats — weddings
          </label>
          <input
            id="mk-wed"
            value={makeup.statsWeddings}
            onChange={(e) => setMakeup((p) => ({ ...p, statsWeddings: e.target.value }))}
            className={input}
            placeholder="300+"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="mk-loc">
            Stats — location label
          </label>
          <input
            id="mk-loc"
            value={makeup.statsLocation}
            onChange={(e) => setMakeup((p) => ({ ...p, statsLocation: e.target.value }))}
            className={input}
            placeholder="Kochi, KL"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="mk-wa">
            WhatsApp number (digits, country code without +)
          </label>
          <input
            id="mk-wa"
            inputMode="numeric"
            value={makeup.whatsapp}
            onChange={(e) => setMakeup((p) => ({ ...p, whatsapp: e.target.value.replace(/\D/g, "") }))}
            className={input}
            placeholder="919876543210"
          />
        </div>
        <div className="sm:col-span-2 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
          <p className="text-sm font-semibold text-[#8C4B55]">Urgency banner (optional)</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label} htmlFor="mk-urg1">
                Main line
              </label>
              <input
                id="mk-urg1"
                value={makeup.urgencyLine}
                onChange={(e) => setMakeup((p) => ({ ...p, urgencyLine: e.target.value }))}
                className={input}
                placeholder="Only 3 slots left for Dec 2026"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="mk-urg2">
                Sub line
              </label>
              <input
                id="mk-urg2"
                value={makeup.urgencySub}
                onChange={(e) => setMakeup((p) => ({ ...p, urgencySub: e.target.value }))}
                className={input}
              />
            </div>
          </div>
        </div>
        <div>
          <label className={label} htmlFor="mk-before">
            Before photo URL
          </label>
          <input
            id="mk-before"
            value={makeup.beforeUrl}
            onChange={(e) => setMakeup((p) => ({ ...p, beforeUrl: e.target.value }))}
            className={input}
            placeholder="https://…"
          />
        </div>
        <div>
          <label className={label} htmlFor="mk-after">
            After photo URL
          </label>
          <input
            id="mk-after"
            value={makeup.afterUrl}
            onChange={(e) => setMakeup((p) => ({ ...p, afterUrl: e.target.value }))}
            className={input}
            placeholder="https://…"
          />
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-[#8C4B55]">Expertise blurbs</h3>
        <p className={subtle}>One short paragraph per tab on your public page.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["blurbBridal", "Bridal"],
            ["blurbGroom", "Groom"],
            ["blurbFamily", "Family"],
            ["blurbAirbrush", "Airbrush"],
          ].map(([key, lab]) => (
            <div key={key}>
              <label className={label} htmlFor={`mk-${key}`}>
                {lab}
              </label>
              <textarea
                id={`mk-${key}`}
                rows={3}
                value={makeup[key]}
                onChange={(e) => setMakeup((p) => ({ ...p, [key]: e.target.value }))}
                className={input}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-base font-semibold text-[#8C4B55]">Signature packages</h3>
          <button type="button" onClick={addPackage} className="rounded-xl border border-[#D4A373]/40 bg-white px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-[#FAF9F6]">
            + Add package
          </button>
        </div>
        <div className="mt-4 space-y-6">
          {makeup.packages.map((row) => (
            <div key={row.id} className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={label}>Package name</label>
                  <input
                    value={row.name}
                    onChange={(e) => updatePackage(row.id, "name", e.target.value)}
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>Price (₹)</label>
                  <input
                    value={row.price}
                    onChange={(e) => updatePackage(row.id, "price", e.target.value)}
                    className={input}
                    placeholder="45000"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={label}>Badge (optional)</label>
                  <input
                    value={row.tag}
                    onChange={(e) => updatePackage(row.id, "tag", e.target.value)}
                    className={input}
                    placeholder="Most booked"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={label}>Features (one per line)</label>
                  <textarea
                    rows={4}
                    value={row.featuresText}
                    onChange={(e) => updatePackage(row.id, "featuresText", e.target.value)}
                    className={input}
                    placeholder={"Premium HD Makeup\nHair styling"}
                  />
                </div>
              </div>
              {makeup.packages.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removePackage(row.id)}
                  className="mt-3 text-sm font-medium text-red-700 hover:underline"
                >
                  Remove package
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-base font-semibold text-[#8C4B55]">Client love (testimonials)</h3>
          <button
            type="button"
            onClick={addTestimonial}
            className="rounded-xl border border-[#D4A373]/40 bg-white px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-[#FAF9F6]"
          >
            + Add review
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {makeup.testimonials.map((row) => (
            <div key={row.id} className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={label}>Name</label>
                  <input
                    value={row.author}
                    onChange={(e) => updateTestimonial(row.id, "author", e.target.value)}
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>Date</label>
                  <input
                    value={row.date}
                    onChange={(e) => updateTestimonial(row.id, "date", e.target.value)}
                    className={input}
                    placeholder="Nov 2025"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={label}>Quote</label>
                  <textarea
                    rows={3}
                    value={row.quote}
                    onChange={(e) => updateTestimonial(row.id, "quote", e.target.value)}
                    className={input}
                  />
                </div>
              </div>
              {makeup.testimonials.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeTestimonial(row.id)}
                  className="mt-3 text-sm font-medium text-red-700 hover:underline"
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-[#8C4B55]">Studio &amp; map</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label} htmlFor="mk-st-title">
              Section title
            </label>
            <input
              id="mk-st-title"
              value={makeup.studioTitle}
              onChange={(e) => setMakeup((p) => ({ ...p, studioTitle: e.target.value }))}
              className={input}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="mk-st-addr">
              Address
            </label>
            <input
              id="mk-st-addr"
              value={makeup.studioAddress}
              onChange={(e) => setMakeup((p) => ({ ...p, studioAddress: e.target.value }))}
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="mk-lat">
              Latitude
            </label>
            <input
              id="mk-lat"
              value={makeup.studioLat}
              onChange={(e) => setMakeup((p) => ({ ...p, studioLat: e.target.value }))}
              className={input}
              placeholder="9.9405"
            />
          </div>
          <div>
            <label className={label} htmlFor="mk-lon">
              Longitude
            </label>
            <input
              id="mk-lon"
              value={makeup.studioLon}
              onChange={(e) => setMakeup((p) => ({ ...p, studioLon: e.target.value }))}
              className={input}
              placeholder="76.2653"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#8C4B55]/15 bg-white/80 p-4">
        <h3 className="text-base font-semibold text-[#8C4B55]">AI recommendation block</h3>
        <p className={subtle}>Optional copy for the gradient CTA on your public page.</p>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={label} htmlFor="mk-ai-t">
              Title
            </label>
            <input
              id="mk-ai-t"
              value={makeup.aiTitle}
              onChange={(e) => setMakeup((p) => ({ ...p, aiTitle: e.target.value }))}
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="mk-ai-b">
              Body
            </label>
            <textarea
              id="mk-ai-b"
              rows={3}
              value={makeup.aiBody}
              onChange={(e) => setMakeup((p) => ({ ...p, aiBody: e.target.value }))}
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="mk-ai-c">
              Button label
            </label>
            <input
              id="mk-ai-c"
              value={makeup.aiCta}
              onChange={(e) => setMakeup((p) => ({ ...p, aiCta: e.target.value }))}
              className={input}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
