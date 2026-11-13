export type Point = { x: number; y: number };

/**
 * Выполняет изменение интерфейса с круговым раскрытием от точки клика.
 * Если браузер не умеет View Transitions или включено «меньше движения» — меняет сразу.
 */
export function runViewTransition(apply: () => void, origin?: Point): void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof document.startViewTransition !== 'function' || reduceMotion) {
    apply();
    return;
  }

  const root = document.documentElement;
  root.style.setProperty('--vt-x', `${origin?.x ?? window.innerWidth / 2}px`);
  root.style.setProperty('--vt-y', `${origin?.y ?? 0}px`);
  document.startViewTransition(apply);
}
