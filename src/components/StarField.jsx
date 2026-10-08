import { useEffect, useRef } from 'react';

// Constellation behind the hero: drifting points joined by lines when they come close, a
// gentle pull toward the mouse, and the occasional shooting star, all on one canvas with one
// requestAnimationFrame loop. The loop only runs while the tab is visible and the hero is on
// screen. Colours come from the --sky-* variables in index.css, so they follow the theme; a
// theme change redraws the current frame immediately (no flicker during the view transition).
// Under prefers-reduced-motion a single static frame is drawn instead.

const MAX_DPR = 2;
const MAX_SHOOTING = 3;
const SPAWN_MIN = 2000; // ms between shooting stars
const SPAWN_MAX = 4000;
const PULL_RADIUS = 170; // px around the pointer that feel the pull
const PULL_FORCE = 70; // px/s^2 at the strongest point of the pull
const RETURN = 1.4; // how quickly a particle eases back to its own drift (per second)
const ALPHA_BUCKETS = 6; // lines are batched into this many opacity levels

const rand = (min, max) => min + Math.random() * (max - min);

// About 40 points on a phone, 90 on a desktop, scaled linearly in between.
const particleCount = (width) => Math.round(Math.min(90, Math.max(40, 40 + ((width - 375) / (1440 - 375)) * 50)));
const linkDistance = (width) => (width < 768 ? 105 : 135);

function readColors() {
  const style = getComputedStyle(document.documentElement);
  const read = (name) => style.getPropertyValue(name).trim();
  const rgb = (name) => read(name).split(/[\s,]+/).join(',');
  return {
    dot: `rgb(${rgb('--sky-dot')})`,
    dotAlpha: parseFloat(read('--sky-dot-alpha')) || 0.6,
    line: `rgb(${rgb('--sky-line')})`,
    lineAlpha: parseFloat(read('--sky-line-alpha')) || 0.2,
    trail: rgb('--sky-trail'),
    head: `rgb(${rgb('--sky-head')})`,
    shootAlpha: parseFloat(read('--sky-shoot-alpha')) || 0.9,
  };
}

function makeParticle(width, height) {
  const angle = rand(0, Math.PI * 2);
  const speed = rand(5, 16); // px per second
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx,
    vy,
    baseVx: vx,
    baseVy: vy,
    size: Math.random() < 0.18 ? 1.8 : rand(0.9, 1.4),
    alpha: rand(0.45, 1),
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

export default function StarField({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return undefined;
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    let width = 0;
    let height = 0;
    let particles = [];
    let shooting = [];
    let colors = readColors();
    let frame = 0;
    let last = 0;
    let nextSpawn = 0;
    let onScreen = true;
    let reduced = reduceQuery.matches;
    let pointer = null; // client coordinates of a mouse or pen
    const buckets = Array.from({ length: ALPHA_BUCKETS }, () => []);

    const step = (dt) => {
      let px = 0;
      let py = 0;
      if (pointer) {
        const rect = canvas.getBoundingClientRect();
        px = pointer.x - rect.left;
        py = pointer.y - rect.top;
      }
      const ease = Math.min(1, RETURN * dt);
      for (const p of particles) {
        if (pointer) {
          const dx = px - p.x;
          const dy = py - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 1 && dist < PULL_RADIUS) {
            // Zero at the centre and the edge, strongest in between, so points gather
            // loosely around the pointer instead of collapsing onto it.
            const t = dist / PULL_RADIUS;
            const force = PULL_FORCE * 4 * t * (1 - t) * dt;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }
        p.vx += (p.baseVx - p.vx) * ease;
        p.vy += (p.baseVy - p.vy) * ease;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Wrap around the edges with a small margin so lines do not pop.
        if (p.x < -20) p.x = width + 20;
        else if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        else if (p.y > height + 20) p.y = -20;
      }
    };

    const drawConstellation = () => {
      const link = linkDistance(width);
      const link2 = link * link;
      buckets.forEach((bucket) => (bucket.length = 0));
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < link2) {
            const strength = 1 - Math.sqrt(d2) / link;
            buckets[Math.min(ALPHA_BUCKETS - 1, Math.floor(strength * ALPHA_BUCKETS))].push(a, b);
          }
        }
      }

      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.line;
      buckets.forEach((bucket, level) => {
        if (!bucket.length) return;
        ctx.globalAlpha = ((level + 1) / ALPHA_BUCKETS) * colors.lineAlpha;
        ctx.beginPath();
        for (let k = 0; k < bucket.length; k += 2) {
          ctx.moveTo(bucket[k].x, bucket[k].y);
          ctx.lineTo(bucket[k + 1].x, bucket[k + 1].y);
        }
        ctx.stroke();
      });

      ctx.fillStyle = colors.dot;
      for (const p of particles) {
        ctx.globalAlpha = p.alpha * colors.dotAlpha;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
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

    // One frame with no movement: used for the reduced-motion still and theme/resize redraws.
    const paint = () => {
      ctx.clearRect(0, 0, width, height);
      drawConstellation();
    };

    const loop = (time) => {
      const dt = Math.min((time - last) / 1000, 0.05); // clamp after a pause
      last = time;
      step(dt);
      ctx.clearRect(0, 0, width, height);
      drawConstellation();
      drawShooting(time, dt);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (frame || reduced || document.hidden || !onScreen) return;
      frame = requestAnimationFrame((time) => {
        last = time;
        if (!nextSpawn || nextSpawn < time) nextSpawn = time + rand(600, SPAWN_MIN);
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
      const scaleX = width ? rect.width / width : 1;
      const scaleY = height ? rect.height / height : 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Keep existing points (rescaled) so a resize does not reshuffle the sky.
      for (const p of particles) {
        p.x *= scaleX;
        p.y *= scaleY;
      }
      const count = particleCount(width);
      if (particles.length > count) particles.length = count;
      while (particles.length < count) particles.push(makeParticle(width, height));
      paint();
    };

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
      colors = readColors();
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
    };
    const onPointerLeave = () => {
      pointer = null;
    };
    reduceQuery.addEventListener('change', onReduceChange);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    start();

    return () => {
      stop();
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
