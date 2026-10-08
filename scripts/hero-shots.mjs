// Serves dist/ (run `npm run build` first), screenshots the hero and runs layout checks.
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
  { width: 1366, height: 768, mobile: false, shot: true },
  { width: 390, height: 844, mobile: true, shot: true },
  { width: 360, height: 640, mobile: true, shot: true },
];

// Watches the loader from first paint: how long it stayed, whether it locked scrolling,
// and whether anything is left covering the page afterwards.
async function checkLoader(page) {
  const start = Date.now();
  const sawLoader = await page.locator('.boot').count();
  const lockedWhileVisible = await page.evaluate(() => document.documentElement.style.overflow === 'hidden' || !document.querySelector('.boot'));
  await page.waitForSelector('.boot', { state: 'detached', timeout: 8000 });
  return page.evaluate(
    ({ sawLoader, lockedWhileVisible, waited }) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const hit = document.elementFromPoint(cx, cy);
      return {
        shownAtFirstPaint: sawLoader > 0,
        lockedWhileVisible,
        unmountedAfterMs: waited,
        nameScramblingAfterBoot: !!document.querySelector('#hero-title .is-scrambling'),
        scrollRestored: document.documentElement.style.overflow === '',
        topElementIsPage: !!hit && !hit.closest('.boot') && getComputedStyle(hit).position !== 'fixed',
      };
    },
    { sawLoader, lockedWhileVisible, waited: Date.now() - start },
  );
}

// Hovers the name and records the box of every word and the caret on each frame of the
// scramble; any change is a layout shift.
async function checkScramble(page) {
  await page.evaluate(() => {
    const h1 = document.getElementById('hero-title');
    const layout = () =>
      [...h1.querySelectorAll('.anim-word, .caret')]
        .map((el) => {
          const r = el.getBoundingClientRect();
          return `${r.left.toFixed(1)},${r.top.toFixed(1)},${r.width.toFixed(1)},${r.height.toFixed(1)}`;
        })
        .join('|');
    const layouts = new Set([layout()]);
    let scrambledFrames = 0;
    const startAt = performance.now();
    window.__scramble = new Promise((resolve) => {
      const sample = () => {
        layouts.add(layout());
        if (h1.querySelector('.is-scrambling')) scrambledFrames += 1;
        if (performance.now() - startAt < 2000) requestAnimationFrame(sample);
        else
          resolve({
            ariaLabel: h1.getAttribute('aria-label'),
            visibleTreeHidden: [...h1.children].every((el) => el.getAttribute('aria-hidden') === 'true'),
            scrambledFrames,
            layoutShift: layouts.size > 1 ? layouts.size : false,
            restoredText: [...h1.querySelectorAll('[data-char]')].every((el) => el.textContent === el.dataset.char),
          });
      };
      requestAnimationFrame(sample);
    });
  });
  await page.mouse.move(5, 5);
  await page.hover('#hero-title');
  return page.evaluate(() => window.__scramble);
}

async function checkPage(page) {
  return page.evaluate(async () => {
    await document.fonts.ready;
    const doc = document.documentElement;
    const hero = document.getElementById('hero');
    const h1 = document.getElementById('hero-title');
    const cta = document.querySelector('#hero-title ~ div a');
    const box = cta.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    const canvas = document.querySelector('.star-field');
    const ticker = hero.querySelector('.marquee');
    const track = ticker.querySelector('.marquee-track');
    const lists = track.querySelectorAll('ul');
    const tickerBox = ticker.getBoundingClientRect();
    return {
      horizontalOverflow: doc.scrollWidth > doc.clientWidth,
      h1Overflow: h1.scrollWidth > h1.clientWidth + 1,
      heroHeight: Math.round(hero.getBoundingClientRect().height),
      heroFitsViewport: hero.getBoundingClientRect().bottom <= window.innerHeight + 1,
      tickerPinnedToBottom: Math.abs(tickerBox.bottom - hero.getBoundingClientRect().bottom) < 2,
      ctaTappable: cta.contains(hit),
      statusItemsShown: [...document.querySelectorAll('#hero dl > div')].filter((el) => el.offsetParent).length,
      marquee: {
        lists: lists.length,
        accessibleLists: [...lists].filter((ul) => !ul.hasAttribute('aria-hidden')).length,
        halfCoversRow: track.scrollWidth / 2 >= ticker.clientWidth,
        duration: getComputedStyle(track).animationDuration,
      },
      canvasPointerEvents: canvas && getComputedStyle(canvas).pointerEvents,
      canvasDpr: canvas && +(canvas.width / canvas.getBoundingClientRect().width).toFixed(2),
      customCursor: !!document.querySelector('.cursor'),
      fontsLoaded: document.fonts.check('16px "Space Grotesk Variable"') && document.fonts.check('16px "JetBrains Mono Variable"'),
    };
  });
}

