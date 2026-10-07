import { useCallback, useLayoutEffect, useState } from 'react';

const STORAGE_KEY = 'theme';

function apply(theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

// The class on <html> is set before first paint by the inline script in index.html.
// This hook mirrors it into React state (starting from 'light' so the pre-rendered
// HTML hydrates cleanly) and persists the user's choice. Dark is the default
// until the user picks a theme.
export function useTheme() {
  const [theme, setTheme] = useState('light');

  useLayoutEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      apply(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Storage unavailable (private mode): the choice lasts for this page view only.
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
