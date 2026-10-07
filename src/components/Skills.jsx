import { m } from 'motion/react';
import { skillsCopy } from '../data/profile.js';
import { skills, toolbox } from '../data/skills.js';
import SectionHeading from './SectionHeading.jsx';
import Reveal, { revealItem } from './Reveal.jsx';
import { toneAt } from './tones.js';

// One endless row of tool chips. The list is rendered twice so the loop is seamless;
// the copy is hidden from assistive tech (and from everyone when motion is reduced).
function ToolRow({ items, offset, reverse }) {
  return (
    <div className="marquee">
      <div className={`marquee-track ${reverse ? 'marquee-reverse' : ''}`}>
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1 ? 'true' : undefined} className="flex shrink-0 gap-2 pr-2">
            {items.map((tool, index) => (
              <li key={tool} className={`chip font-mono ${toneAt(index + offset)}`}>
                {tool}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const half = Math.ceil(toolbox.length / 2);

  return (
    <section id="skills" aria-labelledby="skills-title" className="border-y border-line bg-surface-2/40 py-20 md:py-28">
      <div className="container-page">
        <SectionHeading id="skills" index={2} label={skillsCopy.heading} title={skillsCopy.title} />

        <Reveal as="ul" stagger={0.08} className="grid gap-4 sm:grid-cols-2">
          {skills.map((skill, index) => (
            <m.li
              key={skill.id}
              variants={revealItem}
              className={`spotlight hover-glow ${toneAt(index)} rounded-2xl border border-line bg-surface p-6 transition-[border-color,box-shadow] duration-300 hover:border-(--tone) md:p-8`}
            >
              <span className="eyebrow text-(--tone)">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">{skill.title}</h3>
              <p className="mt-2 text-muted">{skill.summary}</p>
              <ul className="mt-5 space-y-2 border-t border-line pt-5">
                {skill.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-relaxed">
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-(--tone)" />
                    {point}
                  </li>
                ))}
              </ul>
            </m.li>
          ))}
        </Reveal>

        <Reveal className="mt-14">
          <h3 className="eyebrow mb-5">{skillsCopy.toolboxHeading}</h3>
          <div className="space-y-3">
            <ToolRow items={toolbox.slice(0, half)} offset={0} />
            <ToolRow items={toolbox.slice(half)} offset={2} reverse />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
