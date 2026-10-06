import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { navItems, profile, ui } from '../data/profile.js';
import { scrollToTarget } from '../hooks/useSmoothScroll.js';
import ThemeToggle from './ThemeToggle.jsx';
import CvLink from './CvLink.jsx';

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

const sectionIds = navItems.map((item) => item.id);

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(sectionIds);

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

  const linkClass = (id) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-accent ${
      active === id ? 'text-accent' : 'text-muted'
    }`;

  return (
    <header
      id="site-header"
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        scrolled || open ? 'border-line bg-bg/85' : 'border-transparent bg-bg/0'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <a
          href="#top"
          onClick={(event) => go(event, 'top')}
          title={ui.homeLabel}
          className="flex items-center gap-3 rounded-md"
        >
          <span aria-hidden="true" className="grid size-9 place-items-center rounded-lg bg-fg font-display text-sm font-bold text-bg">
            {profile.initials}
          </span>
          {/* Hidden visually at md, where the nav needs the room; always the accessible name. */}
          <span className="sr-only whitespace-nowrap font-display text-base font-semibold tracking-tight sm:not-sr-only md:sr-only lg:not-sr-only">{profile.shortName}</span>
        </a>

        <nav aria-label={ui.primaryNav} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(event) => go(event, item.id)}
                  className={linkClass(item.id)}
                  aria-current={active === item.id ? 'true' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <CvLink
            label={profile.cv.shortLabel}
            className="hidden h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold transition-colors hover:border-accent hover:text-accent lg:inline-flex"
          />
          <ThemeToggle />
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-line bg-surface md:hidden"
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-full border-y border-line bg-bg shadow-lg md:hidden"
          >
            <ul className="container-page flex flex-col py-3">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(event) => go(event, item.id)}
                    className={`block py-3 font-display text-xl font-semibold ${active === item.id ? 'text-accent' : 'text-fg'}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="mt-2 border-t border-line pt-3">
                <CvLink onClick={() => setOpen(false)} className="flex items-center gap-2 py-3 font-display text-xl font-semibold text-accent" />
              </li>
            </ul>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
