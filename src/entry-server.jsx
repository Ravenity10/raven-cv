// Used only at build time by scripts/prerender.mjs to write the page's HTML into dist/index.html.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App.jsx';

export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
