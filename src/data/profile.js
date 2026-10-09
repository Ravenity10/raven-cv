// Single source of truth for years of experience (first role: Oct 2020). Update once a year.
export const YEARS_EXPERIENCE = 6;
export const CAREER_START = 2020;

export const profile = {
  name: 'John Raven M. Delos Reyes',
  shortName: 'Raven Delos Reyes',
  initials: 'JR',
  role: 'Web Developer',
  // The specialism shown next to the role (hero prompt, footer).
  focus: 'WordPress focus',
  email: 'gtrax03@gmail.com',
  location: 'Taugtog, Botolan, Zambales, Philippines',
  locationShort: 'Zambales, Philippines',
  timezone: 'Philippine Time (UTC+8)',
  linkedin: 'https://www.linkedin.com/in/john-raven-delos-reyes-9813aa229/',
  github: 'https://github.com/Ravenity10',
  // Replace the PDF in public/cv/ to update the CV; keep the file name or change it here.
  cv: {
    href: `${import.meta.env.BASE_URL}cv/John_Raven_Delos_Reyes_Resume.pdf`,
    fileName: 'John_Raven_Delos_Reyes_Resume.pdf',
    label: 'Download CV',
    shortLabel: 'CV',
    format: '(PDF)',
  },
};

// Order follows the section labels: 01 whoami, 02 git log, 03 projects, 04 stack.
export const navItems = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Stack' },
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
  // Floating button (BackToTop.jsx); the visible label is also its accessible name.
  backToTop: 'Back to top',
};

// Command palette (CommandPalette.jsx), opened with Ctrl+K / Cmd+K or the header hint.
export const palette = {
  label: 'Command palette',
  hint: 'ctrl k',
  hintMac: 'cmd k',
  openLabel: 'Open the command palette',
  placeholder: 'Type a command or search',
  inputLabel: 'Search commands',
  empty: 'No matching commands',
  navigateGroup: 'Go to',
  actionsGroup: 'Actions',
  topLabel: 'Top of the page',
  themeToLight: 'Switch to light theme',
  themeToDark: 'Switch to dark theme',
  copyEmail: 'Copy email address',
  openGithub: 'Open GitHub',
  openLinkedin: 'Open LinkedIn',
  downloadCv: 'Download CV (PDF)',
  keys: [
    { key: 'up/down', label: 'move' },
    { key: 'enter', label: 'run' },
    { key: 'esc', label: 'close' },
  ],
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
  // Prompt line above the name: "$ whoami" types out, then resolves to the role.
  prompt: { user: 'raven@prod', path: ':~$', command: 'whoami' },
  eyebrow: profile.role,
  eyebrowFocus: 'WordPress specialist',
  eyebrowPlace: 'Zambales, PH',
  // Each string is one line of the (uppercase) name; the last line gets the gradient.
  nameLines: ['John Raven M.', 'Delos Reyes'],
  tagline: 'I design and build fast, secure and maintainable websites, specialising in custom WordPress themes and plugins, API integrations and React front ends.',
  primaryCta: { label: 'Get in touch', href: `mailto:${profile.email}` },
  secondaryCta: { label: 'View projects', href: '#projects' },
  statusLabel: 'Status',
  // `clock: true` renders the live Asia/Manila time in place of a fixed value.
  // `minor: true` items are hidden on short screens so the hero fits one viewport.
  status: [
    { key: 'status', value: 'open to projects', live: true },
    { key: 'base', value: 'Botolan, Zambales', minor: true },
    { key: 'since', value: `${CAREER_START} · ${YEARS_EXPERIENCE}+ years`, minor: true },
    { key: 'local', clock: true, suffix: 'UTC+08:00' },
  ],
  timeZone: 'Asia/Manila',
  tickerLabel: 'Skills',
  ticker: ['Custom themes', 'ACF Pro', 'Custom post types', 'Plugin development', 'WooCommerce', 'WP REST API', 'PHP', 'React', 'Tailwind CSS', 'JavaScript', 'Stripe & Square', 'MySQL', 'WP-CLI'],
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
  snippetCaption: 'Clean architecture. Standards-based code. Built to last.',
};

