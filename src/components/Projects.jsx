import { useCallback, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { projectFilters, projects } from '../data/projects.js';
import { projectsCopy } from '../data/profile.js';
import SectionHeading from './SectionHeading.jsx';
import Reveal from './Reveal.jsx';
import ProjectCard from './ProjectCard.jsx';
import ProjectModal from './ProjectModal.jsx';

const counts = Object.fromEntries(projectFilters.map((filter) => [filter.id, projects.filter((project) => project.filters.includes(filter.id)).length]));

// Toggle buttons in one row that scrolls sideways on narrow screens.
function FilterChips({ active, onChange }) {
  return (
    <div className="filter-row -mx-5 mb-5 overflow-x-auto px-5 md:mx-0 md:mb-8 md:px-0" role="group" aria-label={projectsCopy.filtersLabel}>
      <ul className="flex w-max gap-2">
        {projectFilters
          .filter((filter) => counts[filter.id] > 0)
          .map((filter) => {
            const pressed = active === filter.id;
            return (
              <li key={filter.id}>
                <button
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => onChange(filter.id)}
                  className={`inline-flex min-h-9 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 font-mono text-xs transition-[border-color,background-color,color] ${
                    pressed ? 'border-accent bg-accent text-accent-fg' : 'border-line bg-surface text-fg hover:border-accent'
                  }`}
                >
                  {filter.label}
                  <span className={pressed ? 'text-accent-fg' : 'text-muted'}>{counts[filter.id]}</span>
                </button>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export default function Projects() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const triggerRef = useRef(null);
  const visible = projects.filter((project) => project.filters.includes(filter));

  const open = useCallback((project, trigger) => {
    triggerRef.current = trigger;
    setSelected(project);
  }, []);

  const close = useCallback(() => setSelected(null), []);

  return (
    <section id="projects" aria-labelledby="projects-title" className="section-pad border-t border-line">
      <div className="container-page">
        <SectionHeading id="projects" index={3} label={projectsCopy.heading} title={projectsCopy.title} intro={projectsCopy.intro} />

        <FilterChips active={filter} onChange={setFilter} />
        <p role="status" className="sr-only">
          {projectsCopy.showing(visible.length)}
        </p>

        {/* Remounting the grid per filter replays the staggered reveal for the new set. */}
        <Reveal as="ul" key={filter} stagger={0.05} className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard key={project.slug} project={project} onOpen={open} />
          ))}
        </Reveal>
      </div>

      <AnimatePresence onExitComplete={() => triggerRef.current?.focus({ preventScroll: true })}>
        {selected && <ProjectModal key={selected.slug} project={selected} onClose={close} />}
      </AnimatePresence>
    </section>
  );
}
