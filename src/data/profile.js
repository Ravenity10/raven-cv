// Single source of truth for years of experience (first role: Oct 2020). Update once a year.
export const YEARS_EXPERIENCE = 6;
export const CAREER_START = 2020;

export const profile = {
  name: 'John Raven M. Delos Reyes',
  shortName: 'Raven Delos Reyes',
  initials: 'JR',
  role: 'WordPress Developer',
  email: 'gtrax03@gmail.com',
  location: 'Taugtog, Botolan, Zambales, Philippines',
  locationShort: 'Zambales, Philippines',
  timezone: 'Philippine Time (UTC+8)',
  linkedin: 'https://www.linkedin.com/in/john-raven-delos-reyes-9813aa229/',
  // Replace the PDF in public/cv/ to update the CV; keep the file name or change it here.
  cv: {
    href: `${import.meta.env.BASE_URL}cv/John_Raven_Delos_Reyes_Resume.pdf`,
    fileName: 'John_Raven_Delos_Reyes_Resume.pdf',
    label: 'Download CV',
    shortLabel: 'CV',
    format: '(PDF)',
  },
};

export const navItems = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'services', label: 'Services' },
  // `cta` renders the item as the filled button at the end of the nav.
  { id: 'contact', label: 'Contact', cta: true },
];

export const ui = {
  skipLink: 'Skip to content',
  homeLabel: `${profile.shortName}, back to top`,
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
  themeToLight: 'Switch to light theme',
  themeToDark: 'Switch to dark theme',
  primaryNav: 'Primary',
  // Floating button (BackToTop.jsx): visible label and its accessible name.
  backToTop: 'top',
  backToTopLabel: 'Back to top',
};

// Boot screen shown while fonts, hero assets and the page load (Loader.jsx).
// One step ticks off per quarter of real progress; the message names the step in progress.
export const loader = {
  user: 'raven@prod',
  path: ':~$',
  command: 'deploy --env production --portfolio',
  steps: [
    { label: 'Build', message: 'compiling the page bundle' },
    { label: 'Test', message: 'loading fonts' },
    { label: 'Deploy', message: 'decoding hero assets' },
    { label: 'Release', message: 'verifying health checks' },
  ],
  done: 'deployment successful, site is live',
};

export const hero = {
  eyebrow: 'WordPress Developer',
  eyebrowPlace: 'Zambales, PH',
  // Each string is one line of the (uppercase) name; the last line gets the gradient.
  nameLines: ['John Raven M.', 'Delos Reyes'],
  tagline: 'I build custom WordPress themes, ACF content models, custom post types and plugins that teams run with confidence.',
  primaryCta: { label: "Let's talk", href: `mailto:${profile.email}` },
  secondaryCta: { label: 'View the work', href: '#projects' },
  statusLabel: 'Status',
  // `clock: true` renders the live Asia/Manila time in place of a fixed value.
  // `minor: true` items are hidden on short screens so the hero fits one viewport.
  status: [
    { key: 'status', value: 'available', live: true },
    { key: 'base', value: 'Botolan, Zambales', minor: true },
    { key: 'since', value: `${CAREER_START} · ${YEARS_EXPERIENCE}+ yrs`, minor: true },
    { key: 'local', clock: true, suffix: 'UTC+08:00' },
  ],
  timeZone: 'Asia/Manila',
  tickerLabel: 'Skills',
  ticker: ['Custom themes', 'ACF Pro', 'Custom post types', 'Plugin development', 'WooCommerce', 'WP REST API', 'PHP', 'JavaScript', 'Stripe & Square', 'Gravity Forms', 'MySQL', 'WP-CLI'],
  snippetLabel: 'functions.php',
  snippet: `add_action( 'init', function () {
  register_post_type( 'project', [
    'label'        => 'Projects',
    'public'       => true,
    'show_in_rest' => true,
    'has_archive'  => true,
    'supports'     => [ 'title', 'editor', 'thumbnail' ],
  ] );
} );`,
  snippetCaption: 'Solid architecture first. Polished design on top.',
};

// Section labels read like terminal commands: "01 - whoami".
export const about = {
  heading: 'whoami',
  title: 'A developer who builds for the people editing the site next week.',
  paragraphs: [
    `I'm a WordPress developer based in ${profile.locationShort}, currently a Senior WordPress Developer at TechZ Digital, where I lead a web development and digital marketing team. Over the past ${YEARS_EXPERIENCE} years most of my work has been custom: themes built from a design, content modelled with ACF and custom post types, and plugins written for the one job a site needs done.`,
    'I care about the parts clients never see: sensible data structures, safe payment flows, tidy databases and code the next developer can read. The goal is always a site that is fast for visitors and simple for the team who runs it.',
  ],
  facts: [
    { label: 'Based in', value: profile.locationShort },
    { label: 'Experience', value: `${YEARS_EXPERIENCE}+ years` },
    { label: 'Currently', value: 'Senior WordPress Developer, TechZ Digital' },
    { label: 'Education', value: 'BS Information Technology' },
  ],
};

export const services = {
  heading: 'services',
  title: 'What I can take off your plate.',
  items: [
    {
      title: 'Custom theme builds',
      body: 'From a Figma or Adobe XD design to a hand-built theme with flexible ACF layouts, so editors can build pages without breaking them.',
    },
    {
      title: 'Plugin development',
      body: 'Focused plugins for a single job: payment pages, booking rules, admin tools and REST endpoints, written to WordPress coding standards.',
    },
    {
      title: 'Integrations',
      body: 'Stripe, Square and PayPal, CRMs, mailing lists, SMTP delivery and third-party APIs, with webhooks that are verified and safe to retry.',
    },
    {
      title: 'WooCommerce',
      body: 'Stores, bookings and ordering flows: custom checkout logic, order statuses, gift cards, coupons and reporting.',
    },
    {
      title: 'Care and maintenance',
      body: 'Updates tested on a local copy first, backups before every change, database clean-ups and performance work on live sites.',
    },
    {
      title: 'Rescue and recovery',
      body: 'Diagnosing broken or compromised sites, restoring from clean sources and documenting what happened and what changed.',
    },
  ],
};

export const contact = {
  heading: 'contact',
  title: 'Have a WordPress project in mind?',
  body: 'Tell me about the site, the deadline and what is not working today. I usually reply within one working day.',
  emailLabel: 'Email',
  locationLabel: 'Location',
  elsewhereLabel: 'Elsewhere',
  linkedinLabel: 'LinkedIn',
  newTab: '(opens in a new tab)',
  copyLabel: 'Copy email address',
  copiedLabel: 'Copied',
  copiedToast: 'Email copied to clipboard',
  copyFailedToast: `Copy blocked. Email: ${profile.email}`,
  ctaLabel: 'Start a conversation',
};

export const footer = {
  rights: 'All rights reserved.',
  backToTop: 'Back to top',
};

export const projectsCopy = {
  heading: 'projects',
  title: 'Selected WordPress builds.',
  intro: 'Live client sites I have built or worked on. Select a project for the full breakdown.',
  viewDetails: 'View details',
  tagsLabel: 'Technologies',
  visitSite: 'Visit live site',
  newTab: '(opens in a new tab)',
  close: 'Close project details',
  featuresHeading: 'Under the hood',
  noScreenshot: 'Screenshot unavailable',
  screenshotAlt: (name) => `Homepage of the ${name} website`,
};

export const skillsCopy = {
  heading: 'stack',
  title: 'The WordPress stack, end to end.',
  toolboxHeading: 'Toolbox',
};
