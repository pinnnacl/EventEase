import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { ADMIN_IMPORT_VENDOR_CATEGORIES } from "../../lib/vendors";
import { PREDEFINED_VENUE_DETAIL_TITLES } from "../../lib/venueDetails";

const SAMPLE_JSON = `[
  {
    "businessName": "Example Bridal Studio",
    "category": "Makeup",
    "city": "Kochi",
    "state": "Kerala",
    "place": "Panampilly Nagar",
    "phone": "9876543210",
    "description": "Premium bridal makeup and trials across Ernakulam. Book a consultation to match your palette and outfit timeline.",
    "pricingRange": "From ₹25,000",
    "status": "pending"
  },
  {
    "businessName": "Example Convention Hall",
    "category": "Venue",
    "city": "Kochi",
    "state": "Kerala",
    "place": "Edapally",
    "phone": "9876501234",
    "description": "Column-free main hall with rigging points, breakout rooms, and valet parking for large weddings and conferences across Ernakulam.",
    "pricingRange": "From ₹2,00,000",
    "status": "pending",
    "venueDetailsByTitle": {
      "Capacity": "1200 seated theatre-style",
      "Dining Capacity": "650 plated dinner",
      "Car Park Capacity": "~180 cars; overflow on request",
      "Kitchen / Catering Policy": "In-house kitchen; outside caterers with corkage by approval."
    },
    "venueDetailsCustom": [
      {
        "title": "AV & streaming",
        "description": "4K projectors, line-array PA, optional hybrid streaming packages."
      }
    ]
  }
]`;

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && c === ",") {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function parseVendorCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) {
    throw new Error("CSV needs a header row plus at least one data row.");
  }
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, j) => {
      row[h] = cells[j] ?? "";
    });
    out.push(row);
  }
  return out;
}

