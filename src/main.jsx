import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const container = document.getElementById('root');
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production HTML is pre-rendered (scripts/prerender.mjs), so hydrate it; the dev server renders from scratch.
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);
