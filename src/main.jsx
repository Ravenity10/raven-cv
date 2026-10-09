import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
// Self-hosted variable fonts (only the latin subset downloads for this page).
import '@fontsource-variable/space-grotesk/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import './index.css';
import { consoleGreeting } from './data/profile.js';

const container = document.getElementById('root');
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production HTML is pre-rendered (scripts/prerender.mjs), so hydrate it; the dev server renders from scratch.
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);

// A hello for anyone who opens DevTools.
console.log(`%c${consoleGreeting.art}`, 'font-family: ui-monospace, monospace; color: #8b8ff9; line-height: 1.2');
console.log(`%c${consoleGreeting.lines.join('\n')}`, 'font-family: ui-monospace, monospace; line-height: 1.6');
