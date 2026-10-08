import { Fragment, useEffect, useRef, useState } from 'react';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { hero } from '../data/profile.js';
import { scrollToTarget } from '../hooks/useSmoothScroll.js';
import StarField from './StarField.jsx';

// The entrance uses CSS keyframes (.anim-word / .anim-fade-up in index.css) so it plays
// from the pre-rendered HTML on first paint, without waiting for JavaScript.
const WORD_STAGGER = 0.06;
const START = 0.1;
const delay = (seconds) => ({ '--d': `${seconds.toFixed(2)}s` });

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

// Live local time for the status row. The pre-rendered HTML shows a placeholder,
// so server and client markup match until the first tick.
function useClock(timeZone) {
  const [time, setTime] = useState(null);
  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [timeZone]);
  return time;
}

function StatusValue({ item, clock }) {
  if (item.clock) {
    return (
      <>
        <time suppressHydrationWarning className="tabular-nums text-fg">
          {clock ?? '--:--:--'}
        </time>{' '}
        <span className="text-muted">{item.suffix}</span>
      </>
    );
  }
  if (item.live) {
    return (
      <span className="inline-flex items-center gap-2 text-(--teal)">
        <span aria-hidden="true" className="pulse-dot" />
        {item.value}
      </span>
    );
  }
  return <span className="text-fg">{item.value}</span>;
}

function SkillTicker() {
  return (
    <div className="hero-ticker marquee border-y border-line bg-surface/40 py-3">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-label={copy === 0 ? hero.tickerLabel : undefined}
            aria-hidden={copy === 1 ? 'true' : undefined}
            className="flex shrink-0 items-center font-mono text-[0.8rem] text-muted"
          >
            {hero.ticker.map((skill) => (
              <li key={skill} className="flex items-center whitespace-nowrap">
                <span className="px-5">{skill}</span>
                <span aria-hidden="true" className="text-accent">
                  /
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const clock = useClock(hero.timeZone);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const cardY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.2]);

  const lines = hero.nameLines.map((line) => line.split(' '));
  const lastLine = lines.length - 1;
  let step = 0;
  const afterHeading = START + lines.flat().length * WORD_STAGGER;

  const onCta = (event, href) => {
    if (!href.startsWith('#')) return;
    event.preventDefault();
    scrollToTarget(href.slice(1));
  };

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative overflow-hidden">
      <StarField />

      <div className="container-page relative grid gap-12 pb-14 pt-12 md:pb-20 md:pt-20 lg:grid-cols-[1.45fr_1fr] lg:items-center">
        <m.div style={{ opacity: copyOpacity }} className="min-w-0">
          <p className="anim-fade-up eyebrow mb-6 flex flex-wrap items-center gap-x-2.5 gap-y-1 uppercase tracking-[0.06em] sm:gap-x-3 sm:tracking-[0.16em]" style={delay(0)}>
            <span aria-hidden="true" className="hidden h-px w-8 bg-current sm:block" />
            <span>{hero.eyebrow}</span>
            <span aria-hidden="true" className="text-accent">
              /
            </span>
            <span className="text-accent">{hero.eyebrowPlace}</span>
          </p>

          <h1
            id="hero-title"
            className="font-display text-[clamp(2.25rem,10.4vw,4rem)] font-bold uppercase leading-[0.95] tracking-[-0.02em] lg:text-[4.25rem] xl:text-[4.9rem]"
          >
            {lines.map((line, lineIndex) => (
              <span key={lineIndex} className="block">
                {line.map((word, index) => (
                  // The space sits between the inline-blocks; inside one it would be collapsed.
                  <Fragment key={index}>
                    <span className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                      <span className={`anim-word ${lineIndex === lastLine ? 'text-gradient' : ''}`} style={delay(START + step++ * WORD_STAGGER)}>
                        {word}
                      </span>
                    </span>
                    {index < line.length - 1 ? ' ' : ''}
                  </Fragment>
                ))}
                {lineIndex === lastLine && (
                  <span aria-hidden="true" className="caret ml-[0.12em] inline-block h-[0.72em] w-[0.38em] bg-accent align-baseline" />
                )}
              </span>
            ))}
          </h1>

          <p className="anim-fade-up mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty md:text-xl" style={delay(afterHeading)}>
            {hero.tagline}
          </p>

          <div className="anim-fade-up mt-8 flex flex-wrap gap-3" style={delay(afterHeading + 0.08)}>
            <a href={hero.primaryCta.href} className="btn-brand inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold">
              {hero.primaryCta.label}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href={hero.secondaryCta.href}
              onClick={(event) => onCta(event, hero.secondaryCta.href)}
              className="glass inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-medium transition-[transform,border-color] hover:-translate-y-0.5 hover:border-accent"
            >
              {hero.secondaryCta.label}
            </a>
          </div>

          <dl
            aria-label={hero.statusLabel}
            className="anim-fade-up mt-10 grid grid-cols-1 gap-x-8 gap-y-2.5 border-t border-line pt-6 font-mono text-[0.8rem] min-[400px]:grid-cols-2 sm:max-w-xl"
            style={delay(afterHeading + 0.16)}
          >
            {hero.status.map((item) => (
              <div key={item.key} className="flex min-w-0 items-baseline gap-2">
                <dt className="shrink-0 text-muted">{item.key}:</dt>
                <dd className="min-w-0">
                  <StatusValue item={item} clock={clock} />
                </dd>
              </div>
            ))}
          </dl>
        </m.div>

        <m.figure style={{ y: cardY }} className="relative hidden lg:block">
          <div className="anim-fade-up" style={delay(0.35)}>
            <div className="code-float relative">
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
                  <code>{highlight(hero.snippet)}</code>
                </pre>
              </div>
            </div>
            <figcaption className="eyebrow mt-6 text-right">{hero.snippetCaption}</figcaption>
          </div>
        </m.figure>
      </div>

      <div className="anim-fade-up relative" style={delay(afterHeading + 0.24)}>
        <SkillTicker />
      </div>
    </section>
  );
}
