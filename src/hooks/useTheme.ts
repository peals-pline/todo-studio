import { useCallback, useState } from 'react';
import { flushSync } from 'react-dom';
import { THEME_KEY } from '../lib/storage';
import { runViewTransition, type Point } from '../lib/viewTransition';
import type { Theme } from '../types';

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'air' ? 'air' : 'night';
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme);

  const setTheme = useCallback((next: Theme, origin?: Point) => {
    if (next === readTheme()) return;

    runViewTransition(() => {
      document.documentElement.dataset.theme = next;
      flushSync(() => setThemeState(next));
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // без сохранения выбора
      }
    }, origin);
  }, []);

  return { theme, setTheme };
}
