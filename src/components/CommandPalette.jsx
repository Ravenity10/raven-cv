import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { navItems, palette, profile } from '../data/profile.js';
import { lockScroll, scrollToTarget } from '../hooks/useSmoothScroll.js';
import { useTheme } from '../hooks/useTheme.js';
import { copyEmail } from '../hooks/copyEmail.js';

// Ctrl+K / Cmd+K (or the header hint, via openPalette) opens a small command palette: jump to
// a section, switch theme, copy the email address, open GitHub or LinkedIn, download the CV.
// Type to filter, arrow keys to move, Enter to run, Escape to close. Focus stays in the input
// (the list is an ARIA listbox driven by aria-activedescendant) and returns to where it was.

const OPEN_EVENT = 'app:palette';
const EASE = [0.22, 1, 0.36, 1];

export function openPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

function openExternal(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

function downloadCv() {
  const link = document.createElement('a');
  link.href = profile.cv.href;
  link.download = profile.cv.fileName;
  link.click();
}

function buildCommands(theme, toggleTheme) {
  const sections = [{ id: 'hero', label: palette.topLabel, hint: '#top' }, ...navItems.map((item) => ({ id: item.id, label: item.label, hint: `#${item.id}` }))];
  return [
    ...sections.map((section) => ({
      id: `go-${section.id}`,
      group: palette.navigateGroup,
      label: section.label,
      hint: section.hint,
      // Navigation moves focus to the section, so focus is not handed back to the opener.
      keepFocus: true,
      run: () => scrollToTarget(section.id === 'hero' ? 'top' : section.id),
    })),
    {
      id: 'theme',
      group: palette.actionsGroup,
      label: theme === 'dark' ? palette.themeToLight : palette.themeToDark,
      hint: theme === 'dark' ? 'light' : 'dark',
      run: () => toggleTheme({ fade: !window.matchMedia('(prefers-reduced-motion: reduce)').matches }),
    },
    { id: 'email', group: palette.actionsGroup, label: palette.copyEmail, hint: profile.email, run: copyEmail },
    { id: 'github', group: palette.actionsGroup, label: palette.openGithub, hint: profile.github.replace(/^https:\/\//, ''), run: () => openExternal(profile.github) },
    { id: 'linkedin', group: palette.actionsGroup, label: palette.openLinkedin, hint: 'linkedin.com', run: () => openExternal(profile.linkedin) },
    { id: 'cv', group: palette.actionsGroup, label: palette.downloadCv, hint: 'pdf', run: downloadCv },
  ];
}

function Palette({ onClose }) {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();

  const commands = useMemo(() => buildCommands(theme, toggleTheme), [theme, toggleTheme]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((command) => `${command.label} ${command.hint} ${command.group}`.toLowerCase().includes(q));
  }, [commands, query]);
  const groups = [...new Set(results.map((command) => command.group))];
  const current = results[Math.min(active, results.length - 1)];

  useEffect(() => {
    lockScroll(true);
    inputRef.current?.focus({ preventScroll: true });
    return () => lockScroll(false);
  }, []);

  // Keep the highlighted option in view while moving with the arrow keys.
  useEffect(() => {
    if (!current) return;
    listRef.current?.querySelector(`[data-command="${current.id}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [current]);

  const run = (command) => {
    onClose(!command.keepFocus);
    // Unlock first: Lenis ignores scrollTo while stopped, and the exit animation is still running.
    lockScroll(false);
    requestAnimationFrame(() => command.run());
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!results.length) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((index) => (Math.min(index, results.length - 1) + step + results.length) % results.length);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActive(event.key === 'Home' ? 0 : results.length - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (current) run(current);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose(true);
    } else if (event.key === 'Tab') {
      // The input is the only focus stop, which keeps focus inside the dialog.
      event.preventDefault();
    }
  };

  const optionId = (command) => `${listId}-${command.id}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
      <m.div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={() => onClose(true)}
      />
      <m.div
        role="dialog"
        aria-modal="true"
        aria-label={palette.label}
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        transition={{ duration: 0.2, ease: EASE }}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface font-mono shadow-2xl shadow-black/40"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <span aria-hidden="true" className="text-accent">
            $
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={palette.placeholder}
            aria-label={palette.inputLabel}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={current ? optionId(current) : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck="false"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-muted focus-visible:outline-none"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 text-[0.65rem] text-muted">esc</kbd>
        </div>

        <div ref={listRef} id={listId} role="listbox" aria-label={palette.label} data-lenis-prevent className="max-h-[min(22rem,55vh)] overflow-y-auto overscroll-contain p-2">
          {results.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted">{palette.empty}</p>}
          {groups.map((group) => (
            <div key={group} role="group" aria-label={group} className="mb-1 last:mb-0">
              <p aria-hidden="true" className="px-3 pb-1 pt-2 text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                {group}
              </p>
              {results
                .filter((command) => command.group === group)
                .map((command) => {
                  const selected = command === current;
                  return (
                    <div
                      key={command.id}
                      id={optionId(command)}
                      data-command={command.id}
                      role="option"
                      aria-selected={selected}
                      onPointerMove={() => setActive(results.indexOf(command))}
                      onClick={() => run(command)}
                      className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm ${selected ? 'bg-accent-soft text-accent' : 'text-fg'}`}
                    >
                      <span className="truncate">{command.label}</span>
                      <span className={`shrink-0 truncate text-xs ${selected ? 'text-accent' : 'text-muted'}`}>{command.hint}</span>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>

        <p className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-4 py-2 text-[0.68rem] text-muted">
          {palette.keys.map((item) => (
            <span key={item.key}>
              <kbd className="text-fg">{item.key}</kbd> {item.label}
            </span>
          ))}
        </p>
      </m.div>
    </div>
  );
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const opener = useRef(null);

  const show = useCallback(() => {
    // Not on top of another dialog (the project modal).
    if (document.querySelector('[aria-modal="true"]')) return;
    opener.current = document.activeElement;
    setOpen(true);
  }, []);

  const close = useCallback((restoreFocus) => {
    setOpen(false);
    if (restoreFocus && opener.current instanceof HTMLElement) opener.current.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      if (open) close(true);
      else show();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, [open, show, close]);

  return <AnimatePresence>{open && <Palette onClose={close} />}</AnimatePresence>;
}
