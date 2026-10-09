// Serves dist/ (run `npm run build` first), screenshots the v2 sections and runs checks.
//
// Output: scripts/out/v2/<section>-<width>-<theme>.png for hero, projects and experience at
// 1440x900 and 390x844, in dark and light. 360x640 is checked (overflow, tap blockers) but
// not saved. Also checks the command palette, project filters, the hero typing, WCAG AA text
// contrast in both themes, and a reduced-motion load.
// Usage:  npm run v2-shots

import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { preview } from 'vite';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(root, 'scripts', 'out', 'v2');
const PORT = 4181;

const VIEWPORTS = [
  { width: 1440, height: 900, mobile: false, shot: true },
  { width: 390, height: 844, mobile: true, shot: true },
  { width: 360, height: 640, mobile: true, shot: false },
];
const SECTIONS = ['projects', 'experience'];

// Scrolls through the page so every whileInView reveal has played, then back to the top.
async function revealAll(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
}

// Taps that would land on something fixed or sticky that is not a control.
async function tapBlockers(page) {
  return page.evaluate(async () => {
    const found = new Set();
    // The compact header bar is a visible surface, so taps on it are expected to stop there.
    const isControl = (el) => el.closest('a, button, input, nav, kbd, [role="dialog"], [role="status"], .header-bar');
    const fixedAncestor = (el) => {
      for (let node = el; node && node !== document.body; node = node.parentElement) {
        // Sticky content (the Education card) is part of the page; only the header floats over it.
        const position = getComputedStyle(node).position;
        if (position === 'fixed' || (position === 'sticky' && node.id === 'site-header')) return node;
      }
      return null;
    };
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y < height; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
      for (let py = 4; py < window.innerHeight; py += 24) {
        for (let px = 4; px < window.innerWidth; px += 24) {
          const hit = document.elementFromPoint(px, py);
          if (!hit || isControl(hit)) continue;
          const overlay = fixedAncestor(hit);
          if (overlay) found.add(`${overlay.tagName.toLowerCase()}.${[...overlay.classList].slice(0, 3).join('.')} > ${hit.tagName.toLowerCase()}`);
        }
      }
    }
    window.scrollTo(0, 0);
    return [...found];
  });
}

// WCAG AA contrast for every visible text node, against the composited solid background.
// Text over gradients or images is skipped (listed as a count) and reviewed by eye.
async function contrast(page) {
  return page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const parse = (color) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return { r, g, b, a: a / 255 };
    };
    const over = (top, bottom) => ({
      r: top.r * top.a + bottom.r * (1 - top.a),
      g: top.g * top.a + bottom.g * (1 - top.a),
      b: top.b * top.a + bottom.b * (1 - top.a),
      a: 1,
    });
    const lum = ({ r, g, b }) => {
      const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a, b) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    const pageBg = parse(getComputedStyle(document.body).backgroundColor);
    const failures = [];
    let checked = 0;
    let skipped = 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent.trim();
      const el = walker.currentNode.parentElement;
      if (!text || !el || seen.has(el)) continue;
      seen.add(el);
      if (el.closest('.sr-only, .boot, canvas, [aria-hidden="true"] .marquee-track > [aria-hidden]')) continue;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (!rect.width || !rect.height || style.visibility === 'hidden') continue;
      let hidden = false;
      for (let node = el; node; node = node.parentElement) {
        const s = getComputedStyle(node);
        if (s.display === 'none' || parseFloat(s.opacity) < 0.95) hidden = true;
      }
      if (hidden) continue;
      if (style.backgroundClip === 'text' || style.webkitBackgroundClip === 'text') {
        skipped += 1;
        continue;
      }
      // Background layers from the element outward, until one is opaque.
      const layers = [];
      let gradient = false;
      for (let node = el; node; node = node.parentElement) {
        const s = getComputedStyle(node);
        if (s.backgroundImage !== 'none') gradient = true;
        const bg = parse(s.backgroundColor);
        if (bg.a > 0) layers.push(bg);
        if (bg.a >= 1 || gradient) break;
      }
      if (gradient) {
        skipped += 1;
        continue;
      }
      let bg = pageBg;
      for (const layer of layers.reverse()) bg = over(layer, bg);
      const fg = over(parse(style.color), bg);
      const size = parseFloat(style.fontSize);
      const bold = parseInt(style.fontWeight, 10) >= 700;
      const large = size >= 24 || (size >= 18.66 && bold);
      const value = ratio(fg, bg);
      checked += 1;
      if (value < (large ? 3 : 4.5)) failures.push({ text: text.slice(0, 40), ratio: +value.toFixed(2), size, color: style.color });
    }
    return { checked, skipped, failures };
  });
}

