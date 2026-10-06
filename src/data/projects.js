// Project content lives in scripts/sites.json so the screenshot script and the site
// read the same list. screens.json is written by scripts/screenshot.mjs.
import sites from '../../scripts/sites.json';
import screens from './screens.json';
import { slugify } from '../../scripts/slugify.mjs';

// "/" locally, "/raven-cv/" on GitHub Pages (set by the deploy workflow).
const base = import.meta.env.BASE_URL;

// Bullets in sites.json prefixed with "[inferred]" are awaiting review.
// The prefix is stripped for display.
const clean =(text) => text.replace(/^\[inferred\]\s*/i, '');

export const projects = sites.map((site) => {
  const slug = slugify(site.name);
  const screen = screens[slug];
  return {
    slug,
    name: site.name,
    url: site.url,
    host: new URL(site.url).hostname.replace(/^www\./, ''),
    description: clean(site.description),
    features: site.features.map(clean),
    tags: site.tags,
    image: screen
      ? {
          src: `${base}screens/${slug}.webp`,
          srcSmall: `${base}screens/${slug}-sm.webp`,
          width: screen.width,
          height: screen.height,
        }
      : null,
  };
});
