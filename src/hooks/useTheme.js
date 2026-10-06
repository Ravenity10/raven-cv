import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

const STORAGE_KEY = 'theme';

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function apply(theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

// The class on <html> is set before first paint by the inline script in index.html.
// This hook mirrors it into React state (starting from 'light' so the pre-rendered
// HTML hydrates cleanly), follows system changes until the user picks a theme,
// and persists the user's choice.
export function useTheme() {
  const [theme, setTheme] = useState('light');

  useLayoutEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event) => {
      if (readStored()) return;
      const next = event.matches ? 'dark' : 'light';
      apply(next);
      setTheme(next);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
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
