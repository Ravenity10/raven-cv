import { m } from 'motion/react';
import { profile } from '../data/profile.js';
import { education, experience, experienceCopy } from '../data/experience.js';
import SectionHeading from './SectionHeading.jsx';
import Reveal, { revealItem } from './Reveal.jsx';
import CvLink from './CvLink.jsx';

export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="border-t border-line py-20 md:py-28">
      <div className="container-page">
        <SectionHeading id="experience" index={4} label={experienceCopy.heading} title={experienceCopy.title} intro={experienceCopy.intro} />

        <div className="grid gap-12 lg:grid-cols-[1fr_18rem]">
          <ol className="space-y-12">
            {experience.map((job, jobIndex) => (
              <Reveal as="li" stagger={0.08} key={job.company} className="grid gap-4 md:grid-cols-[12rem_1fr] md:gap-8">
                <m.div variants={revealItem}>
                  <h3 className="font-display text-2xl font-bold tracking-tight">{job.company}</h3>
                  <p className="mt-1 font-mono text-xs text-muted">{job.period}</p>
                  {job.location && <p className="mt-1 text-sm text-muted">{job.location}</p>}
                </m.div>

                <ol className="timeline space-y-8">
                  {job.roles.map((role, roleIndex) => (
                    <m.li key={role.title} variants={revealItem} className="relative pl-6 md:pl-8">
                      <span
                        aria-hidden="true"
                        className={`dot-glow absolute -left-[5px] top-2 size-2.5 rounded-full ${jobIndex === 0 && roleIndex === 0 ? 'pulse-dot !size-2.5' : 'bg-accent'}`}
                      />
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h4 className="font-display text-lg font-semibold tracking-tight">{role.title}</h4>
                        <span className="font-mono text-xs text-muted">{role.period}</span>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {role.points.map((point) => (
                          <li key={point} className="flex gap-3 text-sm leading-relaxed text-muted">
                            <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-muted" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </m.li>
                  ))}
                </ol>
              </Reveal>
            ))}
          </ol>

          <Reveal as="aside" stagger={0.08} className="space-y-4 self-start lg:sticky lg:top-24">
            <m.div variants={revealItem} className="spotlight rounded-2xl border border-line bg-surface p-6">
              <h3 className="eyebrow">{experienceCopy.educationHeading}</h3>
              <ul className="mt-3 space-y-4">
                {education.map((item) => (
                  <li key={item.school}>
                    <p className="font-display text-lg font-semibold leading-snug">{item.degree}</p>
                    <p className="mt-1 text-sm text-muted">{item.school}</p>
                    <p className="mt-1 font-mono text-xs text-muted">{item.period}</p>
                  </li>
                ))}
              </ul>
            </m.div>
            <m.div variants={revealItem}>
              <CvLink
                label={experienceCopy.cvLabel}
                className="btn-brand flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold"
              />
              <p className="mt-2 text-center font-mono text-xs text-muted">{profile.cv.fileName}</p>
            </m.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
