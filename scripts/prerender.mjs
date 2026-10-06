// Runs after `vite build` and the SSR build (see the "build" script in package.json).
// Renders the app to HTML and writes it into dist/index.html so the first paint
// does not wait for JavaScript, and crawlers see the full content.

import { readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlFile = path.join(root, 'dist', 'index.html');
const serverDir = path.join(root, 'dist-ssr');

const { render } = await import(pathToFileURL(path.join(serverDir, 'entry-server.js')).href);
const template = await readFile(htmlFile, 'utf8');

const marker = '<div id="root"></div>';
if (!template.includes(marker)) throw new Error(`Could not find ${marker} in dist/index.html`);

await writeFile(htmlFile, template.replace(marker, `<div id="root">${render()}</div>`));
await rm(serverDir, { recursive: true, force: true });
console.log('Pre-rendered dist/index.html');
