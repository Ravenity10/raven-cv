import Reveal, { revealItem } from './Reveal.jsx';
import { m } from 'motion/react';

export default function SectionHeading({ id, index, label, title, intro }) {
  return (
    <Reveal stagger={0.08} className="mb-10 max-w-3xl md:mb-14">
      <m.p variants={revealItem} className="eyebrow mb-3 flex items-center gap-3">
        <span className="text-gradient font-medium">{String(index).padStart(2, '0')}</span>
        <span aria-hidden="true" className="h-px w-10 bg-linear-to-r from-(--grad-1) to-(--grad-2)" />
        <span>{label}</span>
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
