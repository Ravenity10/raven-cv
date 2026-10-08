import { useEffect } from 'react';
import Lenis from 'lenis';

let lenis = null;
let locked = false;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Starts Lenis once for the app. Skipped entirely when the user prefers reduced motion,
// in which case native scrolling (with CSS scroll-padding) takes over.
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    // The boot loader can lock scrolling before Lenis exists (child effects run first).
    if (locked) lenis.stop();
    let frame = requestAnimationFrame(function raf(time) {
      lenis?.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
}

// `duration` (seconds) overrides Lenis's distance-based timing for this one scroll.
export function scrollToTarget(target, { duration } = {}) {
  const element = target === 'top' ? document.body : document.getElementById(target);
  if (!element) return;

  // The sticky header offset comes from `scroll-padding-top` on <html> (index.css),
  // which both Lenis and native scrolling respect.
  if (lenis) {
    lenis.scrollTo(target === 'top' ? 0 : element, duration ? { duration } : undefined);
  } else if (target === 'top') {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  } else {
    element.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  // Move focus for keyboard and screen reader users without a second scroll jump.
  if (target !== 'top') {
    element.setAttribute('tabindex', '-1');
    element.focus({ preventScroll: true });
  }
  history.replaceState(null, '', target === 'top' ? window.location.pathname : `#${target}`);
}

export function lockScroll(value) {
  locked = value;
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}
