import { useEffect, useState } from 'react';
import { m } from 'motion/react';
import { contact, profile } from '../data/profile.js';
import SectionHeading from './SectionHeading.jsx';
import Reveal, { revealItem } from './Reveal.jsx';
import CvLink from './CvLink.jsx';

export default function Contact() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch {
      // Clipboard blocked: the mailto link is still available.
    }
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="py-20 md:py-28">
      <div className="container-page">
        <SectionHeading id="contact" index={6} label={contact.heading} title={contact.title} intro={contact.body} />

        <Reveal stagger={0.08} className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
          <m.div
            variants={revealItem}
            className="bg-brand-strong relative flex flex-col justify-between gap-8 overflow-hidden rounded-3xl p-8 text-white shadow-2xl shadow-indigo-900/30 md:p-10"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.25),transparent)]"
            />
            <div className="relative">
              <p className="font-mono text-sm text-white/80">{contact.emailLabel}</p>
              <a
                href={`mailto:${profile.email}`}
                className="mt-2 block break-all font-display text-3xl font-bold tracking-tight underline-offset-8 hover:underline focus-visible:outline-white md:text-4xl"
              >
                {profile.email}
              </a>
            </div>
            <div className="relative flex flex-wrap gap-3">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center rounded-full bg-white px-6 py-3 font-semibold text-indigo-700 transition-transform hover:-translate-y-0.5 focus-visible:outline-white"
              >
                {contact.ctaLabel}
              </a>
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 font-semibold transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-white"
              >
                {copied ? contact.copiedLabel : contact.copyLabel}
              </button>
              <span className="sr-only" role="status" aria-live="polite">
                {copied ? contact.copiedLabel : ''}
              </span>
            </div>
          </m.div>

          <m.div variants={revealItem} className="spotlight rounded-3xl border border-line bg-surface p-8 md:p-10">
            <p className="font-mono text-sm text-muted">{contact.locationLabel}</p>
            <address className="mt-2 font-display text-2xl font-bold not-italic leading-snug tracking-tight">
              {profile.location}
            </address>
            <p className="mt-4 text-muted">{profile.timezone}</p>

            <p className="mt-8 border-t border-line pt-6 font-mono text-sm text-muted">{contact.elsewhereLabel}</p>
            <ul className="mt-3 space-y-2 font-semibold">
              <li>
                <CvLink className="inline-flex items-center gap-2 hover:text-accent" />
              </li>
              <li>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-accent">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm7 0h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.1c0-1.22-.02-2.79-1.7-2.79-1.7 0-1.96 1.33-1.96 2.7V21h-4V9.5Z" />
                  </svg>
                  {contact.linkedinLabel}
                  <span className="sr-only"> {contact.newTab}</span>
                </a>
              </li>
            </ul>
          </m.div>
        </Reveal>
      </div>
    </section>
  );
}
