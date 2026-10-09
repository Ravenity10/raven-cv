import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useScroll, useSpring } from 'motion/react';
import { contact, navItems, palette, profile, ui } from '../data/profile.js';
import { scrollToTarget } from '../hooks/useSmoothScroll.js';
import { copyEmail } from '../hooks/copyEmail.js';
import ThemeToggle from './ThemeToggle.jsx';
import CvLink from './CvLink.jsx';
import { openPalette } from './CommandPalette.jsx';

// useLayoutEffect warns during the build-time server render; it only matters in the browser.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

// Position of the pill that slides under the active nav link. Re-measured on resize and
// once fonts load, since both change the link widths.
function useIndicator(active, links) {
  const [box, setBox] = useState(null);
  useIsoLayoutEffect(() => {
    const measure = () => {
      const el = active && links.current[active];
      setBox(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
    };
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener('resize', measure);
  }, [active, links]);
  return box;
}

const sectionIds = navItems.map((item) => item.id);
const isMac = () => /Mac|iPhone|iPad/.test(navigator.userAgentData?.platform ?? navigator.platform ?? '');
const pill = 'glass h-11 rounded-full border border-line transition-shadow';

// Past this scroll offset the header compacts into one centred bar (.header-bar in index.css).
// Tablets and up only: phones keep the separate brand and button pills with the role line.
const COMPACT_AT = 48;
const COMPACT_QUERY = '(min-width: 768px)';
const FLIP_MS = 480;
const FLIP_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

// Compacting changes the layout in one step; this animates the change with transforms only
// (FLIP). Before the switch the scroll handler records where the groups and the bar were;
// after the render they are measured again and slide (bar: slides and scales) from the old
// box to the new one. Reduced motion: no animation, the bar just fades.
function useCompactFlip(compact, refs, first) {
  useIsoLayoutEffect(() => {
    const before = first.current;
    first.current = null;
    if (!before || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    refs.forEach((ref, index) => {
      const el = ref.current;
      const from = before[index];
      if (!el || !from?.width) return;
      el.getAnimations().forEach((animation) => animation.cancel());
      const to = el.getBoundingClientRect();
      if (!to.width) return;
      const isBar = index === refs.length - 1;
      const dx = isBar ? from.left + from.width / 2 - (to.left + to.width / 2) : from.left - to.left;
      const scale = isBar ? from.width / to.width : 1;
      if (Math.abs(dx) < 0.5 && Math.abs(scale - 1) < 0.005) return;
      el.animate([{ transform: `translateX(${dx}px) scaleX(${scale})` }, { transform: 'none' }], { duration: FLIP_MS, easing: FLIP_EASE });
    });
  }, [compact]);
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const compactRef = useRef(null);
  const brandRef = useRef(null);
  const navRef = useRef(null);
  const actionsRef = useRef(null);
  const barRef = useRef(null);
  const flipRefs = useRef([brandRef, navRef, actionsRef, barRef]).current;
  const flipFrom = useRef(null);
  useCompactFlip(compact, flipRefs, flipFrom);
  const section = useActiveSection(sectionIds);
  // Back at the top of the page no section is current, so nothing is highlighted.
  const active = scrolled ? section : null;
  const links = useRef({});
  const indicator = useIndicator(active, links);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  // "ctrl k" in the pre-rendered HTML; "cmd k" on Apple devices once hydrated.
  const [paletteHint, setPaletteHint] = useState(palette.hint);
  useEffect(() => {
    if (isMac()) setPaletteHint(palette.hintMac);
  }, []);

  useEffect(() => {
    const wide = window.matchMedia(COMPACT_QUERY);
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const next = wide.matches && window.scrollY > COMPACT_AT;
      if (next === compactRef.current) return;
      // Record the boxes before the switch (not on the first check, so a reload mid-page does not animate).
      if (compactRef.current !== null) {
        flipFrom.current = flipRefs.map((ref) => {
          const rect = ref.current?.getBoundingClientRect();
          return rect && { left: rect.left, width: rect.width };
        });
      }
      compactRef.current = next;
      setCompact(next);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    // Rotating a tablet or resizing across the breakpoint switches compacting on or off.
    wide.addEventListener('change', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      wide.removeEventListener('change', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    // Tapping anywhere outside the header closes the dropdown (there is no backdrop to tap).
    const onPointerDown = (event) => {
      if (!document.getElementById('site-header')?.contains(event.target)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const go = (event, id) => {
    event.preventDefault();
    setOpen(false);
    scrollToTarget(id);
  };

  // In the compact bar the shadow belongs to the bar, not to each pill.
  const lifted = (scrolled || open) && !compact ? 'shadow-lg shadow-black/10 dark:shadow-black/40' : '';
  const ctaItem = navItems.find((item) => item.cta);
  const indicatorVisible = indicator && !navItems.find((item) => item.id === active)?.cta;

  return (
    // The header strip itself lets taps through to the page; only the pills take pointer events.
    // Compact (scrolled), the groups share one bar, which then takes taps as well.
    <header
      id="site-header"
      data-compact={compact ? '' : undefined}
      className="pointer-events-none sticky top-0 z-40 pt-3 [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_nav]:pointer-events-auto"
    >
      {/* Reading progress. */}
      <m.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-linear-to-r from-(--grad-1) via-(--grad-2) to-(--grad-3)"
      />
      <div
        className={`relative mx-auto flex max-w-[84rem] items-center justify-between gap-2 px-4 min-[360px]:gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:px-6 ${
          // From xl the compact groups close up to their content; narrower, they keep their places.
          compact ? 'xl:w-max xl:grid-cols-[auto_auto_auto] xl:gap-4 xl:px-0' : ''
        }`}
      >
        {/* The compact bar: one glass pill behind all the groups, faded in and sized by FLIP. */}
        <span ref={barRef} aria-hidden="true" className="header-bar glass absolute inset-x-2.5 -inset-y-1 -z-10 rounded-full border border-line md:inset-x-[18px] xl:-inset-x-1.5" />

        {/* Brand */}
        <a
          ref={brandRef}
          href="#top"
          onClick={(event) => go(event, 'top')}
          title={ui.homeLabel}
          // Tighter below 360px (with the row and action gaps) so the header fits a 320px screen.
          className={`${pill} ${lifted} header-flat flex items-center gap-2 justify-self-start p-1 pr-3 min-[360px]:gap-3 min-[360px]:pr-5 md:pr-1 lg:pr-5`}
        >
          <span aria-hidden="true" className="relative grid size-9 shrink-0 place-items-center rounded-full bg-brand-strong font-display text-xs font-bold text-white shadow-md shadow-indigo-900/30">
            {profile.initials}
            <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-surface bg-[#22c55e]" />
          </span>
          {/* Hidden visually at md, where the nav needs the room; always the accessible name. */}
          <span className="flex flex-col leading-tight md:sr-only lg:not-sr-only">
            <span className="whitespace-nowrap font-display text-sm font-semibold tracking-tight">{profile.shortName}</span>
            <span className="header-role whitespace-nowrap font-mono text-[0.68rem] text-muted">{profile.role}</span>
          </span>
        </a>

        {/* Centre nav */}
        <nav ref={navRef} aria-label={ui.primaryNav} className={`${pill} ${lifted} header-flat hidden p-1 md:block`}>
          <ul className="relative flex h-full items-center">
            <li
              aria-hidden="true"
              className="absolute inset-y-0 rounded-full bg-accent-soft ring-1 ring-accent/25 transition-[left,width,opacity] duration-300 ease-out"
              style={{ left: indicator?.left ?? 0, width: indicator?.width ?? 0, opacity: indicatorVisible ? 1 : 0 }}
            />
            {navItems.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id} className="h-full">
                  <a
                    ref={(el) => {
                      links.current[item.id] = el;
                    }}
                    href={`#${item.id}`}
                    onClick={(event) => go(event, item.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={
                      item.cta
                        ? `relative ml-1 flex h-full items-center rounded-full bg-fg px-5 text-sm font-semibold text-bg transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-lg hover:shadow-(--grad-2)/30 ${
                            isActive ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface' : ''
                          }`
                        : `relative flex h-full items-center rounded-full px-4 text-sm font-medium transition-colors lg:px-4.5 ${
                            isActive ? 'text-accent' : 'text-muted hover:text-fg'
                          }`
                    }
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Actions */}
        <div ref={actionsRef} className="flex items-center gap-1.5 justify-self-end min-[360px]:gap-2">
          {/* Click to copy; the toast confirms (Toast.jsx). */}
          <button
            type="button"
            onClick={copyEmail}
            title={contact.copyLabel}
            className={`${pill} ${lifted} header-extra hidden items-center gap-2.5 px-5 font-mono text-[0.8rem] font-medium hover:border-accent hover:text-accent xl:inline-flex`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-accent">
              <rect x="9" y="9" width="12" height="12" rx="2" />
              <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
            </svg>
            {profile.email}
            <span className="sr-only">, {contact.copyLabel.toLowerCase()}</span>
          </button>
          <CvLink
            label={profile.cv.shortLabel}
            className={`${pill} ${lifted} hidden items-center gap-1.5 px-4 text-sm font-semibold hover:border-accent hover:text-accent lg:inline-flex`}
          />
          <button
            type="button"
            onClick={openPalette}
            aria-label={palette.openLabel}
            aria-keyshortcuts="Control+K Meta+K"
            title={palette.openLabel}
            className={`${pill} ${lifted} hidden items-center px-3 font-mono text-[0.72rem] text-muted hover:border-accent hover:text-accent xl:inline-flex`}
          >
            <kbd suppressHydrationWarning className="whitespace-nowrap rounded-md border border-line px-1.5 py-0.5 font-mono">
              {paletteHint}
            </kbd>
          </button>
          <ThemeToggle className={`${lifted} size-11`} />
          <button
            type="button"
            className={`${pill} ${lifted} grid w-11 place-items-center md:hidden`}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? ui.menuClose : ui.menuOpen}
            onClick={() => setOpen((value) => !value)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <m.nav
            id="mobile-nav"
            aria-label={ui.primaryNav}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            // A plain dropdown with a solid background: no backdrop, no blur, nothing covering the page.
            className="absolute inset-x-4 top-full mt-2 rounded-3xl border border-line bg-surface p-2 shadow-xl shadow-black/25 md:hidden"
          >
            <ul className="flex flex-col">
              {navItems
                .filter((item) => !item.cta)
                .map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(event) => go(event, item.id)}
                      aria-current={active === item.id ? 'true' : undefined}
                      className={`block rounded-2xl px-4 py-3 font-display text-lg font-semibold ${
                        active === item.id ? 'bg-accent-soft text-accent' : 'text-fg'
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              <li className="mt-2 grid grid-cols-2 gap-2 border-t border-line pt-3">
                <CvLink
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full border border-line px-4 py-3 text-sm font-semibold"
                />
                {ctaItem && (
                  <a
                    href={`#${ctaItem.id}`}
                    onClick={(event) => go(event, ctaItem.id)}
                    className="flex items-center justify-center rounded-full bg-fg px-4 py-3 text-sm font-semibold text-bg"
                  >
                    {ctaItem.label}
                  </a>
                )}
              </li>
            </ul>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
