import { useCallback, useState } from 'react';
import { flushSync } from 'react-dom';
import { LAYOUT_KEY } from '../lib/storage';
import { runViewTransition, type Point } from '../lib/viewTransition';
import type { Layout } from '../types';

function readLayout(): Layout {
  try {
    return localStorage.getItem(LAYOUT_KEY) === 'simple' ? 'simple' : 'studio';
  } catch {
    return 'studio';
  }
}

export function useLayout() {
  const [layout, setLayoutState] = useState<Layout>(readLayout);

  const setLayout = useCallback((next: Layout, origin?: Point) => {
    runViewTransition(() => {
      flushSync(() => setLayoutState(next));
      try {
        localStorage.setItem(LAYOUT_KEY, next);
      } catch {
        // без сохранения выбора
      }
    }, origin);
  }, []);

  return { layout, setLayout };
}
