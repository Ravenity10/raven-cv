import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useScroll, useSpring } from 'motion/react';
import { navItems, profile, ui } from '../data/profile.js';
import { scrollToTarget } from '../hooks/useSmoothScroll.js';
import ThemeToggle from './ThemeToggle.jsx';
import CvLink from './CvLink.jsx';

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
const pill = 'glass h-11 rounded-full border border-line transition-shadow';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const section = useActiveSection(sectionIds);
  // Back at the top of the page no section is current, so nothing is highlighted.
  const active = scrolled ? section : null;
  const links = useRef({});
  const indicator = useIndicator(active, links);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (event, id) => {
    event.preventDefault();
    setOpen(false);
    scrollToTarget(id);
  };

  const lifted = scrolled || open ? 'shadow-lg shadow-black/10 dark:shadow-black/40' : '';
  const ctaItem = navItems.find((item) => item.cta);
  const indicatorVisible = indicator && !navItems.find((item) => item.id === active)?.cta;

  return (
    <header id="site-header" className="sticky top-0 z-40 pt-3">
      {/* Reading progress. */}
      <m.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-linear-to-r from-(--grad-1) via-(--grad-2) to-(--grad-3)"
      />
      <div className="mx-auto flex max-w-[84rem] items-center justify-between gap-3 px-4 md:grid md:grid-cols-[1fr_auto_1fr] md:px-6">
        {/* Brand */}
        <a
          href="#top"
          onClick={(event) => go(event, 'top')}
          title={ui.homeLabel}
          className={`${pill} ${lifted} flex items-center gap-3 justify-self-start p-1 pr-5 md:pr-1 lg:pr-5`}
        >
          <span aria-hidden="true" className="relative grid size-9 shrink-0 place-items-center rounded-full bg-brand-strong font-display text-xs font-bold text-white shadow-md shadow-indigo-900/30">
            {profile.initials}
            <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-surface bg-[#22c55e]" />
          </span>
          {/* Hidden visually at md, where the nav needs the room; always the accessible name. */}
          <span className="flex flex-col leading-tight md:sr-only lg:not-sr-only">
            <span className="whitespace-nowrap font-display text-sm font-semibold tracking-tight">{profile.shortName}</span>
            <span className="whitespace-nowrap font-mono text-[0.68rem] text-muted">{profile.role}</span>
          </span>
        </a>

        {/* Centre nav */}
        <nav aria-label={ui.primaryNav} className={`${pill} ${lifted} hidden p-1 md:block`}>
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
        <div className="flex items-center gap-2 justify-self-end">
          <a
            href={`mailto:${profile.email}`}
            className={`${pill} ${lifted} hidden items-center gap-2.5 px-5 font-mono text-[0.8rem] font-medium hover:border-accent hover:text-accent xl:inline-flex`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-accent">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            {profile.email}
          </a>
          <CvLink
            label={profile.cv.shortLabel}
            className={`${pill} ${lifted} hidden items-center gap-1.5 px-4 text-sm font-semibold hover:border-accent hover:text-accent lg:inline-flex`}
          />
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
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="glass absolute inset-x-4 top-full mt-2 origin-top rounded-3xl border border-line p-2 shadow-2xl shadow-black/20 md:hidden"
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
