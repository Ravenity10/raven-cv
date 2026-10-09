import { useEffect, useRef } from 'react';
import { constellations } from '../data/constellations.js';
import { onBoot } from './Loader.jsx';

// The hero sky: two or three real constellations (src/data/constellations.js) over a faint
// field of background stars, the occasional shooting star, all on one canvas with one
// requestAnimationFrame loop. The figures drift slowly together as one layer, the field
// drifts at half the distance for a little depth, and every star twinkles gently. Once the
// boot loader has gone the figure lines draw in; lines near the pointer brighten, and on a
// desktop the star under the pointer shows its name.
//
// The loop only runs while the tab is visible and the hero is on screen. Colours come from
// the --sky-* variables in index.css, so they follow the theme; a theme change redraws the
// current frame at once. Under prefers-reduced-motion one static frame is drawn (lines in
// place, no drift, twinkle or shooting stars); hovering a star still labels it.

const MAX_DPR = 2;
const MAX_SHOOTING = 3;
const SPAWN_MIN = 2400; // ms between shooting stars
const SPAWN_MAX = 5000;
const DRIFT = { x: 26, y: 14, periodX: 95, periodY: 70 }; // px and seconds
const LINE_DRAW = 0.7; // seconds to draw one line
const LINE_STAGGER = 0.09; // seconds between lines of one figure
const FIGURE_STAGGER = 0.45; // seconds between figures
const NEAR_RADIUS = 150; // px around the pointer that brighten lines
const HOVER_RADIUS = 18; // px to pick up a star for its label
const LABEL_FONT = '500 11px "JetBrains Mono Variable", ui-monospace, monospace';
const NAME_FONT = '500 9px "JetBrains Mono Variable", ui-monospace, monospace';

// Anchor points (fractions of the canvas) and size (fraction of the shorter side per unit).
// The desktop slots sit in the open space around the copy and the code card (top centre,
// below the card, the left margin); the phone slots use the top and bottom corners.
const SLOTS_WIDE = [
  { x: 0.52, y: 0.2, scale: 0.4 },
  { x: 0.83, y: 0.8, scale: 0.42 },
  { x: 0.06, y: 0.56, scale: 0.4 },
];
const SLOTS_NARROW = [
  { x: 0.76, y: 0.16, scale: 0.6 },
  { x: 0.8, y: 0.9, scale: 0.46 },
];

const rand = (min, max) => min + Math.random() * (max - min);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Star radius from its magnitude: Rigel (0.1) about 2.5px, a magnitude 3.5 star about 1px.
const starRadius = (mag) => clamp(2.6 - mag * 0.45, 0.8, 2.6);

const fieldCount = (width, height) => Math.round(clamp((width * height) / 8000, 45, 160));

function readColors() {
  const style = getComputedStyle(document.documentElement);
  const read = (name) => style.getPropertyValue(name).trim();
  const rgb = (name) => read(name).split(/[\s,]+/).join(',');
  return {
    dot: rgb('--sky-dot'),
    dotAlpha: parseFloat(read('--sky-dot-alpha')) || 0.6,
    line: `rgb(${rgb('--sky-line')})`,
    lineAlpha: parseFloat(read('--sky-line-alpha')) || 0.2,
    lineHot: parseFloat(read('--sky-line-hot')) || 0.6,
    label: `rgb(${rgb('--sky-label')})`,
    labelAlpha: parseFloat(read('--sky-label-alpha')) || 0.85,
    trail: rgb('--sky-trail'),
    head: `rgb(${rgb('--sky-head')})`,
    shootAlpha: parseFloat(read('--sky-shoot-alpha')) || 0.9,
  };
}

// Soft halo drawn behind the brightest stars: one cached sprite per theme.
function makeGlow(rgb) {
  const size = 64;
  const sprite = document.createElement('canvas');
  sprite.width = size;
  sprite.height = size;
  const g = sprite.getContext('2d');
  const gradient = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, `rgba(${rgb},0.55)`);
  gradient.addColorStop(0.35, `rgba(${rgb},0.12)`);
  gradient.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gradient;
  g.fillRect(0, 0, size, size);
  return sprite;
}

