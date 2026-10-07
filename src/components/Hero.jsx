import { Fragment, useRef } from 'react';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { hero } from '../data/profile.js';
import { projects } from '../data/projects.js';
import { scrollToTarget } from '../hooks/useSmoothScroll.js';
import { toneAt } from './tones.js';
import CvLink from './CvLink.jsx';

// The entrance uses CSS keyframes (.anim-word / .anim-fade-up in index.css) so it plays
// from the pre-rendered HTML on first paint, without waiting for JavaScript.
const WORD_STAGGER = 0.06;
const START = 0.1;
const delay = (seconds) => ({ '--d': `${seconds.toFixed(2)}s` });

const statValue = (value) => (value === 'PROJECT_COUNT' ? String(projects.length) : value);

// Minimal PHP highlighter for the snippet: strings, arrows, keywords, function calls, punctuation.
const TOKEN = /('[^']*')|(=>)|\b(function|true|false|null)\b|\b([a-z_]+)(?=\s*\()|([()[\]{},;])/g;
const TOKEN_CLASS = ['text-(--teal)', 'text-(--pink)', 'text-(--purple)', 'text-(--blue)', 'text-muted'];

function highlight(code) {
  const parts = [];
  let last = 0;
  for (const match of code.matchAll(TOKEN)) {
    if (match.index > last) parts.push(code.slice(last, match.index));
    const group = match.slice(1).findIndex((value) => value !== undefined);
    parts.push(
      <span key={match.index} className={TOKEN_CLASS[group]}>
        {match[0]}
      </span>,
    );
    last = match.index + match[0].length;
  }
  parts.push(code.slice(last));
  return parts;
}

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // Subtle parallax: the glow drifts slower than the page, the code card a little faster.
  const glowY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '35%']);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.2]);

  const lines = hero.headingLines.map((line) => line.split(' '));
  const lastLine = lines.length - 1;
  let step = 0;
  const wordCount = lines.slice(0, lastLine).flat().length + 1; // the last line reveals as one unit
  const afterHeading = START + wordCount * WORD_STAGGER;

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
        className="pointer-events-none absolute -right-48 -top-48 size-[40rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--grad-2)_24%,transparent),transparent)] md:-right-24 md:-top-32"
      />

      <div className="container-page relative grid gap-12 pb-20 pt-14 md:pb-28 md:pt-24 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <m.div style={{ opacity: copyOpacity }}>
          <p className="anim-fade-up eyebrow glass mb-6 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5" style={delay(0)}>
            <span aria-hidden="true" className="pulse-dot" />
            {hero.eyebrow}
          </p>

          <h1 id="hero-title" className="font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            {lines.map((line, lineIndex) =>
              lineIndex === lastLine ? (
                <span key={lineIndex} className="block overflow-hidden pb-[0.1em]">
                  <span className="anim-word text-gradient" style={delay(START + step++ * WORD_STAGGER)}>
                    {line.join(' ')}
                  </span>
                </span>
              ) : (
                <span key={lineIndex} className="block">
                  {line.map((word, index) => (
                    // The space sits between the inline-blocks; inside one it would be collapsed.
                    <Fragment key={index}>
                      <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                        <span className="anim-word" style={delay(START + step++ * WORD_STAGGER)}>
                          {word}
                        </span>
                      </span>
                      {index < line.length - 1 ? ' ' : ''}
                    </Fragment>
                  ))}{' '}
                </span>
              ),
            )}
          </h1>

          <p className="anim-fade-up mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty" style={delay(afterHeading)}>
            {hero.intro}
          </p>

          <ul aria-label={hero.techLabel} className="anim-fade-up mt-6 flex flex-wrap gap-2" style={delay(afterHeading + 0.05)}>
            {hero.tech.map((tech, index) => (
              <li key={tech} className={`chip ${toneAt(index)}`}>
                {tech}
              </li>
            ))}
          </ul>

          <div className="anim-fade-up mt-8 flex flex-wrap gap-3" style={delay(afterHeading + 0.1)}>
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

          <dl className="anim-fade-up mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6" style={delay(afterHeading + 0.2)}>
            {hero.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1">
                <dt className="text-xs leading-snug text-muted sm:text-sm">{stat.label}</dt>
                <dd className="font-display text-2xl font-bold sm:text-3xl">
                  <span className="text-gradient">{statValue(stat.value)}</span>
                </dd>
              </div>
            ))}
          </dl>
        </m.div>

        <m.figure style={{ y: cardY }} className="relative hidden lg:block">
          <div className="anim-fade-up" style={delay(0.35)}>
            <div className="code-float relative">
              {/* Colour glow behind the window. */}
              <div
                aria-hidden="true"
                className="absolute -inset-6 -z-10 rounded-[2rem] bg-linear-to-br from-(--grad-1) via-(--grad-2) to-(--grad-3) opacity-25 blur-3xl"
              />
              <div className="glass -rotate-[1.5deg] overflow-hidden rounded-2xl border border-line shadow-2xl shadow-black/20 ring-1 ring-white/5">
                <div className="flex items-center gap-2 border-b border-line bg-surface-2/70 px-4 py-3">
                  <span aria-hidden="true" className="size-3 rounded-full bg-[#ff5f57]" />
                  <span aria-hidden="true" className="size-3 rounded-full bg-[#febc2e]" />
                  <span aria-hidden="true" className="size-3 rounded-full bg-[#28c840]" />
                  <span className="ml-3 font-mono text-xs text-muted">{hero.snippetLabel}</span>
                  <span aria-hidden="true" className="ml-auto chip tone-purple !px-2 !py-0.5 !text-[0.7rem]">
                    PHP
                  </span>
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-[0.8rem] leading-relaxed text-fg [font-variant-ligatures:none]">
                  <code>
                    {highlight(hero.snippet)}
                    <span aria-hidden="true" className="caret ml-0.5 inline-block h-[1.1em] w-[0.55ch] translate-y-[0.2em] bg-(--grad-2)" />
                  </code>
                </pre>
              </div>
            </div>
            <figcaption className="eyebrow mt-6 text-right">{hero.snippetCaption}</figcaption>
          </div>
        </m.figure>
      </div>
    </section>
  );
}
