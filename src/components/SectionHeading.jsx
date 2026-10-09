import Reveal, { revealItem } from './Reveal.jsx';
import { m } from 'motion/react';

export default function SectionHeading({ id, index, label, title, intro }) {
  return (
    <Reveal stagger={0.08} className="mb-6 max-w-3xl md:mb-10">
      {/* Terminal-style label: "01 - whoami". */}
      <m.p variants={revealItem} className="eyebrow mb-2 flex items-center gap-2 md:mb-3">
        <span className="font-medium text-accent">{String(index).padStart(2, '0')}</span>
        <span aria-hidden="true">-</span>
        <span className="text-fg">{label}</span>
        <span aria-hidden="true" className="caret inline-block h-[1.05em] w-[0.5em] translate-y-px bg-accent/70" />
      </m.p>
      <m.h2
        variants={revealItem}
        id={`${id}-title`}
        className="font-display text-[1.65rem] font-bold leading-tight tracking-tight text-balance sm:text-3xl md:text-[2.75rem]"
      >
        {title}
      </m.h2>
      {intro && (
        <m.p variants={revealItem} className="mt-2 text-muted text-pretty md:mt-3 md:text-lg">
          {intro}
        </m.p>
      )}
    </Reveal>
  );
}
