import { Fragment, useState } from 'react';
import { m } from 'motion/react';
import { skillsCopy } from '../data/profile.js';
import { stackGroups } from '../data/skills.js';
import SectionHeading from './SectionHeading.jsx';
import Reveal, { revealItem } from './Reveal.jsx';
import { toneAt } from './tones.js';

// The stack as a stack.json file: one line per group. Hovering or focusing a line (or its
// card below) makes that group active: the line and card light up and the comment at the
// end of the file shows the group's summary.

function LineNumber({ n }) {
  return (
    <span aria-hidden="true" className="w-10 shrink-0 select-none pr-4 text-right text-muted">
      {n}
    </span>
  );
}

function GroupLine({ group, n, last, active, onActivate }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      className={`code-line flex w-full py-0.5 pr-4 text-left transition-colors ${active ? 'bg-accent-soft' : 'hover:bg-surface-2'}`}
    >
      <LineNumber n={n} />
      {/* Hanging indent: wrapped values line up two characters in from the key. */}
      <span className="block min-w-0 pl-[4ch] -indent-[2ch]">
        <span className="whitespace-nowrap text-(--blue)">&quot;{group.id}&quot;</span>
        <span className="text-muted">: [</span>
        {group.items.map((item, index) => (
          <Fragment key={item}>
            <span className="whitespace-nowrap text-(--teal)">&quot;{item}&quot;</span>
            {index < group.items.length - 1 && <span className="text-muted">, </span>}
          </Fragment>
        ))}
        <span className="text-muted">]{last ? '' : ','}</span>
        {group.primary && <span className="italic text-muted"> {`// ${skillsCopy.primaryBadge}`}</span>}
      </span>
    </button>
  );
}

export default function Skills() {
  const [active, setActive] = useState(stackGroups[0].id);
  const current = stackGroups.find((group) => group.id === active);
  const lastLine = stackGroups.length + 4;

  return (
    <section id="skills" aria-labelledby="skills-title" className="section-pad border-t border-line bg-surface-2/40">
      <div className="container-page">
        <SectionHeading id="skills" index={4} label={skillsCopy.heading} title={skillsCopy.title} intro={skillsCopy.intro} />

        <Reveal className="code-window overflow-hidden rounded-2xl border border-line bg-surface shadow-xl shadow-black/5">
          <div className="flex items-center gap-2 border-b border-line bg-surface-2/60 px-4 py-2.5 font-mono text-xs text-muted">
            <span aria-hidden="true" className="size-2 rounded-full bg-(--teal)" />
            <span className="text-fg">{skillsCopy.fileName}</span>
            <span className="hidden sm:inline">· {skillsCopy.fileMeta(stackGroups.length)}</span>
            <span aria-hidden="true" className="ml-auto hidden md:inline">
              {skillsCopy.hint} &darr;
            </span>
          </div>
          <div className="py-3 font-mono text-[0.72rem] leading-[1.75] [font-variant-ligatures:none] sm:text-[0.8rem]">
            <p className="code-line flex">
              <LineNumber n={1} />
              <span className="text-muted">{'{'}</span>
            </p>
            {stackGroups.map((group, index) => (
              <GroupLine
                key={group.id}
                group={group}
                n={index + 2}
                last={index === stackGroups.length - 1}
                active={active === group.id}
                onActivate={() => setActive(group.id)}
              />
            ))}
            <p className="code-line flex">
              <LineNumber n={stackGroups.length + 2} />
              <span className="text-muted">{'}'}</span>
            </p>
            <p aria-hidden="true" className="code-line flex">
              <LineNumber n={stackGroups.length + 3} />
            </p>
            <p className="code-line flex pr-4">
              <LineNumber n={lastLine} />
              <span className="min-w-0 italic text-muted">
                {'// '}
                {current.id}: {current.summary}
              </span>
            </p>
          </div>
        </Reveal>

        <Reveal as="ul" stagger={0.06} className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 lg:grid-cols-4">
          {stackGroups.map((group, index) => {
            const isActive = active === group.id;
            return (
              <m.li
                key={group.id}
                variants={revealItem}
                onMouseEnter={() => setActive(group.id)}
                data-cursor
                className={`spotlight ${toneAt(index)} rounded-xl border bg-surface p-3.5 transition-[border-color,box-shadow] duration-300 sm:rounded-2xl sm:p-5 ${
                  isActive ? 'border-(--tone) shadow-[0_18px_40px_-24px_var(--tone)]' : 'border-line'
                }`}
              >
                <p className="font-mono text-[0.68rem] text-(--tone)">
                  {String(index + 1).padStart(2, '0')}
                  {group.primary && ` · ${skillsCopy.primaryBadge}`}
                </p>
                <h3 className="mt-1.5 font-display text-base font-bold tracking-tight sm:text-lg">{group.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">{group.summary}</p>
                <ul className="mt-3 hidden space-y-1.5 border-t border-line pt-3 md:block">
                  {group.points.map((point) => (
                    <li key={point} className="flex gap-2 text-xs leading-relaxed">
                      <span aria-hidden="true" className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-(--tone)" />
                      {point}
                    </li>
                  ))}
                </ul>
              </m.li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
