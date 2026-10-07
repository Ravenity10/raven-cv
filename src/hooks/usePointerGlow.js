import { useEffect } from 'react';

// Feeds the cursor position into every `.spotlight` element as --mx / --my,
// which index.css uses to place a soft glow under the content. Mouse only.
export function usePointerGlow() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;

    const onMove = (event) => {
      const element = event.target instanceof Element ? event.target.closest('.spotlight') : null;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      element.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      element.style.setProperty('--my', `${event.clientY - rect.top}px`);
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, []);
}
