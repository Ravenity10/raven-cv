import { m } from 'motion/react';
import { skillsCopy } from '../data/profile.js';
import { skills, toolbox } from '../data/skills.js';
import SectionHeading from './SectionHeading.jsx';
import Reveal, { revealItem } from './Reveal.jsx';

export default function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="border-y border-line bg-surface-2/50 py-20 md:py-28">
      <div className="container-page">
        <SectionHeading id="skills" index={2} label={skillsCopy.heading} title={skillsCopy.title} />

        <Reveal as="ul" stagger={0.08} className="grid gap-4 sm:grid-cols-2">
          {skills.map((skill, index) => (
            <m.li
              key={skill.id}
              variants={revealItem}
              className="group rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent md:p-8"
            >
              <span className="eyebrow text-accent">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">{skill.title}</h3>
              <p className="mt-2 text-muted">{skill.summary}</p>
              <ul className="mt-5 space-y-2 border-t border-line pt-5">
                {skill.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-relaxed">
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </m.li>
          ))}
        </Reveal>

        <Reveal className="mt-12">
          <h3 className="eyebrow mb-4">{skillsCopy.toolboxHeading}</h3>
          <ul className="flex flex-wrap gap-2">
            {toolbox.map((tool) => (
              <li key={tool} className="rounded-full border border-line bg-surface px-4 py-1.5 font-mono text-sm">
                {tool}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
