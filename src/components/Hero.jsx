import { useRef } from 'react';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { hero } from '../data/profile.js';
import { projects } from '../data/projects.js';
import { scrollToTarget } from '../hooks/useSmoothScroll.js';
import CvLink from './CvLink.jsx';

// The entrance uses CSS keyframes (.anim-word / .anim-fade-up in index.css) so it plays
// from the pre-rendered HTML on first paint, without waiting for JavaScript.
const WORD_STAGGER = 0.06;
const START = 0.1;
const delay = (seconds) => ({ '--d': `${seconds.toFixed(2)}s` });

const statValue = (value) => (value === 'PROJECT_COUNT' ? String(projects.length) : value);

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // Subtle parallax: background layers drift slower than the page, the code card a little faster.
  const gridY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '20%']);
  const glowY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '35%']);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.2]);

  const lines = hero.headingLines.map((line) => line.split(' '));
  let wordIndex = 0;
  const afterHeading = START + lines.flat().length * WORD_STAGGER;

  const onCta = (event, href) => {
    if (!href.startsWith('#')) return;
    event.preventDefault();
    scrollToTarget(href.slice(1));
  };

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative overflow-hidden">
      <m.div aria-hidden="true" style={{ y: gridY }} className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <m.div
        aria-hidden="true"
        style={{ y: glowY }}
        className="pointer-events-none absolute -right-64 -top-56 size-[36rem] rounded-full bg-accent opacity-[0.07] blur-3xl md:-right-40 md:-top-40 md:opacity-[0.12]"
      />

      <div className="container-page relative grid gap-12 pb-20 pt-14 md:pb-28 md:pt-24 lg:grid-cols-[1.25fr_1fr] lg:items-center">
        <m.div style={{ opacity: copyOpacity }}>
          <p className="anim-fade-up eyebrow mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5" style={delay(0)}>
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-accent" />
            {hero.eyebrow}
          </p>

          <h1 id="hero-title" className="font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            {lines.map((line, lineIndex) => (
              <span key={lineIndex} className="block">
                {line.map((word, index) => (
                  <span key={index} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                    <span
                      className={`anim-word ${lineIndex === lines.length - 1 ? 'text-accent' : ''}`}
                      style={delay(START + wordIndex++ * WORD_STAGGER)}
                    >
                      {word}
                      {index < line.length - 1 ? ' ' : ''}
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p className="anim-fade-up mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty" style={delay(afterHeading)}>
            {hero.intro}
          </p>

          <div className="anim-fade-up mt-8 flex flex-wrap gap-3" style={delay(afterHeading + 0.1)}>
            <a
              href={hero.primaryCta.href}
              onClick={(event) => onCta(event, hero.primaryCta.href)}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-accent-fg transition-transform hover:-translate-y-0.5"
            >
              {hero.primaryCta.label}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
            <a
              href={hero.secondaryCta.href}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3 font-medium transition-[transform,border-color] hover:-translate-y-0.5 hover:border-accent"
            >
              {hero.secondaryCta.label}
            </a>
            <CvLink
              label={hero.cvCta}
              className="inline-flex items-center gap-2 rounded-full px-4 py-3 font-medium text-fg underline-offset-4 hover:text-accent hover:underline"
            />
          </div>

          <dl className="anim-fade-up mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6" style={delay(afterHeading + 0.2)}>
            {hero.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1">
                <dt className="text-xs leading-snug text-muted sm:text-sm">{stat.label}</dt>
                <dd className="font-display text-2xl font-bold sm:text-3xl">{statValue(stat.value)}</dd>
              </div>
            ))}
          </dl>
        </m.div>

        <m.figure style={{ y: cardY }} className="relative hidden lg:block">
          <div className="anim-fade-up" style={delay(0.35)}>
            <div className="-rotate-[1.5deg] overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/10">
              <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-3">
                <span aria-hidden="true" className="size-3 rounded-full bg-line" />
                <span aria-hidden="true" className="size-3 rounded-full bg-line" />
                <span aria-hidden="true" className="size-3 rounded-full bg-line" />
                <span className="ml-3 font-mono text-xs text-muted">{hero.snippetLabel}</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[0.8rem] leading-relaxed text-fg [font-variant-ligatures:none]">
                <code>{hero.snippet}</code>
              </pre>
            </div>
            <figcaption className="eyebrow mt-4 text-right">{hero.snippetCaption}</figcaption>
          </div>
        </m.figure>
      </div>
    </section>
  );
}
