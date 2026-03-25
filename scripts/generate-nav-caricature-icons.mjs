import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.resolve("public/nav");

const OUTLINE = "#0f766e";
const ACCENT = "#f8f5f0";

/**
 * Tiny “caricature-ish” icon style: rounded strokes + subtle beige wash.
 * Each SVG is authored at 64x64 and then rasterized.
 */
function wrapSvg(inner) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="wash" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${ACCENT}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${ACCENT}" stop-opacity="0.55"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#142b3c" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect x="6" y="6" width="52" height="52" rx="18" fill="url(#wash)"/>
  <g fill="none" stroke="${OUTLINE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" filter="url(#soft)">
    ${inner}
  </g>
</svg>`;
}

const svgs = {
  home: wrapSvg(`
    <path d="M14 31.5L32 17l18 14.5"/>
    <path d="M20 29.5v17.5c0 2 1.6 3.6 3.6 3.6H40.4c2 0 3.6-1.6 3.6-3.6V29.5"/>
    <path d="M27 50V39.8c0-1.4 1.1-2.6 2.6-2.6h4.8c1.4 0 2.6 1.1 2.6 2.6V50"/>
    <path d="M24 26.5h16"/>
  `),
  venues: wrapSvg(`
    <path d="M18 50V22c0-2 1.6-3.6 3.6-3.6h20.8c2 0 3.6 1.6 3.6 3.6v28"/>
    <path d="M14 50h36"/>
    <path d="M24 26h4M24 32h4M24 38h4"/>
    <path d="M36 26h4M36 32h4M36 38h4"/>
    <path d="M29 50V45c0-1.4 1.1-2.6 2.6-2.6h.8c1.4 0 2.6 1.1 2.6 2.6v5"/>
  `),
  photography: wrapSvg(`
    <path d="M18 24h10l2.8-4h8.2c2 0 3.6 1.6 3.6 3.6V44c0 2-1.6 3.6-3.6 3.6H18c-2 0-3.6-1.6-3.6-3.6V27.6c0-2 1.6-3.6 3.6-3.6z"/>
    <path d="M32 41.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z"/>
    <path d="M44.5 28.5h.01"/>
  `),
  catering: wrapSvg(`
    <path d="M24 18v14"/>
    <path d="M20.5 18v9.2c0 2.7 1.6 4.8 3.5 4.8s3.5-2.1 3.5-4.8V18"/>
    <path d="M38 18v32"/>
    <path d="M43 18c0 6-4.5 6.8-4.5 11.8V50"/>
    <path d="M18 50h28"/>
  `),
  decoration: wrapSvg(`
    <path d="M32 19c5.5 0 10 4.5 10 10 0 8-10 18-10 18S22 37 22 29c0-5.5 4.5-10 10-10z"/>
    <path d="M32 31.5c1.6-2.6 3.3-4.2 5.5-5.2"/>
    <path d="M26.5 26.3c2.2 1 3.9 2.6 5.5 5.2"/>
    <path d="M32 50v-6"/>
  `),
  transport: wrapSvg(`
    <path d="M20 44h24"/>
    <path d="M22 44V28.5c0-1.6 1.3-2.9 2.9-2.9h14.2c1.6 0 2.9 1.3 2.9 2.9V44"/>
    <path d="M26 44a3.5 3.5 0 1 0 0.1 0"/>
    <path d="M40 44a3.5 3.5 0 1 0 0.1 0"/>
    <path d="M22 34h22"/>
  `),
  makeup: wrapSvg(`
    <path d="M24 18l16 16"/>
    <path d="M22 44l12-12"/>
    <path d="M34 32l8 8"/>
    <path d="M22 46c0 1.7 1.3 3 3 3h4l11-11-7-7-11 11v4z"/>
    <path d="M39.5 22.5l4-4c1.1-1.1 2.9-1.1 4 0 1.1 1.1 1.1 2.9 0 4l-4 4"/>
  `),
};

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const order = ["home", "venues", "photography", "catering", "decoration", "transport", "makeup"];

  // Render individual PNGs
  const pngBuffers = [];
  for (const key of order) {
    const svg = svgs[key];
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    pngBuffers.push(png);
    await fs.writeFile(path.join(OUT_DIR, `${key}.png`), png);
  }

  // Build sprite sheet 7*64 x 64
  const sprite = sharp({
    create: {
      width: order.length * 64,
      height: 64,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const composites = [];
  for (let i = 0; i < pngBuffers.length; i++) {
    composites.push({ input: pngBuffers[i], left: i * 64, top: 0 });
  }

  const spritePng = await sprite.composite(composites).png().toBuffer();
  await fs.writeFile(path.join(OUT_DIR, "nav-sprite.png"), spritePng);

  // Simple JSON mapping for usage
  const manifest = Object.fromEntries(order.map((k, i) => [k, { x: i * 64, y: 0, w: 64, h: 64 }]));
  await fs.writeFile(path.join(OUT_DIR, "nav-sprite.json"), JSON.stringify(manifest, null, 2));

  // eslint-disable-next-line no-console
  console.log(`Wrote ${order.length} icons + sprite to ${OUT_DIR}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

