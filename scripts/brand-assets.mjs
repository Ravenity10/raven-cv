// Generates the favicon set and the Open Graph image from inline SVG.
// Run after changing the name or role: node scripts/brand-assets.mjs

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const pub = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const INK = '#14161a';
const PAPER = '#f7f5f0';
const ACCENT = '#2f4fd8';
const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${INK}"/>
  <text x="32" y="42" text-anchor="middle" font-family="${FONT}" font-size="28" font-weight="800" fill="${PAPER}">JR</text>
  <rect x="18" y="48" width="28" height="4" rx="2" fill="${ACCENT}"/>
</svg>
`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M56 0H0V56" fill="none" stroke="#dcd8ce" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="${PAPER}"/>
  <rect width="1200" height="630" fill="url(#grid)" opacity="0.6"/>
  <circle cx="1080" cy="40" r="300" fill="${ACCENT}" opacity="0.12"/>
  <rect x="80" y="80" width="72" height="72" rx="16" fill="${INK}"/>
  <text x="116" y="128" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="800" fill="${PAPER}">JR</text>
  <text x="80" y="300" font-family="${FONT}" font-size="76" font-weight="800" fill="${INK}">John Raven M. Delos Reyes</text>
  <text x="80" y="390" font-family="${FONT}" font-size="54" font-weight="700" fill="${ACCENT}">WordPress Developer</text>
  <text x="80" y="520" font-family="${FONT}" font-size="30" fill="#545a65">Custom themes · ACF · Custom post types · Plugins · Integrations</text>
</svg>
`;

await writeFile(path.join(pub, 'favicon.svg'), favicon);
await sharp(Buffer.from(favicon)).resize(32, 32).png().toFile(path.join(pub, 'favicon-32.png'));
await sharp(Buffer.from(favicon)).resize(180, 180).flatten({ background: INK }).png().toFile(path.join(pub, 'apple-touch-icon.png'));
await sharp(Buffer.from(og)).png().toFile(path.join(pub, 'og-image.png'));
console.log('Wrote favicon.svg, favicon-32.png, apple-touch-icon.png, og-image.png');
