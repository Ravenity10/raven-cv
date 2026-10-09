import { useEffect, useRef, useState } from 'react';
import { m } from 'motion/react';
import { projectsCopy } from '../data/profile.js';
import { lockScroll } from '../hooks/useSmoothScroll.js';
import { ScreenshotPlaceholder } from './ProjectCard.jsx';
import { toneAt } from './tones.js';

const EASE = [0.22, 1, 0.36, 1];
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Phones get a bottom sheet that slides up; wider screens a centred dialog.
const SHEET_QUERY = '(max-width: 639px)';
const sheetMotion = { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } };
const dialogMotion = {
  initial: { opacity: 0, y: 40, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 24, scale: 0.98 },
};

export default function ProjectModal({ project, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const titleId = `project-${project.slug}-title`;
  // The modal only mounts after a click, so reading the media query here is safe.
  const [sheet] = useState(() => window.matchMedia(SHEET_QUERY).matches);
  const motionProps = sheet ? sheetMotion : dialogMotion;

  useEffect(() => {
    lockScroll(true);
    closeRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      // Keep keyboard focus inside the dialog.
      const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      lockScroll(false);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <m.div
        aria-hidden="true"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />

      <m.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        {...motionProps}
        transition={{ duration: sheet ? 0.34 : 0.4, ease: EASE }}
        data-lenis-prevent
        className="relative flex max-h-[88svh] w-full max-w-4xl flex-col overflow-y-auto overscroll-contain rounded-t-2xl border border-b-0 border-line bg-surface pb-[env(safe-area-inset-bottom)] shadow-2xl sm:max-h-[92vh] sm:rounded-3xl sm:border-b sm:pb-0"
      >
        {/* Grab handle: a visual cue that this is a sheet (tap the backdrop or close to dismiss). */}
        <span aria-hidden="true" className="absolute left-1/2 top-2 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-fg/30 sm:hidden" />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={projectsCopy.close}
          className="absolute right-3 top-3 z-10 grid size-10 sm:right-4 sm:top-4 place-items-center rounded-full border border-line bg-surface/90 backdrop-blur transition-colors hover:border-accent hover:text-accent"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="aspect-[16/9] max-h-[30svh] w-full shrink-0 sm:aspect-[16/10] sm:max-h-[48vh] overflow-hidden border-b border-line bg-surface-2">
          {project.image ? (
            <m.img
              src={project.image.src}
              srcSet={`${project.image.srcSmall} 640w, ${project.image.src} ${project.image.width}w`}
              sizes="(min-width: 960px) 896px, 100vw"
              width={project.image.width}
              height={project.image.height}
              alt={projectsCopy.screenshotAlt(project.name)}
              decoding="async"
              initial={{ scale: 1.06, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <ScreenshotPlaceholder name={project.name} host={project.host} />
          )}
        </div>

        <div className="grid gap-6 p-5 sm:gap-8 sm:p-6 md:grid-cols-[1.2fr_1fr] md:p-10">
          <div>
            <p className="font-mono text-xs text-muted">{project.host}</p>
            <h2 id={titleId} className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              {project.name}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:mt-4 sm:text-base">{project.description}</p>
            <ul className="mt-5 flex flex-wrap gap-1.5" aria-label={projectsCopy.tagsLabel}>
              {project.tags.map((tag, index) => (
                <li key={tag} className={`chip ${toneAt(index)} !px-2.5 !py-1 !text-xs`}>
                  {tag}
                </li>
              ))}
            </ul>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand mt-6 inline-flex sm:mt-8 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              {projectsCopy.visitSite}
              <span className="sr-only">{projectsCopy.newTab}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </a>
          </div>

          <div>
            <h3 className="eyebrow mb-4">{projectsCopy.featuresHeading}</h3>
            <ol className="space-y-3 sm:space-y-4">
              {project.features.map((feature, index) => (
                <m.li
                  key={feature}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.2 + index * 0.06 }}
                  className="flex gap-3 text-sm leading-relaxed"
                >
                  <span className="text-gradient font-mono text-xs leading-6">{String(index + 1).padStart(2, '0')}</span>
                  <span>{feature}</span>
                </m.li>
              ))}
            </ol>
          </div>
        </div>
      </m.div>
    </div>
  );
}
