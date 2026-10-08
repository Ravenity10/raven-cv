import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// useLayoutEffect warns during the build-time server render; it only matters in the browser.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Endless row. The list is repeated until half the track is at least as wide as the row,
// and that half is then duplicated, so the track (.marquee-track, index.css) can slide from
// 0 to -50% with no gap or jump on any screen width. Only the first list is exposed to
// assistive tech; every repeat is aria-hidden (and hidden for everyone under reduced motion).
// `secondsPerCopy` keeps the speed constant however many copies a wide screen needs.
export default function Marquee({ items, renderItem, label, reverse = false, secondsPerCopy = 40, className = '', listClassName = '' }) {
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const [copies, setCopies] = useState(1);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    const list = listRef.current;
    const measure = () => {
      const listWidth = list.getBoundingClientRect().width;
      if (listWidth) setCopies(Math.max(1, Math.ceil(root.clientWidth / listWidth)));
    };
    measure();
    // Re-measure when the row resizes or the list does (web fonts swapping in).
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={`marquee ${className}`}>
      <div className={`marquee-track ${reverse ? 'marquee-reverse' : ''}`} style={{ '--marquee-duration': `${secondsPerCopy * copies}s` }}>
        {Array.from({ length: copies * 2 }, (_, index) => (
          <ul
            key={index}
            ref={index === 0 ? listRef : undefined}
            aria-label={index === 0 ? label : undefined}
            aria-hidden={index > 0 ? 'true' : undefined}
            className={`flex shrink-0 ${listClassName}`}
          >
            {items.map(renderItem)}
          </ul>
        ))}
      </div>
    </div>
  );
}
