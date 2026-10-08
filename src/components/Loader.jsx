import { useEffect, useState } from 'react';
import { loader } from '../data/profile.js';
import { lockScroll } from '../hooks/useSmoothScroll.js';

// Full-screen boot screen. It is part of the pre-rendered HTML, so it covers the page from
// first paint. Progress is real: each task below (app hydrated, fonts, hero images decoded,
// window load) is an equal share, and the shown percentage eases toward the share completed.
// It stays at least MIN_DISPLAY ms and never longer than HARD_TIMEOUT ms (both measured from
// navigation start), then fades out and unmounts. A CSS failsafe (.boot in index.css) hides it
// if JavaScript never runs. Decorative only: aria-hidden, the page underneath stays readable.

const MIN_DISPLAY = 800;
const HARD_TIMEOUT = 4000;
const DONE_HOLD = 220; // ms the "done" line stays before the fade
const FADE = 450; // matches .boot.is-leaving in index.css
const REDUCED_FADE = 160;
const EASE = 0.14;

// Anything that should start once the loader is gone (the hero name scramble) subscribes here.
let booted = false;
const listeners = new Set();
export function onBoot(callback) {
  if (booted) {
    callback();
    return () => {};
  }
  listeners.add(callback);
  return () => listeners.delete(callback);
}
function markBooted() {
  booted = true;
  listeners.forEach((callback) => callback());
  listeners.clear();
}

function bootTasks() {
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const load =
    document.readyState === 'complete' ? Promise.resolve() : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
  const images = Promise.all([...document.querySelectorAll('#hero img')].map((img) => img.decode().catch(() => {})));
  return [Promise.resolve(), fonts, images, load];
}

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('active'); // active -> done -> leaving -> gone

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers = [];
    let frame = 0;
    let cancelled = false;

    const leave = (fade) => {
      setPhase('leaving');
      lockScroll(false);
      markBooted();
      timers.push(setTimeout(() => setPhase('gone'), fade));
    };

    lockScroll(true);

    if (reduce) {
      // No progress animation: a short fade as soon as the app is interactive.
      setProgress(100);
      leave(REDUCED_FADE);
      return () => timers.forEach(clearTimeout);
    }

    const tasks = bootTasks();
    let completed = 0;
    tasks.forEach((task) =>
      task.then(() => {
        if (!cancelled) completed += 1;
      }),
    );

    let shown = 0;
    const tick = () => {
      const target = (completed / tasks.length) * 100;
      shown += (target - shown) * EASE;
      if (target - shown < 0.5) shown = target;
      const now = performance.now();
      const ready = shown >= 100 && now >= MIN_DISPLAY;
      if (ready || now >= HARD_TIMEOUT) {
        setProgress(100);
        setPhase('done');
        timers.push(setTimeout(() => leave(FADE), DONE_HOLD));
        return;
      }
      setProgress(Math.floor(shown));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      lockScroll(false);
    };
  }, []);

  if (phase === 'gone') return null;

  const steps = loader.steps;
  const doneSteps = Math.min(steps.length, Math.floor((progress / 100) * steps.length));
  const finished = phase !== 'active';
  const message = finished ? loader.done : steps[Math.min(doneSteps, steps.length - 1)].message;

  return (
    <div aria-hidden="true" className={`boot ${phase === 'leaving' ? 'is-leaving' : ''}`}>
      <div className="boot-panel">
        <p className="boot-prompt">
          <span className="text-accent">{loader.user}</span>
          <span className="text-muted">{loader.path}</span> {loader.command}
          <span className="boot-caret" />
        </p>

        <ol className="boot-steps">
          <li className="boot-rail">
            <span className="boot-rail-fill" style={{ transform: `scaleX(${progress / 100})` }} />
          </li>
          {steps.map((step, index) => {
            const state = index < doneSteps ? 'done' : index === doneSteps && !finished ? 'active' : 'pending';
            return (
              <li key={step.label} className="boot-step" data-state={state}>
                <span className="boot-node">{state === 'done' && <Check />}</span>
                <span className="boot-label">{step.label}</span>
              </li>
            );
          })}
        </ol>

        <div className="boot-foot">
          <p className={finished ? 'text-accent' : ''}>
            <span className="text-accent">&gt;</span> {message}
            {finished ? '' : '...'}
          </p>
          <p className="boot-pct">
            {progress}
            <span className="text-muted">%</span>
          </p>
        </div>
      </div>
    </div>
  );
}
