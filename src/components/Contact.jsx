import { useEffect, useState } from 'react';
import { m } from 'motion/react';
import { contact, profile } from '../data/profile.js';
import SectionHeading from './SectionHeading.jsx';
import Reveal, { revealItem } from './Reveal.jsx';
import CvLink from './CvLink.jsx';
import { copyEmail } from '../hooks/copyEmail.js';

export default function Contact() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  // The toast announces the result; the button label also confirms it briefly.
  const copy = async () => setCopied(await copyEmail());

  return (
    <section id="contact" aria-labelledby="contact-title" className="section-pad border-t border-line">
      <div className="container-page">
        <SectionHeading id="contact" index={6} label={contact.heading} title={contact.title} intro={contact.body} />

        <Reveal stagger={0.08} className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
          <m.div
            variants={revealItem}
            className="bg-brand-strong relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl p-5 text-white shadow-2xl shadow-indigo-900/30 sm:gap-8 sm:rounded-3xl sm:p-8 md:p-10"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.25),transparent)]"
            />
            <div className="relative">
              <p className="font-mono text-sm text-white/80">{contact.emailLabel}</p>
              <a
                href={`mailto:${profile.email}`}
                className="mt-2 block break-all font-display text-2xl font-bold tracking-tight underline-offset-8 hover:underline focus-visible:outline-white sm:text-3xl md:text-4xl"
              >
                {profile.email}
              </a>
            </div>
            <div className="relative flex flex-wrap gap-3">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center rounded-full bg-white px-5 py-2.5 font-semibold text-indigo-700 sm:px-6 sm:py-3 transition-transform hover:-translate-y-0.5 focus-visible:outline-white"
              >
                {contact.ctaLabel}
              </a>
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center rounded-full border border-white/40 px-5 py-2.5 font-semibold sm:px-6 sm:py-3 transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-white"
              >
                {copied ? contact.copiedLabel : contact.copyLabel}
              </button>
            </div>
          </m.div>

          <m.div variants={revealItem} data-cursor className="spotlight rounded-2xl border border-line bg-surface p-5 sm:rounded-3xl sm:p-8 md:p-10">
            <p className="font-mono text-sm text-muted">{contact.locationLabel}</p>
            <address className="mt-2 font-display text-xl font-bold not-italic leading-snug tracking-tight sm:text-2xl">
              {profile.location}
            </address>
            <p className="mt-4 text-muted">{profile.timezone}</p>

            <p className="mt-5 border-t border-line pt-4 font-mono text-sm text-muted sm:mt-8 sm:pt-6">{contact.elsewhereLabel}</p>
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
              <li>
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-accent">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
                  </svg>
                  {contact.githubLabel}
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