export default function AdminBulkVendorsPage() {
  const router = useRouter();
  const [mode, setMode] = useState("json");
  const [text, setText] = useState(SAMPLE_JSON);
  const [defaultStatus, setDefaultStatus] = useState("pending");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [result, setResult] = useState(null);
  const categoriesHint = useMemo(() => ADMIN_IMPORT_VENDOR_CATEGORIES.join(", "), []);
  const venueDetailTitlesHint = useMemo(() => PREDEFINED_VENUE_DETAIL_TITLES.join(", "), []);

  const parseRows = useCallback(() => {
    if (mode === "json") {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of vendor objects.");
      return parsed;
    }
    return parseVendorCsv(text);
  }, [mode, text]);

  async function handleBulkFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    try {
      const contents = await file.text();
      setText(contents);
      const name = file.name.toLowerCase();
      if (name.endsWith(".json")) setMode("json");
      else if (name.endsWith(".csv")) setMode("csv");
    } catch {
      setError("Could not read that file. Try UTF-8 CSV or JSON.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setHint("");
    setResult(null);
    let vendors;
    try {
      vendors = parseRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not parse input");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/vendors/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendors, defaultStatus, maxRows: 50 }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        await router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Import failed");
        return;
      }
      if (typeof data.hint === "string" && data.hint.trim()) {
        setHint(data.hint.trim());
      }
      setResult(data);
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Bulk vendor import | Admin | THAALI</title>
      </Head>
      <main className="container-default w-full max-w-none py-10 sm:py-14">
        <div className="mx-auto w-full max-w-4xl rounded-2xl border border-stone-200/70 bg-white p-6 shadow-[0_18px_60px_-34px_rgba(20,43,60,0.35)] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-brand-950 sm:text-3xl">Bulk vendor import</h1>
              <p className="mt-2 max-w-2xl text-sm text-stone-600">
                Create multiple vendor listings without vendor login. Rows are stored with no linked auth user until you
                connect a claim flow later. Use <strong>pending</strong> to moderate before publish, or{" "}
                <strong>approved</strong> to go live immediately.
              </p>
            </div>
            <Link
              href="/admin/vendors"
              className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
            >
              ← Vendor list
            </Link>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-sm text-amber-950">
            <strong>Database:</strong> run{" "}
            <code className="rounded bg-white/80 px-1.5 py-0.5 text-xs">010_vendor_null_user_admin_imports.sql</code> in
            Supabase if bulk insert fails on <code className="text-xs">user_id</code>.
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <p className="text-sm font-semibold text-stone-800">Format</p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="radio" name="fmt" checked={mode === "json"} onChange={() => setMode("json")} />
                  JSON array
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="radio" name="fmt" checked={mode === "csv"} onChange={() => setMode("csv")} />
                  CSV (header row)
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-stone-800" htmlFor="bulk-input">
                {mode === "json" ? "JSON array" : "CSV"}
              </label>
              <p className="mt-1 text-xs text-stone-500">
                Required fields per row: <code className="text-[0.7rem]">businessName</code>,{" "}
                <code className="text-[0.7rem]">category</code> ({categoriesHint}), <code className="text-[0.7rem]">city</code>
                , <code className="text-[0.7rem]">state</code>, <code className="text-[0.7rem]">phone</code>,{" "}
                <code className="text-[0.7rem]">description</code> (≥20 chars). Optional:{" "}
                <code className="text-[0.7rem]">place</code>, <code className="text-[0.7rem]">pricingRange</code>,{" "}
                <code className="text-[0.7rem]">capacity</code>, <code className="text-[0.7rem]">profileImage</code>,{" "}
                <code className="text-[0.7rem]">status</code>, <code className="text-[0.7rem]">galleryImages</code> (array
                or comma-separated), <code className="text-[0.7rem]">facilities</code>.{" "}
                <strong className="font-semibold text-stone-600">Venue only:</strong>{" "}
                <code className="text-[0.7rem]">venueDetails</code> (array or JSON string in CSV) with{" "}
                <code className="text-[0.7rem]">title</code>, <code className="text-[0.7rem]">description</code>, optional{" "}
                <code className="text-[0.7rem]">isCustom</code>; or <code className="text-[0.7rem]">venueDetailsByTitle</code>{" "}
                (JSON object: keys must match predefined titles) plus optional{" "}
                <code className="text-[0.7rem]">venueDetailsCustom</code> (array of{" "}
                <code className="text-[0.7rem]">{"{ title, description }"}</code>). Predefined title keys:{" "}
                <span className="text-[0.65rem] text-stone-600">{venueDetailTitlesHint}</span>. Empty predefined fields
                become blank in DB; the public page shows “Not specified” for those rows.
              </p>
              <p className="mt-2 text-xs text-stone-500">
                <strong className="font-semibold text-stone-600">Image quality:</strong> URLs are stored as-is — use{" "}
                <strong className="font-semibold text-stone-700">full-size HTTPS links</strong> (roughly{" "}
                <span className="whitespace-nowrap">≥1920px</span> wide for hero/cover,{" "}
                <span className="whitespace-nowrap">≥1200px</span> for gallery). Avoid thumbnail-only links (
                <code className="text-[0.65rem]">?w=200</code>, social previews, etc.). After import, vendors can re-upload
                in the dashboard for optimized thumb/medium/large variants. Optional: set{" "}
                <code className="text-[0.7rem]">profileImage</code> to a JSON string{" "}
                <code className="text-[0.65rem]">{`{"thumb":"…","medium":"…","large":"…"}`}</code> (same shape as the vendor
                portal) for best results on listings.
              </p>
              <textarea
                id="bulk-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={mode === "json" ? 16 : 14}
                className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 font-mono text-xs text-stone-900 outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-2 sm:text-sm"
                spellCheck={false}
              />
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <input
                  id="bulk-file-upload"
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  className="sr-only"
                  onChange={handleBulkFileChange}
                />
                <label
                  htmlFor="bulk-file-upload"
                  className="inline-flex cursor-pointer items-center rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-stone-400 hover:bg-stone-50"
                >
                  Upload file…
                </label>
                <span className="text-xs text-stone-500">UTF-8 <code className="text-[0.65rem]">.csv</code> or{" "}
                  <code className="text-[0.65rem]">.json</code> fills the box; extension switches format.</span>
                {mode === "json" ? (
                  <button
                    type="button"
                    onClick={() => setText(SAMPLE_JSON)}
                    className="text-sm font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
                  >
                    Load sample JSON
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setText(
                        [
                          "businessName,category,city,state,place,phone,description,pricingRange,status,venueDetails",
                          'Example Venue,Venue,Kochi,Kerala,Marine Drive,9876543210,"A beautiful waterfront hall for receptions with ample parking and modern lighting for your celebration.",From ₹2,00,000,pending,"[{""title"":""Capacity"",""description"":""450 seated theatre"",""isCustom"":false},{""title"":""Dining Capacity"",""description"":""280 plated"",""isCustom"":false}]"',
                        ].join("\n"),
                      )
                    }
                    className="text-sm font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
                  >
                    Load sample CSV
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-stone-800" htmlFor="bulk-status">
                Default status (when row omits <code className="text-xs">status</code>)
              </label>
              <select
                id="bulk-status"
                value={defaultStatus}
                onChange={(e) => setDefaultStatus(e.target.value)}
                className="mt-2 w-full max-w-xs rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-2 sm:w-auto"
              >
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
              </select>
            </div>

            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">
                {error}
              </p>
            ) : null}
            {hint ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">{hint}</p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? "Importing…" : "Import vendors (max 50 per request)"}
            </button>
          </form>

          {result ? (
            <div className="mt-10 space-y-4 border-t border-stone-200 pt-8">
              <h2 className="text-lg font-semibold text-stone-900">Results</h2>
              <p className="text-sm text-stone-600">
                Created <strong>{result.createdCount}</strong> · Errors <strong>{result.errorCount}</strong>
              </p>
              {Array.isArray(result.created) && result.created.length ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Created</p>
                  <ul className="mt-2 space-y-1 text-sm text-stone-800">
                    {result.created.map((v) => (
                      <li key={v.id}>
                        <span className="font-medium">{v.businessName}</span>{" "}
                        <span className="text-stone-500">({v.category})</span> —{" "}
                        <code className="rounded bg-stone-100 px-1 text-xs">{v.id}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {Array.isArray(result.errors) && result.errors.length ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Errors</p>
                  <ul className="mt-2 space-y-2 text-sm text-rose-900">
                    {result.errors.map((err, i) => (
                      <li key={`${err.index}-${i}`}>
                        Row {err.index}
                        {err.businessName ? ` (${err.businessName})` : ""}: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