async function checkPalette(page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.keyboard.press('Control+k');
  const opened = await page.waitForSelector('[role="dialog"][aria-label="Command palette"]', { timeout: 2000 }).then(() => true, () => false);
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('role') === 'combobox');
  await page.keyboard.type('proj');
  const options = await page.locator('[role="option"]').count();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1600);
  const closed = !(await page.$('[role="dialog"][aria-label="Command palette"]'));
  const atProjects = await page.evaluate(() => Math.abs(document.getElementById('projects').getBoundingClientRect().top) < 120);
  // Theme switch from the palette.
  const before = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  await page.keyboard.press('Control+k');
  await page.keyboard.type('theme');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  const footerTheme = await page.evaluate(() => document.querySelector('footer [aria-label="Site status"]').textContent.includes(document.documentElement.classList.contains('dark') ? 'dark' : 'light'));
  await page.keyboard.press('Control+k');
  await page.keyboard.type('theme');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  await page.keyboard.press('Control+k');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const escClosed = !(await page.$('[role="dialog"][aria-label="Command palette"]'));
  return { opened, focused, optionsForProj: options, closed, atProjects, themeToggled: before !== after, footerTheme, escClosed };
}

async function checkFilters(page) {
  const result = {};
  for (const name of ['Plugin', 'WooCommerce', 'All']) {
    await page.locator('#projects button[aria-pressed]', { hasText: name }).click();
    await page.waitForTimeout(700);
    result[name] = await page.locator('#projects article').count();
  }
  result.announced = await page.locator('#projects [role="status"]').textContent();
  return result;
}

const server = await preview({ root, preview: { port: PORT, strictPort: true, open: false }, logLevel: 'warn' });
const url = `http://localhost:${PORT}/`;
await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
let failures = 0;

try {
  for (const vp of VIEWPORTS) {
    for (const theme of ['dark', 'light']) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.mobile ? 2 : 1,
        isMobile: vp.mobile,
        hasTouch: vp.mobile,
        colorScheme: theme,
      });
      await context.addInitScript((value) => localStorage.setItem('theme', value), theme);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForSelector('.boot', { state: 'detached', timeout: 8000 });
      if (!vp.mobile) await page.mouse.move(vp.width * 0.5, vp.height * 0.45);
      await page.waitForTimeout(2600); // typing, figure lines drawing in, first shooting star

      const report = {};
      report.typing = await page.evaluate(() => ({
        booted: document.documentElement.classList.contains('is-booted'),
        charsVisible: [...document.querySelectorAll('.type-char')].every((el) => getComputedStyle(el).opacity === '1'),
        outputVisible: getComputedStyle(document.querySelector('.type-out')).opacity === '1',
      }));
      if (vp.shot) await page.screenshot({ path: path.join(OUT_DIR, `hero-${vp.width}-${theme}.png`) });

      await revealAll(page);
      report.horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      report.tapBlockers = await tapBlockers(page);

      // Section shots: the whole section, with the floating header and button hidden.
      await page.addStyleTag({ content: '#site-header, .back-to-top, .cursor { visibility: hidden !important; }' });
      if (vp.shot) {
        for (const id of SECTIONS) {
          await page.locator(`#${id}`).screenshot({ path: path.join(OUT_DIR, `${id}-${vp.width}-${theme}.png`) });
        }
      }
      await page.addStyleTag({ content: '#site-header, .back-to-top, .cursor { visibility: visible !important; }' });

      if (vp.width === 1440) {
        report.contrast = await contrast(page);
        if (theme === 'dark') report.palette = await checkPalette(page);
      }
      if (vp.width === 390 && theme === 'dark') {
        report.filters = await checkFilters(page);
        report.projectColumns = await page.evaluate(() => getComputedStyle(document.querySelector('#projects ul.grid')).gridTemplateColumns.split(' ').length);
      }
      report.errors = errors;

      const failed =
        report.horizontalOverflow ||
        report.tapBlockers.length ||
        errors.length ||
        !report.typing.charsVisible ||
        !report.typing.outputVisible ||
        report.contrast?.failures.length ||
        (report.palette && !(report.palette.opened && report.palette.atProjects && report.palette.themeToggled && report.palette.escClosed));
      if (failed) failures += 1;
      console.log(`\n${vp.width}x${vp.height} ${theme}${failed ? '  <-- CHECK' : ''}`, JSON.stringify(report, null, 2));
      await context.close();
    }
  }

  // Reduced motion: one static sky, no errors, typing shown at once.
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForSelector('.boot', { state: 'detached', timeout: 8000 });
  await page.waitForTimeout(300);
  const reduced = await page.evaluate(() => {
    const c = document.querySelector('.star-field');
    const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let drawn = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 40) drawn += 1;
    return { drawnPixels: drawn, typedAtOnce: getComputedStyle(document.querySelector('.type-out')).opacity === '1' };
  });
  console.log('\nreduced motion', JSON.stringify({ ...reduced, errors }, null, 2));
  if (errors.length || !reduced.drawnPixels || !reduced.typedAtOnce) failures += 1;
  await context.close();
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
console.log(`\nScreenshots in ${path.relative(root, OUT_DIR)}/  (${failures} runs flagged)`);
process.exitCode = failures ? 1 : 0;
