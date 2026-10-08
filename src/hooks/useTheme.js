import { useCallback, useLayoutEffect, useState } from 'react';

const STORAGE_KEY = 'theme';
const FADE_MS = 300; // matches html.theme-fade in index.css

let fadeTimer = 0;

function apply(theme, fade) {
  const root = document.documentElement;
  // The colour transition only exists while .theme-fade is on <html>, so first paint and
  // hydration never animate; it is removed again once the fade has finished.
  if (fade) {
    root.classList.add('theme-fade');
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => root.classList.remove('theme-fade'), FADE_MS + 50);
  }
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

// The class on <html> is set before first paint by the inline script in index.html.
// This hook mirrors it into React state (starting from 'light' so the pre-rendered
// HTML hydrates cleanly) and persists the user's choice. Dark is the default
// until the user picks a theme.
// toggleTheme({ fade: true }) cross-fades colours; ThemeToggle uses it when the
// View Transitions API is unavailable.
export function useTheme() {
  const [theme, setTheme] = useState('light');

  useLayoutEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(({ fade = false } = {}) => {
    const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    apply(next, fade);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private mode): the choice lasts for this page view only.
    }
    setTheme(next);
  }, []);

  return { theme, toggleTheme };
}
