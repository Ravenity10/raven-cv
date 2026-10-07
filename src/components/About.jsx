import { m } from 'motion/react';
import { about } from '../data/profile.js';
import SectionHeading from './SectionHeading.jsx';
import Reveal, { revealItem } from './Reveal.jsx';

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="py-20 md:py-28">
      <div className="container-page">
        <SectionHeading id="about" index={1} label={about.heading} title={about.title} />
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Reveal stagger={0.1} className="space-y-5 text-lg leading-relaxed text-muted">
            {about.paragraphs.map((paragraph) => (
              <m.p key={paragraph} variants={revealItem} className="text-pretty">
                {paragraph}
              </m.p>
            ))}
          </Reveal>
          <Reveal as="dl" stagger={0.08} className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-2xl border border-line bg-line">
            {about.facts.map((fact) => (
              <m.div key={fact.label} variants={revealItem} className="spotlight bg-surface p-5">
                <dt className="eyebrow">{fact.label}</dt>
                <dd className="mt-1 font-display text-lg font-semibold">{fact.value}</dd>
              </m.div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