async function checkBackToTop(page) {
  const result = {};
  result.hiddenOnHero = !(await page.$('.back-to-top'));
  await page.evaluate(() => window.scrollTo(0, document.getElementById('about').offsetTop + 300));
  await page.waitForSelector('.back-to-top', { timeout: 3000 });
  await page.waitForTimeout(400);
  result.shownPastHero = true;
  result.button = await page.evaluate(() => {
    const btn = document.querySelector('.back-to-top');
    const r = btn.getBoundingClientRect();
    return {
      tag: btn.tagName,
      ariaLabel: btn.getAttribute('aria-label'),
      size: `${Math.round(r.width)}x${Math.round(r.height)}`,
      rightGap: Math.round(window.innerWidth - r.right),
      bottomGap: Math.round(window.innerHeight - r.bottom),
      ringOffset: btn.querySelector('.back-to-top-ring').style.strokeDashoffset,
    };
  });
  // At the very bottom it must sit above the footer, not over its links.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(700);
  result.clearsFooter = await page.evaluate(() => {
    const btn = document.querySelector('.back-to-top').getBoundingClientRect();
    const footer = document.querySelector('footer').getBoundingClientRect();
    return btn.bottom <= footer.top + 1;
  });
  await page.click('.back-to-top');
  await page.waitForTimeout(1800);
  result.scrolledToTop = await page.evaluate(() => window.scrollY < 5);
  result.hiddenAgain = !(await page.$('.back-to-top'));
  return result;
}

async function checkThemeSwitch(page) {
  const sample = () =>
    page.evaluate(() => {
      const c = document.querySelector('.star-field');
      // Average colour of the drawn canvas pixels, to see the sky follow the theme.
      const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let r = 0;
      let n = 0;
      for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 40) (r += data[i]), (n += 1);
      return { dark: document.documentElement.classList.contains('dark'), drawnPixels: n, avgRed: n ? Math.round(r / n) : null };
    });
  const before = await sample();
  await page.click('#site-header button[aria-label*="theme"]');
  const right = await sample(); // synchronously after the click: canvas already repainted?
  await page.waitForTimeout(700);
  const after = await sample();
  await page.click('#site-header button[aria-label*="theme"]');
  await page.waitForTimeout(700);
  return {
    viewTransitions: await page.evaluate(() => typeof document.startViewTransition === 'function'),
    before,
    immediatelyAfter: right,
    after,
    leftoverFadeClass: await page.evaluate(() => document.documentElement.classList.contains('theme-fade')),
  };
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
        deviceScaleFactor: vp.mobile ? 3 : 1,
        isMobile: vp.mobile,
        hasTouch: vp.mobile,
        colorScheme: theme,
      });
      await context.addInitScript((value) => localStorage.setItem('theme', value), theme);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
      await page.goto(url, { waitUntil: 'commit' });
      await page.waitForSelector('#hero');
      const loaderReport = await checkLoader(page);
      if (!vp.mobile) await page.mouse.move(vp.width * 0.72, vp.height * 0.3);
      await page.waitForTimeout(2200); // scramble, entrance animations, first shooting star

      const name = `hero-${vp.width}${theme === 'light' ? '-light' : ''}`;
      if (vp.shot) await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });

      const report = { loader: loaderReport, ...(await checkPage(page)) };
      if (theme === 'dark') {
        report.scramble = await checkScramble(page);
        if (!vp.mobile) report.theme = await checkThemeSwitch(page);
        report.backToTop = await checkBackToTop(page);
      }
      report.errors = errors;
      const failed =
        report.horizontalOverflow || report.h1Overflow || !report.heroFitsViewport || !report.ctaTappable || !report.marquee.halfCoversRow || errors.length || report.scramble?.layoutShift || report.loader.topElementIsPage === false;
      if (failed) failures += 1;
      console.log(`\n${vp.width}x${vp.height} ${theme}${failed ? '  <-- CHECK' : ''}`, JSON.stringify(report, null, 2));
      await context.close();
    }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
console.log(`\nScreenshots in ${path.relative(root, OUT_DIR)}/  (${failures} viewport/theme runs flagged)`);
