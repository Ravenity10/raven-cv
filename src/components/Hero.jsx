import { Fragment, useEffect, useRef, useState } from 'react';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { hero } from '../data/profile.js';
import { scrollToTarget } from '../hooks/useSmoothScroll.js';
import { useScramble } from '../hooks/useScramble.js';
import StarField from './StarField.jsx';
import Marquee from './Marquee.jsx';
import { onBoot } from './Loader.jsx';

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
      <span className="whitespace-nowrap">
        <time suppressHydrationWarning className="tabular-nums text-fg">
          {clock ?? '--:--:--'}
        </time>{' '}
        {/* The offset drops on the narrowest phones so the time never wraps or overflows. */}
        <span className="hidden text-muted min-[360px]:inline">{item.suffix}</span>
      </span>
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
    <Marquee
      items={hero.ticker}
      label={hero.tickerLabel}
      className="border-y border-line bg-surface/40 py-3"
      listClassName="items-center font-mono text-[0.8rem] text-muted"
      renderItem={(skill) => (
        <li key={skill} className="flex items-center whitespace-nowrap">
          <span className="px-5">{skill}</span>
          <span aria-hidden="true" className="text-accent">
            /
          </span>
        </li>
      )}
    />
  );
}

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const clock = useClock(hero.timeZone);
  const scramble = useScramble();
  const { play } = scramble;

  // The name scrambles once the boot loader has gone, and again on hover.
  useEffect(() => onBoot(play), [play]);
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
    // Fills the viewport below the sticky header (.hero in index.css); the copy is centred
    // in the space left above the ticker, which is pinned to the bottom.
    <section id="hero" ref={ref} aria-labelledby="hero-title" className="hero relative flex flex-col overflow-hidden outline-none">
      <StarField />

      <div className="hero-body container-page relative grid flex-1 content-center gap-12 lg:grid-cols-[1.45fr_1fr] lg:items-center">
        <m.div style={{ opacity: copyOpacity }} className="min-w-0">
          <p className="anim-fade-up eyebrow hero-gap-sm flex flex-wrap items-center gap-x-2.5 gap-y-1 uppercase tracking-[0.06em] sm:gap-x-3 sm:tracking-[0.16em]" style={delay(0)}>
            <span aria-hidden="true" className="hidden h-px w-8 bg-current sm:block" />
            <span>{hero.eyebrow}</span>
            <span aria-hidden="true" className="text-accent">
              /
            </span>
            <span className="text-accent">{hero.eyebrowPlace}</span>
          </p>

          {/* The real name is the accessible label; the per-letter spans that scramble are hidden. */}
          <h1
            id="hero-title"
            ref={scramble.ref}
            aria-label={hero.nameLines.join(' ')}
            onPointerEnter={play}
            className="hero-name font-display font-bold uppercase leading-[0.95] tracking-[-0.02em]"
          >
            {lines.map((line, lineIndex) => (
              <span key={lineIndex} aria-hidden="true" className="block">
                {line.map((word, index) => (
                  // The space sits between the inline-blocks; inside one it would be collapsed.
                  <Fragment key={index}>
                    <span className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                      <span className={`anim-word ${lineIndex === lastLine ? 'text-gradient' : ''}`} style={delay(START + step++ * WORD_STAGGER)}>
                        {[...word].map((char, charIndex) => (
                          <span key={charIndex} data-char={char} className="glitch-char">
                            {char}
                          </span>
                        ))}
                      </span>
                    </span>
                    {index < line.length - 1 ? ' ' : ''}
                  </Fragment>
                ))}
                {lineIndex === lastLine && <span className="caret ml-[0.12em] inline-block h-[0.72em] w-[0.38em] bg-accent align-baseline" />}
              </span>
            ))}
          </h1>

          <p className="anim-fade-up hero-tagline hero-gap max-w-xl leading-relaxed text-muted text-pretty" style={delay(afterHeading)}>
            {hero.tagline}
          </p>

          <div className="anim-fade-up hero-gap flex flex-wrap gap-3" style={delay(afterHeading + 0.08)}>
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
            className="anim-fade-up hero-status grid grid-cols-2 gap-x-6 gap-y-3.5 border-t border-line font-mono text-[0.8rem] sm:max-w-xl sm:gap-x-8 sm:gap-y-2.5"
            style={delay(afterHeading + 0.16)}
          >
            {/* Phones: label above value, so two columns fit without values wrapping. */}
            {hero.status.map((item) => (
              <div
                key={item.key}
                className={`flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2 ${item.minor ? '[@media(max-height:760px)]:hidden' : ''}`}
              >
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
      {/* Once this scrolls above the viewport, the floating back-to-top button shows (BackToTop.jsx). */}
      <span data-hero-sentinel aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-px w-px" />
    </section>
  );
}
