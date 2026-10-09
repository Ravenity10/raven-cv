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

// Filter chips above the grid. Each filter matches the projects whose sites.json tags
// include any of its `tags`; "All" has none and matches everything.
export const projectFilters = [
  { id: 'all', label: 'All' },
  { id: 'theme', label: 'Custom Theme', tags: ['Custom theme', 'Child theme', 'ACF Flexible Content'] },
  { id: 'plugin', label: 'Plugin', tags: ['Plugin development'] },
  { id: 'woocommerce', label: 'WooCommerce', tags: ['WooCommerce'] },
  { id: 'integration', label: 'Integration', tags: ['Stripe', 'Webhooks', 'Mailchimp', 'SMTP', 'Cloudflare', 'GA4'] },
];

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
    filters: projectFilters.filter((filter) => !filter.tags || filter.tags.some((tag) => site.tags.includes(tag))).map((filter) => filter.id),
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
