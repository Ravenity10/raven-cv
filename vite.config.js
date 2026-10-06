import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Served from the domain root by default. The GitHub Pages workflow sets VITE_BASE
  // to the repository sub-path (for example /raven-cv/).
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
});
