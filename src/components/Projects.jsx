import { useCallback, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { projects } from '../data/projects.js';
import { projectsCopy } from '../data/profile.js';
import SectionHeading from './SectionHeading.jsx';
import Reveal from './Reveal.jsx';
import ProjectCard from './ProjectCard.jsx';
import ProjectModal from './ProjectModal.jsx';

export default function Projects() {
  const [selected, setSelected] = useState(null);
  const triggerRef = useRef(null);

  const open = useCallback((project, trigger) => {
    triggerRef.current = trigger;
    setSelected(project);
  }, []);

  const close = useCallback(() => setSelected(null), []);

  return (
    <section id="projects" aria-labelledby="projects-title" className="py-20 md:py-28">
      <div className="container-page">
        <SectionHeading id="projects" index={3} label={projectsCopy.heading} title={projectsCopy.title} intro={projectsCopy.intro} />

        <Reveal as="ul" stagger={0.07} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
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
