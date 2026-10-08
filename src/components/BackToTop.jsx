import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { ui } from '../data/profile.js';
import { scrollToTarget } from '../hooks/useSmoothScroll.js';

// Floating "top" button, bottom-right. It appears once the sentinel at the end of the hero
// ([data-hero-sentinel], Hero.jsx) has scrolled above the viewport, and lifts by the visible
// height of the footer so it never covers the footer links. Both are IntersectionObservers,
// not scroll listeners. The ring around the arrow shows scroll progress; Motion batches the
// updates into its requestAnimationFrame loop. Styles: .back-to-top in index.css.

const RADIUS = 15;
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
    const sentinel = document.querySelector('[data-hero-sentinel]');
    const footer = document.querySelector('footer');
    const observers = [];

    if (sentinel) {
      const heroObserver = new IntersectionObserver(([entry]) => {
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      });
      heroObserver.observe(sentinel);
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
        <m.button
          key="back-to-top"
          type="button"
          aria-label={ui.backToTopLabel}
          onClick={() => scrollToTarget('hero', { duration: 1.2 })}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: -lift }}
          exit={{ opacity: 0, y: 12 - lift }}
          transition={transition}
          className="back-to-top group"
        >
          <span className="relative grid size-8 place-items-center">
            <svg width="32" height="32" viewBox="0 0 36 36" aria-hidden="true" className="absolute inset-0 size-full -rotate-90">
              <circle cx="18" cy="18" r={RADIUS} className="back-to-top-track" />
              <circle
                ref={(element) => {
                  ringRef.current = element;
                  setRing(scrollYProgress.get());
                }}
                cx="18"
                cy="18"
                r={RADIUS}
                strokeDasharray={CIRCUMFERENCE}
                className="back-to-top-ring"
              />
            </svg>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="back-to-top-arrow"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </span>
          <span aria-hidden="true">{ui.backToTop}</span>
        </m.button>
      )}
    </AnimatePresence>
  );
}