// Section labels read like terminal commands: "01 - whoami".
export const about = {
  heading: 'whoami',
  title: 'A developer who builds for the people editing the site next week.',
  paragraphs: [
    `I'm a web developer based in ${profile.locationShort}, with WordPress at the centre of my work. I'm currently a Senior WordPress Developer at TechZ Digital, where I lead the web development team. Over the past ${YEARS_EXPERIENCE} years most of my work has been custom: themes built from a design, content modelled with ACF and custom post types, and plugins written for the one job a site needs done.`,
    'I care about the parts clients never see: sensible data structures, safe payment flows, tidy databases and code the next developer can read. The goal is always a site that is fast for visitors and simple for the team who runs it.',
  ],
  // Shown as a syntax-highlighted file (CodeBlock.jsx tokenizes it).
  codeFile: 'developer.js',
  codeMeta: 'UTF-8 · JavaScript',
  code: `// ${profile.role}, ${profile.focus.toLowerCase()}
const developer = {
  name: '${profile.name}',
  role: '${profile.role}',
  focus: 'WordPress',
  base: 'Botolan, Zambales, PH',
  experience: ${YEARS_EXPERIENCE}, // years
  currently: {
    title: 'Senior WordPress Developer',
    company: 'TechZ Digital',
  },
  education: 'BS Information Technology',
  builds: ['custom themes', 'ACF', 'CPTs',
           'plugins', 'APIs', 'React'],
  available: true,
};

export default developer;`,
  // Rendered like `git diff --stat`; numbers count up when the block scrolls into view.
  // `value: null` means "use the computed default" in About.jsx (years, project count).
  statsLabel: 'git diff --stat',
  stats: [
    { file: 'years.txt', label: 'years of experience', value: YEARS_EXPERIENCE },
    { file: 'projects.md', label: 'case studies on this page', value: null },
    // Total sites shipped or maintained across both employers. Estimate: confirm before publishing.
    { file: 'sites.log', label: 'sites shipped and maintained', value: 30, suffix: '+' },
    { file: 'integrations.json', label: 'third-party services integrated', value: null },
  ],
  // Third-party services named in the project write-ups and skills; their count is the stat above.
  integrations: ['Stripe', 'Square', 'PayPal', 'Apple Pay', 'Google Pay', 'Mailchimp', 'Brevo SMTP', 'Cloudflare', 'GA4', 'Sage'],
  statsSummary: (files, insertions) => `${files} files changed, ${insertions} insertions(+)`,
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
  title: 'Have a web project in mind?',
  body: 'Tell me about the site, the deadline and what is not working today. I usually reply within one working day.',
  emailLabel: 'Email',
  locationLabel: 'Location',
  elsewhereLabel: 'Elsewhere',
  linkedinLabel: 'LinkedIn',
  githubLabel: 'GitHub',
  newTab: '(opens in a new tab)',
  copyLabel: 'Copy email address',
  copiedLabel: 'Copied',
  copiedToast: 'Email copied to clipboard',
  copyFailedToast: `Copy blocked. Email: ${profile.email}`,
  ctaLabel: 'Start a conversation',
};

// Footer, styled as an editor status bar. The version is read from package.json.
export const footer = {
  rights: 'All rights reserved.',
  statusLabel: 'Site status',
  branch: 'v2',
  branchLabel: 'Branch',
  versionLabel: 'Version',
  timeLabel: 'Local time in Botolan',
  themeLabel: 'Theme',
  deployed: 'deployed from Botolan, PH',
  encoding: 'UTF-8',
};

// Printed in the browser DevTools console once the page has loaded (main.jsx).
export const consoleGreeting = {
  art: String.raw` ____      _    __     __ _____  _   _
|  _ \    / \   \ \   / /| ____|| \ | |
| |_) |  / _ \   \ \ / / |  _|  |  \| |
|  _ <  / ___ \   \ V /  | |___ | |\  |
|_| \_\/_/   \_\   \_/   |_____||_| \_|`,
  lines: [
    `${profile.name}, ${profile.role} (${profile.focus.toLowerCase()})`,
    `Reading the source? Say hello: ${profile.email}`,
    `Code: ${profile.github}`,
  ],
};

export const projectsCopy = {
  heading: 'projects',
  title: 'Selected WordPress builds.',
  intro: 'Live client sites I have built or worked on. Select a project for the full breakdown.',
  filtersLabel: 'Filter projects',
  // Announced to screen readers when a filter changes.
  showing: (count) => `Showing ${count} ${count === 1 ? 'project' : 'projects'}`,
  tagsLabel: 'Technologies',
  visitSite: 'Visit live site',
  newTab: '(opens in a new tab)',
  close: 'Close project details',
  featuresHeading: 'Under the hood',
  noScreenshot: 'Screenshot unavailable',
  screenshotAlt: (name) => `Homepage of the ${name} website`,
};

export const skillsCopy = {
  heading: 'cat stack.json',
  title: 'WordPress first, and the web stack around it.',
  intro: `${YEARS_EXPERIENCE} years of production work. Hover or focus a group for the detail.`,
  fileName: 'stack.json',
  fileMeta: (groups) => `${groups} groups · ${YEARS_EXPERIENCE} yrs · tracked`,
  hint: 'hover a group',
  primaryBadge: 'primary',
};
