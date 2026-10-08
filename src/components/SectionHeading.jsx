import Reveal, { revealItem } from './Reveal.jsx';
import { m } from 'motion/react';

export default function SectionHeading({ id, index, label, title, intro }) {
  return (
    <Reveal stagger={0.08} className="mb-10 max-w-3xl md:mb-14">
      {/* Terminal-style label: "01 - whoami". */}
      <m.p variants={revealItem} className="eyebrow mb-3 flex items-center gap-2">
        <span className="font-medium text-accent">{String(index).padStart(2, '0')}</span>
        <span aria-hidden="true">-</span>
        <span className="text-fg">{label}</span>
        <span aria-hidden="true" className="caret inline-block h-[1.05em] w-[0.5em] translate-y-px bg-accent/70" />
      </m.p>
      <m.h2
        variants={revealItem}
        id={`${id}-title`}
        className="font-display text-3xl font-bold leading-tight tracking-tight text-balance md:text-5xl"
      >
        {title}
      </m.h2>
      {intro && (
        <m.p variants={revealItem} className="mt-4 text-lg text-muted text-pretty">
          {intro}
        </m.p>
      )}
    </Reveal>
  );
}
