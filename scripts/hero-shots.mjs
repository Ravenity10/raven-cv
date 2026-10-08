// Serves dist/ (run `npm run build` first), screenshots the hero and runs a few layout checks.
//
// Output: scripts/out/hero-<width>.png (dark, the default theme) and hero-<width>-light.png
// Usage:  npm run hero-shots

import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { preview } from 'vite';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(root, 'scripts', 'out');
const PORT = 4179;

const VIEWPORTS = [
  { width: 1440, height: 900, mobile: false, shot: true },
  { width: 390, height: 844, mobile: true, shot: true },
  { width: 360, height: 780, mobile: true, shot: false },
];

async function checkPage(page, mobile) {
  return page.evaluate(async (isMobile) => {
    await document.fonts.ready;
    const doc = document.documentElement;
    const h1 = document.getElementById('hero-title');
    const cta = document.querySelector('#hero-title ~ div a');
    const box = cta.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    const canvas = document.querySelector('.star-field');
    return {
      horizontalOverflow: doc.scrollWidth > doc.clientWidth,
      h1Overflow: h1.scrollWidth > h1.clientWidth + 1,
      ctaTappable: cta.contains(hit),
      canvasPointerEvents: canvas && getComputedStyle(canvas).pointerEvents,
      canvasDpr: canvas && +(canvas.width / canvas.getBoundingClientRect().width).toFixed(2),
      customCursor: !!document.querySelector('.cursor'),
      nativeCursorHidden: doc.classList.contains('has-cursor'),
      fonts: {
        body: getComputedStyle(document.body).fontFamily.split(',')[0],
        h1: getComputedStyle(h1).fontFamily.split(',')[0],
        mono: getComputedStyle(document.querySelector('.eyebrow')).fontFamily.split(',')[0],
        loaded: document.fonts.check('16px "Space Grotesk Variable"') && document.fonts.check('16px "JetBrains Mono Variable"'),
      },
      clock: document.querySelector('#main time')?.textContent,
      expectMobile: isMobile,
    };
  }, mobile);
}

async function checkMobileMenu(page) {
  await page.click('button[aria-controls="mobile-nav"]');
  await page.waitForTimeout(300);
  const result = await page.evaluate(() => {
    const nav = document.getElementById('mobile-nav');
    const style = getComputedStyle(nav);
    const below = nav.getBoundingClientRect().bottom + 20;
    // Anything under the menu should be the page itself, not a full-screen layer.
    const hit = document.elementFromPoint(window.innerWidth / 2, Math.min(below, window.innerHeight - 10));
    return {
      menuBackground: style.backgroundColor,
      menuBackdropFilter: style.backdropFilter,
      pageBelowMenuReachable: !!hit && !hit.closest('#mobile-nav') && hit.id !== 'site-header',
    };
  });
  await page.mouse.click(10, 700); // outside tap closes it
  await page.waitForTimeout(300);
  result.closesOnOutsideTap = !(await page.$('#mobile-nav'));
  return result;
}

async function checkCopyToast(page) {
  await page.locator('#contact button', { hasText: /copy/i }).first().click();
  await page.waitForTimeout(300);
  return page.evaluate(() => document.querySelector('.toast.is-visible')?.textContent.trim() || null);
}

const server = await preview({ root, preview: { port: PORT, strictPort: true, open: false }, logLevel: 'warn' });
const url = `http://localhost:${PORT}/`;
await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();

try {
  for (const vp of VIEWPORTS) {
    for (const theme of ['dark', 'light']) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.mobile ? 3 : 1,
        isMobile: vp.mobile,
        hasTouch: vp.mobile,
        colorScheme: theme,
        permissions: ['clipboard-read', 'clipboard-write'],
      });
      await context.addInitScript((value) => localStorage.setItem('theme', value), theme);
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });
      if (!vp.mobile) await page.mouse.move(vp.width * 0.72, vp.height * 0.3);
      await page.waitForTimeout(2600); // entrance animations, first shooting star, clock tick

      const name = `hero-${vp.width}${theme === 'light' ? '-light' : ''}`;
      if (vp.shot) await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });

      if (theme === 'dark') {
        const report = await checkPage(page, vp.mobile);
        if (vp.mobile) report.menu = await checkMobileMenu(page);
        else report.copyToast = await checkCopyToast(page);
        console.log(`\n${vp.width}px`, JSON.stringify(report, null, 2));
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
console.log(`\nScreenshots in ${path.relative(root, OUT_DIR)}/`);
