import { useEffect, useRef, useState } from 'react';
import { m } from 'motion/react';
import { about } from '../data/profile.js';
import { projects } from '../data/projects.js';
import SectionHeading from './SectionHeading.jsx';
import Reveal, { revealItem } from './Reveal.jsx';
import CodeBlock from './CodeBlock.jsx';

const COUNT_MS = 1400;
const MAX_BAR = 16; // plus signs for the largest stat (fits a 360px screen)
const easeOut = (t) => 1 - (1 - t) ** 3;

// Defaults for stats whose value is computed from other data.
const computed = {
  'projects.md': projects.length,
  'integrations.json': about.integrations.length,
};
const stats = about.stats.map((stat) => ({ ...stat, value: stat.value ?? computed[stat.file] ?? 0 }));
const largest = Math.max(...stats.map((stat) => stat.value));
const insertions = stats.reduce((sum, stat) => sum + stat.value, 0);

// 0 -> 1 once the element scrolls into view. The pre-rendered HTML shows the final numbers;
// below the fold they reset to 0 on hydration and count up when seen. Reduced motion: no count.
function useCountUp(ref) {
  const [progress, setProgress] = useState(1);
  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let frame = 0;
    setProgress(0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / COUNT_MS);
          setProgress(easeOut(t));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ref]);
  return progress;
}

function DiffStat() {
  const ref = useRef(null);
  const progress = useCountUp(ref);
  const fileWidth = Math.max(...stats.map((stat) => stat.file.length));
  const valueWidth = Math.max(...stats.map((stat) => `${stat.value}${stat.suffix ?? ''}`.length));

  return (
    <div ref={ref} className="diffstat rounded-2xl border border-line bg-surface p-4 font-mono text-[0.75rem] sm:p-5 sm:text-[0.8rem]">
      <p className="text-muted">
        <span aria-hidden="true" className="text-accent">
          ${' '}
        </span>
        {about.statsLabel}
      </p>
      <dl className="mt-3 space-y-1.5">
        {stats.map((stat) => {
          const bar = Math.max(2, Math.round((stat.value / largest) * MAX_BAR));
          const shown = Math.round(bar * progress);
          return (
            <div key={stat.file} className="flex items-baseline gap-2 whitespace-nowrap">
              <dt className="shrink-0">
                <span aria-hidden="true" className="inline-block text-fg" style={{ width: `${fileWidth}ch` }}>
                  {stat.file}
                </span>
                <span className="sr-only">{stat.label}</span>
              </dt>
              <span aria-hidden="true" className="text-muted">
                |
              </span>
              <dd className="flex min-w-0 items-baseline gap-2">
                <span className="inline-block text-right tabular-nums text-fg" style={{ width: `${valueWidth}ch` }}>
                  {Math.round(stat.value * progress)}
                  {stat.suffix}
                </span>
                <span aria-hidden="true" className="overflow-hidden text-(--teal)">
                  {Array.from({ length: bar }, (_, index) => (
                    <span key={index} className="diffstat-plus" style={{ opacity: index < shown ? 1 : 0 }}>
                      +
                    </span>
                  ))}
                </span>
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="mt-3 text-muted">{about.statsSummary(stats.length, insertions)}</p>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="section-pad">
      <div className="container-page">
        <SectionHeading id="about" index={1} label={about.heading} title={about.title} />
        <div className="grid gap-5 md:gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          <div className="min-w-0 space-y-5">
            {/* Phones show the first paragraph only; the code block carries the same facts. */}
            <Reveal stagger={0.1} className="space-y-4 text-[0.95rem] leading-relaxed text-muted md:text-lg">
              {about.paragraphs.map((paragraph, index) => (
                <m.p key={paragraph} variants={revealItem} className={`text-pretty ${index > 0 ? 'max-md:hidden' : ''}`}>
                  {paragraph}
                </m.p>
              ))}
            </Reveal>
            <Reveal>
              <DiffStat />
            </Reveal>
          </div>
          <Reveal className="min-w-0 self-start">
            <CodeBlock code={about.code} fileName={about.codeFile} meta={about.codeMeta} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
