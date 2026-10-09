import { m } from 'motion/react';
import { profile } from '../data/profile.js';
import { education, experience, experienceCopy } from '../data/experience.js';
import SectionHeading from './SectionHeading.jsx';
import Reveal, { revealItem } from './Reveal.jsx';
import CvLink from './CvLink.jsx';

// Career as a `git log`: a vertical rail with one commit node per role, newest first, the
// current role marked HEAD. The rail draws down and each node pops in as it scrolls into view
// (transform and opacity only; MotionConfig drops the movement under reduced motion).

const EASE = [0.22, 1, 0.36, 1];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const parse = (value) => {
  const [year, month] = value.split('-').map(Number);
  return { year, month };
};
const formatMonth = (value) => {
  const { year, month } = parse(value);
  return `${MONTHS[month - 1]} ${year}`;
};
// "2y 6m" between two "YYYY-MM" dates; an open end counts to this month.
function duration(start, end) {
  const from = parse(start);
  const now = new Date();
  const to = end ? parse(end) : { year: now.getFullYear(), month: now.getMonth() + 1 };
  const months = Math.max(1, (to.year - from.year) * 12 + (to.month - from.month));
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years && `${years}y`, rest && `${rest}m`].filter(Boolean).join(' ');
}

const nodeVariants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

function Entry({ entry, head }) {
  const release = `release/${parse(entry.start).year}`;
  return (
    <Reveal as="li" stagger={0.08} className="relative pb-8 pl-8 last:pb-0 md:pb-12 md:pl-11">
      <m.span
        aria-hidden="true"
        variants={nodeVariants}
        className={`gitlog-node absolute left-0 top-0.5 grid size-[15px] place-items-center rounded-full border-2 bg-bg ${
          head ? 'border-accent shadow-[0_0_0_5px_color-mix(in_srgb,var(--accent)_18%,transparent)]' : 'border-muted'
        }`}
      >
        {head && <span className="size-[5px] rounded-full bg-accent" />}
      </m.span>

      <div className="grid gap-2.5 md:grid-cols-[12.5rem_1fr] md:gap-8">
        <m.div variants={revealItem} className="min-w-0">
          <p
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.7rem] ${
              head ? 'border-accent/40 bg-accent-soft text-accent' : 'border-line text-muted'
            }`}
          >
            {release}
            {head && (
              <>
                <span aria-hidden="true">-</span>
                <span>{experienceCopy.head}</span>
              </>
            )}
          </p>
          <p className="mt-2 font-display text-lg font-bold leading-tight tracking-tight md:text-xl">{entry.company}</p>
          <p className="mt-1 font-mono text-[0.7rem] text-muted">
            <time dateTime={entry.start}>{formatMonth(entry.start)}</time> <span aria-hidden="true">-&gt;</span>{' '}
            {entry.end ? <time dateTime={entry.end}>{formatMonth(entry.end)}</time> : experienceCopy.present}
            <span aria-hidden="true"> · </span>
            <span suppressHydrationWarning>{duration(entry.start, entry.end)}</span>
          </p>
          {entry.location && <p className="mt-0.5 font-mono text-[0.7rem] text-muted">{entry.location}</p>}
        </m.div>

        <m.div variants={revealItem} className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-2 font-display text-base font-semibold tracking-tight md:text-lg">
            {entry.role}
            {head && <span className="rounded-full bg-accent-soft px-2 py-px font-mono text-[0.65rem] font-medium text-accent">{experienceCopy.now}</span>}
          </h3>
          <ul className="mt-2 space-y-1.5">
            {entry.points.map((point) => (
              <li key={point} className="flex gap-2.5 text-[0.8125rem] leading-snug text-muted sm:text-sm sm:leading-relaxed">
                <span aria-hidden="true" className="mt-[0.5rem] size-1 shrink-0 rounded-full bg-muted sm:mt-[0.6rem]" />
                {point}
              </li>
            ))}
          </ul>
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={experienceCopy.techLabel}>
            {entry.tech.map((tech) => (
              <li key={tech} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 font-mono text-[0.68rem] text-fg">
                <span aria-hidden="true" className="size-1 rounded-full bg-accent" />
                {tech}
              </li>
            ))}
          </ul>
        </m.div>
      </div>
    </Reveal>
  );
}

export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="section-pad border-t border-line">
      <div className="container-page">
        <SectionHeading id="experience" index={2} label={experienceCopy.heading} title={experienceCopy.title} intro={experienceCopy.intro} />

        <div className="grid gap-8 lg:grid-cols-[1fr_17rem] lg:gap-12">
          <div className="relative">
            {/* The rail runs through the node centres (15px nodes, so 7px in). */}
            <m.span
              aria-hidden="true"
              className="gitlog-rail absolute bottom-2 left-[7px] top-2 w-px origin-top"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 1.2, ease: EASE }}
            />
            <ol className="relative">
              {experience.map((entry, index) => (
                <Entry key={`${entry.company}-${entry.start}`} entry={entry} head={index === 0} />
              ))}
            </ol>
          </div>

          <Reveal as="aside" stagger={0.08} className="space-y-4 self-start lg:sticky lg:top-24">
            <m.div variants={revealItem} className="spotlight rounded-2xl border border-line bg-surface p-5 md:p-6">
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