// Picks the figures for this visit and gives each a slot and a small random tilt.
function pickFigures(narrow) {
  const slots = narrow ? SLOTS_NARROW : SLOTS_WIDE;
  const pool = [...constellations].sort(() => Math.random() - 0.5);
  return slots.map((slot, index) => {
    const figure = pool[index];
    const angle = rand(-0.25, 0.25);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      ...figure,
      slot,
      delay: index * FIGURE_STAGGER,
      stars: figure.stars.map((star) => ({
        ...star,
        lx: star.x * cos - star.y * sin,
        ly: star.x * sin + star.y * cos,
        r: starRadius(star.mag),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.6, 1.4),
        px: 0,
        py: 0,
      })),
    };
  });
}

function makeFieldStar() {
  return {
    x: Math.random(),
    y: Math.random(),
    r: Math.random() < 0.12 ? rand(1, 1.4) : rand(0.4, 0.9),
    alpha: rand(0.25, 0.7),
    phase: rand(0, Math.PI * 2),
    speed: rand(0.5, 2),
  };
}

function makeShootingStar(width, height) {
  // 15-40 degrees below horizontal, heading left or right.
  const angle = rand(0.26, 0.7);
  const direction = Math.random() < 0.5 ? 1 : -1;
  const speed = rand(0.55, 0.85) * Math.max(width, 700); // px per second
  return {
    x: rand(0.1, 0.9) * width,
    y: rand(0, 0.45) * height,
    vx: Math.cos(angle) * speed * direction,
    vy: Math.sin(angle) * speed,
    length: rand(90, 170) * Math.min(1, width / 1000 + 0.4),
    life: rand(0.8, 1.3), // seconds
    age: 0,
  };
}

// Distance from point (x, y) to the segment a-b.
function segmentDistance(x, y, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return Math.hypot(x - (ax + dx * t), y - (ay + dy * t));
}

const easeOut = (t) => 1 - (1 - t) ** 3;

