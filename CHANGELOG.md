# Changelog

All notable changes to this portfolio. Versions follow [Semantic Versioning](https://semver.org/);
the current version is read from `package.json` and shown in the footer status bar.

## [2.0.0] - 2026-10-09

Branch `v2`. Positioning moves from "WordPress Developer" to "Web Developer, WordPress focus".

### Content
- Role is now "Web Developer" in the hero, header, meta and Open Graph tags, the OG image and the README.
  Job titles from the CV (for example "Senior WordPress Developer") are unchanged.
- Hero copy rewritten in a more professional tone: tagline ("I design and build fast, secure and
  maintainable websites..."), "WordPress specialist" in the prompt output, "Get in touch" / "View projects"
  buttons, "open to projects" status and a new code-card caption.
- About and Experience no longer mention digital marketing; both say I lead the web development team.
- Skills regrouped as WordPress (primary), Front end, Back end and Tools (`src/data/skills.js`).
- Section order follows the new labels: 01 whoami, 02 git log, 03 projects, 04 cat stack.json.
- GitHub link added to the contact card and the command palette.

### Hero
- Real constellations replace the random particle network: Orion, Ursa Major, Cassiopeia, Scorpius,
  Cygnus and Crux (`src/data/constellations.js`, projected from RA/Dec). Two figures on phones, three on
  wider screens, drifting as one layer over a faint twinkling star field; star size follows magnitude.
- Figure lines draw in after the boot loader, brighten near the pointer, and the hovered star shows its
  name (desktop). Shooting stars stay on the same canvas and requestAnimationFrame loop.
- Terminal prompt line: `$ whoami` types out, then resolves to the role.

### Sections
- About: a syntax-highlighted `developer.js` block (hand-written tokenizer, `CodeBlock.jsx`) and
  `git diff --stat` style counters (years, projects, sites, integrations) that count up on view.
- Experience: a "git log" deployment history with commit nodes, `release/<year>` labels, HEAD on the
  current role, durations, short bullets and tech chips. Education stays sticky beside it on desktop.
- Projects: compact cards (thumbnail, name, one-line description, up to three tags), a two-column grid on
  phones, sideways-scrolling filter chips (All, Custom Theme, Plugin, WooCommerce, Integration) and a
  bottom-sheet modal on phones.
- Stack: a `stack.json` card with one line per group; hovering or focusing a group highlights its card
  and shows its summary.
- Footer: an editor-style status bar with branch, version, local time, theme and deploy location.

### Header
- Compacts on scroll: past the hero top the pills merge into one glass bar, the role line and the email
  button step out, and from 1280px up the groups close in to a centred bar. Tablets and up only;
  phones keep the separate pills. Animated with transforms only
  (FLIP), expands again at the top; the header height never changes, so the page does not shift.
- The "ctrl k" palette hint shows from 1280px up, where the row has room for it.

### Developer touches
- Command palette on Ctrl+K / Cmd+K (with a "ctrl k" hint in the desktop header): jump to sections,
  switch theme, copy the email address, open GitHub or LinkedIn, download the CV.
- ASCII greeting and contact line in the DevTools console.

### Mobile and accessibility
- Tighter section spacing and type scale on phones.
- The transparent strip of the sticky header no longer blocks taps on the page under it; the floating
  back-to-top button is icon-only on phones.
- Theme state is shared by every component that shows it (toggle, palette, footer).
- The back-to-top button watches the whole hero, so it also appears after a jump past it (palette or
  anchor link) on screens where the hero is taller than the viewport.
- `npm run v2-shots`: Playwright screenshots plus overflow, tap-blocker, palette, filter, typing,
  reduced-motion and WCAG AA contrast checks (`scripts/out/v2/`).

## [1.0.0] - 2026-10-09

Baseline, tagged `v1.0.0` on `main` before v2 work began.

- Single-page WordPress developer portfolio: Vite, React 19, Tailwind CSS v4, Motion and Lenis,
  pre-rendered to static HTML and deployed to GitHub Pages.
- Boot loader, hero with scrambling name, particle constellation and shooting stars, skill ticker and a
  `functions.php` card.
- About, Skills, Projects (cards with a detail modal and Playwright-captured screenshots), Experience,
  Services and Contact sections; all content in `src/data/`.
- Light and dark themes with a circular view-transition reveal, custom cursor, floating back-to-top
  button, toast notifications, reduced-motion support and WCAG AA colour tokens.
