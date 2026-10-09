import { m } from 'motion/react';
import { services } from '../data/profile.js';
import SectionHeading from './SectionHeading.jsx';
import Reveal, { revealItem } from './Reveal.jsx';
import { toneAt } from './tones.js';

export default function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="section-pad border-t border-line">
      <div className="container-page">
        <SectionHeading id="services" index={5} label={services.heading} title={services.title} />

        <Reveal as="ul" stagger={0.06} className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {services.items.map((item, index) => (
            <m.li key={item.title} variants={revealItem} data-cursor className={`spotlight ${toneAt(index)} bg-surface p-4 sm:p-6 md:p-8`}>
              <span className="eyebrow text-(--tone)">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 font-display text-lg font-bold tracking-tight sm:mt-3 sm:text-xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </m.li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
