import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { ui } from '../data/profile.js';
import { scrollToTarget } from '../hooks/useSmoothScroll.js';

// Floating "top" button, bottom-right. It appears once the whole hero (#hero) has scrolled
// above the viewport, and lifts by the visible
// height of the footer so it never covers the footer links. Both are IntersectionObservers,
// not scroll listeners. The ring around the arrow shows scroll progress; Motion batches the
// updates into its requestAnimationFrame loop. Styles: .back-to-top in index.css.

const RADIUS = 18.5; // the ring sits just outside the 32px badge
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// 0, 0.05 ... 1: enough steps for the lift to follow the footer smoothly.
const FOOTER_THRESHOLDS = Array.from({ length: 21 }, (_, index) => index / 20);

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [lift, setLift] = useState(0);
  const ringRef = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const setRing = (progress) => {
    if (ringRef.current) ringRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - progress));
  };
  useMotionValueEvent(scrollYProgress, 'change', setRing);

  useEffect(() => {
    // The hero itself, not a 1px marker at its end: the hero is always on screen at the top,
    // so even a jump past it (palette, anchor link) changes its intersection and is noticed.
    const hero = document.getElementById('hero');
    const footer = document.querySelector('footer');
    const observers = [];

    if (hero) {
      const heroObserver = new IntersectionObserver(([entry]) => {
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      });
      heroObserver.observe(hero);
      observers.push(heroObserver);
    }
    if (footer) {
      const footerObserver = new IntersectionObserver(
        ([entry]) => setLift(entry.isIntersecting ? Math.round(entry.intersectionRect.height) : 0),
        { threshold: FOOTER_THRESHOLDS },
      );
      footerObserver.observe(footer);
      observers.push(footerObserver);
    }
    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const transition = reduce ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] };

  return (
    <AnimatePresence>
      {visible && (
        // Same pill as the header actions: glass, hairline border, brand-gradient badge.
        <m.button
          key="back-to-top"
          type="button"
          onClick={() => scrollToTarget('hero', { duration: 1.2 })}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: -lift }}
          exit={{ opacity: 0, y: 12 - lift }}
          transition={transition}
          className="back-to-top group glass rounded-full border border-line p-1 text-sm font-medium text-fg transition-[border-color] hover:border-accent sm:pl-5"
        >
          {/* Icon only on phones, so less of the page sits under it; the label stays its name. */}
          <span className="max-sm:sr-only">{ui.backToTop}</span>
          <span aria-hidden="true" className="relative grid size-10 place-items-center">
            <svg width="40" height="40" viewBox="0 0 40 40" className="absolute inset-0 size-full -rotate-90">
              <circle cx="20" cy="20" r={RADIUS} className="back-to-top-track" />
              <circle
                ref={(element) => {
                  ringRef.current = element;
                  setRing(scrollYProgress.get());
                }}
                cx="20"
                cy="20"
                r={RADIUS}
                strokeDasharray={CIRCUMFERENCE}
                className="back-to-top-ring"
              />
            </svg>
            <span className="grid size-8 place-items-center rounded-full bg-brand-strong text-white">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="back-to-top-arrow"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </span>
          </span>
        </m.button>
      )}
    </AnimatePresence>
  );
}
