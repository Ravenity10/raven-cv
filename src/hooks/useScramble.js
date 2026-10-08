import { useCallback, useEffect, useRef } from 'react';

// Scrambles every [data-char] inside the returned ref into random glyphs, then resolves them
// left to right. Every letter is pinned to its measured resting width for the whole run
// (.glitch-pinned in index.css) and all are released in the same frame at the end: mixing
// pinned and free letters would change the kerning between them and nudge the line.
// The DOM is written directly from one requestAnimationFrame loop; React never re-renders
// during the effect. Does nothing under prefers-reduced-motion.

const GLYPHS = '!<>-_/[]{}=+*^?#~$%&';
const SCRAMBLE_FOR = 380; // ms before the first letter resolves
const PER_CHAR = 42; // ms between letters resolving
const SWAP_EVERY = 55; // ms between glyph changes on one letter

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

function release(el) {
  el.textContent = el.dataset.char;
  el.classList.remove('glitch-pinned', 'is-scrambling');
  el.style.width = '';
}

export function useScramble() {
  const ref = useRef(null);
  const frame = useRef(0);

  const reset = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    ref.current?.querySelectorAll('[data-char]').forEach(release);
  }, []);

  const play = useCallback(() => {
    const root = ref.current;
    if (!root || frame.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const chars = [...root.querySelectorAll('[data-char]')];
    // Read every width first, then write, so the measurement is one layout pass.
    const widths = chars.map((el) => el.getBoundingClientRect().width);
    chars.forEach((el, index) => {
      el.style.width = `${widths[index]}px`;
      el.classList.add('glitch-pinned', 'is-scrambling');
    });

    const start = performance.now();
    const swapped = new Array(chars.length).fill(-Infinity);
    const resolved = new Array(chars.length).fill(false);
    let pending = chars.length;

    const tick = (now) => {
      const elapsed = now - start;
      chars.forEach((el, index) => {
        if (resolved[index]) return;
        if (elapsed >= SCRAMBLE_FOR + index * PER_CHAR) {
          el.textContent = el.dataset.char;
          el.classList.remove('is-scrambling');
          resolved[index] = true;
          pending -= 1;
        } else if (now - swapped[index] >= SWAP_EVERY) {
          el.textContent = randomGlyph();
          swapped[index] = now;
        }
      });
      if (pending) {
        frame.current = requestAnimationFrame(tick);
      } else {
        chars.forEach(release);
        frame.current = 0;
      }
    };
    frame.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => reset, [reset]);

  return { ref, play };
}
