import { useEffect, useRef } from 'react';

// Sparse star field with the occasional shooting star, drawn on one canvas behind the hero.
// One requestAnimationFrame loop that only runs while the tab is visible and the hero is on
// screen. Skipped entirely under prefers-reduced-motion. Full effect in dark mode, faint in light.

const MAX_DPR = 2;
const MAX_SHOOTING = 3;
const SPAWN_MIN = 2000; // ms between shooting stars
const SPAWN_MAX = 4000;
const MOBILE_WIDTH = 768;

const THEMES = {
  dark: { star: '226 232 255', starAlpha: 0.8, trail: '199 210 254', head: '#ffffff', shootAlpha: 0.95 },
  light: { star: '79 70 229', starAlpha: 0.22, trail: '99 102 241', head: '#6366f1', shootAlpha: 0.3 },
};

const rand = (min, max) => min + Math.random() * (max - min);
const currentTheme = () => (document.documentElement.classList.contains('dark') ? THEMES.dark : THEMES.light);

function makeStars(width, height) {
  const mobile = width < MOBILE_WIDTH;
  const count = Math.min(mobile ? 40 : 160, Math.round((width * height) / (mobile ? 9000 : 7000)));
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() < 0.15 ? 1.6 : rand(0.6, 1.1),
    alpha: rand(0.25, 1),
    // About a third of the stars twinkle.
    twinkle: Math.random() < 0.35 ? rand(0.6, 1.8) : 0,
    phase: rand(0, Math.PI * 2),
  }));
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

export default function StarField({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!canvas || reduceQuery.matches) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let stars = [];
    let shooting = [];
    let theme = currentTheme();
    let frame = 0;
    let last = 0;
    let nextSpawn = 0;
    let onScreen = true;
    let disabled = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = makeStars(width, height);
    };

    const draw = (time) => {
      const dt = Math.min((time - last) / 1000, 0.05); // clamp after a pause
      last = time;
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = `rgb(${theme.star})`;
      for (const star of stars) {
        const flicker = star.twinkle ? 0.6 + 0.4 * Math.sin(time * 0.001 * star.twinkle + star.phase) : 1;
        ctx.globalAlpha = star.alpha * flicker * theme.starAlpha;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }

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
        gradient.addColorStop(0, `rgb(${theme.trail} / 0)`);
        gradient.addColorStop(1, `rgb(${theme.trail} / ${fade * theme.shootAlpha})`);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.globalAlpha = fade * theme.shootAlpha;
        ctx.fillStyle = theme.head;
        ctx.fillRect(s.x - 1, s.y - 1, 2, 2);
        return true;
      });
      ctx.globalAlpha = 1;

      frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (frame || disabled || document.hidden || !onScreen) return;
      frame = requestAnimationFrame((time) => {
        last = time;
        if (!nextSpawn || nextSpawn < time) nextSpawn = time + rand(600, SPAWN_MIN);
        draw(time);
      });
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const sync = () => (disabled || document.hidden || !onScreen ? stop() : start());

    resize();
    canvas.classList.add('is-ready');

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    visibility.observe(canvas);
    const themeObserver = new MutationObserver(() => {
      theme = currentTheme();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const onReduceChange = () => {
      disabled = reduceQuery.matches;
      if (disabled) {
        stop();
        ctx.clearRect(0, 0, width, height);
      } else {
        start();
      }
    };
    reduceQuery.addEventListener('change', onReduceChange);
    document.addEventListener('visibilitychange', sync);
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      visibility.disconnect();
      themeObserver.disconnect();
      reduceQuery.removeEventListener('change', onReduceChange);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`star-field pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