export default function StarField({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return undefined;
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    let width = 0;
    let height = 0;
    let narrow = window.innerWidth < 768;
    let figures = pickFigures(narrow);
    const field = [];
    let shooting = [];
    let colors = readColors();
    let glow = makeGlow(colors.dot);
    let frame = 0;
    let last = 0;
    let nextSpawn = 0;
    let onScreen = true;
    let reduced = reduceQuery.matches;
    let drawStart = null; // set when the boot loader has gone
    let pointer = null; // client coordinates of a mouse or pen
    let stillFrame = 0;

    // Places every figure star in canvas pixels for the given drift offset.
    const layout = (ox, oy) => {
      const unit = Math.min(width, height);
      for (const figure of figures) {
        const size = unit * figure.slot.scale;
        const cx = figure.slot.x * width + ox;
        const cy = figure.slot.y * height + oy;
        let minY = Infinity;
        let maxY = -Infinity;
        let minX = Infinity;
        let maxX = -Infinity;
        for (const star of figure.stars) {
          star.px = cx + star.lx * size;
          star.py = cy + star.ly * size;
          minX = Math.min(minX, star.px);
          maxX = Math.max(maxX, star.px);
          minY = Math.min(minY, star.py);
          maxY = Math.max(maxY, star.py);
        }
        figure.box = { minX, maxX, minY, maxY };
      }
    };

    const pointerLocal = () => {
      if (!pointer) return null;
      const rect = canvas.getBoundingClientRect();
      const x = pointer.x - rect.left;
      const y = pointer.y - rect.top;
      return x >= 0 && y >= 0 && x <= width && y <= height ? { x, y } : null;
    };

    const drawField = (time, ox, oy) => {
      ctx.fillStyle = `rgb(${colors.dot})`;
      for (const star of field) {
        const twinkle = reduced ? 1 : 0.7 + 0.3 * Math.sin(time * 0.001 * star.speed + star.phase);
        ctx.globalAlpha = star.alpha * twinkle * colors.dotAlpha * 0.7;
        const x = (((star.x * width + ox * 0.5) % width) + width) % width;
        const y = (((star.y * height + oy * 0.5) % height) + height) % height;
        ctx.fillRect(x - star.r / 2, y - star.r / 2, star.r, star.r);
      }
    };

    const drawFigures = (time, local) => {
      const elapsed = drawStart === null ? -1 : (time - drawStart) / 1000;
      let hovered = null;
      let best = HOVER_RADIUS;

      for (const figure of figures) {
        const start = elapsed - figure.delay;
        const starsIn = reduced ? 1 : clamp(start / 0.6, 0, 1);
        const inBox =
          local && local.x > figure.box.minX - 30 && local.x < figure.box.maxX + 30 && local.y > figure.box.minY - 30 && local.y < figure.box.maxY + 30;

        // Lines, each drawn from its first star toward the second, with a small gap at each star.
        ctx.lineWidth = 1;
        ctx.strokeStyle = colors.line;
        figure.lines.forEach(([ia, ib], index) => {
          const progress = reduced ? 1 : easeOut(clamp((start - 0.25 - index * LINE_STAGGER) / LINE_DRAW, 0, 1));
          if (progress <= 0) return;
          const a = figure.stars[ia];
          const b = figure.stars[ib];
          const dx = b.px - a.px;
          const dy = b.py - a.py;
          const length = Math.hypot(dx, dy) || 1;
          const ux = dx / length;
          const uy = dy / length;
          const gapA = a.r + 3;
          const gapB = b.r + 3;
          const visible = Math.max(0, length - gapA - gapB);
          if (!visible) return;
          const ax = a.px + ux * gapA;
          const ay = a.py + uy * gapA;
          const bx = ax + ux * visible * progress;
          const by = ay + uy * visible * progress;
          let alpha = colors.lineAlpha;
          if (local) {
            const near = 1 - clamp(segmentDistance(local.x, local.y, ax, ay, bx, by) / NEAR_RADIUS, 0, 1);
            alpha += (colors.lineHot - colors.lineAlpha) * near * near;
          }
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        });

        if (starsIn <= 0) continue;
        for (const star of figure.stars) {
          const twinkle = reduced ? 1 : 0.86 + 0.14 * Math.sin(time * 0.001 * star.speed + star.phase);
          // Phones put the figures behind the copy, so they sit a little fainter there.
          const alpha = starsIn * twinkle * colors.dotAlpha * (narrow ? 0.75 : 1);
          if (star.mag < 1.9) {
            const size = star.r * 9;
            ctx.globalAlpha = alpha;
            ctx.drawImage(glow, star.px - size / 2, star.py - size / 2, size, size);
          }
          ctx.globalAlpha = Math.min(1, alpha * 1.25);
          ctx.fillStyle = `rgb(${colors.dot})`;
          ctx.beginPath();
          ctx.arc(star.px, star.py, star.r, 0, Math.PI * 2);
          ctx.fill();
          if (local && star.name && starsIn === 1) {
            const distance = Math.hypot(local.x - star.px, local.y - star.py);
            if (distance < best) {
              best = distance;
              hovered = { star, figure };
            }
          }
        }

        // The figure's name, faint, under it; brighter while the pointer is over the figure.
        if (!narrow) {
          ctx.globalAlpha = starsIn * colors.labelAlpha * (inBox ? 0.7 : 0.32);
          ctx.fillStyle = colors.label;
          ctx.font = NAME_FONT;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
          ctx.fillText(figure.name.toUpperCase(), (figure.box.minX + figure.box.maxX) / 2, figure.box.maxY + 14);
          if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
        }
      }
      ctx.globalAlpha = 1;
      return hovered;
    };

    // Ring and name for the star under the pointer (desktop only).
    const drawHover = (hovered) => {
      if (!hovered) return;
      const { star, figure } = hovered;
      ctx.globalAlpha = colors.labelAlpha;
      ctx.strokeStyle = colors.label;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(star.px, star.py, star.r + 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = LABEL_FONT;
      ctx.textBaseline = 'middle';
      const text = `${star.name} · ${figure.name}`;
      const textWidth = ctx.measureText(text).width;
      const flip = star.px + 16 + textWidth > width - 8;
      ctx.textAlign = flip ? 'right' : 'left';
      ctx.fillStyle = colors.label;
      ctx.fillText(text, star.px + (flip ? -16 : 16), star.py - 12);
      ctx.globalAlpha = 1;
    };

    const drawShooting = (time, dt) => {
      if (time >= nextSpawn) {
        if (shooting.length < MAX_SHOOTING) shooting.push(makeShootingStar(width, height));
        nextSpawn = time + rand(SPAWN_MIN, SPAWN_MAX);
      }

      ctx.lineCap = 'round';
      ctx.lineWidth = 1.2;
      shooting = shooting.filter((s) => {
        s.age += dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const t = s.age / s.life;
        if (t >= 1) return false;
        // Quick fade in, long fade out; the trail grows to full length as it starts.
        const fade = Math.min(t / 0.15, 1) * Math.min((1 - t) / 0.5, 1);
        const speed = Math.hypot(s.vx, s.vy);
        const len = s.length * Math.min(t / 0.25, 1);
        const tailX = s.x - (s.vx / speed) * len;
        const tailY = s.y - (s.vy / speed) * len;
        const gradient = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        gradient.addColorStop(0, `rgba(${colors.trail},0)`);
        gradient.addColorStop(1, `rgba(${colors.trail},${fade * colors.shootAlpha})`);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.globalAlpha = fade * colors.shootAlpha;
        ctx.fillStyle = colors.head;
        ctx.fillRect(s.x - 1, s.y - 1, 2, 2);
        return true;
      });
      ctx.globalAlpha = 1;
    };

    const render = (time, dt) => {
      const seconds = time / 1000;
      const ox = reduced ? 0 : DRIFT.x * Math.sin((seconds / DRIFT.periodX) * Math.PI * 2);
      const oy = reduced ? 0 : DRIFT.y * Math.sin((seconds / DRIFT.periodY) * Math.PI * 2 + 1.3);
      const local = finePointer.matches ? pointerLocal() : null;
      layout(ox, oy);
      ctx.clearRect(0, 0, width, height);
      drawField(time, ox, oy);
      const hovered = drawFigures(time, local);
      if (!reduced && dt) drawShooting(time, dt);
      drawHover(hovered);
    };

    // One frame with no movement: the reduced-motion still and theme/resize redraws.
    const paint = () => render(performance.now(), 0);

    const loop = (time) => {
      const dt = Math.min((time - last) / 1000, 0.05); // clamp after a pause
      last = time;
      render(time, dt);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (frame || reduced || document.hidden || !onScreen) return;
      frame = requestAnimationFrame((time) => {
        last = time;
        if (!nextSpawn || nextSpawn < time) nextSpawn = time + rand(1200, SPAWN_MIN);
        loop(time);
      });
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const sync = () => (reduced || document.hidden || !onScreen ? stop() : start());

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Crossing the tablet breakpoint swaps between the two- and three-figure layouts.
      const nextNarrow = window.innerWidth < 768;
      if (nextNarrow !== narrow) {
        narrow = nextNarrow;
        figures = pickFigures(narrow);
      }
      const count = fieldCount(width, height);
      if (field.length > count) field.length = count;
      while (field.length < count) field.push(makeFieldStar());
      paint();
    };

    resize();
    canvas.classList.add('is-ready');
    const offBoot = onBoot(() => {
      drawStart = performance.now();
      paint();
    });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    visibility.observe(canvas);
    const themeObserver = new MutationObserver(() => {
      colors = readColors();
      glow = makeGlow(colors.dot);
      // Redraw now rather than on the next frame, so the new theme never shows old colours.
      paint();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const onReduceChange = () => {
      reduced = reduceQuery.matches;
      shooting = [];
      paint();
      sync();
    };
    const onPointerMove = (event) => {
      if (event.pointerType === 'touch') return;
      pointer = { x: event.clientX, y: event.clientY };
      // With the loop stopped (reduced motion), repaint once per frame so hover labels still work.
      if (reduced && onScreen && !stillFrame) {
        stillFrame = requestAnimationFrame(() => {
          stillFrame = 0;
          paint();
        });
      }
    };
    const onPointerLeave = () => {
      pointer = null;
      if (reduced) paint();
    };
    reduceQuery.addEventListener('change', onReduceChange);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    start();

    return () => {
      stop();
      cancelAnimationFrame(stillFrame);
      offBoot();
      resizeObserver.disconnect();
      visibility.disconnect();
      themeObserver.disconnect();
      reduceQuery.removeEventListener('change', onReduceChange);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`star-field pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
