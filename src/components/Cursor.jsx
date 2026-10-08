import { useEffect, useRef, useState } from 'react';

// Custom cursor: a dot that tracks the pointer exactly and a ring that eases after it.
// The ring grows over links, buttons and cards ([data-cursor]); over [data-cursor="view"]
// it fills and shows a "view" label. Only for a real mouse ((hover: hover) and (pointer: fine))
// and not under reduced motion, so touch devices always keep the native cursor.
// Everything moves with transform; the visual states live in index.css (.cursor[data-state]).

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const TARGETS = 'a, button, [role="button"], summary, label, [data-cursor]';
const LERP = 0.2;

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const rootRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia(FINE_POINTER);
    const reduce = window.matchMedia(REDUCED_MOTION);
    const update = () => setEnabled(fine.matches && !reduce.matches);
    update();
    fine.addEventListener('change', update);
    reduce.addEventListener('change', update);
    return () => {
      fine.removeEventListener('change', update);
      reduce.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    const html = document.documentElement;
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    let x = 0;
    let y = 0;
    let ringX = 0;
    let ringY = 0;
    let frame = 0;
    let shown = false;

    const follow = () => {
      ringX += (x - ringX) * LERP;
      ringY += (y - ringY) * LERP;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      // Stop the loop once the ring has caught up; the next move restarts it.
      frame = Math.abs(x - ringX) + Math.abs(y - ringY) > 0.1 ? requestAnimationFrame(follow) : 0;
    };

    const onMove = (event) => {
      if (event.pointerType !== 'mouse') return;
      x = event.clientX;
      y = event.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!shown) {
        // Hide the native cursor only once the custom one has a position to show.
        shown = true;
        ringX = x;
        ringY = y;
        html.classList.add('has-cursor');
        root.dataset.visible = 'true';
      }
      if (!frame) frame = requestAnimationFrame(follow);
    };

    const onOver = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      root.dataset.state = target?.closest('[data-cursor="view"]') ? 'view' : target?.closest(TARGETS) ? 'hover' : '';
    };

    const onLeave = () => {
      root.dataset.visible = 'false';
      shown = false;
      html.classList.remove('has-cursor');
    };
    const onDown = () => root.setAttribute('data-pressed', '');
    const onUp = () => root.removeAttribute('data-pressed');

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      html.classList.remove('has-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={rootRef} aria-hidden="true" className="cursor" data-visible="false">
      <div ref={ringRef} className="cursor-ring">
        <span className="cursor-ring-shape" />
        <span className="cursor-label">view</span>
      </div>
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
