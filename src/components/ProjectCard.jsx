import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { projectsCopy } from '../data/profile.js';
import { revealItem } from './Reveal.jsx';
import { toneAt } from './tones.js';

const MAX_TILT = 6;
const spring = { stiffness: 220, damping: 20, mass: 0.6 };

export function ScreenshotPlaceholder({ name, host }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-accent-soft p-6 text-center">
      <span className="font-display text-2xl font-bold text-fg">{name}</span>
      <span className="font-mono text-xs text-muted">{host}</span>
    </div>
  );
}

export default function ProjectCard({ project, onOpen }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [MAX_TILT, -MAX_TILT]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-MAX_TILT, MAX_TILT]), spring);

  const onPointerMove = (event) => {
    if (reduce || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <m.li variants={revealItem} className="[perspective:1000px]">
      <m.article
        onPointerMove={onPointerMove}
        onPointerLeave={reset}
        style={reduce ? undefined : { rotateX, rotateY }}
        whileHover={reduce ? undefined : { y: -4 }}
        className="spotlight hover-glow group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-accent has-[button:focus-visible]:border-accent has-[button:focus-visible]:ring-2 has-[button:focus-visible]:ring-ring has-[button:focus-visible]:ring-offset-2 has-[button:focus-visible]:ring-offset-bg"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line bg-surface-2">
          {project.image ? (
            <img
              src={project.image.srcSmall}
              srcSet={`${project.image.srcSmall} 640w, ${project.image.src} ${project.image.width}w`}
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
              width={project.image.width}
              height={project.image.height}
              alt={projectsCopy.screenshotAlt(project.name)}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <ScreenshotPlaceholder name={project.name} host={project.host} />
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="font-mono text-xs text-muted">{project.host}</p>
          <h3 className="mt-1 font-display text-xl font-bold tracking-tight">
            {/* The ::after overlay stretches this button over the whole card. */}
            <button
              type="button"
              onClick={(event) => onOpen(project, event.currentTarget)}
              onBlur={reset}
              aria-haspopup="dialog"
              className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {project.name}
            </button>
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{project.description}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={projectsCopy.tagsLabel}>
            {project.tags.map((tag, index) => (
              <li key={tag} className={`chip ${toneAt(index)} !px-2.5 !py-1 !text-xs`}>
                {tag}
              </li>
            ))}
          </ul>
          <span aria-hidden="true" className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-accent">
            {projectsCopy.viewDetails}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </m.article>
    </m.li>
  );
}
