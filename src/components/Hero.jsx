import { Fragment, useRef } from 'react';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { hero } from '../data/profile.js';
import { projects } from '../data/projects.js';
import { scrollToTarget } from '../hooks/useSmoothScroll.js';
import { toneAt } from './tones.js';
import CvLink from './CvLink.jsx';

// The entrance uses CSS keyframes (.anim-blur-in / .anim-fade-up in index.css) so it plays
// from the pre-rendered HTML on first paint, without waiting for JavaScript.
const delay = (seconds) => ({ '--d': `${seconds.toFixed(2)}s` });

const statValue = (value) => (value === 'PROJECT_COUNT' ? String(projects.length) : value);

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // Subtle parallax: the glow drifts slower than the page, the focus card a little faster.
  const glowY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '40%']);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -50]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.25]);

  const onCta = (event, href) => {
    if (!href.startsWith('#')) return;
    event.preventDefault();
    scrollToTarget(href.slice(1));
  };

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative overflow-hidden">
      <m.div
        aria-hidden="true"
        style={{ y: glowY }}
        className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[34rem] max-w-4xl rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--grad-2)_22%,transparent),transparent)]"
      />

      <div className="container-page relative pb-20 pt-16 text-center md:pb-28 md:pt-24">
        <m.div style={{ opacity: copyOpacity }}>
          <p className="anim-fade-up eyebrow glass inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5" style={delay(0)}>
            <span aria-hidden="true" className="pulse-dot" />
            {hero.eyebrow}
          </p>

          <h1 id="hero-title" className="mt-8 font-display font-extrabold tracking-tight">
            <span className="anim-blur-in block text-[2.9rem] leading-[1.02] sm:text-7xl lg:text-8xl" style={delay(0.1)}>
              <span className="text-gradient inline-block pb-[0.1em]">{hero.name}</span>
            </span>
            <span className="sr-only">, </span>
            <span className="anim-fade-up mt-2 block text-2xl text-fg sm:text-4xl" style={delay(0.3)}>
              {hero.role}
            </span>
          </h1>

          <p className="anim-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty md:text-xl" style={delay(0.4)}>
            {hero.intro}
          </p>

          <p className="anim-fade-up mt-4 text-muted" style={delay(0.48)}>
            {hero.career.map((part, index) => (
              <Fragment key={index}>
                {typeof part === 'string' ? part : <span className={`${part.tone} font-semibold text-(--tone)`}>{part.text}</span>}
              </Fragment>
            ))}
          </p>

          <ul aria-label={hero.techLabel} className="anim-fade-up mt-7 flex flex-wrap justify-center gap-2" style={delay(0.56)}>
            {hero.tech.map((tech, index) => (
              <li key={tech} className={`chip ${toneAt(index)}`}>
                {tech}
              </li>
            ))}
          </ul>

          <div className="anim-fade-up mt-9 flex flex-wrap items-center justify-center gap-3" style={delay(0.64)}>
            <a
              href={hero.primaryCta.href}
              onClick={(event) => onCta(event, hero.primaryCta.href)}
              className="btn-brand inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold"
            >
              {hero.primaryCta.label}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
            <a
              href={hero.secondaryCta.href}
              className="glass inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-medium transition-[transform,border-color] hover:-translate-y-0.5 hover:border-accent"
            >
              {hero.secondaryCta.label}
            </a>
            <CvLink
              label={hero.cvCta}
              className="inline-flex items-center gap-2 rounded-full px-4 py-3 font-medium text-fg underline-offset-4 hover:text-accent hover:underline"
            />
          </div>
        </m.div>

        <m.div style={{ y: cardY }} className="relative mt-16 md:mt-20">
          <div className="anim-fade-up" style={delay(0.75)}>
            <div className="spotlight glass grid gap-3 rounded-3xl border border-line p-3 text-left shadow-2xl shadow-black/10 md:grid-cols-3 md:gap-4 md:p-4">
              {hero.focus.map((column, index) => (
                <div key={column.title} className={`${toneAt(index)} rounded-2xl border border-line bg-surface-2/60 p-6`}>
                  <p className="font-display text-xl font-semibold tracking-tight text-(--tone)">{column.title}</p>
                  <ul className="mt-4 space-y-2.5">
                    {column.points.map((point) => (
                      <li key={point} className="flex gap-3 text-sm leading-relaxed text-muted">
                        <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-(--tone)" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4">
              {hero.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse gap-1">
                  <dt className="text-xs leading-snug text-muted sm:text-sm">{stat.label}</dt>
                  <dd className="font-display text-3xl font-bold sm:text-4xl">
                    <span className="text-gradient">{statValue(stat.value)}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </m.div>
      </div>
    </section>
  );
}
