// Captures a homepage screenshot for every site in scripts/sites.json.
//
// Output:
//   public/screens/<slug>.webp      max 1200px wide, quality 80 (modal / large view)
//   public/screens/<slug>-sm.webp   640px wide (project cards)
//   src/data/screens.json           manifest of successful captures, read by src/data/projects.js
//
// Usage:
//   npm run screenshots              all sites
//   npm run screenshots -- grasslands-turf   only sites whose slug contains the given text

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { slugify } from './slugify.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITES_FILE = path.join(root, 'scripts', 'sites.json');
const OUT_DIR = path.join(root, 'public', 'screens');
const MANIFEST = path.join(root, 'src', 'data', 'screens.json');

const VIEWPORT = { width: 1440, height: 900 };
const FULL_WIDTH = 1200;
const SMALL_WIDTH = 640;
const QUALITY = 80;
const NAV_TIMEOUT = 45000;
const IDLE_TIMEOUT = 20000;
const SETTLE_MS = 1500;

// Common consent managers and site popups. Hidden with CSS rather than clicked,
// so no consent choice is recorded on the client's analytics.
const HIDE_CSS = `
  #cookie-notice, #cookie-law-info-bar, .cookie-law-info-bar, #cliSettingsPopup,
  .cky-consent-container, .cky-overlay, .cky-btn-revisit-wrapper,
  #CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay,
  #cmplz-cookiebanner-container, .cmplz-cookiebanner, #cmplz-manage-consent,
  #onetrust-banner-sdk, #onetrust-consent-sdk,
  #moove_gdpr_cookie_info_bar, #moove_gdpr_cookie_modal,
  #catapult-cookie-bar, .cc-window, .cc-banner, .cc-revoke,
  #BorlabsCookieBox, .borlabs-cookie, #iubenda-cs-banner, .iubenda-cs-container,
  #gdpr-cookie-consent-bar, .gdpr-cookie-notice, #wpgdprc-consent-bar,
  .termly-styles-root, #termly-code-snippet-support, #usercentrics-root,
  #siteCookie, .cookiealert, .pum-overlay, #sitePopup, .cookie-banner, .cookie-consent, .cookies-banner,
  [id*="cookie-banner" i], [class*="cookie-banner" i], [aria-label*="cookie consent" i]
  { display: none !important; visibility: hidden !important; }
  html, body { overflow: auto !important; }
`;

async function capture(browser, site) {
  const slug = slugify(site.name);
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    locale: 'en-GB',
    reducedMotion: 'reduce',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  try {
    const response = await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    const status = response?.status() ?? 0;
    if (status >= 400) throw new Error(`HTTP ${status}`);

    // Network idle can never arrive on sites with polling or chat widgets, so it is best effort.
    await page.waitForLoadState('networkidle', { timeout: IDLE_TIMEOUT }).catch(() => {});
    await page.addStyleTag({ content: HIDE_CSS });
    await page.waitForTimeout(SETTLE_MS);

    const png = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(png).resize({ width: FULL_WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(path.join(OUT_DIR, `${slug}.webp`));
    await sharp(png).resize({ width: SMALL_WIDTH }).webp({ quality: QUALITY }).toFile(path.join(OUT_DIR, `${slug}-sm.webp`));

    const height = Math.round((VIEWPORT.height / VIEWPORT.width) * FULL_WIDTH);
    return { slug, ok: true, width: FULL_WIDTH, height };
  } catch (error) {
    return { slug, ok: false, error: error.message.split('\n')[0] };
  } finally {
    await context.close();
  }
}

async function main() {
  const filter = process.argv[2]?.toLowerCase();
  const sites = JSON.parse(await readFile(SITES_FILE, 'utf8')).filter(
    (site) => !filter || slugify(site.name).includes(filter),
  );
  if (!sites.length) {
    console.error('No sites matched.');
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  let manifest = {};
  try {
    manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
  } catch {
    // First run: no manifest yet.
  }

  const browser = await chromium.launch();
  const failed = [];
  for (const site of sites) {
    process.stdout.write(`${site.name} ... `);
    const result = await capture(browser, site);
    if (result.ok) {
      manifest[result.slug] = { width: result.width, height: result.height };
      console.log('ok');
    } else {
      failed.push({ name: site.name, url: site.url, error: result.error });
      console.log(`failed (${result.error})`);
    }
  }
  await browser.close();

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`\n${sites.length - failed.length}/${sites.length} captured.`);
  if (failed.length) {
    console.log('Failed:');
    for (const f of failed) console.log(`  - ${f.name} (${f.url}): ${f.error}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
